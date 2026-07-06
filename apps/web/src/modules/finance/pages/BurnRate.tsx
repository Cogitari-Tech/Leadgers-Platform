import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Flame,
  Bell,
  BellOff,
  Plus,
  Trash2,
  DollarSign,
  Clock,
  AlertTriangle,
  X,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Select } from "@/shared/components/ui/Select";
import { useBurnRate, BurnRateAlert } from "../hooks/useBurnRate";

const ALERT_TYPE_LABELS: Record<string, string> = {
  runway_months: "Meses de Runway",
  burn_rate_change: "Burn Rate (R$)",
  cash_low: "Caixa Mínimo (R$)",
};

export default function BurnRate() {
  const {
    alerts,
    metrics,
    triggeredAlerts,
    loading,
    createAlert,
    toggleAlert,
    deleteAlert,
    formatCurrency,
  } = useBurnRate();

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertForm, setAlertForm] = useState({
    alert_type: "runway_months" as BurnRateAlert["alert_type"],
    threshold_value: 6,
    comparison: "below" as "below" | "above",
    notify_email: true,
    notify_in_app: true,
  });

  const trendIcon =
    metrics.trend === "increasing" ? (
      <TrendingUp className="w-5 h-5 text-destructive" />
    ) : metrics.trend === "decreasing" ? (
      <TrendingDown className="w-5 h-5 text-emerald-500" />
    ) : (
      <Minus className="w-5 h-5 text-muted-foreground" />
    );

  // Gauge calculations
  const maxBurn = metrics.currentMonthlyBurn * 2 || 100000;
  const gaugePercent = Math.min(
    (metrics.currentMonthlyBurn / maxBurn) * 100,
    100,
  );
  const gaugeColor =
    gaugePercent > 75 ? "#ef4444" : gaugePercent > 50 ? "#f59e0b" : "#10b981";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-1 bg-primary rounded-full" />
            <h1 className="text-4xl font-bold tracking-tight font-display">
              Burn Rate
            </h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Monitoramento de queima de caixa com alertas automáticos.
          </p>
        </div>
        <Button
          variant="primary"
          className="rounded-2xl px-6 shadow-lg shadow-primary/20"
          onClick={() => setShowAlertModal(true)}
        >
          <Bell className="w-4 h-4 mr-2" /> Configurar Alertas
        </Button>
      </div>

      {/* Triggered Alerts Banner */}
      {triggeredAlerts.length > 0 && (
        <div className="p-6 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-destructive">
              {triggeredAlerts.length} Alerta
              {triggeredAlerts.length > 1 ? "s" : ""} Ativo
              {triggeredAlerts.length > 1 ? "s" : ""}
            </h4>
            {triggeredAlerts.map((a) => (
              <p key={a.id} className="text-xs text-destructive/80">
                • {ALERT_TYPE_LABELS[a.alert_type]}: limite de{" "}
                {a.threshold_value}{" "}
                {a.comparison === "below"
                  ? "atingido (abaixo)"
                  : "ultrapassado (acima)"}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gauge Card */}
        <div className="glass-card soft-shadow p-8 rounded-3xl flex flex-col items-center">
          <div className="relative w-48 h-28 mb-6">
            <svg viewBox="0 0 200 100" className="w-full">
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                stroke={gaugeColor}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${gaugePercent * 2.51} 251`}
                style={{ filter: `drop-shadow(0 0 12px ${gaugeColor}50)` }}
              />
              <text
                x="100"
                y="75"
                textAnchor="middle"
                fill="currentColor"
                fontSize="24"
                fontWeight="800"
                className="fill-foreground"
              >
                {formatCurrency(metrics.currentMonthlyBurn)}
              </text>
              <text
                x="100"
                y="95"
                textAnchor="middle"
                fill="currentColor"
                fontSize="10"
                className="fill-muted-foreground"
              >
                BURN MENSAL
              </text>
            </svg>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {trendIcon}
            <span className="font-bold uppercase tracking-widest">
              {metrics.trend === "increasing"
                ? "Subindo"
                : metrics.trend === "decreasing"
                  ? "Descendo"
                  : "Estável"}
            </span>
          </div>
        </div>

        {/* Cash Remaining */}
        <div className="glass-card soft-shadow p-8 rounded-3xl">
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 rounded-2xl bg-emerald-500/10">
              <DollarSign className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
            Caixa Disponível
          </p>
          <h3 className="text-3xl font-bold tracking-tight text-foreground mt-1">
            {formatCurrency(metrics.cashRemaining)}
          </h3>
          <div className="mt-4 pt-4 border-t border-border/20 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Média 3m</span>
              <span className="font-bold">
                {formatCurrency(metrics.avgBurn3m)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Média 6m</span>
              <span className="font-bold">
                {formatCurrency(metrics.avgBurn6m)}
              </span>
            </div>
          </div>
        </div>

        {/* Runway */}
        <div className="glass-card soft-shadow p-8 rounded-3xl">
          <div className="flex items-start justify-between mb-6">
            <div
              className={`p-3 rounded-2xl ${metrics.runwayMonths <= 6 ? "bg-destructive/10" : "bg-primary/10"}`}
            >
              <Clock
                className={`w-6 h-6 ${metrics.runwayMonths <= 6 ? "text-destructive" : "text-primary"}`}
              />
            </div>
          </div>
          <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
            Runway Estimado
          </p>
          <h3 className="text-4xl font-bold tracking-tight text-foreground mt-1">
            {metrics.runwayMonths >= 999 ? "∞" : metrics.runwayMonths}
            <span className="text-lg text-muted-foreground font-normal ml-1">
              meses
            </span>
          </h3>
          {metrics.runwayMonths <= 6 && (
            <div className="mt-4 flex items-center gap-2 p-3 rounded-2xl bg-destructive/10">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-xs font-bold text-destructive">
                Atenção: runway curto
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Burn Rate Trend Chart */}
      <div className="glass-card soft-shadow p-10 rounded-3xl">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">
              Tendência
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
              Burn rate nos últimos 12 meses
            </p>
          </div>
          <Flame className="w-5 h-5 text-primary opacity-40" />
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metrics.burnHistory}>
            <defs>
              <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{
                fill: "rgba(255,255,255,0.4)",
                fontSize: 10,
                fontWeight: 700,
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{
                fill: "rgba(255,255,255,0.4)",
                fontSize: 10,
                fontWeight: 700,
              }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.85)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                color: "#fff",
              }}
              formatter={(v: number) => [formatCurrency(v), "Burn"]}
            />
            {alerts
              .filter((a) => a.is_active && a.alert_type === "burn_rate_change")
              .map((a) => (
                <ReferenceLine
                  key={a.id}
                  y={a.threshold_value}
                  stroke="#ef444480"
                  strokeDasharray="5 5"
                  label={{
                    value: `Alerta: ${formatCurrency(a.threshold_value)}`,
                    fill: "#ef4444",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
              ))}
            <Line
              type="monotone"
              dataKey="burn"
              stroke="#ef4444"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: "#ef4444" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Alert Config List */}
      <div className="glass-card soft-shadow overflow-hidden rounded-3xl">
        <div className="p-8 border-b border-border/40 flex justify-between items-center">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">
            Alertas Configurados
          </h3>
          <Button
            variant="ghost"
            className="text-[10px] font-bold uppercase tracking-widest"
            onClick={() => setShowAlertModal(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> Novo Alerta
          </Button>
        </div>

        {alerts.length > 0 ? (
          <div className="divide-y divide-border/10">
            {alerts.map((alert) => {
              const isTriggered = triggeredAlerts.some(
                (t) => t.id === alert.id,
              );
              return (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between px-8 py-6 hover:bg-muted/50 transition-all group ${isTriggered ? "bg-destructive/5" : ""}`}
                >
                  <div className="flex items-center gap-6">
                    <div
                      className={`p-3 rounded-2xl ${isTriggered ? "bg-destructive/10" : "bg-foreground/5"}`}
                    >
                      {isTriggered ? (
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      ) : (
                        <Bell className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">
                        {ALERT_TYPE_LABELS[alert.alert_type]}
                      </h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        {alert.comparison === "below"
                          ? "Abaixo de"
                          : "Acima de"}{" "}
                        {alert.alert_type === "runway_months"
                          ? `${alert.threshold_value} meses`
                          : formatCurrency(alert.threshold_value)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      {alert.notify_in_app && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-primary/10 text-primary uppercase tracking-widest">
                          App
                        </span>
                      )}
                      {alert.notify_email && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 uppercase tracking-widest">
                          Email
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleAlert(alert.id, !alert.is_active)}
                      className="p-2 rounded-full hover:bg-foreground/5"
                    >
                      {alert.is_active ? (
                        <Bell className="w-4 h-4 text-primary" />
                      ) : (
                        <BellOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="p-2 rounded-full hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center text-muted-foreground">
            <Bell className="w-16 h-16 mb-6 mx-auto opacity-10" />
            <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-40">
              Nenhum alerta configurado
            </p>
          </div>
        )}
      </div>

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            onClick={() => setShowAlertModal(false)}
          />
          <div className="relative glass-panel soft-shadow p-10 w-full max-w-xl z-10 rounded-3xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold font-display tracking-tight">
                Novo Alerta
              </h3>
              <button
                onClick={() => setShowAlertModal(false)}
                className="p-3 rounded-full bg-foreground/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await createAlert(alertForm);
                setShowAlertModal(false);
              }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Tipo de Alerta
                </label>
                <Select
                  value={alertForm.alert_type}
                  onChange={(e) =>
                    setAlertForm({
                      ...alertForm,
                      alert_type: e.target.value as BurnRateAlert["alert_type"],
                    })
                  }
                  className="w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm"
                >
                  <option
                    value="runway_months"
                    className="bg-background text-foreground"
                  >
                    Meses de Runway
                  </option>
                  <option
                    value="burn_rate_change"
                    className="bg-background text-foreground"
                  >
                    Burn Rate Mensal
                  </option>
                  <option
                    value="cash_low"
                    className="bg-background text-foreground"
                  >
                    Caixa Mínimo
                  </option>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Limite
                  </label>
                  <input
                    type="number"
                    value={alertForm.threshold_value}
                    onChange={(e) =>
                      setAlertForm({
                        ...alertForm,
                        threshold_value: Number(e.target.value),
                      })
                    }
                    className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Condição
                  </label>
                  <Select
                    value={alertForm.comparison}
                    onChange={(e) =>
                      setAlertForm({
                        ...alertForm,
                        comparison: e.target.value as "below" | "above",
                      })
                    }
                    className="w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm"
                  >
                    <option
                      value="below"
                      className="bg-background text-foreground"
                    >
                      Abaixo de
                    </option>
                    <option
                      value="above"
                      className="bg-background text-foreground"
                    >
                      Acima de
                    </option>
                  </Select>
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertForm.notify_in_app}
                    onChange={(e) =>
                      setAlertForm({
                        ...alertForm,
                        notify_in_app: e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-primary rounded"
                  />
                  <span className="text-sm font-medium">In-App</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertForm.notify_email}
                    onChange={(e) =>
                      setAlertForm({
                        ...alertForm,
                        notify_email: e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-primary rounded"
                  />
                  <span className="text-sm font-medium">Email</span>
                </label>
              </div>
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAlertModal(false)}
                  className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                >
                  {loading ? "Salvando..." : "Criar Alerta"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
