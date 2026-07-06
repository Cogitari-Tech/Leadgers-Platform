import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Target, Users, TrendingUp, Clock, Save, X } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import {
  useUnitEconomics,
  UnitEconomicsInput,
} from "../hooks/useUnitEconomics";

export default function UnitEconomics() {
  const {
    latestMetrics,
    trendData,
    loading,
    computeMetrics,
    saveSnapshot,
    formatCurrency,
  } = useUnitEconomics();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<UnitEconomicsInput>({
    totalCustomers: latestMetrics?.totalCustomers || 0,
    newCustomers: latestMetrics?.newCustomers || 0,
    churnedCustomers: 0,
    marketingSpend: 0,
    salesSpend: 0,
    ltv: 0,
  });

  const liveMetrics = computeMetrics(formData);

  const kpis = [
    {
      label: "CAC",
      value: latestMetrics ? formatCurrency(latestMetrics.cac) : "–",
      sublabel: "Custo de Aquisição",
      icon: Target,
      color: "text-primary",
      bgColor: "bg-primary/10",
      helpText: "(Marketing + Vendas) / Novos Clientes",
    },
    {
      label: "LTV",
      value: latestMetrics ? formatCurrency(latestMetrics.ltv) : "–",
      sublabel: "Lifetime Value",
      icon: Users,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      helpText: "ARPU / Taxa de Churn Mensal",
    },
    {
      label: "LTV / CAC",
      value: latestMetrics ? `${latestMetrics.ltvCacRatio.toFixed(1)}x` : "–",
      sublabel: "Índice de Eficiência",
      icon: TrendingUp,
      color:
        latestMetrics && latestMetrics.ltvCacRatio >= 3
          ? "text-emerald-500"
          : "text-amber-500",
      bgColor:
        latestMetrics && latestMetrics.ltvCacRatio >= 3
          ? "bg-emerald-500/10"
          : "bg-amber-500/10",
      helpText: "Meta: ≥ 3x",
    },
    {
      label: "Payback",
      value: latestMetrics
        ? `${latestMetrics.paybackPeriodMonths.toFixed(1)}m`
        : "–",
      sublabel: "Período de Retorno",
      icon: Clock,
      color:
        latestMetrics && latestMetrics.paybackPeriodMonths <= 12
          ? "text-emerald-500"
          : "text-amber-500",
      bgColor:
        latestMetrics && latestMetrics.paybackPeriodMonths <= 12
          ? "bg-emerald-500/10"
          : "bg-amber-500/10",
      helpText: "CAC / ARPU (meses)",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-1 bg-primary rounded-full" />
            <h1 className="text-4xl font-bold tracking-tight font-display">
              Unit Economics
            </h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Métricas automatizadas de aquisição e rentabilidade por cliente.
          </p>
        </div>
        <Button
          variant="primary"
          className="rounded-2xl px-6 shadow-lg shadow-primary/20"
          onClick={() => setShowForm(true)}
        >
          <Save className="w-4 h-4 mr-2" /> Registrar Snapshot
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="glass-card soft-shadow p-8 rounded-3xl relative overflow-hidden group hover:scale-[1.03] transition-all"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`p-3 rounded-2xl ${kpi.bgColor}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
              {kpi.sublabel}
            </p>
            <h3 className="text-4xl font-bold tracking-tight text-foreground mt-1">
              {kpi.value}
            </h3>
            <p className="text-[10px] text-muted-foreground/40 mt-3 font-medium">
              {kpi.helpText}
            </p>
            <div className="absolute -bottom-6 -right-6 opacity-[0.03] pointer-events-none">
              <kpi.icon className="w-32 h-32" />
            </div>
          </div>
        ))}
      </div>

      {/* Trend Chart */}
      <div className="glass-card soft-shadow p-10 rounded-3xl">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">
              Evolução das Métricas
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
              Histórico dos últimos 12 meses
            </p>
          </div>
        </div>

        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={trendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.85)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  color: "#fff",
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{
                  paddingBottom: "24px",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                }}
              />
              <Line
                type="monotone"
                dataKey="cac"
                name="CAC"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="ltv"
                name="LTV"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="ratio"
                name="LTV/CAC"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground bg-foreground/[0.02] rounded-3xl">
            <TrendingUp className="w-12 h-12 mb-4 opacity-10" />
            <p className="text-xs font-bold uppercase tracking-widest opacity-40">
              Registre snapshots para visualizar tendências
            </p>
          </div>
        )}
      </div>

      {/* Snapshot Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            onClick={() => setShowForm(false)}
          />
          <div className="relative glass-panel soft-shadow p-10 w-full max-w-3xl z-10 rounded-3xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold font-display tracking-tight">
                  Registrar Snapshot
                </h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                  Dados do mês vigente
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-3 rounded-full bg-foreground/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveSnapshot(formData);
                setShowForm(false);
              }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="totalCustomers"
                    className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
                  >
                    Total Clientes
                  </label>
                  <input
                    id="totalCustomers"
                    type="number"
                    value={formData.totalCustomers}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalCustomers: Number(e.target.value),
                      })
                    }
                    className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="newCustomers"
                    className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
                  >
                    Novos Clientes
                  </label>
                  <input
                    id="newCustomers"
                    type="number"
                    value={formData.newCustomers}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        newCustomers: Number(e.target.value),
                      })
                    }
                    className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="churnedCustomers"
                    className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
                  >
                    Churn (Clientes)
                  </label>
                  <input
                    id="churnedCustomers"
                    type="number"
                    value={formData.churnedCustomers}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        churnedCustomers: Number(e.target.value),
                      })
                    }
                    className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="marketingSpend"
                    className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
                  >
                    Gasto Marketing (R$)
                  </label>
                  <input
                    id="marketingSpend"
                    type="number"
                    value={formData.marketingSpend}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        marketingSpend: Number(e.target.value),
                      })
                    }
                    className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="salesSpend"
                    className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
                  >
                    Gasto Vendas (R$)
                  </label>
                  <input
                    id="salesSpend"
                    type="number"
                    value={formData.salesSpend}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salesSpend: Number(e.target.value),
                      })
                    }
                    className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
                  />
                </div>
              </div>
              {/* Live Preview */}
              <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 grid grid-cols-4 gap-6">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    CAC
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(liveMetrics.cac)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    LTV
                  </p>
                  <p className="text-lg font-bold text-emerald-500">
                    {formatCurrency(liveMetrics.ltv)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    LTV/CAC
                  </p>
                  <p className="text-lg font-bold">
                    {liveMetrics.ltvCacRatio.toFixed(1)}x
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Payback
                  </p>
                  <p className="text-lg font-bold">
                    {liveMetrics.paybackPeriodMonths.toFixed(1)}m
                  </p>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                  className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                >
                  {loading ? "Salvando..." : "Salvar Snapshot"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
