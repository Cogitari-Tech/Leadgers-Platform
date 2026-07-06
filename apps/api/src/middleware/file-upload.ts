import type { Context, Next } from "hono";

// Magic bytes signatures for common file types
const MAGIC_BYTES: Record<string, { bytes: number[]; offset?: number }[]> = {
  "application/pdf": [{ bytes: [0x25, 0x50, 0x44, 0x46] }], // %PDF
  "image/png": [{ bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  "image/jpeg": [{ bytes: [0xff, 0xd8, 0xff] }],
  "image/gif": [
    { bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61] }, // GIF87a
    { bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] }, // GIF89a
  ],
  "image/webp": [{ bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }], // RIFF
  "application/zip": [{ bytes: [0x50, 0x4b, 0x03, 0x04] }],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    { bytes: [0x50, 0x4b, 0x03, 0x04] },
  ], // xlsx = zip
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    { bytes: [0x50, 0x4b, 0x03, 0x04] },
  ], // docx = zip
  "text/csv": [], // No magic bytes for text-based formats — validated by content
  "text/plain": [],
};

const ALLOWED_MIME_TYPES = new Set(Object.keys(MAGIC_BYTES));

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".zip",
  ".xlsx",
  ".docx",
  ".csv",
  ".txt",
]);

const MAX_FILE_SIZE = 10_485_760; // 10MB

interface FileValidationResult {
  valid: boolean;
  error?: string;
}

function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.slice(lastDot).toLowerCase();
}

// Content sniff for text formats that have no magic bytes: a real text file
// contains no NUL bytes and no C0 control chars other than tab/LF/CR. This blocks
// a binary payload (e.g. an .exe) renamed to .txt/.csv with a spoofed MIME.
function isProbablyText(buffer: Uint8Array): boolean {
  if (buffer.length === 0) return false;
  const sample = buffer.subarray(0, Math.min(buffer.length, 8192));
  for (const byte of sample) {
    if (byte === 0x00) return false;
    if (byte < 0x09 || (byte > 0x0d && byte < 0x20)) return false;
  }
  return true;
}

function validateMagicBytes(buffer: Uint8Array, declaredMime: string): boolean {
  const signatures = MAGIC_BYTES[declaredMime];

  // Text-based formats have no magic bytes — verify the content is actually text
  // instead of blindly trusting the client-declared MIME type.
  if (!signatures || signatures.length === 0) return isProbablyText(buffer);

  return signatures.some((sig) => {
    const offset = sig.offset ?? 0;
    if (buffer.length < offset + sig.bytes.length) return false;

    return sig.bytes.every((byte, i) => buffer[offset + i] === byte);
  });
}

export function validateUploadedFile(
  filename: string,
  mimeType: string,
  buffer: Uint8Array,
): FileValidationResult {
  // Layer 1: Extension allowlist
  const ext = getExtension(filename);
  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `File extension "${ext}" is not allowed` };
  }

  // Layer 2: MIME type allowlist
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return { valid: false, error: `MIME type "${mimeType}" is not allowed` };
  }

  // Layer 3: File size check
  if (buffer.length > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size (${buffer.length} bytes) exceeds maximum (${MAX_FILE_SIZE} bytes)`,
    };
  }

  // Layer 4: Magic bytes verification — the REAL content check
  if (!validateMagicBytes(buffer, mimeType)) {
    return {
      valid: false,
      error: `File content does not match declared MIME type "${mimeType}". Possible disguised file.`,
    };
  }

  return { valid: true };
}

export function fileUploadGuard() {
  return async (c: Context, next: Next) => {
    if (c.req.method !== "POST" && c.req.method !== "PUT") {
      return next();
    }

    const contentType = c.req.header("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return next();
    }

    try {
      const formData = await c.req.formData();
      const files: Array<{ name: string; file: File }> = [];

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          const buffer = new Uint8Array(await value.arrayBuffer());
          const result = validateUploadedFile(value.name, value.type, buffer);

          if (!result.valid) {
            return c.json(
              {
                error: "File validation failed",
                details: result.error,
                field: key,
              },
              400,
            );
          }

          files.push({ name: key, file: value });
        }
      }

      c.set("validatedFiles", files);
    } catch {
      return c.json({ error: "Failed to parse multipart form data" }, 400);
    }

    await next();
  };
}
