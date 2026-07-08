import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../shared/utils/apiClient";

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertCategory =
  | "runway"
  | "burn"
  | "equity"
  | "revenue"
  | "roadmap";

export interface PredictiveAlert {
  id: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  message: string;
  metric?: number;
}

interface AlertsResponse {
  alerts: PredictiveAlert[];
  generated_at: string;
  degraded: boolean;
}

export function useAiAlerts() {
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [degraded, setDegraded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<AlertsResponse>("/ai/alerts");
      setAlerts(res.alerts);
      setDegraded(res.degraded);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar alertas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return { alerts, degraded, loading, error, refresh: fetchAlerts };
}
