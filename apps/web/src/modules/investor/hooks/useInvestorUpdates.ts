import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../shared/utils/apiClient";

export interface InvestorUpdate {
  id: string;
  title: string;
  content_md: string;
  period: string;
  status: string;
  generated_by_ai: boolean;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvestorUpdateInput {
  title: string;
  content_md: string;
  period: string;
}

interface UpdatesResponse {
  data: InvestorUpdate[];
}

interface UpdateResponse {
  data: InvestorUpdate;
}

export function useInvestorUpdates() {
  const [updates, setUpdates] = useState<InvestorUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUpdates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<UpdatesResponse>("/investor/updates");
      setUpdates(res.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar updates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  const createUpdate = useCallback(
    async (input: InvestorUpdateInput): Promise<InvestorUpdate> => {
      setSaving(true);
      try {
        const res = await apiClient.post<UpdateResponse>(
          "/investor/updates",
          input,
        );
        setUpdates((prev) => [res.data, ...prev]);
        return res.data;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const updateUpdate = useCallback(
    async (
      id: string,
      input: Partial<InvestorUpdateInput>,
    ): Promise<InvestorUpdate> => {
      setSaving(true);
      try {
        const res = await apiClient.patch<UpdateResponse>(
          `/investor/updates/${id}`,
          input,
        );
        setUpdates((prev) => prev.map((u) => (u.id === id ? res.data : u)));
        return res.data;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const publishUpdate = useCallback(async (id: string) => {
    const res = await apiClient.post<UpdateResponse>(
      `/investor/updates/${id}/publish`,
    );
    setUpdates((prev) => prev.map((u) => (u.id === id ? res.data : u)));
    return res.data;
  }, []);

  const deleteUpdate = useCallback(async (id: string) => {
    await apiClient.delete(`/investor/updates/${id}`);
    setUpdates((prev) => prev.filter((u) => u.id !== id));
  }, []);

  return {
    updates,
    loading,
    saving,
    error,
    refresh: fetchUpdates,
    createUpdate,
    updateUpdate,
    publishUpdate,
    deleteUpdate,
  };
}
