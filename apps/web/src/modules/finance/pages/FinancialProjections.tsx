import { useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  Presentation,
  Download,
  Save,
  Trash2,
  Settings,
  X,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useFinancialProjections } from "../hooks/useFinancialProjections";

export default function FinancialProjections() {
  const {
    projections,
    assumptions,
    yearsAhead,
    activeScenario,
    chartData,
    loading,
    setAssumptions,
    setYearsAhead,
    setActiveScenario,
    saveProjection,
    deleteProjection,
    formatCurrency,
  } = useFinancialProjections();

  const [showSettings, setShowSettings] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const printRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>Projeções Financeiras - Leadgers Governance</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', system-ui, sans-serif; }
                body { padding: 40px; background: #0a0a0a; color: #fafafa; }
                .header { font-size: 32px; font-weight: 800; margin-bottom: 8px; }
                .subtitle { color: #888; font-size: 14px; margin-bottom: 40px; }
                .scenario-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 40px; }
                .scenario-card { background: #1a1a1a; border: 1px solid #333; border-radius: 24px; padding: 24px; }
                .scenario-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #888; }
                .scenario-value { font-size: 24px; font-weight: 800; margin-top: 4px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #222; font-size: 12px; }
                th { font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #888; font-size: 10px; }
                .text-primary { color: #3b82f6; }
                .text-green { color: #10b981; }
                .text-red { color: #ef4444; }
                @media print { body { background: white; color: black; } .scenario-card { background: #f5f5f5; border-color: #ddd; } th { color: #666; } td { border-color: #eee; } }
              </style>
            </head>
            <body>
              <div class="header">Leadgers Governance</div>
              <div class="subtitle">Projeção de ${yearsAhead} anos • Gerado em ${new Date().toLocaleDateString("pt-BR")}</div>
              ${printContent}
              <script>setTimeout(() => window.print(), 500);</script>
            </body>
          </html>
        `);
        win.document.close();
      }
    }
  };

  const scenarioColors = {
    pessimistic: "#ef4444",
    base: "#3b82f6",
    optimistic: "#10b981",
  };

  const scenarioLabels = {
    pessimistic: "Pessimista",
    base: "Base",
    optimistic: "Otimista",
  };

  return (
    <div className="space-y-8 font-sans">
      {/* SEO Metadata */}
      <div className="hidden" aria-hidden="true">
        <title>Projeções Financeiras | Leadgers Governance</title>
        <meta
          name="description"
          content="Gere projeções financeiras detalhadas para o seu pitch deck com 3 cenários integrados."
        />
        <meta
          property="og:title"
          content="Projeções Financeiras - Leadgers Governance"
        />
        <meta
          property="og:description"
          content="Modele o futuro financeiro da sua startup."
        />
      </div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
            <Presentation className="w-3.5 h-3.5" />
            Financial Engineering
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter font-display uppercase italic">
            Projeções <span className="text-primary">Financeiras</span>
          </h1>
          <p className="text-muted-foreground font-medium max-w-lg">
            Modelagem preditiva de {yearsAhead} anos para Pitch Decks e
            Governança de Caixa.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="rounded-2xl px-6 h-12 font-black uppercase tracking-widest text-[10px]"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-2" /> Premissas
          </Button>
          <Button
            variant="secondary"
            className="rounded-2xl px-6 h-12 font-black uppercase tracking-widest text-[10px]"
            onClick={() => setShowSaveModal(true)}
          >
            <Save className="w-4 h-4 mr-2" /> Salvar
          </Button>
          <Button
            variant="primary"
            className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
            onClick={handleExportPDF}
          >
            <Download className="w-4 h-4 mr-2" /> Exportar Pitch
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="glass-card soft-shadow p-10 rounded-3xl animate-in slide-in-from-top-4">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-8">
            Premissas do Modelo Preditivo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Crescimento Receita Base (%)
              </label>
              <input
                type="number"
                value={Math.round(assumptions.revenueGrowthBase * 100)}
                onChange={(e) =>
                  setAssumptions({
                    ...assumptions,
                    revenueGrowthBase: Number(e.target.value) / 100,
                  })
                }
                className="w-full px-6 py-4 rounded-2xl bg-background/50 border border-border/40 text-sm font-bold outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Crescimento Despesa Base (%)
              </label>
              <input
                type="number"
                value={Math.round(assumptions.expenseGrowthBase * 100)}
                onChange={(e) =>
                  setAssumptions({
                    ...assumptions,
                    expenseGrowthBase: Number(e.target.value) / 100,
                  })
                }
                className="w-full px-6 py-4 rounded-2xl bg-background/50 border border-border/40 text-sm font-bold outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Melhoria de Margem Anual (%)
              </label>
              <input
                type="number"
                value={Math.round(assumptions.marginImprovement * 100)}
                onChange={(e) =>
                  setAssumptions({
                    ...assumptions,
                    marginImprovement: Number(e.target.value) / 100,
                  })
                }
                className="w-full px-6 py-4 rounded-2xl bg-background/50 border border-border/40 text-sm font-bold outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
          <div className="mt-10 flex gap-6 items-center bg-background/40 p-6 rounded-2xl border border-border/20">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest shrink-0">
              Janela de Projeção
            </label>
            <input
              type="range"
              min={3}
              max={10}
              value={yearsAhead}
              onChange={(e) => setYearsAhead(Number(e.target.value))}
              className="accent-primary flex-1 h-1.5 rounded-full bg-muted cursor-pointer"
            />
            <span className="text-xl font-black w-10 text-primary">
              {yearsAhead} ANOS
            </span>
          </div>
        </div>
      )}

      {/* Chart Controls */}
      <div className="flex gap-4 items-center">
        <div className="flex bg-muted/30 rounded-2xl p-1.5 border border-border/20">
          {(["all", "pessimistic", "base", "optimistic"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveScenario(s)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeScenario === s ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
            >
              {s === "all" ? "Visão Geral" : scenarioLabels[s]}
            </button>
          ))}
        </div>
        <div className="flex bg-muted/30 rounded-2xl p-1.5 ml-auto border border-border/20">
          <button
            onClick={() => setChartType("bar")}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${chartType === "bar" ? "bg-foreground/10 text-foreground" : "text-muted-foreground"}`}
          >
            Barras
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${chartType === "line" ? "bg-foreground/10 text-foreground" : "text-muted-foreground"}`}
          >
            Linhas
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card soft-shadow p-12 rounded-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
          <ShieldCheck className="w-64 h-64" />
        </div>
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-foreground font-display tracking-tight uppercase">
              Receita Projetada
            </h2>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
              Visão Multi-Cenário (M-ARR / Y-ARR)
            </p>
          </div>
          <Presentation className="w-8 h-8 text-primary opacity-20" />
        </div>

        <div className="relative z-10">
          <ResponsiveContainer width="100%" height={450}>
            {chartType === "bar" ? (
              <BarChart data={chartData} barCategoryGap="20%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="year"
                  tick={{
                    fill: "rgba(255,255,255,0.4)",
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fill: "rgba(255,255,255,0.4)",
                    fontSize: 10,
                    fontWeight: 900,
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.9)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "24px",
                    padding: "16px",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                  }}
                  itemStyle={{
                    fontWeight: 800,
                    textTransform: "uppercase",
                    fontSize: "10px",
                  }}
                  labelStyle={{
                    fontWeight: 900,
                    color: "#3b82f6",
                    marginBottom: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(v: number) => [formatCurrency(v), ""]}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{
                    paddingBottom: "40px",
                    fontSize: "10px",
                    fontWeight: 900,
                    textTransform: "uppercase" as const,
                    letterSpacing: "1px",
                  }}
                />
                {(activeScenario === "all" ||
                  activeScenario === "pessimistic") && (
                  <Bar
                    dataKey="pessimisticRevenue"
                    name="Pessimista"
                    fill="#ef4444"
                    radius={[12, 12, 0, 0]}
                    opacity={0.8}
                  />
                )}
                {(activeScenario === "all" || activeScenario === "base") && (
                  <Bar
                    dataKey="baseRevenue"
                    name="Base"
                    fill="#3b82f6"
                    radius={[12, 12, 0, 0]}
                    opacity={0.8}
                  />
                )}
                {(activeScenario === "all" ||
                  activeScenario === "optimistic") && (
                  <Bar
                    dataKey="optimisticRevenue"
                    name="Otimista"
                    fill="#10b981"
                    radius={[12, 12, 0, 0]}
                    opacity={0.8}
                  />
                )}
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="year"
                  tick={{
                    fill: "rgba(255,255,255,0.4)",
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fill: "rgba(255,255,255,0.4)",
                    fontSize: 10,
                    fontWeight: 900,
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.9)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "24px",
                  }}
                  formatter={(v: number) => [formatCurrency(v), ""]}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{
                    paddingBottom: "40px",
                    fontSize: "10px",
                    fontWeight: 900,
                    textTransform: "uppercase" as const,
                  }}
                />
                {(activeScenario === "all" ||
                  activeScenario === "pessimistic") && (
                  <Line
                    type="monotone"
                    dataKey="pessimisticRevenue"
                    name="Pessimista"
                    stroke="#ef4444"
                    strokeWidth={4}
                    dot={{ fill: "#ef4444", r: 4 }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                )}
                {(activeScenario === "all" || activeScenario === "base") && (
                  <Line
                    type="monotone"
                    dataKey="baseRevenue"
                    name="Base"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                )}
                {(activeScenario === "all" ||
                  activeScenario === "optimistic") && (
                  <Line
                    type="monotone"
                    dataKey="optimisticRevenue"
                    name="Otimista"
                    stroke="#10b981"
                    strokeWidth={4}
                    dot={{ fill: "#10b981", r: 4 }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Profit Chart */}
      <div className="glass-card soft-shadow p-12 rounded-3xl">
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-foreground font-display tracking-tight uppercase">
              Fluxo de Lucro
            </h2>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
              Yield & Operational Efficiency
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              tick={{
                fill: "rgba(255,255,255,0.4)",
                fontSize: 12,
                fontWeight: 900,
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{
                fill: "rgba(255,255,255,0.4)",
                fontSize: 10,
                fontWeight: 900,
              }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$${(v / 1000000).toFixed(1)}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.9)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "24px",
              }}
              formatter={(v: number) => [formatCurrency(v), ""]}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{
                paddingBottom: "30px",
                fontSize: "10px",
                fontWeight: 900,
                textTransform: "uppercase" as const,
              }}
            />
            {(activeScenario === "all" || activeScenario === "pessimistic") && (
              <Bar
                dataKey="pessimisticProfit"
                name="Pessimista"
                fill="#ef444480"
                radius={[8, 8, 0, 0]}
              />
            )}
            {(activeScenario === "all" || activeScenario === "base") && (
              <Bar
                dataKey="baseProfit"
                name="Base"
                fill="#3b82f680"
                radius={[8, 8, 0, 0]}
              />
            )}
            {(activeScenario === "all" || activeScenario === "optimistic") && (
              <Bar
                dataKey="optimisticProfit"
                name="Otimista"
                fill="#10b98180"
                radius={[8, 8, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Hidden Print Content */}
      <div ref={printRef} className="hidden">
        <div className="scenario-grid">
          {(["pessimistic", "base", "optimistic"] as const).map((s) => (
            <div key={s} className="scenario-card">
              <p className="scenario-label">{scenarioLabels[s]}</p>
              <p
                className="scenario-value"
                style={{ color: scenarioColors[s] }}
              >
                {formatCurrency(
                  chartData[chartData.length - 1]?.[`${s}Revenue`] || 0,
                )}
              </p>
              <p className="scenario-label" style={{ marginTop: "8px" }}>
                Receita Ano {yearsAhead}
              </p>
            </div>
          ))}
        </div>
        <table>
          <thead>
            <tr>
              <th>Ano</th>
              <th>Receita (Pessim.)</th>
              <th>Receita (Base)</th>
              <th>Receita (Otim.)</th>
              <th>Lucro (Base)</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row) => (
              <tr key={row.year}>
                <td style={{ fontWeight: 700 }}>{row.year}</td>
                <td className="text-red">
                  {formatCurrency(row.pessimisticRevenue)}
                </td>
                <td className="text-primary">
                  {formatCurrency(row.baseRevenue)}
                </td>
                <td className="text-green">
                  {formatCurrency(row.optimisticRevenue)}
                </td>
                <td style={{ fontWeight: 700 }}>
                  {formatCurrency(row.baseProfit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Saved Projections */}
      {projections.length > 0 && (
        <div className="glass-card soft-shadow overflow-hidden rounded-3xl">
          <div className="p-10 border-b border-border/20">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
              Biblioteca de Simulações
            </h3>
          </div>
          <div className="divide-y divide-border/10">
            {projections.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-10 py-8 hover:bg-muted/30 transition-all group"
              >
                <div className="flex items-center gap-8">
                  <div className="w-14 h-14 rounded-[1.25rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black tracking-tight uppercase">
                      {p.name}
                    </h4>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-1">
                      {p.start_year} → {p.end_year} •{" "}
                      {new Date(p.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteProjection(p.id)}
                  className="p-4 rounded-2xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-destructive/20"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-background/90 backdrop-blur-2xl"
            onClick={() => setShowSaveModal(false)}
          />
          <div className="relative glass-card soft-shadow p-12 w-full max-w-md z-10 rounded-3xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-black font-display tracking-tight uppercase italic">
                Salvar Projeção
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveProjection(saveName);
                setShowSaveModal(false);
                setSaveName("");
              }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                  Nome da Simulação
                </label>
                <input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="w-full px-6 py-5 rounded-2xl bg-background border border-border text-foreground text-base font-bold outline-none focus:border-primary transition-all"
                  placeholder="Ex: Pitch Series A 2026"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20"
                >
                  {loading ? "Gravando..." : "Confirmar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
