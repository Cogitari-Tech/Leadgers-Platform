import { useState, useEffect } from "react";
import { Project, ProjectFormData } from "../types/project.types";
import { X } from "lucide-react";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  initialData?: Project;
}

export function ProjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ProjectFormModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
    status: "active",
    startDate: "",
    endDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || "",
        status: initialData.status,
        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        status: "active",
        startDate: "",
        endDate: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(formData);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-panel rounded-3xl p-8 w-full max-w-xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 opacity-40" />

        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-muted-foreground hover:text-primary transition-all p-2 rounded-xl hover:bg-primary/10 group"
        >
          <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
        </button>

        <div className="mb-8 space-y-1">
          <h2 className="text-2xl font-black text-foreground font-display tracking-tight">
            {initialData ? "Refinar Projeto" : "Inicializar Projeto"}
          </h2>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-60">
            {initialData
              ? "Atualize os parâmetros estratégicos"
              : "Configure os pilares da nova auditoria"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
              Nome do Projeto
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-background/50 border border-border/40 rounded-2xl px-5 py-4 text-sm font-bold text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
              placeholder="Ex: Auditoria Q3 2026"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
              Status Operacional
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Project["status"],
                })
              }
              className="w-full bg-background/50 border border-border/40 rounded-2xl px-5 py-4 text-sm font-bold text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm appearance-none"
            >
              <option value="active">Em Execução</option>
              <option value="on_hold">Pausado / Suspenso</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
                Data de Início
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full bg-background/50 border border-border/40 rounded-2xl px-5 py-4 text-sm font-bold text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 dark:[color-scheme:dark] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
                Data de Término
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full bg-background/50 border border-border/40 rounded-2xl px-5 py-4 text-sm font-bold text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 dark:[color-scheme:dark] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
              Memorial Descritivo
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full bg-background/50 border border-border/40 rounded-2xl px-5 py-4 text-sm font-bold text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 resize-none transition-all shadow-sm"
              placeholder="Descreva o escopo e os objetivos estratégicos deste projeto..."
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-6 mt-4 border-t border-border/40">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-all"
            >
              Descartar Alterações
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.name.trim()}
              className="flex items-center justify-center gap-3 px-10 py-4 bg-primary text-primary-foreground rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
            >
              {submitting
                ? "Processando..."
                : initialData
                  ? "Atualizar Parâmetros"
                  : "Confirmar e Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
