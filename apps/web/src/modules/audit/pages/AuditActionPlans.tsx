import { useState } from "react";
import {
  ClipboardCheck,
  Plus,
  Search,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Button, Input, Select } from "@/shared/components/ui";
import { useAudit } from "../hooks/useAudit";
import type {
  ActionPlanPriority,
  ActionPlanStatus,
  CreateActionPlanInput,
  AuditActionPlan,
} from "../types/audit.types";
import { useGitHub } from "../../github/hooks/useGitHub";
import { Loader2 } from "lucide-react";

const PRIORITY_CONFIG: Record<
  ActionPlanPriority,
  { label: string; color: string }
> = {
  critical: {
    label: "Crítica",
    color: "text-red-400 bg-red-400/10 border-red-400/20 shadow-red-400/10",
  },
  high: {
    label: "Alta",
    color:
      "text-orange-400 bg-orange-400/10 border-orange-400/20 shadow-orange-400/10",
  },
  medium: {
    label: "Média",
    color:
      "text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-amber-400/10",
  },
  low: {
    label: "Baixa",
    color:
      "text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-emerald-400/10",
  },
};

const STATUS_CONFIG: Record<
  ActionPlanStatus,
  { label: string; color: string }
> = {
  pending: {
    label: "Pendente",
    color: "text-slate-400 bg-slate-400/10 border-slate-400/20",
  },
  in_progress: {
    label: "Em Andamento",
    color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
  },
  completed: {
    label: "Concluído",
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  },
  overdue: {
    label: "Atrasado",
    color: "text-red-400 bg-red-400/10 border-red-400/20",
  },
};

export default function AuditActionPlans() {
  const { actionPlans, findings, loading, createActionPlan, updateActionPlan } =
    useAudit();
  const { closeIssue } = useGitHub();

  const [showModal, setShowModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<CreateActionPlanInput>({
    finding_id: "",
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
  });

  const filtered = actionPlans.filter(
    (ap) =>
      !search ||
      ap.title.toLowerCase().includes(search.toLowerCase()) ||
      ap.description?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async () => {
    try {
      await createActionPlan(form);
      setShowModal(false);
      setForm({
        finding_id: "",
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
      });
    } catch {
      // error shown via hook
    }
  };

  const isOverdue = (ap: { due_date: string | null; status: string }) =>
    ap.due_date &&
    new Date(ap.due_date) < new Date() &&
    ap.status !== "completed";

  const handleCompleteActionPlan = async (ap: AuditActionPlan) => {
    setProcessingId(ap.id);
    try {
      if (
        ap.finding?.source_type === "github" &&
        ap.finding?.source_ref?.startsWith("github_issue#")
      ) {
        const parts = ap.finding.source_ref.split("#");
        if (parts.length === 3) {
          const repoId = parts[1];
          const issueNumber = parseInt(parts[2], 10);
          await closeIssue(repoId, issueNumber);
        }
      }
      await updateActionPlan(ap.id, {
        status: "completed",
        completed_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to complete action plan", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 md:p-20 space-y-16 animate-in fade-in duration-700">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <ClipboardCheck className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Plano de Melhorias
            </span>
          </div>
          <h1 className="text-3xl md:text-6xl font-black tracking-tighter md:text-7xl font-outfit uppercase italic">
            Planos de <span className="text-primary italic">Ação</span>
          </h1>
          <p className="max-w-xl text-lg font-medium leading-relaxed text-muted-foreground/60">
            Monitoramento de ações corretivas e preventivas para os achados
            identificados.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group overflow-hidden">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110 duration-300">
              <Search className="w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary" />
            </div>
            <Input
              placeholder="Localizar planos..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              className="pl-12 w-80 bg-background/50 border-border rounded-full h-14 text-sm focus:bg-background focus:ring-primary/20 transition-all duration-300 backdrop-blur-md dark:bg-card/50"
            />
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="rounded-full h-14 px-8 font-bold gap-3 shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Criar Nova Ação</span>
          </Button>
        </div>
      </div>

      {loading && actionPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-6">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
            Carregando Planos...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-3xl p-32 flex flex-col items-center text-center space-y-8 shadow-2xl">
          <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center border border-border rotate-12 group hover:rotate-0 transition-transform duration-500">
            <ClipboardCheck className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors duration-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold font-outfit uppercase">
              Pronto para <span className="text-primary">Agir</span>?
            </h3>
            <p className="text-muted-foreground/40 max-w-sm font-medium">
              Ainda não existem planos de ação. Comece criando um para resolver
              os achados pendentes.
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setShowModal(true)}
            className="rounded-full h-14 px-8 font-bold gap-3 border border-border hover:bg-muted"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Plano</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map((ap) => (
            <div
              key={ap.id}
              className={`group glass-card relative bg-card border border-border rounded-3xl p-8 space-y-6 transition-all duration-500 hover:scale-[1.02] hover:bg-muted/50 backdrop-blur-xl ${
                isOverdue(ap) ? "ring-2 ring-red-500/20" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm transition-colors ${PRIORITY_CONFIG[ap.priority].color}`}
                    >
                      {PRIORITY_CONFIG[ap.priority].label}
                    </span>
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm transition-colors ${STATUS_CONFIG[ap.status].color}`}
                    >
                      {STATUS_CONFIG[ap.status].label}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-outfit leading-tight group-hover:text-primary transition-colors">
                    {ap.title}
                  </h3>
                </div>
              </div>

              {ap.description && (
                <p className="text-sm text-muted-foreground/60 leading-relaxed line-clamp-3 font-medium">
                  {ap.description}
                </p>
              )}

              <div className="flex flex-col gap-4">
                <div className="h-px w-full bg-border" />
                <div className="flex items-center justify-between">
                  {ap.due_date && (
                    <div
                      className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-background border border-border ${
                        isOverdue(ap)
                          ? "text-red-400 border-red-400/20 bg-red-400/5 font-bold"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {isOverdue(ap) ? (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      ) : (
                        <Calendar className="w-4 h-4 shrink-0 text-primary" />
                      )}
                      <span className="text-[11px] font-bold uppercase tracking-wider">
                        {new Date(ap.due_date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {ap.status === "pending" && (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          updateActionPlan(ap.id, { status: "in_progress" })
                        }
                        className="rounded-full h-8 px-4 font-bold text-[10px] uppercase border border-border hover:bg-primary hover:text-white"
                      >
                        Iniciar
                      </Button>
                    )}
                    {(ap.status === "in_progress" ||
                      ap.status === "overdue") && (
                      <Button
                        variant="ghost"
                        onClick={() => handleCompleteActionPlan(ap)}
                        disabled={processingId === ap.id}
                        className="rounded-full h-8 px-4 font-bold text-[10px] uppercase border border-border hover:bg-emerald-500 hover:text-white flex items-center gap-1.5"
                      >
                        {processingId === ap.id && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                        Concluir
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            onClick={() => setShowModal(false)}
          />
          <div className="glass-card rounded-3xl p-8 md:p-12 max-w-2xl w-full shadow-2xl space-y-10 relative scale-up">
            <div className="space-y-2">
              <h2 className="text-4xl font-black font-outfit uppercase italic tracking-tighter">
                Novo <span className="text-primary">Plano de Ação</span>
              </h2>
              <p className="text-muted-foreground/60 font-medium">
                Defina as etapas para resolver o achado identificado.
              </p>
            </div>

            <div className="space-y-6">
              <Select
                label="Achado Relacionado"
                value={form.finding_id}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setForm((f) => ({ ...f, finding_id: e.target.value }))
                }
                className="bg-background/50 border-border h-14 rounded-2xl"
              >
                <option value="" className="bg-background text-foreground">
                  Selecione o achado...
                </option>
                {findings
                  .filter((f) => f.status !== "resolved")
                  .map((f) => (
                    <option
                      key={f.id}
                      value={f.id}
                      className="bg-background text-foreground"
                    >
                      [{f.risk_level.toUpperCase()}] {f.title}
                    </option>
                  ))}
              </Select>

              <Input
                label="Título da Ação"
                placeholder="Ex: Treinamento da equipe de TI"
                value={form.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="bg-background/50 border-border h-14 rounded-2xl px-6"
              />

              <Input
                label="Descrição Detalhada"
                placeholder="Descreva as etapas e responsáveis..."
                value={form.description ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="bg-background/50 border-border h-14 rounded-2xl px-6"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Select
                  label="Prioridade"
                  value={form.priority}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setForm((f) => ({
                      ...f,
                      priority: e.target.value as ActionPlanPriority,
                    }))
                  }
                  className="bg-background/50 border-border h-14 rounded-2xl"
                >
                  {Object.entries(PRIORITY_CONFIG).map(([val, cfg]) => (
                    <option
                      key={val}
                      value={val}
                      className="bg-background text-foreground"
                    >
                      {cfg.label}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Data Limite"
                  type="date"
                  value={form.due_date ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((f) => ({ ...f, due_date: e.target.value }))
                  }
                  className="bg-background/50 border-border h-14 rounded-2xl px-6"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 w-full">
                <Button
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-14 rounded-full font-bold border border-border bg-foreground/5 text-muted-foreground hover:bg-foreground hover:text-background transition-all"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!form.finding_id || !form.title || loading}
                  className="flex-1 h-14 rounded-full font-bold shadow-xl shadow-primary/20 text-white bg-primary hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {loading ? "Processando..." : "Criar Plano de Ação"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
