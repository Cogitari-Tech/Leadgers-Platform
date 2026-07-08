import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../shared/utils/apiClient";

export type RoadmapStatus =
  | "planned"
  | "in_progress"
  | "in_review"
  | "completed"
  | "cancelled";

export interface RoadmapItem {
  id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  status: RoadmapStatus;
  quarter: string;
  github_issue_id: number | null;
  github_issue_url: string | null;
  key_result_id: string | null;
  milestone_id: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface CreateRoadmapInput {
  title: string;
  description?: string | null;
  status?: RoadmapStatus;
  quarter?: string;
  start_date?: string | null;
  end_date?: string | null;
}

/**
 * Hook do Roadmap Visual (PRD §7.7).
 * CRUD de itens e movimentação de status para o Kanban.
 */
export function useRoadmap() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<RoadmapItem[]>("/product/roadmap");
      setItems(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar o roadmap",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(
    async (input: CreateRoadmapInput) => {
      const data = await apiClient.post<RoadmapItem>("/product/roadmap", input);
      await loadItems();
      return data;
    },
    [loadItems],
  );

  const moveItem = useCallback(
    async (id: string, status: RoadmapStatus) => {
      // Optimistic move; reloads from the server on failure.
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item)),
      );
      try {
        await apiClient.patch(`/product/roadmap/${encodeURIComponent(id)}`, {
          status,
        });
      } catch (err) {
        await loadItems();
        throw err;
      }
    },
    [loadItems],
  );

  const deleteItem = useCallback(async (id: string) => {
    await apiClient.delete(`/product/roadmap/${encodeURIComponent(id)}`);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return {
    items,
    loading,
    error,
    createItem,
    moveItem,
    deleteItem,
    reload: loadItems,
  };
}
