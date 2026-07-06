import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Fuel,
  Calendar,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useRunwayCalculator } from "../hooks/useRunwayCalculator";

export default function RunwayCalculator() {
  const {
    scenarios,
    results,
    cashBalance,
    projectionMonths,
    setCashBalance,
    setProjectionMonths,
    updateScenario,
    formatCurrency,
  } = useRunwayCalculator();

  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-1 bg-primary rounded-full" />
            <h1 className="text-4xl font-bold tracking-tight font-display">
              Runway Calculator
            </h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Projeção de sobrevivência financeira em 3 cenários.
          </p>
        </div>
        <Button
          variant="secondary"
          className="rounded-2xl px-6"
          onClick={() => setShowSettings(!showSettings)}
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" /> Configurar
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="glass-card soft-shadow p-8 rounded-3xl">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6">
            Parâmetros Globais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label
                htmlFor="cashBalance"
                className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
              >
                Saldo Inicial em Caixa (R$)
              </label>
              <input
                id="cashBalance"
                type="number"
                value={cashBalance}
                onChange={(e) => setCashBalance(Number(e.target.value))}
                className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              />
            </div>
            <div className="space-y-3">
              <label
                htmlFor="projectionMonths"
                className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
              >
                Meses de Projeção
              </label>
              <input
                id="projectionMonths"
                type="range"
                min={6}
                max={60}
                value={projectionMonths}
                onChange={(e) => setProjectionMonths(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <span className="text-xs font-bold text-foreground">
                {projectionMonths} meses
              </span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {scenarios.map((scenario, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: scenario.color }}
                  />
                  <span className="text-sm font-bold">{scenario.label}</span>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor={`revenueGrowthRate-${idx}`}
                    className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
                  >
                    Cresc. Receita Mensal (%)
                  </label>
                  <input
                    id={`revenueGrowthRate-${idx}`}
                    type="number"
                    step="1"
                    value={Math.round(scenario.revenueGrowthRate * 100)}
                    onChange={(e) =>
                      updateScenario(idx, {
                        revenueGrowthRate: Number(e.target.value) / 100,
                      })
                    }
                    className="glass-input w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor={`costReductionRate-${idx}`}
                    className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
                  >
                    Redução Custo Mensal (%)
                  </label>
                  <input
                    id={`costReductionRate-${idx}`}
                    type="number"
                    step="1"
                    value={Math.round(scenario.costReductionRate * 100)}
                    onChange={(e) =>
                      updateScenario(idx, {
                        costReductionRate: Number(e.target.value) / 100,
                      })
                    }
                    className="glass-input w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scenario KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {results.map((result, idx) => (
          <div
            key={idx}
            className="glass-card soft-shadow p-8 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-all"
          >
            <div className="flex items-start justify-between mb-6">
              <div
                className="p-3 rounded-2xl"
                style={{ backgroundColor: `${result.params.color}15` }}
              >
                {idx === 0 ? (
                  <AlertTriangle
                    className="w-6 h-6"
                    style={{ color: result.params.color }}
                  />
                ) : idx === 1 ? (
                  <Calendar
                    className="w-6 h-6"
                    style={{ color: result.params.color }}
                  />
                ) : (
                  <Fuel
                    className="w-6 h-6"
                    style={{ color: result.params.color }}
                  />
                )}
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${result.params.color}15`,
                  color: result.params.color,
                }}
              >
                {result.params.label}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                  Runway
                </p>
                <h3 className="text-4xl font-bold tracking-tight text-foreground">
                  {result.runwayMonths}{" "}
                  <span className="text-lg text-muted-foreground font-normal">
                    meses
                  </span>
                </h3>
              </div>

              <div className="pt-4 border-t border-border/20 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Burn Mensal</span>
                  <span className="font-bold">
                    {formatCurrency(result.monthlyBurn)}
                  </span>
                </div>
                {result.zeroDate && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Cash Zero</span>
                    <span className="font-bold text-destructive">
                      {result.zeroDate}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 opacity-[0.03] pointer-events-none">
              <TrendingDown className="w-32 h-32" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card soft-shadow p-10 rounded-3xl">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">
              Projeção de Caixa
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
              Saldo estimado ao longo do tempo
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DollarSign className="w-5 h-5 text-primary opacity-40" />
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <AreaChart>
            <defs>
              {results.map((r, i) => (
                <linearGradient
                  key={i}
                  id={`gradient-${i}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={r.params.color}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={r.params.color}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              allowDuplicatedCategory={false}
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
                backgroundColor: "rgba(0, 0, 0, 0.85)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "16px",
                color: "#fff",
                padding: "12px 16px",
              }}
              formatter={(value: number) => [formatCurrency(value), ""]}
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
                letterSpacing: "1px",
              }}
            />
            {results.map((r, i) => (
              <Area
                key={i}
                data={r.data}
                type="monotone"
                dataKey="cashBalance"
                name={r.params.label}
                stroke={r.params.color}
                fill={`url(#gradient-${i})`}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: r.params.color }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
