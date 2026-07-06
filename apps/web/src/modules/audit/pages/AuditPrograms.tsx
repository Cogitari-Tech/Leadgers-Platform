import { useState } from "react";
import {
  FileText,
  Plus,
  Calendar,
  ChevronRight,
  Trash2,
  Play,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { useAudit } from "../hooks/useAudit";
import type {
  AuditProgramFrequency,
  AuditProgramStatus,
} from "../types/audit.types";

const FREQUENCY_LABELS: Record<AuditProgramFrequency, string> = {
  annual: "Anual",
  semi_annual: "Semestral",
  quarterly: "Trimestral",
  monthly: "Mensal",
  biweekly: "Quinzenal",
  weekly: "Semanal",
};

const STATUS_CONFIG: Record<
  AuditProgramStatus,
  { label: string; color: string }
> = {
  draft: {
    label: "Rascunho",
    color: "text-muted-foreground/60 border-white/5 bg-foreground/5 shadow-sm",
  },
  in_progress: {
    label: "Em Andamento",
    color: "text-primary border-primary/20 bg-primary/5 shadow-sm",
  },
  completed: {
    label: "Concluído",
    color: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5 shadow-sm",
  },
  under_review: {
    label: "Em Revisão",
    color: "text-amber-500 border-amber-500/20 bg-amber-500/5 shadow-sm",
  },
  approved: {
    label: "Aprovado",
    color: "text-sky-500 border-sky-500/20 bg-sky-500/5 shadow-sm",
  },
  archived: {
    label: "Arquivado",
    color: "text-slate-500 border-slate-500/20 bg-slate-500/5 shadow-sm",
  },
  cancelled: {
    label: "Cancelado",
    color: "text-destructive border-destructive/20 bg-destructive/5 shadow-sm",
  },
};

export default function AuditPrograms() {
  const {
    programs,
    frameworks,
    loading,
    createProgram,
    updateProgram,
    deleteProgram,
    populateChecklistFromFramework,
  } = useAudit();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    framework_id: "",
    frequency: "quarterly" as AuditProgramFrequency,
    start_date: "",
    end_date: "",
  });

  const handleCreate = async () => {
    try {
      const program = await createProgram({
        name: form.name,
        description: form.description || undefined,
        framework_id: form.framework_id || undefined,
        frequency: form.frequency,
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
      });

      // Auto-populate checklist from framework controls
      if (program && form.framework_id) {
        await populateChecklistFromFramework(program.id, form.framework_id);
      }

      setShowModal(false);
      setForm({
        name: "",
        description: "",
        framework_id: "",
        frequency: "quarterly",
        start_date: "",
        end_date: "",
      });
    } catch {
      // error shown via hook
    }
  };

  const handleStatusChange = async (id: string, status: AuditProgramStatus) => {
    await updateProgram(id, { status });
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-1 bg-primary rounded-full" />
            <h1 className="text-4xl font-bold tracking-tight font-display">
              Programas de Auditoria
            </h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Ciclos de inspeção e acompanhamento de conformidade.
          </p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          variant="primary"
          className="rounded-2xl px-6 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Programa
        </Button>
      </div>

      {/* Programs List */}
      {loading && programs.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-24 glass-card dark:bg-black/20 rounded-3xl border-white/5 soft-shadow text-center">
          <div className="w-24 h-24 rounded-3xl bg-foreground/5 flex items-center justify-center mx-auto mb-8 shadow-xl border border-white/5">
            <FileText className="w-10 h-10 text-muted-foreground/20" />
          </div>
          <h3 className="text-2xl font-bold text-foreground font-display tracking-tight mb-3">
            Nenhum programa ativo
          </h3>
          <p className="text-muted-foreground/60 font-medium max-w-sm mx-auto mb-10">
            Comece criando o seu primeiro ciclo de auditoria para monitorar
            conformidades.
          </p>
          <Button
            variant="primary"
            className="rounded-2xl px-8"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Programa
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-1 gap-6 min-w-[600px]">
            {programs.map((program) => (
              <div
                key={program.id}
                className="glass-card soft-shadow p-8 rounded-3xl dark:bg-black/20 border-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors tracking-tight font-display">
                        {program.name}
                      </h3>
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                          STATUS_CONFIG[program.status].color
                        }`}
                      >
                        {STATUS_CONFIG[program.status].label}
                      </span>
                    </div>

                    {program.description && (
                      <p className="text-sm text-muted-foreground/60 font-medium leading-relaxed max-w-2xl">
                        {program.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-6 pt-2">
                      {program.framework && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 rounded-xl text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                          <FileText className="w-3.5 h-3.5" />
                          {program.framework.name}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {FREQUENCY_LABELS[program.frequency]}
                      </div>
                      {program.start_date && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(program.start_date).toLocaleDateString(
                            "pt-BR",
                          )}
                          {program.end_date &&
                            ` — ${new Date(program.end_date).toLocaleDateString("pt-BR")}`}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:pt-1">
                    {program.status === "draft" && (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          handleStatusChange(program.id, "in_progress")
                        }
                        className="p-3 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                        title="Iniciar"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </Button>
                    )}
                    {program.status === "in_progress" && (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          handleStatusChange(program.id, "completed")
                        }
                        className="p-3 rounded-xl bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                        title="Concluir"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() =>
                        handleStatusChange(program.id, "cancelled")
                      }
                      className="p-3 rounded-xl bg-foreground/5 text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive transition-all shadow-sm"
                      title="Cancelar"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => deleteProgram(program.id)}
                      className="p-3 rounded-xl bg-destructive/5 text-destructive/40 hover:bg-destructive hover:text-white transition-all shadow-sm"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <a
                      href={`/audit/programs/${program.id}`}
                      className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-muted-foreground/40 hover:text-primary hover:bg-white hover:shadow-lg transition-all ml-2 border border-white/5"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-xl">
          <div className="glass-card rounded-3xl p-12 max-w-2xl w-full shadow-2xl space-y-10 relative scale-up">
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-foreground font-display tracking-tight">
                Novo Programa
              </h3>
              <p className="text-sm text-muted-foreground/60 font-medium">
                Configure os parâmetros do novo ciclo de auditoria.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">
                  Nome do Programa
                </label>
                <Input
                  placeholder="Ex: Ciclo de Auditoria 2026"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="rounded-2xl h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  placeholder="Objetivo e escopo..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="w-full bg-foreground/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:bg-white/10 transition-all text-sm font-medium resize-none placeholder:text-muted-foreground/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">
                    Framework
                  </label>
                  <Select
                    value={form.framework_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, framework_id: e.target.value }))
                    }
                    className="rounded-2xl h-12"
                  >
                    <option value="" className="bg-background text-foreground">
                      Nenhum (Personalizado)
                    </option>
                    {frameworks.map((fw) => (
                      <option
                        key={fw.id}
                        value={fw.id}
                        className="bg-background text-foreground"
                      >
                        {fw.name} ({fw.version})
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">
                    Frequência
                  </label>
                  <Select
                    value={form.frequency}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        frequency: e.target.value as AuditProgramFrequency,
                      }))
                    }
                    className="rounded-2xl h-12"
                  >
                    {Object.entries(FREQUENCY_LABELS).map(([val, label]) => (
                      <option
                        key={val}
                        value={val}
                        className="bg-background text-foreground"
                      >
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">
                    Data Início
                  </label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, start_date: e.target.value }))
                    }
                    className="rounded-2xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">
                    Data Término
                  </label>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, end_date: e.target.value }))
                    }
                    className="rounded-2xl h-12"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full">
              <Button
                variant="ghost"
                onClick={() => setShowModal(false)}
                className="py-4 flex-1 rounded-2xl bg-foreground/5 text-muted-foreground hover:bg-white hover:text-black transition-all font-bold uppercase tracking-widest text-[10px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!form.name || loading}
                className="py-4 flex-1 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all font-bold uppercase tracking-widest text-[10px] px-10"
              >
                {loading ? "Processando..." : "Criar Ciclo de Auditoria"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
