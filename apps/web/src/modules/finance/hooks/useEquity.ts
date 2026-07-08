import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../shared/utils/apiClient";

export type AccelerationType = "none" | "single_trigger" | "double_trigger";
export type GrantStatus = "active" | "terminated" | "exercised" | "cancelled";

export interface EquityGrantView {
  id: string;
  tenant_id: string;
  beneficiary_name: string;
  beneficiary_email: string | null;
  options_total: number;
  grant_date: string;
  cliff_months: number;
  vesting_months: number;
  grant_price: number;
  acceleration: AccelerationType;
  status: GrantStatus;
  terminated_at: string | null;
  exercise_window_days: number;
  notes: string | null;
  created_at: string;
  vested_options: number;
  unvested_options: number;
  vested_percentage: number;
  next_vesting_date: string | null;
  exercise_window_open: boolean;
}

export interface CreateGrantInput {
  beneficiary_name: string;
  beneficiary_email?: string | null;
  options_total: number;
  grant_date: string;
  cliff_months?: number;
  vesting_months?: number;
  grant_price?: number;
  acceleration?: AccelerationType;
  exercise_window_days?: number;
  notes?: string | null;
}

export interface EsopPoolSummary {
  pool: {
    id: string;
    total_options: number;
    pool_percentage: number | null;
    notes: string | null;
  } | null;
  issued_options: number;
  vested_options: number;
  available_options: number | null;
  utilization_percentage: number | null;
  over_threshold: boolean;
  beneficiaries: number;
}

export interface VestingMilestone {
  date: string;
  cumulativeVested: number;
}

/**
 * Hook do Equity & Vesting Tracker (PRD §7.6).
 * CRUD de grants, pool ESOP e timeline de vesting via API REST.
 */
export function useEquity() {
  const [grants, setGrants] = useState<EquityGrantView[]>([]);
  const [pool, setPool] = useState<EsopPoolSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [grantsData, poolData] = await Promise.all([
        apiClient.get<EquityGrantView[]>("/finance/equity/grants"),
        apiClient.get<EsopPoolSummary>("/finance/equity/pool"),
      ]);
      setGrants(grantsData || []);
      setPool(poolData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar dados de equity",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createGrant = useCallback(
    async (input: CreateGrantInput) => {
      const data = await apiClient.post<EquityGrantView>(
        "/finance/equity/grants",
        input,
      );
      await loadData();
      return data;
    },
    [loadData],
  );

  const terminateGrant = useCallback(
    async (id: string) => {
      const data = await apiClient.post<EquityGrantView>(
        `/finance/equity/grants/${encodeURIComponent(id)}/terminate`,
        {},
      );
      await loadData();
      return data;
    },
    [loadData],
  );

  const deleteGrant = useCallback(
    async (id: string) => {
      await apiClient.delete(
        `/finance/equity/grants/${encodeURIComponent(id)}`,
      );
      await loadData();
    },
    [loadData],
  );

  const savePool = useCallback(
    async (input: {
      total_options: number;
      pool_percentage?: number | null;
      notes?: string | null;
    }) => {
      await apiClient.put("/finance/equity/pool", input);
      await loadData();
    },
    [loadData],
  );

  const loadTimeline = useCallback(async (grantId: string) => {
    const data = await apiClient.get<{
      grant_id: string;
      milestones: VestingMilestone[];
    }>(`/finance/equity/grants/${encodeURIComponent(grantId)}/timeline`);
    return data.milestones;
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    grants,
    pool,
    loading,
    error,
    createGrant,
    terminateGrant,
    deleteGrant,
    savePool,
    loadTimeline,
    reload: loadData,
  };
}
