// apps/web/src/modules/audit/repositories/SupabaseReportRepository.ts

import { supabase } from "../../../config/supabase";
import type { AuditReport, ReportStatus } from "../types/audit.types";

/**
 * Adapter: Supabase persistence for Audit Reports (5W2H).
 *
 * Bridges the gap between the frontend AuditReport type
 * (with JSONB findings/signatures) and the audit_reports table.
 */

interface AuditReportRow {
  id: string;
  tenant_id: string;
  program_id: string | null;
  project_id: string | null;
  doc_id: string;
  client_name: string;
  project_name: string;
  environment: string;
  lead_auditor: string;
  start_date: string | null;
  end_date: string | null;
  executive_summary: string;
  final_opinion: string;
  findings: unknown;
  signatures: unknown;
  status: ReportStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

function rowToReport(row: AuditReportRow): AuditReport {
  return {
    id: row.id,
    program_id: row.program_id ?? "",
    project_id: row.project_id ?? "",
    doc_id: row.doc_id,
    client_name: row.client_name,
    project_name: row.project_name,
    environment: row.environment,
    lead_auditor: row.lead_auditor,
    start_date: row.start_date ?? "",
    end_date: row.end_date ?? "",
    executive_summary: row.executive_summary,
    final_opinion: row.final_opinion,
    findings: Array.isArray(row.findings) ? row.findings : [],
    signatures: Array.isArray(row.signatures) ? row.signatures : [],
    status: row.status,
  };
}

function reportToRow(
  report: AuditReport,
  tenantId: string,
): Omit<AuditReportRow, "created_by" | "created_at" | "updated_at"> {
  return {
    id: report.id ?? crypto.randomUUID(),
    tenant_id: tenantId,
    program_id: report.program_id || null,
    project_id: report.project_id || null,
    doc_id: report.doc_id,
    client_name: report.client_name,
    project_name: report.project_name,
    environment: report.environment,
    lead_auditor: report.lead_auditor,
    start_date: report.start_date || null,
    end_date: report.end_date || null,
    executive_summary: report.executive_summary,
    final_opinion: report.final_opinion,
    findings: report.findings,
    signatures: report.signatures,
    status: report.status,
  };
}

export const SupabaseReportRepository = {
  async save(report: AuditReport, tenantId: string): Promise<AuditReport> {
    const row = reportToRow(report, tenantId);

    const { data, error } = await supabase
      .from("audit_reports")
      .upsert(row, { onConflict: "id" })
      .select()
      .single();

    if (error) throw new Error(`Failed to save report: ${error.message}`);
    return rowToReport(data as AuditReportRow);
  },

  async getById(id: string): Promise<AuditReport | null> {
    const { data, error } = await supabase
      .from("audit_reports")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to get report: ${error.message}`);
    }
    return rowToReport(data as AuditReportRow);
  },

  async listByTenant(tenantId: string): Promise<AuditReport[]> {
    const { data, error } = await supabase
      .from("audit_reports")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("updated_at", { ascending: false });

    if (error) throw new Error(`Failed to list reports: ${error.message}`);
    return (data ?? []).map((row) => rowToReport(row as AuditReportRow));
  },

  async getLatestByTenant(tenantId: string): Promise<AuditReport | null> {
    const { data, error } = await supabase
      .from("audit_reports")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(`Failed to get latest report: ${error.message}`);
    if (!data) return null;
    return rowToReport(data as AuditReportRow);
  },

  async deleteById(id: string): Promise<void> {
    const { error } = await supabase
      .from("audit_reports")
      .delete()
      .eq("id", id);

    if (error) throw new Error(`Failed to delete report: ${error.message}`);
  },
};
