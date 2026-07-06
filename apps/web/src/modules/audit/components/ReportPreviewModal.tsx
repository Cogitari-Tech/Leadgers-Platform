import {
  X,
  Download,
  Printer,
  ShieldAlert,
  Mail,
  Link as LinkIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AuditReport } from "../types/audit.types";

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AuditReport;
  onExport: () => void;
}

const RISK_STYLES: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  critical: {
    bg: "bg-destructive shadow-lg shadow-destructive/20",
    text: "text-destructive-foreground font-bold",
    border: "border-destructive",
    label: "Risco Crítico",
  },
  high: {
    bg: "bg-primary shadow-lg shadow-primary/20",
    text: "text-primary-foreground font-bold",
    border: "border-primary",
    label: "Risco Alto",
  },
  medium: {
    bg: "bg-amber-500 shadow-lg shadow-amber-500/20",
    text: "text-white font-bold",
    border: "border-amber-600",
    label: "Risco Médio",
  },
  low: {
    bg: "bg-emerald-500 shadow-lg shadow-emerald-500/20",
    text: "text-white font-bold",
    border: "border-emerald-600",
    label: "Risco Baixo",
  },
};

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  open: {
    bg: "bg-foreground shadow-lg shadow-foreground/10",
    text: "text-background font-bold",
    border: "border-foreground",
    label: "Aberto",
  },
  in_progress: {
    bg: "bg-primary shadow-lg shadow-primary/20",
    text: "text-primary-foreground font-bold",
    border: "border-primary",
    label: "Em Tratamento",
  },
  resolved: {
    bg: "bg-emerald-600 shadow-lg shadow-emerald-500/20",
    text: "text-white font-bold",
    border: "border-emerald-700",
    label: "Resolvido",
  },
  accepted: {
    bg: "bg-muted-foreground shadow-lg shadow-muted-foreground/20",
    text: "text-background font-bold",
    border: "border-muted-foreground",
    label: "Aceito",
  },
};

const TASK_TYPES_MAP: Record<string, string> = {
  "Frontend Bug": "Interface (Frontend)",
  "Backend Logic": "Lógica de Processamento",
  "Security Vuln": "Risco de Segurança",
  Database: "Dados e Persistência",
  "DevOps/CI-CD": "Pipeline e Operações",
  "Code Quality": "Débito Técnico / Código",
  Performance: "Performance / Escala",
  Documentation: "Falta de Documentação",
  Compliance: "Não Conformidade Legal",
  Infrastructure: "Arquitetura / Infra",
  Dependency: "Gestão de Dependências",
  Architecture: "Arquitetura e Design",
  "Product UI/UX": "Produto / UI-UX",
  "Growth/Marketing": "Growth / Marketing",
  "Sales/CRM": "Vendas / CRM",
  "Customer Success": "Customer Success",
  "HR/Recruitment": "RH / Recrutamento",
  "Finance/Billing": "Financeiro / Billing",
  "Legal/Privacy": "Jurídico / Privacidade",
  "Data Science/AI": "Data Science / AI",
};

function getRisk(level: string) {
  return RISK_STYLES[level] ?? RISK_STYLES.low;
}

function getStatus(status: string) {
  return STATUS_STYLES[status] ?? STATUS_STYLES.open;
}

export default function ReportPreviewModal({
  isOpen,
  onClose,
  report,
  onExport,
}: ReportPreviewModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 z-[200] flex flex-col bg-background print:bg-white"
        >
          {/* ─── Toolbar ─── */}
          <div className="flex items-center justify-between px-6 py-3 bg-background/80 backdrop-blur-xl border-b border-border print:hidden shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              <div>
                <h2 className="text-base font-bold text-foreground tracking-tight">
                  Pré-visualização do Relatório
                </h2>
                <p className="text-xs text-muted-foreground font-medium tracking-wide">
                  ID: {report.doc_id || "Não definido"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground bg-secondary hover:bg-secondary/80 rounded-xl transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Imprimir
              </button>
              <button
                onClick={() => {
                  onExport();
                  onClose();
                }}
                className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground bg-primary hover:brightness-110 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                <Download className="w-4 h-4" /> Exportar PDF
              </button>
            </div>
          </div>

          {/* ─── Paper Container ─── */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center py-10 px-4 print:p-0 print:block bg-muted/20">
            <div className="w-full max-w-[210mm] print:max-w-none space-y-8 print:space-y-0">
              {/* ═══════════════════════════ COVER PAGE ═══════════════════════════ */}
              <div className="bg-card rounded-3xl print:rounded-none shadow-2xl print:shadow-none overflow-hidden print:break-after-page relative ring-1 ring-border/50 print:ring-0">
                <div className="min-h-[297mm] print:min-h-0 flex flex-col items-center justify-center px-16 py-24 relative overflow-hidden">
                  {/* Premium Background Elements */}
                  <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-primary/80 via-primary to-amber-500" />
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-64 -mt-64" />
                  <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -ml-64 -mb-64" />

                  <div className="mb-16">
                    <img
                      src="/images/logo-dark.webp"
                      alt="Leadgers"
                      className="h-16 dark:hidden print:block"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <img
                      src="/images/logo-light.webp"
                      alt="Leadgers"
                      className="h-16 hidden dark:block print:hidden"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>

                  <h1 className="text-4xl md:text-5xl font-black text-foreground text-center tracking-tight mb-4 print:text-black">
                    Relatório de Auditoria
                  </h1>
                  <p className="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-20 print:text-orange-600">
                    Registros de Conformidade & Ocorrências
                  </p>

                  <div className="w-full max-w-lg bg-muted/20 backdrop-blur-sm rounded-2xl p-10 space-y-6 border border-border/50 print:bg-slate-50 print:border-slate-300 shadow-xl shadow-foreground/[0.02]">
                    {[
                      { label: "Empresa Cliente", value: report.client_name },
                      { label: "Projeto / Escopo", value: report.project_name },
                      { label: "Auditor Líder", value: report.lead_auditor },
                      { label: "Referência ID", value: report.doc_id },
                      {
                        label: "Período Auditado",
                        value: `${report.start_date || "—"} até ${report.end_date || "—"}`,
                      },
                    ].map(({ label, value }, i) => (
                      <div
                        key={label}
                        className={`flex items-start gap-6 pb-6 ${i < 4 ? "border-b border-border/40 print:border-slate-300" : "pb-0"}`}
                      >
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] w-32 shrink-0 pt-1 print:text-slate-600">
                          {label}
                        </span>
                        <span className="text-base font-bold text-foreground print:text-black leading-tight tracking-tight">
                          {value || "—"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="absolute bottom-12 text-[10px] text-muted-foreground font-medium uppercase tracking-widest print:text-slate-500">
                    CONFIDENCIAL — LEADGERS TECH © {new Date().getFullYear()}
                  </p>
                </div>
              </div>

              {/* ═══════════════════════════ CONTENT PAGES ═══════════════════════════ */}
              <div className="bg-card rounded-2xl print:rounded-none shadow-xl print:shadow-none overflow-hidden print:break-inside-auto ring-1 ring-border print:ring-0">
                <div className="px-10 md:px-16 py-16 space-y-16 print:px-10 print:py-10">
                  {/* Header */}
                  <div className="flex items-end justify-between pb-6 border-b-2 border-foreground print:border-black">
                    <div>
                      <h2 className="text-xl font-black text-foreground tracking-tight print:text-black">
                        Detalhes da Auditoria
                      </h2>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1 print:text-slate-600">
                        {report.client_name} • {report.project_name}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium bg-secondary px-3 py-1 rounded-full print:bg-slate-100 print:text-slate-700">
                      ID: {report.doc_id}
                    </span>
                  </div>

                  {/* 1. Executive Summary */}
                  <section>
                    <div className="flex items-center gap-3 mb-6 border-b border-border pb-4 print:border-slate-300">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        1
                      </span>
                      <h3 className="text-lg font-bold text-foreground tracking-tight print:text-black">
                        Sumário Executivo
                      </h3>
                    </div>
                    <div className="bg-muted/30 p-6 rounded-2xl border border-border print:border-slate-200">
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap print:text-slate-800">
                        {report.executive_summary ||
                          "Nenhum sumário executivo fornecido."}
                      </p>
                    </div>
                  </section>

                  {/* 2. Findings (5W2H) */}
                  <section className="print:break-before-page">
                    <div className="flex items-center justify-between mb-8 border-b border-border pb-4 print:border-slate-300">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          2
                        </span>
                        <h3 className="text-lg font-bold text-foreground tracking-tight print:text-black">
                          Registro de Ocorrências (5W2H)
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-muted-foreground bg-secondary px-3 py-1 rounded-full print:bg-slate-100 print:text-slate-600">
                        {report.findings.length} Achados
                      </span>
                    </div>

                    {report.findings.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic print:text-slate-600 bg-muted/30 p-6 rounded-2xl">
                        Nenhuma não-conformidade registrada neste ciclo.
                      </p>
                    ) : (
                      <div className="space-y-10">
                        {report.findings.map((f, i) => {
                          const risk = getRisk(f.risk_level);
                          const status = getStatus(f.status);
                          const taskLabel =
                            TASK_TYPES_MAP[f.task_type] || f.task_type;

                          return (
                            <div
                              key={f.id}
                              className="border border-border rounded-2xl overflow-hidden print:border-slate-300 print:break-inside-avoid bg-card shadow-sm"
                            >
                              <div className="bg-muted/30 px-6 py-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 print:bg-slate-50 print:border-slate-300">
                                <div className="flex items-center gap-4">
                                  <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${risk.bg} ${risk.border}`}
                                  >
                                    <ShieldAlert
                                      className={`w-5 h-5 ${risk.text}`}
                                    />
                                  </div>
                                  <div>
                                    <h4 className="text-base font-bold text-foreground print:text-black">
                                      Achado #{String(i + 1).padStart(2, "0")}{" "}
                                      <span className="text-muted-foreground font-normal ml-2">
                                        ({taskLabel || "Não Categorizado"})
                                      </span>
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                      <span
                                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${risk.bg} ${risk.text} ${risk.border}`}
                                      >
                                        {risk.label}
                                      </span>
                                      <span
                                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${status.bg} ${status.text} ${status.border}`}
                                      >
                                        {status.label}
                                      </span>
                                      {f.should_notify && f.notify_email && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-secondary text-secondary-foreground border-border flex items-center gap-1">
                                          <Mail className="w-3 h-3" />{" "}
                                          Notificado
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 print:grid-cols-2">
                                <div className="md:col-span-2">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2 print:text-slate-600">
                                    O QUÊ (What) — Descrição do Achado
                                  </span>
                                  <div className="bg-muted/30 rounded-xl p-5 border border-border/50 print:bg-slate-50 print:border-slate-200">
                                    <p className="text-sm text-foreground/90 leading-relaxed print:text-slate-900 font-medium">
                                      {f.analysis.what || "—"}
                                    </p>
                                  </div>
                                </div>

                                <div className="md:col-span-2">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2 print:text-slate-600">
                                    POR QUÊ (Why) — Causa Raiz Identificada
                                  </span>
                                  <div className="bg-muted/30 rounded-xl p-5 border border-border/50 print:bg-slate-50 print:border-slate-200">
                                    <p className="text-sm text-foreground/80 leading-relaxed print:text-slate-800">
                                      {f.analysis.why || "—"}
                                    </p>
                                  </div>
                                </div>

                                {(
                                  [
                                    ["ONDE (Where)", f.analysis.where],
                                    ["QUANDO (When)", f.analysis.when],
                                    ["QUEM (Who)", f.analysis.who],
                                    ["COMO (How)", f.analysis.how],
                                  ] as const
                                ).map(([label, value]) => (
                                  <div key={label} className="space-y-2">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest print:text-slate-500">
                                      {label}
                                    </span>
                                    <div className="border-l-2 border-border pl-4 py-1 print:border-slate-300">
                                      <p className="text-sm text-foreground/90 print:text-slate-900 leading-relaxed">
                                        {value || "—"}
                                      </p>
                                    </div>
                                  </div>
                                ))}

                                <div className="md:col-span-2 mt-2">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2 print:text-slate-600">
                                    QUANTO / IMPACTO (How Much)
                                  </span>
                                  <div className="bg-destructive/10 rounded-xl p-5 border border-destructive/20 print:bg-red-50 print:border-red-200">
                                    <p className="text-sm text-destructive leading-relaxed print:text-red-900 font-medium">
                                      {f.analysis.howMuch || "—"}
                                    </p>
                                  </div>
                                </div>

                                {f.code_snippet && (
                                  <div className="md:col-span-2 mt-4">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2 print:text-slate-600">
                                      Evidência Técnica / Snippet Restrito
                                    </span>
                                    <pre className="text-[11px] font-mono text-emerald-400 bg-black/90 dark:bg-black rounded-xl p-5 overflow-x-auto leading-relaxed border border-border print:text-slate-800 print:bg-slate-50 print:border-slate-300 shadow-inner">
                                      {f.code_snippet}
                                    </pre>
                                  </div>
                                )}

                                {f.evidence_links &&
                                  f.evidence_links.filter(Boolean).length >
                                    0 && (
                                    <div className="md:col-span-2 mt-2">
                                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2 print:text-slate-600">
                                        Referências Externas
                                      </span>
                                      <div className="flex flex-col gap-2">
                                        {f.evidence_links.map((link, idx) => {
                                          let isValid = false;
                                          try {
                                            const parsed = new URL(link);
                                            isValid =
                                              parsed.protocol === "http:" ||
                                              parsed.protocol === "https:";
                                          } catch {
                                            isValid = false;
                                          }
                                          if (!link || !isValid) return null;
                                          return (
                                            <a
                                              key={idx}
                                              href={link}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-primary hover:text-primary/80 transition-colors truncate flex items-center gap-2 bg-primary/5 px-3 py-2 rounded-lg border border-primary/10 w-fit max-w-full"
                                            >
                                              <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                              <span className="truncate">
                                                {link}
                                              </span>
                                            </a>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                {f.impacted_areas.length > 0 && (
                                  <div className="md:col-span-2 mt-2 pt-6 border-t border-border print:border-slate-200">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-3 print:text-slate-600">
                                      Áreas Afetadas
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                      {f.impacted_areas.map((area) => (
                                        <span
                                          key={area}
                                          className="text-[11px] font-semibold px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg print:bg-slate-100 print:text-slate-800 border border-border"
                                        >
                                          {area}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  {/* 3. Final Opinion */}
                  <section className="print:break-before-page">
                    <div className="flex items-center gap-3 mb-6 border-b border-border pb-4 print:border-slate-300">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        3
                      </span>
                      <h3 className="text-lg font-bold text-foreground tracking-tight print:text-black">
                        Parecer Final e Recomendações
                      </h3>
                    </div>
                    <div className="bg-muted/30 p-6 rounded-2xl border border-border print:border-slate-200">
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap print:text-slate-800">
                        {report.final_opinion ||
                          "Nenhum parecer final registrado."}
                      </p>
                    </div>
                  </section>

                  {/* 4. Signatures */}
                  <section className="print:break-before-page">
                    <div className="flex items-center gap-3 mb-6 border-b border-border pb-4 print:border-slate-300">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        4
                      </span>
                      <h3 className="text-lg font-bold text-foreground tracking-tight print:text-black">
                        Termo de Aprovação
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-10 print:text-slate-500">
                      Este documento foi gerado e conferido sistemicamente pelos
                      perfis abaixo, atestando a integridade das informações
                      aqui contidas no momento de sua emissão.
                    </p>

                    {report.signatures.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic print:text-slate-500 bg-muted/30 p-6 rounded-2xl">
                        Nenhuma assinatura registrada.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-12 mt-8">
                        {report.signatures.map((s, i) => (
                          <div key={i} className="relative pt-6">
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-border print:bg-slate-400" />
                            <p className="text-sm font-bold text-foreground print:text-black mb-0.5">
                              {s.name}
                            </p>
                            <p className="text-xs font-semibold text-primary print:text-orange-600">
                              {s.role}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-2 print:text-slate-500 uppercase tracking-widest font-medium">
                              Data: {s.signed_at}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
