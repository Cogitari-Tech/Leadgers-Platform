import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../config/supabase";
import { apiClient } from "../../../shared/utils/apiClient";
import { useAuth } from "../../auth/context/AuthContext";

export const MAX_FILE_SIZE = 10_485_760; // 10MB — same cap as the API schema

export const DOCUMENT_CATEGORIES = {
  general: "Geral",
  financeiro: "Financeiro",
  juridico: "Jurídico",
  produto: "Produto",
  rh: "RH & Equity",
} as const;

export type DocumentCategory = keyof typeof DOCUMENT_CATEGORIES;

export interface DataRoomDocument {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  category: string;
  description?: string | null;
  created_at: string;
}

interface DocumentsResponse {
  documents: DataRoomDocument[];
}

function fileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  const ext = filename.slice(lastDot + 1).toLowerCase();
  return /^[a-z0-9]{1,10}$/.test(ext) ? `.${ext}` : "";
}

export function useDataRoom() {
  const { tenant } = useAuth();
  const [documents, setDocuments] = useState<DataRoomDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<DocumentsResponse>("/investor/documents");
      setDocuments(res.documents);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar documentos",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = useCallback(
    async (file: File, category: DocumentCategory, description?: string) => {
      if (!tenant?.id) throw new Error("Tenant não identificado");
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("Arquivo excede o limite de 10MB");
      }

      setUploading(true);
      try {
        const storagePath = `uploads/${tenant.id}/${crypto.randomUUID()}${fileExtension(file.name)}`;
        const { error: uploadError } = await supabase.storage
          .from("data_room")
          .upload(storagePath, file);
        if (uploadError) throw new Error(uploadError.message);

        try {
          await apiClient.post("/investor/documents", {
            name: file.name,
            file_path: storagePath,
            file_size: file.size,
            mime_type: file.type || "application/octet-stream",
            category,
            description: description?.trim() || undefined,
          });
        } catch (registerError) {
          // Metadata failed — remove the orphaned object to keep storage clean.
          await supabase.storage.from("data_room").remove([storagePath]);
          throw registerError;
        }

        await fetchDocuments();
      } finally {
        setUploading(false);
      }
    },
    [tenant?.id, fetchDocuments],
  );

  const downloadDocument = useCallback(async (doc: DataRoomDocument) => {
    const { data, error: signError } = await supabase.storage
      .from("data_room")
      .createSignedUrl(doc.file_path, 60, { download: doc.name });
    if (signError || !data?.signedUrl) {
      throw new Error(signError?.message || "Erro ao gerar link de download");
    }
    window.open(data.signedUrl, "_blank", "noopener");
  }, []);

  const deleteDocument = useCallback(async (doc: DataRoomDocument) => {
    await apiClient.delete(`/investor/documents/${doc.id}`);
    await supabase.storage.from("data_room").remove([doc.file_path]);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  }, []);

  return {
    documents,
    loading,
    uploading,
    error,
    refresh: fetchDocuments,
    uploadDocument,
    downloadDocument,
    deleteDocument,
  };
}
