import { useState } from "react";
import {
  Plus,
  X,
  AlertTriangle,
  ShieldCheck,
  ArrowRightLeft,
  CheckCircle2,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import type {
  RiskEntry,
  RiskLikelihood,
  RiskImpact,
} from "../types/compliance.types";
import { useRisks } from "../hooks/useRisks";

const LIKELIHOOD_LABELS = [
  "",
  "Muito Baixa",
  "Baixa",
  "Média",
  "Alta",
  "Muito Alta",
];
const IMPACT_LABELS = ["", "Mínimo", "Baixo", "Moderado", "Alto", "Severo"];

const getCategoryLabel = (cat: RiskEntry["category"]) => {
  const map: Record<string, string> = {
    operational: "Operacional",
    financial: "Financeiro",
    strategic: "Estratégico",
    compliance: "Compliance",
    cybersecurity: "Cybersecurity",
  };
  return map[cat] ?? cat;
};

const getStatusConfig = (status: RiskEntry["status"]) => {
  switch (status) {
    case "open":
      return {
        label: "Aberto",
        icon: AlertTriangle,
        color: "text-destructive border-destructive/30 bg-destructive/5",
      };
    case "mitigated":
      return {
        label: "Mitigado",
        icon: ShieldCheck,
        color: "text-emerald-500 border-emerald-500/30 bg-emerald-500/5",
      };
    case "accepted":
      return {
        label: "Aceito",
        icon: CheckCircle2,
        color: "text-amber-500 border-amber-500/30 bg-amber-500/5",
      };
    case "transferred":
      return {
        label: "Transferido",
        icon: ArrowRightLeft,
        color: "text-primary border-primary/30 bg-primary/5",
      };
  }
};

const getRiskColor = (score: number): string => {
  if (score >= 15) return "bg-red-600";
  if (score >= 10) return "bg-orange-500";
  if (score >= 5) return "bg-amber-500";
  return "bg-emerald-500";
};

const getRiskTextColor = (score: number): string => {
  if (score >= 15) return "text-red-500";
  if (score >= 10) return "text-orange-500";
  if (score >= 5) return "text-amber-500";
  return "text-emerald-500";
};

const getRiskBgColor = (score: number): string => {
  if (score >= 15) return "bg-red-600";
  if (score >= 10) return "bg-orange-600";
  if (score >= 5) return "bg-amber-600";
  return "bg-emerald-600";
};

export default function RiskAssessment() {
  const { risks, loading, addRisk: addRiskApi, removeRisk } = useRisks();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"register" | "matrix">("register");

  // Form state
  const [fTitle, setFTitle] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fCat, setFCat] = useState<RiskEntry["category"]>("operational");
  const [fLikelihood, setFLikelihood] = useState<RiskLikelihood>(3);
  const [fImpact, setFImpact] = useState<RiskImpact>(3);
  const [fOwner, setFOwner] = useState("");

  const handleAddRisk = async () => {
    if (!fTitle.trim()) return;
    await addRiskApi({
      title: fTitle.trim(),
      description: fDesc.trim(),
      category: fCat,
      likelihood: fLikelihood,
      impact: fImpact,
      score: fLikelihood * fImpact,
      status: "open",
      owner: fOwner.trim() || undefined,
    });
    setShowModal(false);
    setFTitle("");
    setFDesc("");
    setFCat("operational");
    setFLikelihood(3);
    setFImpact(3);
    setFOwner("");
  };

  // Build heatmap data (5x5 grid)
  const matrixData: RiskEntry[][][] = Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, () => [] as RiskEntry[]),
  );
  risks.forEach((r) => {
    matrixData[5 - r.likelihood][r.impact - 1].push(r);
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-1 bg-primary rounded-full" />
            <h1 className="text-4xl font-bold tracking-tight font-display">
              Controle de Riscos
            </h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Avaliação e monitoramento de riscos corporativos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowModal(true)}
            variant="primary"
            className="rounded-2xl px-6 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Risco
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-foreground/5 rounded-2xl w-fit">
        {[
          { key: "register" as const, label: "Registro de Riscos" },
          { key: "matrix" as const, label: "Heatmap 5×5" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-xl ${
              activeTab === tab.key
                ? "bg-white dark:bg-white/10 text-primary shadow-sm"
                : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "register" ? (
        <div className="glass-card soft-shadow overflow-hidden rounded-3xl">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 p-8 border-b border-border/40 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] bg-muted/10">
            <div className="col-span-4">Identificação do Risco</div>
            <div className="col-span-2">Categoria</div>
            <div className="col-span-1 text-center">Prob.</div>
            <div className="col-span-1 text-center">Imp.</div>
            <div className="col-span-1 text-center">Score</div>
            <div className="col-span-1">Dono</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1"></div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/10 min-h-[150px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 text-muted-foreground/50 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  Carregando riscos...
                </p>
              </div>
            ) : (
              risks
                .sort((a, b) => b.score - a.score)
                .map((risk) => {
                  const cfg = getStatusConfig(risk.status);
                  const StatusIcon = cfg.icon;
                  return (
                    <div
                      key={risk.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 p-8 hover:bg-muted/50 transition-all items-center group"
                    >
                      <div className="col-span-4">
                        <h4 className="text-base font-bold text-foreground transition-colors group-hover:text-primary">
                          {risk.title}
                        </h4>
                        <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-1 leading-relaxed">
                          {risk.description}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2 py-1 bg-foreground/5 rounded-md">
                          {getCategoryLabel(risk.category)}
                        </span>
                      </div>
                      <div className="col-span-1 text-center">
                        <span className="text-sm font-bold text-foreground">
                          {risk.likelihood}
                        </span>
                      </div>
                      <div className="col-span-1 text-center">
                        <span className="text-sm font-bold text-foreground">
                          {risk.impact}
                        </span>
                      </div>
                      <div className="col-span-1 text-center">
                        <div
                          className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-foreground/5`}
                        >
                          <span
                            className={`text-lg font-bold ${getRiskTextColor(risk.score)}`}
                          >
                            {risk.score}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] font-bold">
                            {risk.owner?.charAt(0) ?? "?"}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            {risk.owner ?? "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-1">
                        <span
                          className={`inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border ${cfg.color} shadow-sm`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>
                      <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => removeRisk(risk.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Remover Risco"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      ) : (
        /* Heatmap Matrix */
        <div className="glass-card soft-shadow p-12 rounded-3xl">
          <div className="flex items-end gap-8 overflow-x-auto pb-6">
            {/* Y-axis label */}
            <div className="flex flex-col items-center justify-center py-4">
              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.4em] [writing-mode:vertical-lr] rotate-180 mb-2 whitespace-nowrap">
                PROBABILIDADE →
              </span>
            </div>

            <div className="flex-1 min-w-[500px]">
              {/* Matrix Grid */}
              <div className="grid grid-cols-5 gap-3">
                {matrixData.map((row, rowIdx) =>
                  row.map((cell, colIdx) => {
                    const likelihood = 5 - rowIdx;
                    const impact = colIdx + 1;
                    const score = likelihood * impact;
                    const hasRisks = cell.length > 0;

                    return (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        className="relative aspect-square flex flex-col items-center justify-center rounded-2xl border border-black/5 dark:border-white/5 transition-all duration-300 group hover:scale-[1.05] hover:z-10 bg-muted/30 dark:bg-muted/10 overflow-hidden"
                        style={{
                          boxShadow: hasRisks
                            ? `0 8px 24px -4px var(--tw-shadow-color, rgba(0,0,0,0.2))`
                            : "none",
                        }}
                        title={`Probability: ${LIKELIHOOD_LABELS[likelihood]}, Impact: ${IMPACT_LABELS[impact]} — Score: ${score}`}
                      >
                        {/* Background color layer */}
                        <div
                          className={`absolute inset-0 transition-opacity duration-300 ${getRiskColor(score)} ${hasRisks ? "opacity-100 dark:opacity-90" : "opacity-0 group-hover:opacity-20"}`}
                        />

                        {/* Content layer */}
                        <div className="relative z-10 flex flex-col items-center justify-center">
                          <span
                            className={`font-bold text-2xl tracking-tight transition-colors ${hasRisks ? "text-white" : "text-muted-foreground/40 group-hover:text-foreground/70"}`}
                          >
                            {score}
                          </span>
                          {hasRisks && (
                            <span className="text-white/90 text-[10px] font-bold uppercase tracking-widest mt-1 px-2 py-0.5 bg-black/20 rounded-full shadow-sm">
                              {cell.length}{" "}
                              {cell.length > 1 ? "Riscos" : "Risco"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }),
                )}
              </div>

              {/* X-axis labels */}
              <div className="grid grid-cols-5 gap-3 mt-6">
                {IMPACT_LABELS.slice(1).map((label, idx) => (
                  <div key={idx} className="text-center">
                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-center text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.5em] mt-8">
                IMPACTO CORPORATIVO →
              </p>
            </div>

            {/* Y-axis labels */}
            <div className="flex flex-col-reverse gap-3 pb-24">
              {LIKELIHOOD_LABELS.slice(1).map((label, idx) => (
                <div
                  key={idx}
                  className="h-[calc((100%-48px)/5)] flex items-center"
                >
                  <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest whitespace-nowrap">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-12 flex flex-wrap items-center gap-8 justify-center border-t border-border/10 pt-10">
            {[
              { label: "Crítico", range: "(15-25)", color: "bg-red-600" },
              { label: "Alto", range: "(10-14)", color: "bg-orange-500" },
              { label: "Médio", range: "(5-9)", color: "bg-amber-500" },
              { label: "Baixo", range: "(1-4)", color: "bg-emerald-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full ${item.color} shadow-lg shadow-current/30`}
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-foreground/80 uppercase tracking-widest leading-none">
                    {item.label}
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground/50 tracking-widest">
                    {item.range}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Risk Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-xl transition-all animate-in fade-in duration-300"
            onClick={() => setShowModal(false)}
          />
          <div className="relative glass-panel soft-shadow p-10 w-full max-w-2xl z-10 rounded-3xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">
                  Registrar Risco
                </h3>
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                  Nova entrada na matriz de riscos
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-3 rounded-full bg-foreground/5 text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label
                  htmlFor="riskTitle"
                  className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1"
                >
                  Título do Risco
                </label>
                <input
                  id="riskTitle"
                  type="text"
                  value={fTitle}
                  onChange={(e) => setFTitle(e.target.value)}
                  className="glass-input w-full px-6 py-4 rounded-2xl bg-white/5 border-white/10 text-foreground text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="Ex: Acesso não autorizado a dados"
                />
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="riskDesc"
                  className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1"
                >
                  Descrição do Cenário
                </label>
                <textarea
                  id="riskDesc"
                  value={fDesc}
                  onChange={(e) => setFDesc(e.target.value)}
                  className="glass-input w-full px-6 py-4 rounded-2xl bg-white/5 border-white/10 text-foreground text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none h-24"
                  placeholder="Detalhes sobre como o risco pode se manifestar..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label
                    htmlFor="riskCat"
                    className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1"
                  >
                    Categoria
                  </label>
                  <select
                    id="riskCat"
                    value={fCat}
                    onChange={(e) =>
                      setFCat(e.target.value as RiskEntry["category"])
                    }
                    className="glass-input w-full px-6 py-4 rounded-2xl bg-white/5 border-white/10 text-foreground text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option
                      value="operational"
                      className="bg-background text-foreground"
                    >
                      Operacional
                    </option>
                    <option
                      value="financial"
                      className="bg-background text-foreground"
                    >
                      Financeiro
                    </option>
                    <option
                      value="strategic"
                      className="bg-background text-foreground"
                    >
                      Estratégico
                    </option>
                    <option
                      value="compliance"
                      className="bg-background text-foreground"
                    >
                      Compliance
                    </option>
                    <option
                      value="cybersecurity"
                      className="bg-background text-foreground"
                    >
                      Cybersecurity
                    </option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="riskOwner"
                    className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1"
                  >
                    Responsável
                  </label>
                  <input
                    id="riskOwner"
                    type="text"
                    value={fOwner}
                    onChange={(e) => setFOwner(e.target.value)}
                    className="glass-input w-full px-6 py-4 rounded-2xl bg-white/5 border-white/10 text-foreground text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    placeholder="Ex: CISO / CTO"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    Probabilidade
                  </label>
                  <div className="flex justify-between gap-2">
                    {([1, 2, 3, 4, 5] as RiskLikelihood[]).map((n) => (
                      <button
                        key={n}
                        onClick={() => setFLikelihood(n)}
                        className={`flex-1 h-12 rounded-xl font-bold text-sm transition-all ${
                          fLikelihood === n
                            ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110 z-10"
                            : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    Impacto
                  </label>
                  <div className="flex justify-between gap-2">
                    {([1, 2, 3, 4, 5] as RiskImpact[]).map((n) => (
                      <button
                        key={n}
                        onClick={() => setFImpact(n)}
                        className={`flex-1 h-12 rounded-xl font-bold text-sm transition-all ${
                          fImpact === n
                            ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110 z-10"
                            : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-foreground/5 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">
                    Impacto Final Calculado
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    O score determina a prioridade de mitigação.
                  </p>
                </div>
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl shadow-current/20 ${getRiskBgColor(fLikelihood * fImpact)}`}
                >
                  <span className="text-3xl font-bold text-white">
                    {fLikelihood * fImpact}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleAddRisk}
                disabled={!fTitle.trim()}
                className="w-full h-16 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                Finalizar Registro
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
