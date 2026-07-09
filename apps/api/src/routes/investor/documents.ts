import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import {
  fileUploadGuard,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
} from "../../middleware/file-upload";
import { uploadBodyLimit } from "../../middleware/body-limit";
import { AppEnv } from "../../types/env";

export const documentsRouter = new Hono<AppEnv>();

// Derive a storage-safe extension from a client filename. Strips path separators
// and traversal sequences; the stored object name itself is a server-generated
// UUID, so a malicious `file.name` can never influence the storage path.
function safeExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  const ext = filename.slice(lastDot + 1).toLowerCase();
  return /^[a-z0-9]{1,10}$/.test(ext) ? `.${ext}` : "";
}

documentsRouter.get("/", async (c) => {
  const tenantId = c.get("tenantId");

  try {
    const documents = await prisma.data_room_documents.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: "desc" },
    });

    return c.json({ documents });
  } catch (error) {
    console.error("Error fetching data room documents:", error);
    return c.json({ error: "Failed to fetch documents" }, 500);
  }
});

// Metadata registration with strict validation
documentsRouter.post(
  "/",
  uploadBodyLimit(),
  zValidator(
    "json",
    z.object({
      name: z.string().min(1).max(300).trim(),
      file_path: z
        .string()
        .min(1)
        .max(1000)
        .refine((path) => ALLOWED_EXTENSIONS.has(safeExtension(path)), {
          message: "file_path extension is not allowed",
        }),
      file_size: z.number().int().positive().max(10_485_760),
      mime_type: z
        .string()
        .min(1)
        .max(100)
        .refine((mime) => ALLOWED_MIME_TYPES.has(mime), {
          message: "mime_type is not allowed",
        }),
      category: z.string().max(100).optional(),
      description: z.string().max(2000).optional(),
    }),
  ),
  async (c) => {
    const tenantId = c.get("tenantId");
    const user = c.get("user");
    const body = c.req.valid("json");

    // The client declares file_path, but it must live under this tenant's own
    // storage prefix — otherwise a caller could register a metadata row that
    // points at another tenant's stored object.
    const tenantPrefix = `uploads/${tenantId}/`;
    if (!body.file_path.startsWith(tenantPrefix)) {
      return c.json({ error: "file_path outside tenant storage scope" }, 400);
    }

    try {
      const newDoc = await prisma.data_room_documents.create({
        data: {
          tenant_id: tenantId,
          name: body.name,
          file_path: body.file_path,
          file_size: body.file_size,
          mime_type: body.mime_type,
          category: body.category || "general",
          description: body.description,
          uploaded_by: user.id,
        },
      });

      return c.json({ document: newDoc }, 201);
    } catch (error) {
      console.error("Error registering document:", error);
      return c.json({ error: "Failed to register document" }, 500);
    }
  },
);

// Upload endpoint with full file validation (MIME + Magic Bytes)
documentsRouter.post(
  "/upload",
  uploadBodyLimit(),
  fileUploadGuard(),
  async (c) => {
    const tenantId = c.get("tenantId");
    const user = c.get("user");
    const validatedFiles = c.get("validatedFiles") as
      | Array<{ name: string; file: File }>
      | undefined;

    if (!validatedFiles || validatedFiles.length === 0) {
      return c.json({ error: "No files provided" }, 400);
    }

    try {
      const results = [];

      for (const { file } of validatedFiles) {
        // Never build the storage path from the client-supplied name — use a
        // server-generated UUID so `../` or absolute paths cannot poison storage.
        const storageName = `${crypto.randomUUID()}${safeExtension(file.name)}`;
        const newDoc = await prisma.data_room_documents.create({
          data: {
            tenant_id: tenantId,
            name: file.name,
            file_path: `uploads/${tenantId}/${storageName}`,
            file_size: file.size,
            mime_type: file.type,
            category: "general",
            uploaded_by: user.id,
          },
        });
        results.push(newDoc);
      }

      return c.json({ documents: results }, 201);
    } catch (error) {
      console.error("Error uploading documents:", error);
      return c.json({ error: "Failed to upload documents" }, 500);
    }
  },
);

documentsRouter.delete("/:id", async (c) => {
  const tenantId = c.get("tenantId");
  const docId = c.req.param("id");

  try {
    const existing = await prisma.data_room_documents.findFirst({
      where: { id: docId, tenant_id: tenantId },
    });

    if (!existing) {
      return c.json({ error: "Document not found" }, 404);
    }

    await prisma.data_room_documents.delete({
      where: { id: docId, tenant_id: tenantId },
    });

    return c.json({ success: true }, 200);
  } catch (error) {
    console.error("Error deleting document:", error);
    return c.json({ error: "Failed to delete document" }, 500);
  }
});
