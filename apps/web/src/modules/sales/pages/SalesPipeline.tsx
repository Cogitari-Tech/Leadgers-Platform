import { useState } from "react";
import { useDeals, PIPELINE_STAGES } from "../hooks/useDeals";
import {
  TrendingUp,
  Plus,
  DollarSign,
  Target,
  AlertTriangle,
  X,
  GripVertical,
} from "lucide-react";

export default function SalesPipeline() {
  const { deals, loading, error, createDeal, updateDeal, deleteDeal } =
    useDeals();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    value: "",
    stage: "lead",
    probability: "20",
    type: "new_business",
    recurrence: "one_time",
    expected_close_date: "",
    notes: "",
  });

  if (loading && deals.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center text-destructive">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <p className="font-bold">Falha ao carregar pipeline</p>
        <p className="text-sm mt-2 opacity-80">{error}</p>
      </div>
    );
  }

  const activePipeline = PIPELINE_STAGES.filter(
    (s) => s.key !== "won" && s.key !== "lost",
  );
  const totalPipeline = deals
    .filter((d) => d.stage !== "won" && d.stage !== "lost")
    .reduce((sum, d) => sum + Number(d.value), 0);
  const wonTotal = deals
    .filter((d) => d.stage === "won")
    .reduce((sum, d) => sum + Number(d.value), 0);
  const weightedPipeline = deals
    .filter((d) => d.stage !== "won" && d.stage !== "lost")
    .reduce((sum, d) => sum + Number(d.value) * (d.probability / 100), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDeal({
      title: formData.title,
      client_name: formData.client_name,
      value: Number(formData.value) as any,
      stage: formData.stage,
      probability: Number(formData.probability),
      type: formData.type,
      recurrence: formData.recurrence,
      expected_close_date: formData.expected_close_date || null,
      notes: formData.notes || null,
    });
    setFormData({
      title: "",
      client_name: "",
      value: "",
      stage: "lead",
      probability: "20",
      type: "new_business",
      recurrence: "one_time",
      expected_close_date: "",
      notes: "",
    });
    setShowForm(false);
  };

  const handleStageMove = async (dealId: string, newStage: string) => {
    const prob =
      newStage === "won"
        ? 100
        : newStage === "lost"
          ? 0
          : newStage === "negotiation"
            ? 70
            : newStage === "proposal"
              ? 50
              : newStage === "qualified"
                ? 30
                : 20;
    await updateDeal(dealId, { stage: newStage, probability: prob });
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(val);

  return (
    <div className="space-y-8 max-w-full mx-auto pb-12 px-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            Pipeline de Vendas
          </h1>
          <p className="text-sm text-muted-foreground mt-1 uppercase tracking-widest font-bold opacity-60">
            Gerencie oportunidades e acompanhe o funil comercial
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-[11px] font-black uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nova Oportunidade
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-3xl border-border/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Pipeline Total
            </p>
            <p className="text-2xl font-black text-foreground">
              {formatCurrency(totalPipeline)}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl border-border/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Receita Ponderada
            </p>
            <p className="text-2xl font-black text-foreground">
              {formatCurrency(weightedPipeline)}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl border-border/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Won (Fechados)
            </p>
            <p className="text-2xl font-black text-foreground">
              {formatCurrency(wonTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {activePipeline.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.key);
          const stageTotal = stageDeals.reduce(
            (sum, d) => sum + Number(d.value),
            0,
          );

          return (
            <div
              key={stage.key}
              className="min-w-[280px] flex-1 glass-panel rounded-3xl border-border/30 p-4 space-y-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const dealId = e.dataTransfer.getData("dealId");
                if (dealId) handleStageMove(dealId, stage.key);
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  <span className="text-xs font-black uppercase tracking-widest text-foreground">
                    {stage.label}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                  {stageDeals.length} · {formatCurrency(stageTotal)}
                </span>
              </div>

              <div className="space-y-2 min-h-[120px]">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData("dealId", deal.id)
                    }
                    className="group bg-background/60 rounded-2xl p-4 border border-border/20 hover:border-primary/30 cursor-grab active:cursor-grabbing transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">
                          {deal.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          {deal.client_name}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteDeal(deal.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-black text-primary">
                        {formatCurrency(Number(deal.value))}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {deal.probability}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Won / Lost summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["won", "lost"].map((status) => {
          const statusDeals = deals.filter((d) => d.stage === status);
          const stageInfo = PIPELINE_STAGES.find((s) => s.key === status)!;
          return (
            <div
              key={status}
              className="glass-panel rounded-3xl border-border/30 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${stageInfo.color}`} />
                <span className="text-xs font-black uppercase tracking-widest text-foreground">
                  {stageInfo.label} ({statusDeals.length})
                </span>
              </div>
              {statusDeals.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Nenhum deal nesta categoria
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {statusDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="flex justify-between text-sm py-1.5 border-b border-border/10 last:border-0"
                    >
                      <span className="font-medium truncate pr-4">
                        {deal.title}
                      </span>
                      <span className="font-bold text-foreground flex-shrink-0">
                        {formatCurrency(Number(deal.value))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Deal Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="glass-panel rounded-3xl p-8 w-full max-w-xl space-y-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tight">
                Nova Oportunidade
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Título
                </label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary"
                  placeholder="Ex: Plano Enterprise - Acme Corp"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Cliente
                </label>
                <input
                  required
                  value={formData.client_name}
                  onChange={(e) =>
                    setFormData({ ...formData, client_name: e.target.value })
                  }
                  className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary"
                  placeholder="Acme Corp"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Valor (BRL)
                </label>
                <input
                  type="number"
                  required
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary"
                  placeholder="50000"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Estágio
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) =>
                    setFormData({ ...formData, stage: e.target.value })
                  }
                  className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary"
                >
                  {PIPELINE_STAGES.filter(
                    (s) => s.key !== "won" && s.key !== "lost",
                  ).map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Probabilidade %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) =>
                    setFormData({ ...formData, probability: e.target.value })
                  }
                  className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Previsão de Fechamento
                </label>
                <input
                  type="date"
                  value={formData.expected_close_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expected_close_date: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Recorrência
                </label>
                <select
                  value={formData.recurrence}
                  onChange={(e) =>
                    setFormData({ ...formData, recurrence: e.target.value })
                  }
                  className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary"
                >
                  <option value="one_time">Pontual</option>
                  <option value="monthly">Mensal (MRR)</option>
                  <option value="annual">Anual</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-primary py-4 text-[11px] font-black uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Criar Oportunidade
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
