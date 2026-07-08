import {
  BellRing,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useAiAlerts,
  type PredictiveAlert,
  type AlertCategory,
  type AlertSeverity,
} from "../hooks/useAiAlerts";

const CATEGORY_ROUTES: Record<AlertCategory, string> = {
  runway: "/dashboard/finance",
  burn: "/dashboard/finance",
  equity: "/dashboard/finance/equity",
  revenue: "/dashboard/sales/mrr",
  roadmap: "/dashboard/product/roadmap",
};

const SEVERITY_STYLES: Record<
  AlertSeverity,
  { icon: React.ElementType; dot: string; badge: string; label: string }
> = {
  critical: {
    icon: ShieldAlert,
    dot: "bg-red-500",
    badge: "bg-red-500/15 text-red-500 border-red-500/20",
    label: "Crítico",
  },
  warning: {
    icon: AlertTriangle,
    dot: "bg-amber-500",
    badge: "bg-amber-500/15 text-amber-500 border-amber-500/20",
    label: "Atenção",
  },
  info: {
    icon: Info,
    dot: "bg-sky-500",
    badge: "bg-sky-500/15 text-sky-500 border-sky-500/20",
    label: "Info",
  },
};

function AlertRow({ alert }: { alert: PredictiveAlert }) {
  const navigate = useNavigate();
  const style = SEVERITY_STYLES[alert.severity];

  return (
    <button
      type="button"
      onClick={() => navigate(CATEGORY_ROUTES[alert.category])}
      aria-label={`${style.label}: ${alert.title}`}
      className="w-full flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-left"
    >
      <div
        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${style.dot}`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-foreground truncate">
            {alert.title}
          </p>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border flex-shrink-0 ${style.badge}`}
          >
            {style.label}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
          {alert.message}
        </p>
      </div>
    </button>
  );
}

export function PredictiveAlertsCard() {
  const { alerts, degraded, loading, error, refresh } = useAiAlerts();

  return (
    <div className="glass-card soft-shadow rounded-2xl p-6 transition-all hover:scale-[1.01] hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BellRing className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Alertas Preditivos
          </h2>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          aria-label="Atualizar alertas preditivos"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          <RefreshCcw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {loading && alerts.length === 0 ? (
        <div className="space-y-2" aria-hidden="true">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <AlertTriangle className="w-8 h-8 text-amber-500/40 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-2 text-xs font-medium text-primary hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-500/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Nenhum alerta no momento.
          </p>
          <p className="text-[10px] text-muted-foreground/70 mt-1">
            Runway, burn, ESOP, MRR e roadmap monitorados.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {degraded && (
        <p className="text-[10px] text-amber-500/80 mt-3 border-t border-border/20 pt-2">
          Algumas fontes de dados falharam — lista pode estar incompleta.
        </p>
      )}
    </div>
  );
}

export default PredictiveAlertsCard;
