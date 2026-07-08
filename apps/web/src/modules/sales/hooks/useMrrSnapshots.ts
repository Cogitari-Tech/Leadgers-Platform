import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../shared/utils/apiClient";

export interface MrrSnapshot {
  id: string;
  month_date: string;
  total_mrr: number;
  total_arr: number;
  new_mrr: number;
  expansion_mrr: number;
  churn_mrr: number;
  contraction_mrr: number;
  notes?: string | null;
}

export interface MrrSnapshotInput {
  month_date: string;
  total_mrr: number;
  new_mrr: number;
  expansion_mrr: number;
  churn_mrr: number;
  contraction_mrr: number;
  notes?: string | null;
}

export function useMrrSnapshots() {
  const [snapshots, setSnapshots] = useState<MrrSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshots = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<MrrSnapshot[]>("/sales/mrr");
      setSnapshots(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar MRR");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  const saveSnapshot = useCallback(
    async (input: MrrSnapshotInput) => {
      setSaving(true);
      try {
        await apiClient.post<MrrSnapshot>("/sales/mrr", input);
        await fetchSnapshots();
      } finally {
        setSaving(false);
      }
    },
    [fetchSnapshots],
  );

  const deleteSnapshot = useCallback(async (id: string) => {
    await apiClient.delete(`/sales/mrr/${id}`);
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    snapshots,
    loading,
    saving,
    error,
    refresh: fetchSnapshots,
    saveSnapshot,
    deleteSnapshot,
  };
}
