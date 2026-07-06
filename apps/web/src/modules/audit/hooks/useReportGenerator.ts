import { useState, useCallback, useEffect, useRef } from "react";
import type {
  AuditReport,
  ReportFinding,
  ReportSignature,
  ExportFormat,
  Finding5W2H,
  FindingRiskLevel,
  FindingStatus,
} from "../types/audit.types";
import { SupabaseReportRepository } from "../repositories/SupabaseReportRepository";
import { supabase } from "../../../config/supabase";

const STORAGE_KEY = "leadgers_audit_report";
const LOCAL_SAVE_DEBOUNCE_MS = 800;
const REMOTE_SAVE_DEBOUNCE_MS = 3000;

// Parse a persisted report from localStorage defensively: corrupt JSON or any
// non-object payload (null, number, array) yields null instead of throwing or
// spreading a malformed shape into state.
function parseStoredReport(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    /* ignore corrupt data */
  }
  return null;
}

function createEmptyFinding(findingId: string = ""): ReportFinding {
  return {
    id: crypto.randomUUID(),
    finding_id: findingId,
    analysis: {
      what: "",
      why: "",
      where: "",
      when: "",
      who: "",
      how: "",
      howMuch: "",
    },
    code_snippet: "",
    task_type: "",
    risk_level: "medium" as FindingRiskLevel,
    status: "open" as FindingStatus,
    impacted_areas: [],
    evidence_links: [],
    evidence_image_url: undefined,
    notify_email: "",
    should_notify: false,
  };
}

function createEmptyReport(): AuditReport {
  return {
    id: crypto.randomUUID(),
    program_id: "",
    project_id: "",
    doc_id: "",
    client_name: "",
    project_name: "",
    environment: "",
    start_date: "",
    end_date: "",
    lead_auditor: "",
    executive_summary: "",
    final_opinion: "",
    findings: [createEmptyFinding()],
    signatures: [],
    status: "draft",
  };
}

// ─── Validation helpers ──────────────────────────────────

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateReport(report: AuditReport): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!report.client_name.trim()) errors.push("Empresa Cliente é obrigatório");
  if (!report.project_name.trim()) errors.push("Projeto/Módulo é obrigatório");
  if (!report.start_date) errors.push("Data Início é obrigatória");
  if (!report.end_date) errors.push("Data Fim é obrigatória");
  if (!report.lead_auditor.trim()) errors.push("Auditor Líder é obrigatório");
  if (!report.executive_summary.trim())
    warnings.push("Sumário Executivo está vazio");
  if (!report.final_opinion.trim()) warnings.push("Parecer Final está vazio");

  if (report.signatures.length === 0) {
    errors.push("Pelo menos uma assinatura é obrigatória para exportar");
  }

  const emptyFindings = report.findings.filter(
    (f) => !f.analysis.what.trim() && !f.analysis.how.trim(),
  );
  if (emptyFindings.length > 0) {
    warnings.push(`${emptyFindings.length} achado(s) com campos 5W2H vazios`);
  }

  const todayStr = new Date().toISOString().split("T")[0];
  if (report.end_date && report.end_date !== todayStr) {
    warnings.push(
      `Data Fim (${report.end_date}) difere da data de hoje (${todayStr})`,
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ─── Export: TXT ──────────────────────────────────────────

function generateTxt(report: AuditReport): string {
  let txt = `RELATÓRIO DE AUDITORIA - LEADGERS TECH\n\n`;
  txt += `DOCUMENTO: ${report.doc_id}\n`;
  txt += `CLIENTE: ${report.client_name}\n`;
  txt += `PROJETO: ${report.project_name}${report.project_id ? ` (ID: ${report.project_id})` : ""}\n`;
  txt += `AMBIENTE: ${report.environment}\n`;
  txt += `PERÍODO: ${report.start_date} a ${report.end_date}\n`;
  txt += `AUDITOR LÍDER: ${report.lead_auditor}\n\n`;
  txt += `=== SUMÁRIO EXECUTIVO ===\n${report.executive_summary}\n\n`;
  txt += `=== ACHADOS (5W2H) ===\n`;

  report.findings.forEach((f, i) => {
    txt += `\n--- Achado #${String(i + 1).padStart(2, "0")} ---\n`;
    txt += `O QUÊ: ${f.analysis.what}\n`;
    txt += `POR QUÊ: ${f.analysis.why}\n`;
    txt += `ONDE: ${f.analysis.where}\n`;
    txt += `QUANDO: ${f.analysis.when}\n`;
    txt += `QUEM: ${f.analysis.who}\n`;
    txt += `COMO: ${f.analysis.how}\n`;
    txt += `QUANTO: ${f.analysis.howMuch}\n`;
    txt += `RISCO: ${f.risk_level.toUpperCase()}\n`;
    txt += `STATUS: ${f.status}\n`;
    if (f.code_snippet) txt += `CÓDIGO:\n${f.code_snippet}\n`;
  });

  txt += `\n=== PARECER FINAL ===\n${report.final_opinion}\n\n`;
  txt += `=== ASSINATURAS ===\n`;
  report.signatures.forEach((s) => {
    txt += `${s.name} | ${s.role} | ${s.signed_at}\n`;
  });

  return txt;
}

// ─── Export: JSON ─────────────────────────────────────────

function generateJson(report: AuditReport): string {
  return JSON.stringify(report, null, 2);
}

// ─── Tenant ID helper ────────────────────────────────────

async function getCurrentTenantId(): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("tenant_members")
      .select("tenant_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    return data?.tenant_id ?? null;
  } catch {
    return null;
  }
}

// ─── Sync status ─────────────────────────────────────────

type SyncStatus = "idle" | "syncing" | "synced" | "offline" | "error";

// ─── Hook ────────────────────────────────────────────────

export function useReportGenerator() {
  const [report, setReport] = useState<AuditReport>(() => {
    const parsed = parseStoredReport(localStorage.getItem(STORAGE_KEY));
    if (parsed) {
      return {
        ...createEmptyReport(),
        ...parsed,
        findings: Array.isArray(parsed.findings)
          ? parsed.findings
          : [createEmptyFinding()],
        signatures: Array.isArray(parsed.signatures) ? parsed.signatures : [],
      } as AuditReport;
    }
    return createEmptyReport();
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const isFirstRender = useRef(true);
  const tenantIdRef = useRef<string | null>(null);
  const remoteSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Initial load: Try Supabase first, localStorage fallback ───
  useEffect(() => {
    let cancelled = false;

    async function loadFromRemote() {
      const tenantId = await getCurrentTenantId();
      if (cancelled || !tenantId) {
        setSyncStatus("offline");
        return;
      }
      tenantIdRef.current = tenantId;

      try {
        const remoteReport =
          await SupabaseReportRepository.getLatestByTenant(tenantId);

        if (cancelled) return;

        if (remoteReport) {
          // Remote data exists: check if local has newer unsaved data
          const localReport = parseStoredReport(
            localStorage.getItem(STORAGE_KEY),
          );
          if (localReport) {
            const localHasData =
              (localReport.client_name as string)?.trim() ||
              (localReport.findings as ReportFinding[])?.some((f) =>
                f.analysis?.what?.trim(),
              );

            // If local has meaningful data and different ID, auto-import it
            if (localHasData && localReport.id !== remoteReport.id) {
              // Import local data to remote as a new report
              const imported = {
                ...createEmptyReport(),
                ...localReport,
                id: crypto.randomUUID(),
              } as AuditReport;
              await SupabaseReportRepository.save(imported, tenantId);
              localStorage.removeItem(STORAGE_KEY);
            }
          }

          setReport(remoteReport);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteReport));
          setSyncStatus("synced");
        } else {
          // No remote data: check if we have local data to migrate
          const localReport = parseStoredReport(
            localStorage.getItem(STORAGE_KEY),
          );
          if (localReport) {
            const localHasData =
              (localReport.client_name as string)?.trim() ||
              (localReport.findings as ReportFinding[])?.some((f) =>
                f.analysis?.what?.trim(),
              );

            if (localHasData) {
              // Auto-migrate local data to Supabase
              const migrated = {
                ...createEmptyReport(),
                ...localReport,
                id: (localReport.id as string) || crypto.randomUUID(),
              } as AuditReport;
              const saved = await SupabaseReportRepository.save(
                migrated,
                tenantId,
              );
              setReport(saved);
              setSyncStatus("synced");
              return;
            }
          }
          setSyncStatus("synced");
        }
      } catch {
        // Network error → stay with localStorage data (offline mode)
        setSyncStatus("offline");
      }
    }

    loadFromRemote();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Auto-save: localStorage (fast, 800ms) ────────────────
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setUnsavedChanges(true);
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(report));
      setUnsavedChanges(false);
    }, LOCAL_SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [report]);

  // ─── Auto-save: Supabase (debounced, 3s) ──────────────────
  useEffect(() => {
    if (isFirstRender.current) return;

    if (remoteSaveTimerRef.current) {
      clearTimeout(remoteSaveTimerRef.current);
    }

    remoteSaveTimerRef.current = setTimeout(async () => {
      const tenantId = tenantIdRef.current;
      if (!tenantId) return;

      try {
        setSyncStatus("syncing");
        await SupabaseReportRepository.save(report, tenantId);
        setSyncStatus("synced");
      } catch {
        setSyncStatus("error");
      }
    }, REMOTE_SAVE_DEBOUNCE_MS);

    return () => {
      if (remoteSaveTimerRef.current) {
        clearTimeout(remoteSaveTimerRef.current);
      }
    };
  }, [report]);

  // Update a top-level field
  const updateField = useCallback(
    <K extends keyof AuditReport>(field: K, value: AuditReport[K]) => {
      setReport((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // Finding CRUD
  const addFinding = useCallback((findingId = "") => {
    setReport((prev) => ({
      ...prev,
      findings: [...prev.findings, createEmptyFinding(findingId)],
    }));
  }, []);

  const addBulkFindings = useCallback((count: number) => {
    setReport((prev) => {
      const newFindings = Array.from({ length: count }, () =>
        createEmptyFinding(),
      );
      return {
        ...prev,
        findings: [...prev.findings, ...newFindings],
      };
    });
  }, []);

  const updateFinding = useCallback(
    (id: string, updates: Partial<ReportFinding>) => {
      setReport((prev) => ({
        ...prev,
        findings: prev.findings.map((f) =>
          f.id === id ? { ...f, ...updates } : f,
        ),
      }));
    },
    [],
  );

  const updateFinding5W2H = useCallback(
    (findingId: string, field: keyof Finding5W2H, value: string) => {
      setReport((prev) => ({
        ...prev,
        findings: prev.findings.map((f) =>
          f.id === findingId
            ? { ...f, analysis: { ...f.analysis, [field]: value } }
            : f,
        ),
      }));
    },
    [],
  );

  const removeFinding = useCallback((id: string) => {
    setReport((prev) => ({
      ...prev,
      findings: prev.findings.filter((f) => f.id !== id),
    }));
  }, []);

  // Signatures
  const addSignature = useCallback((name: string, role: string) => {
    const sig: ReportSignature = {
      name,
      role,
      signed_at: new Date().toLocaleString("pt-BR"),
    };
    setReport((prev) => {
      const existing = prev.signatures.findIndex((s) => s.name === name);
      let sigs: ReportSignature[];
      if (existing >= 0) {
        sigs = [...prev.signatures];
        sigs[existing] = sig;
      } else {
        sigs = [...prev.signatures, sig];
      }
      return { ...prev, signatures: sigs, status: "signed" as const };
    });
  }, []);

  const removeSignature = useCallback((name: string) => {
    setReport((prev) => ({
      ...prev,
      signatures: prev.signatures.filter((s) => s.name !== name),
    }));
  }, []);

  // Validation
  const validate = useCallback((): ValidationResult => {
    return validateReport(report);
  }, [report]);

  // Export dispatcher
  const exportReport = useCallback(
    async (format: ExportFormat) => {
      const clientSlug = (report.client_name || "Cliente").replace(/\s+/g, "_");
      const dateStr = new Date().toISOString().split("T")[0];
      const baseName = `Auditoria_${clientSlug}_${dateStr}`;

      if (format === "txt") {
        const { saveAs } = await import("file-saver");
        const blob = new Blob([generateTxt(report)], {
          type: "text/plain;charset=utf-8",
        });
        saveAs(blob, `${baseName}.txt`);
      } else if (format === "json") {
        const { saveAs } = await import("file-saver");
        const blob = new Blob([generateJson(report)], {
          type: "application/json;charset=utf-8",
        });
        saveAs(blob, `${baseName}.json`);
      } else if (format === "pdf") {
        // PDF generation delegated to ReportPdfDocument component
        // The caller should use @react-pdf/renderer's pdf() function
        throw new Error("Use exportPdf() from the PDF component instead.");
      } else if (format === "docx") {
        // DOCX generation delegated to generateDocx utility
        throw new Error("Use exportDocx() from the DOCX utility instead.");
      }

      updateField("status", "exported");
    },
    [report, updateField],
  );

  // Reset
  const resetReport = useCallback(async () => {
    const fresh = createEmptyReport();
    setReport(fresh);
    localStorage.removeItem(STORAGE_KEY);
    setUnsavedChanges(false);

    // Also save the fresh report to Supabase (start a new report)
    const tenantId = tenantIdRef.current;
    if (tenantId) {
      try {
        await SupabaseReportRepository.save(fresh, tenantId);
        setSyncStatus("synced");
      } catch {
        setSyncStatus("offline");
      }
    }
  }, []);

  // Force sync to remote
  const forceSync = useCallback(async () => {
    const tenantId = tenantIdRef.current ?? (await getCurrentTenantId());
    if (!tenantId) {
      setSyncStatus("offline");
      return;
    }
    tenantIdRef.current = tenantId;

    try {
      setSyncStatus("syncing");
      await SupabaseReportRepository.save(report, tenantId);
      setSyncStatus("synced");
    } catch {
      setSyncStatus("error");
    }
  }, [report]);

  // Warn before closing with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = "Você tem alterações não salvas.";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [unsavedChanges]);

  return {
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
  };
}
