import { useMemo, useState, DragEvent } from "react";
import {
  KanbanSquare,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  ExternalLink,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import {
  useRoadmap,
  RoadmapItem,
  RoadmapStatus,
  CreateRoadmapInput,
} from "../hooks/useRoadmap";

// PRD §7.7 RN-02: Backlog, Em Andamento, Em Revisão, Concluído, Cancelado.
const COLUMNS: { status: RoadmapStatus; label: string; accent: string }[] = [
  { status: "planned", label: "Backlog", accent: "bg-muted-foreground/40" },
  { status: "in_progress", label: "Em Andamento", accent: "bg-primary" },
  { status: "in_review", label: "Em Revisão", accent: "bg-sky-500" },
  { status: "completed", label: "Concluído", accent: "bg-emerald-500" },
  { status: "cancelled", label: "Cancelado", accent: "bg-destructive/60" },
];

const INPUT_CLASS =
  "glass-input w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none figma-focus";

const currentQuarter = () => {
  const now = new Date();
  return `Q${Math.floor(now.getMonth() / 3) + 1}-${now.getFullYear()}`;
};

const EMPTY_FORM: CreateRoadmapInput = {
  title: "",
  description: "",
  quarter: currentQuarter(),
  end_date: null,
};

const formatDate = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("pt-BR") : null;

export default function RoadmapKanban() {
  const { items, loading, error, createItem, moveItem, deleteItem } =
    useRoadmap();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateRoadmapInput>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState<RoadmapStatus | null>(null);

  const byStatus = useMemo(() => {
    const map = new Map<RoadmapStatus, RoadmapItem[]>();
    COLUMNS.forEach((c) => map.set(c.status, []));
    items.forEach((item) => {
      const bucket = map.get(item.status) ?? map.get("planned");
      bucket?.push(item);
    });
    return map;
  }, [items]);

  const submit = async () => {
    setFormError(null);
    setSaving(true);
    try {
      await createItem({ ...form, end_date: form.end_date || null });
      setShowModal(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao criar item");
    } finally {
      setSaving(false);
    }
  };

  const onDrop = async (e: DragEvent, status: RoadmapStatus) => {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData("text/roadmap-item");
    const item = items.find((i) => i.id === id);
    if (id && item && item.status !== status) {
      await moveItem(id, status).catch(() => undefined);
    }
  };

  const handleDelete = async (item: RoadmapItem) => {
    if (window.confirm(`Excluir "${item.title}" do roadmap?`)) {
      await deleteItem(item.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <KanbanSquare className="w-7 h-7 text-primary" aria-hidden="true" />
            Roadmap
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kanban do roadmap de produto — arraste os cards entre as colunas
          </p>
        </div>
        <Button
          onClick={() => {
            setFormError(null);
            setShowModal(true);
          }}
          aria-label="Adicionar item ao roadmap"
        >
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          Novo Item
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="glass-card rounded-xl p-4 flex items-center gap-3 text-destructive"
        >
          <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-10 flex items-center justify-center text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          <span className="text-sm">Carregando roadmap...</span>
        </div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-flow-col auto-cols-[minmax(240px,1fr)] gap-4 min-w-max lg:min-w-0 lg:grid-flow-row lg:grid-cols-5">
            {COLUMNS.map((column) => {
              const columnItems = byStatus.get(column.status) ?? [];
              return (
                <section
                  key={column.status}
                  aria-label={`Coluna ${column.label}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(column.status);
                  }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => onDrop(e, column.status)}
                  className={`glass-card rounded-xl transition-colors ${
                    dragOver === column.status ? "bg-primary/5" : ""
                  }`}
                >
                  <header className="px-4 py-3 flex items-center justify-between border-b border-border/30">
                    <h2 className="text-sm font-bold flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${column.accent}`}
                        aria-hidden="true"
                      />
                      {column.label}
                    </h2>
                    <span className="text-xs font-semibold text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5 tabular-nums">
                      {columnItems.length}
                    </span>
                  </header>
                  <div className="p-3 space-y-3 min-h-[120px]">
                    {columnItems.length === 0 && (
                      <p className="text-xs text-muted-foreground/60 text-center py-6">
                        Solte um card aqui
                      </p>
                    )}
                    {columnItems.map((item) => {
                      const due = formatDate(item.end_date);
                      const overdue =
                        item.end_date &&
                        new Date(item.end_date) < new Date() &&
                        !["completed", "cancelled"].includes(item.status);
                      return (
                        <article
                          key={item.id}
                          draggable
                          onDragStart={(e) =>
                            e.dataTransfer.setData("text/roadmap-item", item.id)
                          }
                          className="rounded-lg bg-background/60 border border-border/30 p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium leading-snug">
                              {item.title}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              aria-label={`Excluir ${item.title}`}
                              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0 figma-focus"
                            >
                              <Trash2
                                className="w-3.5 h-3.5"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {item.quarter && (
                              <span className="text-[10px] font-semibold uppercase text-muted-foreground bg-muted/60 rounded px-1.5 py-0.5">
                                {item.quarter}
                              </span>
                            )}
                            {due && (
                              <span
                                className={`text-[10px] font-semibold flex items-center gap-1 ${
                                  overdue
                                    ? "text-destructive"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <CalendarDays
                                  className="w-3 h-3"
                                  aria-hidden="true"
                                />
                                {due}
                              </span>
                            )}
                            {item.github_issue_url && (
                              <a
                                href={item.github_issue_url}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`Abrir issue do GitHub de ${item.title}`}
                                className="text-[10px] font-semibold text-primary flex items-center gap-1 figma-focus rounded"
                              >
                                <ExternalLink
                                  className="w-3 h-3"
                                  aria-hidden="true"
                                />
                                #{item.github_issue_id ?? "issue"}
                              </a>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Novo Item do Roadmap</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Fechar"
                className="p-2.5 rounded-lg hover:bg-muted/60 figma-focus"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="rm-title"
                  className="text-sm font-medium block mb-1.5"
                >
                  Título *
                </label>
                <input
                  id="rm-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={INPUT_CLASS}
                  placeholder="Ex.: Integração bancária via Open Finance"
                />
              </div>
              <div>
                <label
                  htmlFor="rm-desc"
                  className="text-sm font-medium block mb-1.5"
                >
                  Descrição
                </label>
                <textarea
                  id="rm-desc"
                  rows={3}
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className={INPUT_CLASS}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="rm-quarter"
                    className="text-sm font-medium block mb-1.5"
                  >
                    Trimestre
                  </label>
                  <input
                    id="rm-quarter"
                    value={form.quarter ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, quarter: e.target.value })
                    }
                    className={INPUT_CLASS}
                    placeholder="Q3-2026"
                  />
                </div>
                <div>
                  <label
                    htmlFor="rm-due"
                    className="text-sm font-medium block mb-1.5"
                  >
                    Entrega prevista
                  </label>
                  <input
                    id="rm-due"
                    type="date"
                    value={form.end_date ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, end_date: e.target.value })
                    }
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              {formError && (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={submit}
                  disabled={saving || !form.title.trim()}
                >
                  {saving && (
                    <Loader2
                      className="w-4 h-4 mr-2 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
