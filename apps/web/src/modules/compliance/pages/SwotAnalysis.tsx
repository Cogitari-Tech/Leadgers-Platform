import { useState } from "react";
import {
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Zap,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import type { SwotType } from "../types/compliance.types";
import { useSwot } from "../hooks/useSwot";

const QUADRANT_CONFIG: Record<
  SwotType,
  {
    label: string;
    labelEn: string;
    icon: React.ElementType;
    color: string;
    borderColor: string;
    bgHover: string;
  }
> = {
  strength: {
    label: "Forças",
    labelEn: "Strengths",
    icon: TrendingUp,
    color: "text-emerald-500",
    borderColor: "border-emerald-500/30",
    bgHover: "hover:bg-emerald-500/5",
  },
  weakness: {
    label: "Fraquezas",
    labelEn: "Weaknesses",
    icon: TrendingDown,
    color: "text-destructive",
    borderColor: "border-destructive/30",
    bgHover: "hover:bg-destructive/5",
  },
  opportunity: {
    label: "Oportunidades",
    labelEn: "Opportunities",
    icon: Zap,
    color: "text-primary",
    borderColor: "border-primary/30",
    bgHover: "hover:bg-primary/5",
  },
  threat: {
    label: "Ameaças",
    labelEn: "Threats",
    icon: ShieldAlert,
    color: "text-amber-500",
    borderColor: "border-amber-500/30",
    bgHover: "hover:bg-amber-500/5",
  },
};

export default function SwotAnalysis() {
  const { items, loading, addItem, removeItem } = useSwot();
  const [showModal, setShowModal] = useState<SwotType | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImpact, setFormImpact] = useState(3);

  const handleAddItem = async () => {
    if (!showModal || !formTitle.trim()) return;
    await addItem({
      type: showModal,
      title: formTitle.trim(),
      description: formDescription.trim(),
      impact: formImpact,
    });
    setShowModal(null);
    setFormTitle("");
    setFormDescription("");
    setFormImpact(3);
  };

  const quadrantOrder: SwotType[] = [
    "strength",
    "weakness",
    "opportunity",
    "threat",
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-1 bg-primary rounded-full" />
            <h1 className="text-4xl font-bold tracking-tight font-display">
              Análise SWOT
            </h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Fatores internos e externos para planejamento estratégico.
          </p>
        </div>
      </div>

      {/* Axis Labels */}
      <div className="hidden lg:grid grid-cols-2 gap-4 text-center">
        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
          ← Fatores Internos →
        </p>
        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
          ← Fatores Externos →
        </p>
      </div>

      {/* SWOT Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {quadrantOrder.map((type) => {
          const cfg = QUADRANT_CONFIG[type];
          const Icon = cfg.icon;
          const quadrantItems = items
            .filter((i) => i.type === type)
            .sort((a, b) => b.impact - a.impact);

          return (
            <div
              key={type}
              className={`glass-card soft-shadow p-0 bg-muted/20 dark:bg-card/40 backdrop-blur-xl rounded-2xl border border-border flex flex-col overflow-hidden`}
            >
              {/* Quadrant Header */}
              <div className="p-8 border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-2xl bg-muted/50 transition-transform group-hover:scale-110`}
                  >
                    <Icon className={`w-6 h-6 ${cfg.color}`} />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-bold font-display tracking-tight ${cfg.color}`}
                    >
                      {cfg.label}
                    </h3>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                      {cfg.labelEn}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-muted-foreground/60">
                    {quadrantItems.length} itens
                  </span>
                  <button
                    onClick={() => setShowModal(type)}
                    className="p-2 rounded-xl bg-muted/50 hover:bg-primary/20 hover:text-primary transition-all group"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Items */}
              <div className="flex-1 p-6 space-y-4 min-h-[250px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">
                      Carregando...
                    </p>
                  </div>
                ) : quadrantItems.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground/30">
                    <p className="text-[10px] font-bold uppercase tracking-widest">
                      Nenhum item registrado
                    </p>
                  </div>
                ) : (
                  quadrantItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-foreground/5 ${cfg.color}`}
                            >
                              P{item.impact}
                            </span>
                            <h4 className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                              {item.title}
                            </h4>
                          </div>
                          <p className="text-xs text-muted-foreground/80 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Item Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-md transition-all animate-in fade-in duration-300"
            onClick={() => setShowModal(null)}
          />
          <div className="relative glass-panel soft-shadow p-10 w-full max-w-lg z-10 rounded-3xl border-border/50 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">
                  Adicionar Elemento SWOT
                </h3>
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                  Quadrante: {QUADRANT_CONFIG[showModal].label}
                </p>
              </div>
              <button
                onClick={() => setShowModal(null)}
                className="p-3 rounded-full bg-foreground/5 text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label
                  htmlFor="swot-title"
                  className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1"
                >
                  Título do Fator Estratégico
                </label>
                <input
                  id="swot-title"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="Ex: Equipe técnica qualificada"
                />
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="swot-desc"
                  className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1"
                >
                  Breve Descrição
                </label>
                <textarea
                  id="swot-desc"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none h-32"
                  placeholder="Detalhes sobre este fator..."
                />
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Nível de Impacto
                </label>
                <div className="flex justify-between gap-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setFormImpact(n)}
                      className={`flex-1 h-12 rounded-xl font-bold text-sm transition-all ${
                        formImpact === n
                          ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                          : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleAddItem}
                disabled={!formTitle.trim()}
                className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
              >
                Adicionar à Matriz
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
