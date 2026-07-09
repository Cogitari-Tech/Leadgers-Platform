import { useRef, useState } from "react";
import {
  FolderLock,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileImage,
  File as FileIcon,
  Download,
  Trash2,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import {
  useDataRoom,
  DOCUMENT_CATEGORIES,
  MAX_FILE_SIZE,
  type DataRoomDocument,
  type DocumentCategory,
} from "../hooks/useDataRoom";

function formatFileSize(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function mimeIcon(mime: string): React.ElementType {
  if (mime.startsWith("image/")) return FileImage;
  if (
    mime.includes("spreadsheet") ||
    mime.includes("csv") ||
    mime.includes("excel")
  )
    return FileSpreadsheet;
  if (
    mime.includes("pdf") ||
    mime.includes("document") ||
    mime.startsWith("text/")
  )
    return FileText;
  return FileIcon;
}

function categoryLabel(category: string): string {
  return (
    DOCUMENT_CATEGORIES[category as DocumentCategory] ??
    DOCUMENT_CATEGORIES.general
  );
}

function UploadPanel({
  uploading,
  onUpload,
}: {
  uploading: boolean;
  onUpload: (file: File, category: DocumentCategory) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<DocumentCategory>("general");
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      setUploadError(null);
      await onUpload(file, category);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Erro ao enviar arquivo",
      );
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="glass-card soft-shadow rounded-2xl p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <label
          htmlFor="dataroom-category"
          className="text-xs font-semibold text-muted-foreground"
        >
          Categoria do documento
        </label>
        <select
          id="dataroom-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as DocumentCategory)}
          className="h-11 px-3 rounded-xl bg-background/60 border border-border/40 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
        >
          {Object.entries(DOCUMENT_CATEGORIES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Enviar documento para o Data Room"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 py-10 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border/50 hover:border-primary/50 hover:bg-muted/20"
        }`}
      >
        {uploading ? (
          <>
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Enviando...</p>
          </>
        ) : (
          <>
            <UploadCloud className="w-8 h-8 text-primary/60" />
            <p className="text-sm font-semibold text-foreground">
              Arraste um arquivo ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground">
              Máximo {formatFileSize(MAX_FILE_SIZE)} por arquivo
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          aria-hidden="true"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {uploadError && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {uploadError}
        </p>
      )}
    </div>
  );
}

function DocumentRow({
  doc,
  canManage,
  onDownload,
  onDelete,
}: {
  doc: DataRoomDocument;
  canManage: boolean;
  onDownload: (doc: DataRoomDocument) => Promise<void>;
  onDelete: (doc: DataRoomDocument) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);
  const Icon = mimeIcon(doc.mime_type);

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

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Excluir "${doc.name}" do Data Room? Esta ação não pode ser desfeita.`,
    );
    if (confirmed) run(() => onDelete(doc));
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {doc.name}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
            {categoryLabel(doc.category)}
          </span>
          <span>{formatFileSize(doc.file_size)}</span>
          <span>•</span>
          <span>
            {new Date(doc.created_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        {rowError && (
          <p role="alert" className="text-[11px] text-destructive mt-1">
            {rowError}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => onDownload(doc))}
          aria-label={`Baixar ${doc.name}`}
          className="p-2.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-50 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>
        {canManage && (
          <button
            type="button"
            disabled={busy}
            onClick={handleDelete}
            aria-label={`Excluir ${doc.name}`}
            className="p-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function DataRoomPage() {
  const { hasRole } = useAuth();
  const {
    documents,
    loading,
    uploading,
    error,
    refresh,
    uploadDocument,
    downloadDocument,
    deleteDocument,
  } = useDataRoom();
  const [filter, setFilter] = useState<string>("all");

  const canManage = hasRole("owner") || hasRole("admin");
  const filtered =
    filter === "all"
      ? documents
      : documents.filter((d) => d.category === filter);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <FolderLock className="w-8 h-8 text-primary" />
            Data Room
          </h1>
          <p className="text-sm text-muted-foreground mt-1 uppercase tracking-widest font-bold opacity-60">
            Documentos confidenciais para due diligence de investidores
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          aria-label="Atualizar lista de documentos"
          className="p-2.5 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Upload (owner/admin only — storage RLS enforces server-side) */}
      {canManage && (
        <UploadPanel uploading={uploading} onUpload={uploadDocument} />
      )}

      {/* Category filter */}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filtrar documentos por categoria"
      >
        {[["all", "Todos"], ...Object.entries(DOCUMENT_CATEGORIES)].map(
          ([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={`px-3 h-9 rounded-full text-xs font-semibold transition-colors ${
                filter === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {label}
            </button>
          ),
        )}
      </div>

      {/* Document list */}
      {loading ? (
        <div className="space-y-3" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="glass-card soft-shadow rounded-2xl p-10 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500/50 mx-auto mb-3" />
          <p className="font-bold text-foreground">
            Falha ao carregar documentos
          </p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-4 px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card soft-shadow rounded-2xl p-10 text-center">
          <FolderLock className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="font-bold text-muted-foreground">
            {filter === "all"
              ? "Nenhum documento no Data Room ainda."
              : "Nenhum documento nesta categoria."}
          </p>
          {canManage && filter === "all" && (
            <p className="text-sm text-muted-foreground/60 mt-1">
              Envie o primeiro documento usando a área de upload acima.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((doc) => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              canManage={canManage}
              onDownload={downloadDocument}
              onDelete={deleteDocument}
            />
          ))}
        </div>
      )}
    </div>
  );
}
