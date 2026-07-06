import { useState, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  FileOutput,
  Plus,
  RotateCcw,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  Cloud,
  CloudOff,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { ModernSelect } from "@/shared/components/ui/ModernSelect";
import { Input } from "@/shared/components/ui/Input";
import { cn } from "@/shared/utils/cn";
import { useReportGenerator } from "../hooks/useReportGenerator";
import { useAudit } from "../hooks/useAudit";
import { useProjects } from "../../projects/services/projects.service";
import { useTenantMembers } from "../hooks/useTenantMembers";
import ReportFindingCard from "../components/ReportFindingCard";
import ReportSignatures from "../components/ReportSignatures";
import ExportModal from "../components/ExportModal";
import ReportPreviewModal from "../components/ReportPreviewModal";

const DOC_ID_MAX_LENGTH = 32;

export default function ReportBuilder() {
  const {
    report,
    unsavedChanges,
    syncStatus,
    updateField,
    addFinding,
    addBulkFindings,
    updateFinding,
    updateFinding5W2H,
    removeFinding,
    addSignature,
    removeSignature,
    validate,
    exportReport,
    resetReport,
    forceSync,
  } = useReportGenerator();

  const { programs } = useAudit();
  const { projects } = useProjects();
  const { members: tenantMembers, loading: membersLoading } =
    useTenantMembers();
  const [showExport, setShowExport] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  const validation = useMemo(() => validate(), [validate]);

  const virtualizer = useVirtualizer({
    count: report.findings.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 500, // estimated height of a finding card
    overscan: 3,
  });

  return (
    <div className="min-h-screen bg-transparent transition-colors">
      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-40 bg-background/50 backdrop-blur-2xl border-b border-white/5 px-4 md:px-8 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/5">
              <FileOutput className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-foreground text-base tracking-tight font-display">
                Gerador de Relatórios de Auditoria
              </h1>
              <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.2em] truncate max-w-[280px]">
                {report.doc_id || "Sem documento"}
              </p>
            </div>
            {unsavedChanges ? (
              <span
                key="status-saving"
                className="flex items-center gap-1.5 text-[10px] text-amber-500 font-bold uppercase tracking-widest bg-amber-500/5 border border-amber-500/20 px-3 py-1 rounded-full animate-pulse"
              >
                <AlertCircle className="w-3 h-3" /> Salvando...
              </span>
            ) : (
              <span
                key="status-synced"
                className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/5 border border-emerald-500/20 px-3 py-1 rounded-full"
              >
                <CheckCircle2 className="w-3 h-3" /> Salvo
              </span>
            )}
            {/* Cloud sync indicator */}
            {syncStatus === "syncing" && (
              <span className="flex items-center gap-1.5 text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/5 border border-primary/20 px-3 py-1 rounded-full animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" /> Cloud
              </span>
            )}
            {syncStatus === "synced" && !unsavedChanges && (
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/5 border border-emerald-500/20 px-3 py-1 rounded-full">
                <Cloud className="w-3 h-3" /> Cloud ✓
              </span>
            )}
            {syncStatus === "offline" && (
              <button
                onClick={forceSync}
                className="flex items-center gap-1.5 text-[10px] text-orange-400 font-bold uppercase tracking-widest bg-orange-500/5 border border-orange-500/20 px-3 py-1 rounded-full hover:bg-orange-500/10 transition-colors cursor-pointer"
              >
                <CloudOff className="w-3 h-3" /> Offline
              </button>
            )}
            {syncStatus === "error" && (
              <button
                onClick={forceSync}
                className="flex items-center gap-1.5 text-[10px] text-destructive font-bold uppercase tracking-widest bg-destructive/5 border border-destructive/20 px-3 py-1 rounded-full hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <CloudOff className="w-3 h-3" /> Sync Erro
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowReset(true)}
              className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 hover:bg-destructive/5 hover:text-destructive rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-2" />
              Resetar
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowPreview(true)}
              className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 hover:bg-primary/5 hover:text-primary rounded-xl transition-all"
            >
              <Eye className="w-3.5 h-3.5 mr-2" />
              Pré-visualizar
            </Button>
            <div className="relative group">
              <Button
                onClick={() => setShowExport(true)}
                className="text-[10px] font-bold uppercase tracking-widest px-6 py-2 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5 mr-2" />
                Exportar
                {validation.errors.length > 0 && (
                  <span className="ml-2 w-4 h-4 rounded-full bg-white/20 text-[8px] font-bold flex items-center justify-center">
                    {validation.errors.length}
                  </span>
                )}
              </Button>
              {validation.errors.length > 0 && (
                <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-card border border-border rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <p className="text-[10px] font-bold text-destructive uppercase tracking-widest mb-1.5">
                    Pendências:
                  </p>
                  {validation.errors.slice(0, 3).map((err, i) => (
                    <p
                      key={i}
                      className="text-[10px] text-muted-foreground leading-relaxed"
                    >
                      • {err}
                    </p>
                  ))}
                  {validation.errors.length > 3 && (
                    <p className="text-[10px] text-muted-foreground/50 mt-1">
                      +{validation.errors.length - 3} mais...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 space-y-12">
        {/* ─── Header Fields ─── */}
        <section className="glass-card soft-shadow rounded-3xl p-8 md:p-10 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
              Cabeçalho do Relatório
            </h2>
            <p className="text-[10px] text-muted-foreground/40">
              Preencha os dados do relatório de auditoria
            </p>
          </div>

          {/* Row 1: Doc ID + Programa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-0.5">
                Doc ID <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  value={report.doc_id.slice(0, DOC_ID_MAX_LENGTH)}
                  maxLength={DOC_ID_MAX_LENGTH}
                  onChange={(e) =>
                    updateField(
                      "doc_id",
                      e.target.value.slice(0, DOC_ID_MAX_LENGTH),
                    )
                  }
                  placeholder="AUD-2026-001"
                  className={`bg-card/60 border h-14 rounded-2xl px-5 font-mono text-sm tracking-wide focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${
                    report.doc_id.length >= DOC_ID_MAX_LENGTH
                      ? "border-destructive focus:border-destructive"
                      : "border-border"
                  }`}
                />
                <span
                  className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold tabular-nums ${
                    report.doc_id.length >= DOC_ID_MAX_LENGTH
                      ? "text-destructive"
                      : report.doc_id.length > DOC_ID_MAX_LENGTH - 5
                        ? "text-amber-500"
                        : "text-muted-foreground/30"
                  }`}
                >
                  {Math.min(report.doc_id.length, DOC_ID_MAX_LENGTH)}/
                  {DOC_ID_MAX_LENGTH}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-0.5">
                Programa de Auditoria{" "}
                <span className="text-destructive">*</span>
              </label>
              <ModernSelect
                options={programs.map((p) => ({ value: p.id, label: p.name }))}
                value={report.program_id}
                onChange={(val) => updateField("program_id", val)}
                placeholder="Selecione o programa..."
                className="!h-auto"
              />
            </div>
          </div>

          {/* Row 2: Projeto + Empresa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-0.5">
                Projeto Vinculado{" "}
                <span className="text-muted-foreground/40 normal-case tracking-normal text-[10px]">
                  (auto-preencher)
                </span>
              </label>
              <ModernSelect
                options={projects.map((p) => ({ value: p.id, label: p.name }))}
                value={report.project_id || ""}
                onChange={(projId) => {
                  updateField("project_id", projId);
                  const proj = projects.find((p) => p.id === projId);
                  if (proj) {
                    updateField("project_name", proj.name);
                    if (proj.startDate)
                      updateField("start_date", proj.startDate.split("T")[0]);
                    if (proj.endDate)
                      updateField("end_date", proj.endDate.split("T")[0]);
                  }
                }}
                placeholder="Selecione um projeto..."
                className="!h-auto"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-0.5">
                Empresa Cliente <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Ex: Cogitari Tech"
                value={report.client_name}
                maxLength={100}
                onChange={(e) => updateField("client_name", e.target.value)}
                className={`bg-card/60 border h-14 rounded-2xl px-5 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${
                  !report.client_name.trim() && validation.errors.length > 0
                    ? "border-destructive/50"
                    : "border-border"
                }`}
              />
              {!report.client_name.trim() && validation.errors.length > 0 && (
                <p className="text-[10px] text-destructive font-medium ml-0.5">
                  Campo obrigatório
                </p>
              )}
            </div>
          </div>

          {/* Row 3: Projeto/Módulo + Datas + Ambiente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-0.5">
                Nome do Projeto / Módulo{" "}
                <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Ex: Plataforma Leadgers"
                value={report.project_name}
                maxLength={120}
                onChange={(e) => updateField("project_name", e.target.value)}
                className={`bg-card/60 border h-14 rounded-2xl px-5 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${
                  !report.project_name.trim() && validation.errors.length > 0
                    ? "border-destructive/50"
                    : "border-border"
                }`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-0.5">
                Data Início <span className="text-destructive">*</span>
              </label>
              <div className="relative group">
                <input
                  type="date"
                  value={report.start_date}
                  onChange={(e) => updateField("start_date", e.target.value)}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker();
                    } catch {}
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full [color-scheme:light] dark:[color-scheme:dark]"
                />
                <div
                  className={cn(
                    "flex w-full h-14 items-center justify-between rounded-2xl border bg-card/60 px-5 text-sm transition-all duration-300 group-hover:border-primary/50 group-hover:bg-card/80 group-focus-within:ring-4 group-focus-within:ring-primary/10",
                    report.start_date
                      ? "border-border text-foreground"
                      : "border-border text-muted-foreground/40",
                    !report.start_date && validation.errors.length > 0
                      ? "border-destructive/50"
                      : "border-border",
                  )}
                >
                  <span className="font-medium">
                    {report.start_date
                      ? report.start_date.split("-").reverse().join("/")
                      : "DD/MM/AAAA"}
                  </span>
                  <Calendar className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-0.5">
                Data Fim <span className="text-destructive">*</span>
              </label>
              <div className="relative group">
                <input
                  type="date"
                  value={report.end_date}
                  onChange={(e) => updateField("end_date", e.target.value)}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker();
                    } catch {}
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full [color-scheme:light] dark:[color-scheme:dark]"
                />
                <div
                  className={cn(
                    "flex w-full h-14 items-center justify-between rounded-2xl border bg-card/60 px-5 text-sm transition-all duration-300 group-hover:border-primary/50 group-hover:bg-card/80 group-focus-within:ring-4 group-focus-within:ring-primary/10",
                    report.end_date
                      ? "border-border text-foreground"
                      : "border-border text-muted-foreground/40",
                    !report.end_date && validation.errors.length > 0
                      ? "border-destructive/50"
                      : "border-border",
                  )}
                >
                  <span className="font-medium">
                    {report.end_date
                      ? report.end_date.split("-").reverse().join("/")
                      : "DD/MM/AAAA"}
                  </span>
                  <Calendar className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-0.5">
                Ambiente
              </label>
              <ModernSelect
                options={[
                  { value: "Produção", label: "Produção" },
                  { value: "Staging", label: "Staging" },
                  { value: "Desenvolvimento", label: "Desenvolvimento" },
                  { value: "Homologação", label: "Homologação" },
                ]}
                value={report.environment}
                onChange={(val) => updateField("environment", val)}
                className="!h-auto"
              />
            </div>
          </div>

          {/* Row 4: Auditor Líder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-0.5">
                Auditor Líder <span className="text-destructive">*</span>
              </label>
              {membersLoading ? (
                <div className="h-14 bg-card/60 border border-border rounded-2xl animate-pulse" />
              ) : tenantMembers.length > 0 ? (
                <ModernSelect
                  options={tenantMembers.map((m) => ({
                    value: m.name,
                    label: `${m.name} — ${m.role}`,
                  }))}
                  value={report.lead_auditor}
                  onChange={(val) => updateField("lead_auditor", val)}
                  placeholder="Selecione o auditor..."
                  className="!h-auto"
                />
              ) : (
                <Input
                  placeholder="Nome do Auditor Líder"
                  value={report.lead_auditor}
                  maxLength={80}
                  onChange={(e) => updateField("lead_auditor", e.target.value)}
                  className={`bg-card/60 border h-14 rounded-2xl px-5 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${
                    !report.lead_auditor.trim() && validation.errors.length > 0
                      ? "border-destructive/50"
                      : "border-border"
                  }`}
                />
              )}
              {!report.lead_auditor.trim() && validation.errors.length > 0 && (
                <p className="text-[10px] text-destructive font-medium ml-0.5">
                  Campo obrigatório
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ─── Executive Summary ─── */}
        <section className="glass-card soft-shadow rounded-3xl p-10 space-y-6">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
            Sumário Executivo
          </h2>
          <textarea
            rows={5}
            className="w-full text-sm p-8 bg-card/60 border border-border rounded-2xl focus:bg-card outline-none transition-all resize-none text-foreground placeholder-muted-foreground/20 font-medium leading-relaxed"
            placeholder="Descreva o contexto, os objetivos e as principais conclusões da auditoria..."
            value={report.executive_summary}
            onChange={(e) => updateField("executive_summary", e.target.value)}
          />
        </section>

        {/* ─── Findings (5W2H) ─── */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground font-display tracking-tight">
                Achados de Auditoria
                <span className="ml-2 text-xs text-muted-foreground/50">
                  ({report.findings.length})
                </span>
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                Registro de não conformidades (5W2H)
              </p>
            </div>
            <div className="flex items-center gap-3">
              {import.meta.env.DEV && (
                <Button
                  id="qa-stress-test-btn"
                  onClick={() => addBulkFindings(200)}
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl px-6 py-3 transition-all flex items-center gap-2 border border-amber-500/20"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Stress Test (200)</span>
                </Button>
              )}
              <Button
                onClick={() => addFinding()}
                className="bg-card/40 hover:bg-card text-muted-foreground rounded-2xl px-6 py-3 transition-all flex items-center gap-2 group border border-border"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                <span>Novo Registro</span>
              </Button>
            </div>
          </div>

          <div className="space-y-8" key="findings-content">
            {report.findings.length === 0 ? (
              <div
                key="empty-findings"
                className="text-center py-24 glass-card rounded-3xl soft-shadow"
              >
                <div className="w-20 h-20 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-6 shadow-xl border border-border">
                  <AlertCircle className="w-10 h-10 text-muted-foreground/20" />
                </div>
                <p className="text-sm font-medium text-muted-foreground/60 mb-8">
                  Nenhum achado registrado nesta auditoria
                </p>
                <div className="flex justify-center">
                  <Button
                    variant="primary"
                    className="rounded-2xl px-10 py-6 text-base font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all duration-300"
                    onClick={() => addFinding()}
                  >
                    <Plus className="w-5 h-5 mr-3" /> Começar Agora
                  </Button>
                </div>
              </div>
            ) : (
              <div
                key="findings-list"
                ref={parentRef}
                className="max-h-[800px] overflow-y-auto w-full custom-scrollbar pr-2 pb-4"
              >
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {virtualizer.getVirtualItems().map((virtualItem) => {
                    const finding = report.findings[virtualItem.index];
                    return (
                      <div
                        key={finding.id}
                        data-index={virtualItem.index}
                        ref={virtualizer.measureElement}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${virtualItem.start}px)`,
                          paddingBottom: "2rem", // gap equivalent
                        }}
                      >
                        <ReportFindingCard
                          finding={finding}
                          index={virtualItem.index}
                          onUpdate={updateFinding}
                          onUpdate5W2H={updateFinding5W2H}
                          onRemove={removeFinding}
                          tenantMembers={tenantMembers}
                          membersLoading={membersLoading}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── Final Opinion ─── */}
        <section className="glass-card soft-shadow rounded-3xl p-10 space-y-6">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
            Parecer Final
          </h2>
          <textarea
            rows={5}
            className="w-full text-sm p-8 bg-card/60 border border-border rounded-2xl focus:bg-card outline-none transition-all resize-none text-foreground placeholder-muted-foreground/20 font-medium leading-relaxed"
            placeholder="Parecer final do auditor sobre o estado geral e as recomendações..."
            value={report.final_opinion}
            onChange={(e) => updateField("final_opinion", e.target.value)}
          />
        </section>

        {/* ─── Signatures ─── */}
        <ReportSignatures
          signatures={report.signatures}
          onAdd={addSignature}
          onRemove={removeSignature}
        />

        {/* Inline Validation Warnings (compact, non-blocking) */}
        {validation.warnings.length > 0 && (
          <div className="flex flex-wrap gap-2 px-2">
            {validation.warnings.map((w, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/5 border border-amber-500/15 rounded-full text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider"
              >
                ⚠ {w}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        report={report}
        onExport={exportReport}
        validationErrors={validation.errors}
        validationWarnings={validation.warnings}
      />

      {/* Preview Modal */}
      <ReportPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        report={report}
        onExport={() => {
          setShowPreview(false);
          setShowExport(true);
        }}
      />

      {/* Reset Confirmation */}
      {showReset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            onClick={() => setShowReset(false)}
          />
          <div className="glass-card rounded-3xl p-12 max-w-md w-full shadow-2xl space-y-8 relative z-10 text-center scale-up">
            <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6 shadow-xl border border-destructive/20 group">
              <RotateCcw className="w-10 h-10 text-destructive group-hover:rotate-[-120deg] transition-all duration-700" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">
                Resetar Relatório?
              </h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                Todos os dados do relatório atual serão permanentemente
                removidos. Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowReset(false)}
                className="flex-1 py-4 rounded-2xl bg-foreground/5 text-muted-foreground hover:bg-white hover:text-black transition-all font-bold uppercase tracking-widest text-[10px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  resetReport();
                  setShowReset(false);
                }}
                className="flex-1 py-4 rounded-2xl bg-destructive text-white shadow-xl shadow-destructive/20 hover:scale-105 active:scale-95 transition-all font-bold uppercase tracking-widest text-[10px]"
              >
                Limpar Tudo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
