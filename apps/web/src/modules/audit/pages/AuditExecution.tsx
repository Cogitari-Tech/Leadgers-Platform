import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  MinusCircle,
  Upload,
  Paperclip,
  Trash2,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { AuditTimeline } from "../components/AuditTimeline";
import { useAudit } from "../hooks/useAudit";
import type {
  AuditProgram,
  AuditProgramChecklist,
  AuditItemResponse,
  AuditItemEvidence,
  AuditResponseStatus,
} from "../types/audit.types";

const STATUS_OPTIONS: {
  value: AuditResponseStatus;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    value: "conforme",
    label: "Conforme",
    icon: CheckCircle,
    color: "text-emerald-500",
  },
  {
    value: "nao_conforme",
    label: "Não Conforme",
    icon: XCircle,
    color: "text-red-500",
  },
  {
    value: "parcial",
    label: "Parcial",
    icon: AlertCircle,
    color: "text-amber-500",
  },
  { value: "n_a", label: "N/A", icon: MinusCircle, color: "text-slate-400" },
];

export default function AuditExecution() {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const {
    programs,
    getChecklists,
    loadItemResponses,
    saveItemResponse,
    loadItemEvidences,
    uploadEvidence,
    deleteEvidence,
    submitAuditForReview,
    loading,
    error,
  } = useAudit();

  const [program, setProgram] = useState<AuditProgram | null>(null);
  const [items, setItems] = useState<AuditProgramChecklist[]>([]);
  const [responses, setResponses] = useState<AuditItemResponse[]>([]);
  const [evidences, setEvidences] = useState<AuditItemEvidence[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form State
  const [formStatus, setFormStatus] = useState<AuditResponseStatus | "">("");
  const [formJustification, setFormJustification] = useState("");
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  useEffect(() => {
    if (programId && programs.length > 0) {
      const found = programs.find((p) => p.id === programId);
      if (found) setProgram(found);
    }
  }, [programId, programs]);

  useEffect(() => {
    if (programId) {
      getChecklists(programId).then(setItems);
      loadItemResponses(programId).then(setResponses);
      loadItemEvidences(programId).then(setEvidences);
    }
  }, [programId, getChecklists, loadItemResponses, loadItemEvidences]);

  const toggleExpand = (item: AuditProgramChecklist) => {
    if (expandedId === item.id) {
      setExpandedId(null);
    } else {
      setExpandedId(item.id);
      const existing = responses.find((r) => r.checklist_item_id === item.id);
      if (existing) {
        setFormStatus(existing.status);
        setFormJustification(existing.justification || "");
      } else {
        setFormStatus("");
        setFormJustification("");
      }
    }
  };

  const handleSaveResponse = async (checklistItemId: string) => {
    if (!programId || !formStatus) return;

    if (
      (formStatus === "nao_conforme" || formStatus === "parcial") &&
      !formJustification.trim()
    ) {
      alert("A justificativa é obrigatória para este status.");
      return;
    }

    const newResponse = await saveItemResponse(
      programId,
      checklistItemId,
      formStatus as AuditResponseStatus,
      formJustification.trim() || null,
    );

    if (newResponse) {
      setResponses((prev) => {
        const filtered = prev.filter(
          (r) => r.checklist_item_id !== checklistItemId,
        );
        return [...filtered, newResponse];
      });
      // Don't auto-collapse, user might want to upload evidence
    }
  };

  const handleUploadEvidence = async (
    responseId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingEvidence(true);
    try {
      const newEvidence = await uploadEvidence(responseId, file);
      if (newEvidence) {
        setEvidences((prev) => [...prev, newEvidence]);
      }
    } catch (err) {
      console.error(err);
      alert("Falha no upload da evidência.");
    } finally {
      setUploadingEvidence(false);
      if (e.target) e.target.value = ""; // reset
    }
  };

  const handleDeleteEvidence = async (evidenceId: string, filePath: string) => {
    try {
      await deleteEvidence(evidenceId, filePath);
      setEvidences((prev) => prev.filter((e) => e.id !== evidenceId));
    } catch (err) {
      console.error(err);
      alert("Falha ao excluir evidência.");
    }
  };

  const handleSubmitForReview = async () => {
    if (!programId) return;

    // Check if all items are answered
    if (responses.length < items.length) {
      if (
        !confirm(
          `Apenas ${responses.length} de ${items.length} itens foram respondidos. Tem certeza que deseja consolidar os achados?`,
        )
      ) {
        return;
      }
    }

    try {
      await submitAuditForReview(programId);
      navigate("/audit/programs");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao consolidar.");
    }
  };

  if (!program) {
    return (
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <button
              onClick={() => navigate("/audit/programs")}
              className="flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-foreground font-bold uppercase tracking-widest mb-4 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <ClipboardCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tight font-display mb-1">
                  Execução do Checklist
                </div>
                <p className="text-muted-foreground font-medium text-sm">
                  Carregando programa...
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button
            onClick={() => navigate("/audit/programs")}
            className="flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-foreground font-bold uppercase tracking-widest mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <ClipboardCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-display mb-1">
                Execução do Checklist
              </h1>
              <p className="text-muted-foreground font-medium text-sm">
                Programa:{" "}
                <span className="text-foreground">{program.name}</span>
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSubmitForReview}
          variant="primary"
          className="rounded-xl px-6 py-4 shadow-xl shadow-primary/20"
        >
          Consolidar Achados
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium text-sm">
          {error}
        </div>
      )}

      {/* Progress */}
      <div className="glass-card border-white/5 p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
            Progresso Geral
          </span>
          <span className="text-sm font-bold text-foreground">
            {responses.length} / {items.length} (
            {items.length > 0
              ? Math.round((responses.length / items.length) * 100)
              : 0}
            %)
          </span>
        </div>
        <div className="w-full h-2 bg-foreground/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{
              width: `${items.length > 0 ? (responses.length / items.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {program.status !== "draft" && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-display px-2">
            Histórico da Auditoria
          </h3>
          <AuditTimeline auditId={program.id} />
        </div>
      )}

      {/* Items List */}
      <div className="space-y-4">
        {items.map((item) => {
          const response = responses.find(
            (r) => r.checklist_item_id === item.id,
          );
          const itemEvidences = response
            ? evidences.filter((e) => e.audit_item_response_id === response.id)
            : [];
          const isExpanded = expandedId === item.id;
          const statusOpt = STATUS_OPTIONS.find(
            (s) => s.value === response?.status,
          );

          return (
            <div
              key={item.id}
              className={`glass-card border rounded-3xl transition-all ${
                isExpanded
                  ? "bg-white/10 dark:bg-black/40 border-primary/30 shadow-2xl scale-[1.01]"
                  : "bg-white/5 dark:bg-black/20 border-white/5 hover:bg-white/10"
              }`}
            >
              {/* Item Header Header */}
              <div
                className="p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                onClick={() => toggleExpand(item)}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80 bg-primary/10 px-2 py-0.5 rounded-sm">
                      Requisito
                    </span>
                    <h3 className="font-bold text-foreground text-lg tracking-tight font-display">
                      {item.title}
                    </h3>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground/80 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {statusOpt ? (
                    <div
                      className={`flex items-center gap-2 text-sm font-bold ${statusOpt.color}`}
                    >
                      <statusOpt.icon className="w-5 h-5" />
                      {statusOpt.label}
                    </div>
                  ) : (
                    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">
                      Não respondido
                    </div>
                  )}
                  <ChevronLeft
                    className={`w-5 h-5 text-muted-foreground/40 transition-transform ${isExpanded ? "-rotate-90" : "rotate-180"}`}
                  />
                </div>
              </div>

              {/* Item Details (Expanded) */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-white/5 animate-in slide-in-from-top-4 fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-6">
                    {/* Left Col: Form */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                          Status de Conformidade
                        </label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                          {STATUS_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setFormStatus(opt.value)}
                              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                                formStatus === opt.value
                                  ? `bg-foreground/5 ${opt.color} border-current shadow-sm scale-[1.02]`
                                  : "border-white/5 text-muted-foreground/60 hover:bg-white/5"
                              }`}
                            >
                              <opt.icon className="w-5 h-5" />
                              <span className="text-xs font-bold">
                                {opt.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center justify-between">
                          <span>Justificativa</span>
                          {(formStatus === "nao_conforme" ||
                            formStatus === "parcial") && (
                            <span className="text-red-500">* Obrigatório</span>
                          )}
                        </label>
                        <textarea
                          rows={4}
                          value={formJustification}
                          onChange={(e) => setFormJustification(e.target.value)}
                          placeholder="Detalhe o contexto e observações do avaliador..."
                          className="w-full bg-foreground/5 border border-white/5 rounded-2xl p-4 text-sm font-medium focus:bg-white/10 outline-none resize-none transition-all placeholder:text-muted-foreground/30"
                        />
                      </div>

                      <div>
                        <Button
                          onClick={() => handleSaveResponse(item.id)}
                          disabled={!formStatus || loading}
                          variant="primary"
                          className="w-full sm:w-auto rounded-xl shadow-lg"
                        >
                          Salvar Resposta
                        </Button>
                      </div>
                    </div>

                    {/* Right Col: Evidences */}
                    <div className="space-y-6 border-l md:border-white/5 md:pl-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                          Evidências
                        </label>

                        {!response ? (
                          <div className="p-6 rounded-2xl bg-foreground/5 border border-white/5 flex flex-col items-center justify-center text-center">
                            <AlertCircle className="w-8 h-8 text-muted-foreground/20 mb-3" />
                            <p className="text-sm font-medium text-muted-foreground/60">
                              Salve a resposta primeiro para anexar evidências.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              {itemEvidences.map((evidence) => (
                                <div
                                  key={evidence.id}
                                  className="flex items-center justify-between p-3 rounded-xl bg-foreground/5 border border-white/5"
                                >
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <Paperclip className="w-4 h-4 text-primary shrink-0" />
                                    <span className="text-sm font-medium text-foreground truncate">
                                      {evidence.file_name}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleDeleteEvidence(
                                        evidence.id,
                                        evidence.file_path,
                                      )
                                    }
                                    className="p-2 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}

                              {itemEvidences.length === 0 && (
                                <div className="text-sm font-medium text-muted-foreground/40 italic px-2">
                                  Nenhuma evidência anexada.
                                </div>
                              )}
                            </div>

                            <div className="pt-2">
                              <label
                                htmlFor={`upload-${item.id}`}
                                className={`flex items-center justify-center gap-2 w-full p-4 rounded-xl border border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 text-sm font-bold text-muted-foreground hover:text-primary transition-all cursor-pointer ${uploadingEvidence ? "opacity-50 pointer-events-none" : ""}`}
                              >
                                <Upload className="w-4 h-4" />
                                {uploadingEvidence
                                  ? "Enviando..."
                                  : "Anexar Evidência"}
                                <input
                                  type="file"
                                  id={`upload-${item.id}`}
                                  className="hidden"
                                  onChange={(e) =>
                                    handleUploadEvidence(response.id, e)
                                  }
                                  disabled={uploadingEvidence}
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {items.length === 0 && !loading && (
          <div className="p-12 text-center border border-dashed border-white/10 rounded-3xl">
            <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Checklist não encontrado
            </h3>
            <p className="text-muted-foreground/60 text-sm">
              Este programa não possui requisitos cadastrados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
