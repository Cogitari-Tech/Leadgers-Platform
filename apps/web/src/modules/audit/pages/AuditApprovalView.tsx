import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  MinusCircle,
  Paperclip,
  FileText,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Modal } from "@/shared/components/ui/Modal";
import { AuditTimeline } from "../components/AuditTimeline";
import { useAudit } from "../hooks/useAudit";
import type {
  AuditProgram,
  AuditProgramChecklist,
  AuditItemResponse,
  AuditItemEvidence,
  AuditResponseStatus,
  AuditReport,
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

export default function AuditApprovalView() {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const {
    programs,
    getChecklists,
    loadItemResponses,
    loadItemEvidences,
    approveAudit,
    rejectAudit,
    findings,
    loading,
    error,
  } = useAudit();

  const [program, setProgram] = useState<AuditProgram | null>(null);
  const [items, setItems] = useState<AuditProgramChecklist[]>([]);
  const [responses, setResponses] = useState<AuditItemResponse[]>([]);
  const [evidences, setEvidences] = useState<AuditItemEvidence[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Filter findings for this specific program
  const programFindings = findings.filter((f) => f.program_id === programId);

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
    setExpandedId(expandedId === item.id ? null : item.id);
  };

  const handleApprove = async () => {
    if (!programId || !program) return;

    // Check missing 5W2H forms
    const missingForms = programFindings.some(
      (f) => !f.description || f.status === "draft",
    );
    if (missingForms) {
      alert(
        "Existem achados que ainda estão como Rascunho ou sem a descrição 5W2H preenchida.",
      );
      return;
    }

    try {
      // Create Report object to generate PDF
      const docId = `AUDIT-${program.id.split("-")[0].toUpperCase()}`;
      const reportData: AuditReport = {
        program_id: program.id,
        doc_id: docId,
        client_name: "Leadgers Governance",
        project_name: program.name,
        environment: "Produção",
        start_date:
          program.start_date || new Date().toISOString().split("T")[0],
        end_date: program.end_date || new Date().toISOString().split("T")[0],
        lead_auditor: "Auditor Líder",
        executive_summary:
          program.description || "Auditoria concluída com achados registrados.",
        final_opinion: "Auditoria avaliada e certificada pelo responsável.",
        findings: programFindings.map((f) => {
          let analysis = {
            what: "",
            why: "",
            where: "",
            when: "",
            who: "",
            how: "",
            howMuch: "",
          };
          try {
            if (f.description) analysis = JSON.parse(f.description);
          } catch (e) {
            analysis.what = f.description || "";
          }
          return {
            id: f.id,
            finding_id: f.id,
            analysis,
            risk_level: f.risk_level,
            status: f.status,
            task_type: "",
            impacted_areas: [],
            evidence_links: [],
            should_notify: false,
          };
        }),
        signatures: [
          {
            name: "Auditor System",
            role: "Consolidação Automática",
            signed_at: new Date().toISOString().split("T")[0],
          },
        ],
        status: "signed",
      };

      // Generate PDF Blob
      const { pdf } = await import("@react-pdf/renderer");
      const { default: ReportPdfDocument } =
        await import("../utils/ReportPdfDocument");

      const blob = await pdf(
        <ReportPdfDocument report={reportData} />,
      ).toBlob();

      // Simulate doc_hash for now
      const simulatedDocHash = btoa(programId + "-" + Date.now());
      await approveAudit(programId, simulatedDocHash, blob);

      navigate("/audit/programs");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Erro ao aprovar auditoria. Talvez você não possua permissões suficientes (SoD).",
      );
    }
  };

  const handleReject = () => {
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!programId || !program || !rejectReason.trim()) return;
    try {
      await rejectAudit(programId, rejectReason);
      setRejectReason("");
      setIsRejectModalOpen(false);
      navigate("/audit/programs");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao devolver auditoria.");
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
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <ShieldCheck className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tight font-display mb-1">
                  Aprovação de Auditoria
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
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <ShieldCheck className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-display mb-1">
                Aprovação de Auditoria
              </h1>
              <p className="text-muted-foreground font-medium text-sm">
                Programa:{" "}
                <span className="text-foreground">{program.name}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={handleReject}
            variant="ghost"
            className="rounded-xl px-6 py-4 border border-destructive/20 text-destructive hover:bg-destructive/10"
          >
            Devolver (Correção)
          </Button>
          <Button
            onClick={handleApprove}
            variant="primary"
            className="rounded-xl px-6 py-4 shadow-xl shadow-primary/20"
          >
            Aprovar e Emitir
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium text-sm">
          {error}
        </div>
      )}

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card border-white/5 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Taxa de Conformidade
            </span>
            <span className="text-xl font-bold text-emerald-500">
              {responses.length > 0
                ? Math.round(
                    (responses.filter((r) => r.status === "conforme").length /
                      responses.length) *
                      100,
                  )
                : 0}
              %
            </span>
          </div>
          <div className="w-full h-2 bg-foreground/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{
                width: `${responses.length > 0 ? (responses.filter((r) => r.status === "conforme").length / responses.length) * 100 : 0}%`,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground/60 font-medium mt-4">
            {responses.filter((r) => r.status === "conforme").length} conformes
            de {responses.length} itens avaliados.
          </p>
        </div>

        <div className="glass-card border-white/5 p-6 rounded-3xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <span className="block text-xl font-bold text-foreground">
                {programFindings.length}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                Achados Registrados
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/60 font-medium">
            Consulte a seção inferior para visualizar as não conformidades
            reportadas e certificadas pelo auditor.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display px-2">
          Histórico da Auditoria
        </h3>
        <AuditTimeline auditId={programId as string} />
      </div>

      {/* Items List (Read Only) */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display px-2">
          Resposta aos Requisitos (Read-Only)
        </h3>
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
              {isExpanded && response && (
                <div className="px-6 pb-6 pt-2 border-t border-white/5 animate-in slide-in-from-top-4 fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-6">
                    {/* Left Col: Justification */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                        Justificativa do Auditor
                      </label>
                      <div className="w-full bg-foreground/5 border border-white/5 rounded-2xl p-4 text-sm font-medium text-muted-foreground">
                        {response.justification || (
                          <span className="italic opacity-50">
                            Sem justificativa fornecida.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Col: Evidences */}
                    <div className="space-y-4 border-l md:border-white/5 md:pl-8">
                      <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                        Evidências Anexadas
                      </label>
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
                          </div>
                        ))}

                        {itemEvidences.length === 0 && (
                          <div className="text-sm font-medium text-muted-foreground/40 italic px-2">
                            Nenhuma evidência anexada.
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
              Checklist Vazio
            </h3>
            <p className="text-muted-foreground/60 text-sm">
              Estranho, um programa vazio chegou a revisão.
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Devolver Auditoria (Correção)"
      >
        <div className="space-y-4">
          <p className="text-sm text-foreground/80">
            Informe o motivo da devolução. Este feedback será registrado no
            histórico da auditoria e o auditor será notificado para realizar as
            correções necessárias.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full min-h-[120px] p-3 rounded-xl bg-slate-900/50 dark:bg-black/50 border border-white/10 focus:ring-2 focus:ring-primary/20 text-sm custom-scrollbar text-foreground"
            placeholder="Descreva detalhadamente o que precisa ser corrigido..."
          />
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10 mt-4">
            <Button
              variant="ghost"
              onClick={() => setIsRejectModalOpen(false)}
              className="rounded-xl px-4 mt-4"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={confirmReject}
              disabled={!rejectReason.trim() || loading}
              className="rounded-xl px-4 mt-4 bg-amber-500 hover:bg-amber-600 border-0 shadow-lg shadow-amber-500/20 text-white"
            >
              {loading ? "Processando..." : "Confirmar Devolução"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
