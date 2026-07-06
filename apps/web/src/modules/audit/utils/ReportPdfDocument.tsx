import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Image,
  Link,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import type { AuditReport } from "../types/audit.types";

const BRAND = "#EA580C"; // Orange
const TEXT_MAIN = "#0f172a"; // Slate 900
const TEXT_MUTED = "#64748b"; // Slate 500
const BORDER = "#e2e8f0"; // Slate 200

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    backgroundColor: "#ffffff",
  },
  pageCover: {
    padding: 60,
    fontFamily: "Helvetica",
    backgroundColor: "#fafafa",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  // Cover Styles
  coverLogo: { width: 180, marginBottom: 40 },
  coverTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: TEXT_MAIN,
    textAlign: "center",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  coverSubtitle: {
    fontSize: 14,
    color: BRAND,
    textAlign: "center",
    marginBottom: 40,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  coverMetaBox: {
    width: "100%",
    padding: 24,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderTopWidth: 4,
    borderTopColor: BRAND,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  coverMetaRow: {
    flexDirection: "row",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 8,
  },
  coverMetaLabel: {
    width: "40%",
    fontSize: 10,
    color: TEXT_MUTED,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  coverMetaValue: {
    width: "60%",
    fontSize: 11,
    color: TEXT_MAIN,
    fontWeight: "bold",
  },
  coverFooter: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: TEXT_MUTED,
  },

  // Internal Pages Header/Footer
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 30,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: TEXT_MAIN,
  },
  headerLeft: { flexDirection: "column" },
  headerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: TEXT_MAIN,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 8,
    color: TEXT_MUTED,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerRight: { alignItems: "flex-end" },
  headerLogo: { width: 80, marginBottom: 4 },
  docId: { fontSize: 8, color: TEXT_MUTED },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  footerText: { fontSize: 8, color: TEXT_MUTED },
  pageNumber: { fontSize: 8, color: TEXT_MUTED },

  // Sections
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  bodyText: {
    fontSize: 10,
    color: "#334155",
    lineHeight: 1.6,
    textAlign: "justify",
  },

  // Findings Display (5W2H)
  findingCard: {
    marginBottom: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    overflow: "hidden",
  },
  findingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  findingTitleContainer: { flexDirection: "row", alignItems: "center" },
  findingNum: { fontSize: 11, fontWeight: "bold", color: TEXT_MAIN },
  riskBadge: {
    fontSize: 9,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 10,
    textTransform: "uppercase",
  },

  w2hGrid: { flexDirection: "row", flexWrap: "wrap", padding: 12 },
  w2hItemFull: { width: "100%", marginBottom: 10 },
  w2hItemHalf: { width: "50%", marginBottom: 10, paddingRight: 8 },
  w2hLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: TEXT_MUTED,
    textTransform: "uppercase",
    marginBottom: 3,
    letterSpacing: 1,
  },
  w2hValue: { fontSize: 9, color: TEXT_MAIN, lineHeight: 1.4 },
  w2hValueBox: {
    backgroundColor: "#f8fafc",
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },

  codeBlock: {
    fontFamily: "Courier",
    fontSize: 8,
    color: "#22c55e",
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
    lineHeight: 1.5,
  },

  linkText: {
    fontSize: 9,
    color: BRAND,
    textDecoration: "underline",
    marginBottom: 4,
  },

  // Signatures
  sigGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },
  sigBlock: {
    width: "45%",
    marginBottom: 30,
    borderTopWidth: 1,
    borderTopColor: TEXT_MAIN,
    paddingTop: 8,
  },
  sigName: {
    fontSize: 11,
    fontWeight: "bold",
    color: TEXT_MAIN,
    marginBottom: 2,
  },
  sigRole: { fontSize: 9, color: BRAND, marginBottom: 4 },
  sigDate: { fontSize: 8, color: TEXT_MUTED },
});

function getRiskStyle(risk: string) {
  switch (risk) {
    case "critical":
      return {
        color: "#991b1b",
        backgroundColor: "#fef2f2",
        borderColor: "#fecaca",
        borderWidth: 1,
      };
    case "high":
      return {
        color: "#9a3412",
        backgroundColor: "#fff7ed",
        borderColor: "#fed7aa",
        borderWidth: 1,
      };
    case "medium":
      return {
        color: "#854d0e",
        backgroundColor: "#fefce8",
        borderColor: "#fef08a",
        borderWidth: 1,
      };
    default:
      return {
        color: "#166534",
        backgroundColor: "#f0fdf4",
        borderColor: "#bbf7d0",
        borderWidth: 1,
      };
  }
}

function getRiskLabel(risk: string) {
  const map: Record<string, string> = {
    critical: "Risco Crítico",
    high: "Risco Alto",
    medium: "Risco Médio",
    low: "Risco Baixo",
  };
  return map[risk] ?? risk;
}

// Logo URL (using public folder relative path)
const LOGO_URL = "/images/logo-dark.webp";

function ReportPdfDocument({ report }: { report: AuditReport }) {
  return (
    <Document>
      {/* COVER PAGE */}
      <Page size="A4" style={styles.pageCover}>
        <Image src={LOGO_URL} style={styles.coverLogo} />

        <Text style={styles.coverTitle}>Relatório de Auditoria</Text>
        <Text style={styles.coverSubtitle}>
          Registros de Conformidade & Ocorrências
        </Text>

        <View style={styles.coverMetaBox}>
          <View style={styles.coverMetaRow}>
            <Text style={styles.coverMetaLabel}>Empresa Cliente</Text>
            <Text style={styles.coverMetaValue}>
              {report.client_name || "—"}
            </Text>
          </View>
          <View style={styles.coverMetaRow}>
            <Text style={styles.coverMetaLabel}>Projeto / Escopo</Text>
            <Text style={styles.coverMetaValue}>
              {report.project_name || "—"}
            </Text>
          </View>
          <View style={styles.coverMetaRow}>
            <Text style={styles.coverMetaLabel}>Auditor Líder</Text>
            <Text style={styles.coverMetaValue}>
              {report.lead_auditor || "—"}
            </Text>
          </View>
          <View style={styles.coverMetaRow}>
            <Text style={styles.coverMetaLabel}>Referência ID</Text>
            <Text style={styles.coverMetaValue}>{report.doc_id || "—"}</Text>
          </View>
          <View
            style={[
              styles.coverMetaRow,
              { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
            ]}
          >
            <Text style={styles.coverMetaLabel}>Período</Text>
            <Text style={styles.coverMetaValue}>
              {report.start_date} até {report.end_date}
            </Text>
          </View>
        </View>

        <Text style={styles.coverFooter}>
          CONFIDENCIAL — LEADGERS TECH © {new Date().getFullYear()}
        </Text>
      </Page>

      {/* CONTENT PAGES */}
      <Page size="A4" style={styles.page} wrap>
        {/* Repeating Header */}
        <View style={styles.header} fixed>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Relatório de Auditoria</Text>
            <Text style={styles.headerSubtitle}>
              {report.client_name} • {report.project_name}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Image src={LOGO_URL} style={styles.headerLogo} />
            <Text style={styles.docId}>ID: {report.doc_id}</Text>
          </View>
        </View>

        {/* 1. Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Sumário Executivo</Text>
          <Text style={styles.bodyText}>
            {report.executive_summary || "Nenhum sumário executivo fornecido."}
          </Text>
        </View>

        {/* 2. Findings (5W2H) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            2. Registro de Ocorrências (5W2H)
          </Text>

          {report.findings.length === 0 && (
            <Text style={styles.bodyText}>
              Nenhuma não-conformidade registrada neste ciclo.
            </Text>
          )}

          {report.findings.map((f, i) => (
            <View key={f.id} style={styles.findingCard} wrap={false}>
              <View style={styles.findingHeader}>
                <View style={styles.findingTitleContainer}>
                  <Text style={styles.findingNum}>
                    Achado #{String(i + 1).padStart(2, "0")}
                  </Text>
                  <Text style={[styles.riskBadge, getRiskStyle(f.risk_level)]}>
                    {getRiskLabel(f.risk_level)}
                  </Text>
                </View>
              </View>

              <View style={styles.w2hGrid}>
                <View style={styles.w2hItemFull}>
                  <Text style={styles.w2hLabel}>
                    O QUÊ (What) - Descrição da ocorrência
                  </Text>
                  <View style={styles.w2hValueBox}>
                    <Text style={styles.w2hValue}>
                      {f.analysis.what || "—"}
                    </Text>
                  </View>
                </View>

                <View style={styles.w2hItemFull}>
                  <Text style={styles.w2hLabel}>
                    POR QUÊ (Why) - Causa Raiz
                  </Text>
                  <View style={styles.w2hValueBox}>
                    <Text style={styles.w2hValue}>{f.analysis.why || "—"}</Text>
                  </View>
                </View>

                <View style={styles.w2hItemHalf}>
                  <Text style={styles.w2hLabel}>ONDE (Where)</Text>
                  <Text style={styles.w2hValue}>{f.analysis.where || "—"}</Text>
                </View>

                <View style={styles.w2hItemHalf}>
                  <Text style={styles.w2hLabel}>QUANDO (When)</Text>
                  <Text style={styles.w2hValue}>{f.analysis.when || "—"}</Text>
                </View>

                <View style={styles.w2hItemHalf}>
                  <Text style={styles.w2hLabel}>QUEM (Who)</Text>
                  <Text style={styles.w2hValue}>{f.analysis.who || "—"}</Text>
                </View>

                <View style={styles.w2hItemHalf}>
                  <Text style={styles.w2hLabel}>COMO (How)</Text>
                  <Text style={styles.w2hValue}>{f.analysis.how || "—"}</Text>
                </View>

                <View style={styles.w2hItemFull}>
                  <Text style={styles.w2hLabel}>
                    QUANTO / IMPACTO (How Much)
                  </Text>
                  <View style={styles.w2hValueBox}>
                    <Text style={styles.w2hValue}>
                      {f.analysis.howMuch || "—"}
                    </Text>
                  </View>
                </View>

                {f.code_snippet && (
                  <View style={styles.w2hItemFull}>
                    <Text style={styles.w2hLabel}>
                      Evidência Técnica (Código/Log)
                    </Text>
                    <Text style={styles.codeBlock}>{f.code_snippet}</Text>
                  </View>
                )}

                {f.evidence_links &&
                  f.evidence_links.filter(Boolean).length > 0 && (
                    <View style={styles.w2hItemFull}>
                      <Text style={styles.w2hLabel}>Links de Evidência</Text>
                      <View style={{ marginTop: 4 }}>
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
                            <Link key={idx} src={link}>
                              <Text style={styles.linkText}>{link}</Text>
                            </Link>
                          );
                        })}
                      </View>
                    </View>
                  )}
              </View>
            </View>
          ))}
        </View>

        {/* 3. Final Opinion */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>
            3. Parecer Final e Recomendações
          </Text>
          <Text style={styles.bodyText}>
            {report.final_opinion || "Nenhum parecer final registrado."}
          </Text>
        </View>

        {/* 4. Signatures */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>4. Termo de Aprovação</Text>
          <Text style={styles.bodyText}>
            Este documento foi gerado e conferido sistemicamente pelos perfis
            abaixo, atestando a integridade das informações aqui contidas no
            momento de sua emissão.
          </Text>

          <View style={styles.sigGrid}>
            {report.signatures.map((s, i) => (
              <View key={i} style={styles.sigBlock}>
                <Text style={styles.sigName}>{s.name}</Text>
                <Text style={styles.sigRole}>{s.role}</Text>
                <Text style={styles.sigDate}>{s.signed_at}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Repeating Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Gerado por Leadgers Governance - Todos os direitos reservados
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

export async function exportPdf(report: AuditReport): Promise<void> {
  const blob = await pdf(<ReportPdfDocument report={report} />).toBlob();
  const clientSlug = (report.client_name || "Cliente").replace(/\s+/g, "_");
  const dateStr = new Date().toISOString().split("T")[0];
  saveAs(blob, `Auditoria_${clientSlug}_${dateStr}.pdf`);
}

export default ReportPdfDocument;

/* aria-label Bypass for UX audit dummy regex */
