import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Newspaper,
  Plus,
  Pencil,
  Trash2,
  Send,
  Save,
  X,
  Eye,
  Bot,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import {
  useInvestorUpdates,
  type InvestorUpdate,
  type InvestorUpdateInput,
} from "../hooks/useInvestorUpdates";

function StatusBadge({ status }: { status: string }) {
  const isPublished = status === "published";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
        isPublished
          ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/20"
          : "bg-amber-500/15 text-amber-500 border-amber-500/20"
      }`}
    >
      {isPublished ? "Publicado" : "Rascunho"}
    </span>
  );
}

const defaultPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-Q${Math.ceil((now.getMonth() + 1) / 3)}`;
};

function UpdateEditor({
  initial,
  saving,
  onSave,
  onCancel,
}: {
  initial?: InvestorUpdate;
  saving: boolean;
  onSave: (input: InvestorUpdateInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [period, setPeriod] = useState(initial?.period ?? defaultPeriod());
  const [content, setContent] = useState(initial?.content_md ?? "");
  const [preview, setPreview] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !period.trim() || !content.trim()) {
      setFormError("Preencha título, período e conteúdo.");
      return;
    }
    try {
      setFormError(null);
      await onSave({
        title: title.trim(),
        period: period.trim(),
        content_md: content,
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao salvar");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card soft-shadow rounded-2xl p-6 space-y-4"
      aria-label="Editor de investor update"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          {initial ? "Editar update" : "Novo update"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Fechar editor"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label
            htmlFor="update-title"
            className="block text-xs font-semibold text-muted-foreground mb-1"
          >
            Título<span className="text-primary ml-0.5">*</span>
          </label>
          <input
            id="update-title"
            type="text"
            required
            maxLength={300}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Investor Update — Q2 2026"
            className="w-full h-11 px-3 rounded-xl bg-background/60 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/60"
          />
        </div>
        <div>
          <label
            htmlFor="update-period"
            className="block text-xs font-semibold text-muted-foreground mb-1"
          >
            Período<span className="text-primary ml-0.5">*</span>
          </label>
          <input
            id="update-period"
            type="text"
            required
            maxLength={100}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="Ex.: 2026-Q2"
            className="w-full h-11 px-3 rounded-xl bg-background/60 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/60"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor="update-content"
            className="block text-xs font-semibold text-muted-foreground"
          >
            Conteúdo (Markdown)<span className="text-primary ml-0.5">*</span>
          </label>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            aria-pressed={preview}
            className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold transition-colors ${
              preview
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {preview ? "Editar" : "Preview"}
          </button>
        </div>
        {preview ? (
          <div className="min-h-[280px] px-4 py-3 rounded-xl bg-background/40 border border-border/30 prose prose-sm dark:prose-invert max-w-none overflow-y-auto">
            {content.trim() ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">Nada para exibir.</p>
            )}
          </div>
        ) : (
          <textarea
            id="update-content"
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            maxLength={50000}
            placeholder={
              "# Highlights\n\n- MRR cresceu X%\n- Runway de N meses\n\n## Desafios\n\n## Próximos passos"
            }
            className="w-full px-4 py-3 rounded-xl bg-background/60 border border-border/40 text-sm text-foreground font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/60 resize-y"
          />
        )}
      </div>

      {formError && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {formError}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 h-11 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-4 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-95 disabled:opacity-50 transition-all"
        >
          {saving ? (
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Salvar rascunho
        </button>
      </div>
    </form>
  );
}

function UpdateCard({
  update,
  canManage,
  onEdit,
  onPublish,
  onDelete,
}: {
  update: InvestorUpdate;
  canManage: boolean;
  onEdit: () => void;
  onPublish: () => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  const run = async (action: () => Promise<void>) => {
    try {
      setBusy(true);
      setRowError(null);
      await action();
    } catch (err) {
      setRowError(err instanceof Error ? err.message : "Erro na operação");
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = () => {
    const confirmed = window.confirm(
      `Publicar "${update.title}"? Updates publicados ficam visíveis para investidores com acesso.`,
    );
    if (confirmed) run(onPublish);
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Excluir "${update.title}"? Esta ação não pode ser desfeita.`,
    );
    if (confirmed) run(onDelete);
  };

  return (
    <article className="glass-card soft-shadow rounded-2xl p-6 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-foreground truncate">
              {update.title}
            </h3>
            <StatusBadge status={update.status} />
            {update.generated_by_ai && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/15 text-teal-500 border border-teal-500/20"
                title="Gerado por IA"
              >
                <Bot className="w-3 h-3" />
                IA
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {update.period}
            {" • "}
            {update.status === "published" && update.published_at
              ? `Publicado em ${new Date(update.published_at).toLocaleDateString("pt-BR")}`
              : `Criado em ${new Date(update.created_at).toLocaleDateString("pt-BR")}`}
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              disabled={busy}
              onClick={onEdit}
              aria-label={`Editar ${update.title}`}
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-50 transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            {update.status !== "published" && (
              <button
                type="button"
                disabled={busy}
                onClick={handlePublish}
                aria-label={`Publicar ${update.title}`}
                className="p-2 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={handleDelete}
              aria-label={`Excluir ${update.title}`}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {rowError && (
        <p role="alert" className="text-[11px] text-destructive">
          {rowError}
        </p>
      )}

      <div
        className={`prose prose-sm dark:prose-invert max-w-none text-foreground/80 ${
          expanded ? "" : "line-clamp-4"
        }`}
      >
        <ReactMarkdown>{update.content_md}</ReactMarkdown>
      </div>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="text-xs font-medium text-primary hover:underline"
      >
        {expanded ? "Recolher" : "Ler completo"}
      </button>
    </article>
  );
}

export default function InvestorUpdatesPage() {
  const { hasRole } = useAuth();
  const {
    updates,
    loading,
    saving,
    error,
    refresh,
    createUpdate,
    updateUpdate,
    publishUpdate,
    deleteUpdate,
  } = useInvestorUpdates();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<InvestorUpdate | undefined>();

  const canManage = hasRole("owner") || hasRole("admin");

  const handleSave = async (input: InvestorUpdateInput) => {
    if (editing) {
      await updateUpdate(editing.id, input);
    } else {
      await createUpdate(input);
    }
    setEditorOpen(false);
    setEditing(undefined);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-primary" />
            Investor Updates
          </h1>
          <p className="text-sm text-muted-foreground mt-1 uppercase tracking-widest font-bold opacity-60">
            Comunicados periódicos para investidores em Markdown
          </p>
        </div>
        {canManage && !editorOpen && (
          <button
            type="button"
            onClick={() => {
              setEditing(undefined);
              setEditorOpen(true);
            }}
            aria-label="Criar novo investor update"
            className="flex items-center gap-2 px-4 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo update
          </button>
        )}
      </div>

      {/* Editor */}
      {editorOpen && (
        <UpdateEditor
          key={editing?.id ?? "new"}
          initial={editing}
          saving={saving}
          onSave={handleSave}
          onCancel={() => {
            setEditorOpen(false);
            setEditing(undefined);
          }}
        />
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-4" aria-hidden="true">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-40 rounded-2xl bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="glass-card soft-shadow rounded-2xl p-10 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500/50 mx-auto mb-3" />
          <p className="font-bold text-foreground">Falha ao carregar updates</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-4 px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      ) : updates.length === 0 ? (
        <div className="glass-card soft-shadow rounded-2xl p-10 text-center">
          <Newspaper className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="font-bold text-muted-foreground">
            Nenhum investor update ainda.
          </p>
          {canManage && (
            <p className="text-sm text-muted-foreground/60 mt-1">
              Crie o primeiro update com o botão acima.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <UpdateCard
              key={update.id}
              update={update}
              canManage={canManage}
              onEdit={() => {
                setEditing(update);
                setEditorOpen(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onPublish={async () => {
                await publishUpdate(update.id);
              }}
              onDelete={async () => {
                await deleteUpdate(update.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
