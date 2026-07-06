import { useState } from "react";
import { useMilestones, Milestone } from "../hooks/useMilestones";
import { MilestoneCharts } from "../components/MilestoneCharts";
import {
  Bot,
  Flag,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  X,
  Sparkles,
  Loader2,
  Building,
  CircleDollarSign,
  Users,
  Scale,
} from "lucide-react";

const CATEGORY_ICONS = {
  product: <Sparkles className="w-4 h-4" />,
  financial: <CircleDollarSign className="w-4 h-4" />,
  team: <Users className="w-4 h-4" />,
  fundraising: <Building className="w-4 h-4" />,
  legal: <Scale className="w-4 h-4" />,
};

const CATEGORY_COLORS = {
  product: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  financial: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  team: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  fundraising: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  legal: "text-rose-500 bg-rose-500/10 border-rose-500/20",
};

const STATUS_MAP = {
  planned: {
    label: "Planejado",
    color: "text-slate-500 bg-slate-500/10",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  in_progress: {
    label: "Em Andamento",
    color: "text-blue-500 bg-blue-500/10",
    icon: <Bot className="w-3.5 h-3.5" />,
  }, // Will use alternative inside component
  completed: {
    label: "Concluído",
    color: "text-emerald-500 bg-emerald-500/10",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  delayed: {
    label: "Atrasado",
    color: "text-red-500 bg-red-500/10",
    icon: <X className="w-3.5 h-3.5" />,
  },
};

function MilestoneCard({
  milestone,
  onStatusChange,
}: {
  milestone: Milestone;
  onStatusChange: (id: string, status: string) => void;
}) {
  return (
    <div
      className={`glass-card p-5 rounded-3xl border transition-all hover:shadow-lg ${milestone.status === "completed" ? "border-emerald-500/30 bg-emerald-500/5 opacity-80" : "border-border/40 bg-background/50"}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border ${CATEGORY_COLORS[milestone.category]}`}
        >
          {CATEGORY_ICONS[milestone.category]}
          {milestone.category}
        </div>

        <select
          value={milestone.status}
          onChange={(e) => onStatusChange(milestone.id, e.target.value)}
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-lg appearance-none cursor-pointer outline-none ${STATUS_MAP[milestone.status].color}`}
        >
          <option value="planned">Planejado</option>
          <option value="in_progress">Em Andamento</option>
          <option value="completed">Concluído</option>
          <option value="delayed">Atrasado</option>
        </select>
      </div>

      <h3
        className={`text-lg font-black tracking-tight ${milestone.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}
      >
        {milestone.title}
      </h3>
      {milestone.description && (
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {milestone.description}
        </p>
      )}

      <div className="mt-6 flex items-center gap-4 text-xs font-semibold text-muted-foreground">
        {milestone.target_date && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(milestone.target_date).toLocaleDateString()}
          </div>
        )}
        {milestone.completed_at && (
          <div className="flex items-center gap-1.5 text-emerald-500">
            <CheckCircle2 className="w-4 h-4" />
            {new Date(milestone.completed_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MilestonesTrackerPage() {
  const { milestones, loading, addMilestone, updateMilestone } =
    useMilestones();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [category, setCategory] = useState<Milestone["category"]>("product");

  if (loading && milestones.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await addMilestone({
      title,
      description,
      target_date: targetDate || undefined,
      category,
      status: "planned",
    });
    setIsModalOpen(false);
    setTitle("");
    setDescription("");
    setTargetDate("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-foreground font-display flex items-center gap-4">
            <Flag className="w-10 h-10 text-primary" />
            Milestone Tracker
          </h1>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">
            Acompanhe entregas, metas financeiras e evolução do produto
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black uppercase tracking-wider text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" /> Novo Milestone
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total",
            value: milestones.length,
            color: "text-foreground",
          },
          {
            label: "Concluídos",
            value: milestones.filter((m) => m.status === "completed").length,
            color: "text-emerald-500",
          },
          {
            label: "Em Andamento",
            value: milestones.filter((m) => m.status === "in_progress").length,
            color: "text-blue-500",
          },
          {
            label: "Atrasados",
            value: milestones.filter((m) => m.status === "delayed").length,
            color: "text-red-500",
          },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 rounded-3xl text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
              {stat.label}
            </p>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {milestones.length > 0 && <MilestoneCharts milestones={milestones} />}

      {/* Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 pt-6">
        {/* We'll group by status or simply render a grid of cards */}
        {milestones.length === 0 ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <Flag className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-xl font-bold text-muted-foreground mb-2">
              Nenhum milestone definido
            </h3>
            <p className="text-sm text-muted-foreground/60">
              Os milestones ajudam a equipe a manter o foco em grandes entregas.
            </p>
          </div>
        ) : (
          milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              onStatusChange={(id, status) =>
                updateMilestone(id, { status: status as any })
              }
            />
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background border border-border/40 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden p-8 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-black tracking-tight mb-8">
              Criar Milestone
            </h2>

            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">
                  Título do Milestone
                </label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-muted/30 border border-border/50 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:font-normal"
                  placeholder="Ex: Lançamento do App v2.0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-muted/30 border border-border/50 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                >
                  {Object.entries(CATEGORY_ICONS).map(([key]) => (
                    <option key={key} value={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">
                  Data Alvo (Opcional)
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-muted/30 border border-border/50 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all relative z-20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">
                  Descrição (Opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-muted/30 border border-border/50 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all min-h-[100px]"
                  placeholder="Deixe notas extras aqui..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform mt-4"
              >
                Criar Milestone
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
