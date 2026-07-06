import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { supabase } from "../../../config/supabase";

interface AuditVersionWithProgram {
  id: string;
  audit_id: string;
  version_number: number;
  pdf_path: string | null;
  doc_hash: string;
  approved_by: string;
  approved_at: string;
  program: {
    id: string;
    name: string;
    doc_id?: string;
  };
}

export default function AuditReports() {
  const [reports, setReports] = useState<AuditVersionWithProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadReports = async () => {
    setLoading(true);
    try {
      // Assuming audit_versions joins with audit_programs mapping
      const { data, error } = await supabase
        .from("audit_versions")
        .select(
          `
          *,
          program:audit_programs(id, name)
        `,
        )
        .order("approved_at", { ascending: false });

      if (error) throw error;
      setReports((data as unknown as AuditVersionWithProgram[]) ?? []);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("audit-reports")
        .download(filePath);

      if (error) throw error;

      // Create a download link for the blob
      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading PDF", err);
      alert("Erro ao baixar o PDF. Arquivo pode não estar disponível.");
    }
  };

  const filteredReports = reports.filter((r) =>
    (r.program?.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-10 pb-20 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">
                Relatórios Gerenciais
              </h1>
              <p className="text-muted-foreground font-medium text-sm mt-1">
                Acesse e baixe os relatórios certificados e emitidos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-card p-4 rounded-3xl bg-card/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96 group">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar por nome do programa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-muted/50 border-border rounded-xl text-sm font-medium focus:bg-muted transition-colors"
          />
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto opacity-50" />
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="py-24 text-center glass-card border-white/5 rounded-3xl">
          <div className="w-16 h-16 rounded-3xl bg-foreground/5 flex items-center justify-center mx-auto mb-6 shadow-sm border border-white/5">
            <FileText className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Nenhum Relatório Encontrado
          </h3>
          <p className="text-muted-foreground/60 text-sm font-medium">
            Relatórios aprovados aparecerão aqui após a certificação da
            auditoria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="glass-card soft-shadow p-6 rounded-2xl dark:bg-black/20 border-white/5 hover:bg-white/10 transition-all group scale-up flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-foreground/5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    Versão {report.version_number}
                  </span>
                </div>
              </div>

              <div className="flex-1 mb-6">
                <h3 className="text-lg font-bold text-foreground leading-tight tracking-tight mb-2 line-clamp-2">
                  {report.program?.name || "Programa não identificado"}
                </h3>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/60">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(report.approved_at).toLocaleDateString("pt-BR")}
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-muted-foreground/40 font-mono break-all hidden sm:block">
                  Hash: {report.doc_hash}
                </div>
              </div>

              <div>
                <Button
                  variant="primary"
                  className="w-full py-3 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 font-bold"
                  disabled={!report.pdf_path}
                  onClick={() =>
                    report.pdf_path &&
                    handleDownload(
                      report.pdf_path,
                      `Auditoria_v${report.version_number}_${
                        new Date(report.approved_at).toISOString().split("T")[0]
                      }.pdf`,
                    )
                  }
                >
                  <Download className="w-4 h-4" />
                  {report.pdf_path ? "Baixar PDF" : "PDF Indisponível"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
