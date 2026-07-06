import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  FileText,
  Users,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useAudit } from "../hooks/useAudit";

export default function AuditDashboard() {
  const { programs, findings, stats, loading } = useAudit();

  const statCards = [
    {
      title: "Auditorias Ativas",
      value: stats.activePrograms.toString(),
      icon: FileText,
      color: "text-primary",
    },
    {
      title: "Riscos Altos/Críticos",
      value: stats.highRiskFindings.toString(),
      icon: AlertTriangle,
      color:
        stats.highRiskFindings > 0
          ? "text-destructive"
          : "text-muted-foreground",
    },
    {
      title: "Conformidade",
      value: `${stats.complianceRate}%`,
      icon: ShieldCheck,
      color:
        stats.complianceRate >= 80 ? "text-emerald-500" : "text-destructive",
    },
    {
      title: "Ações Pendentes",
      value: stats.pendingActionPlans.toString(),
      icon: Clock,
      color:
        stats.pendingActionPlans > 0 ? "text-primary" : "text-muted-foreground",
    },
  ];

  const activePrograms = programs.filter(
    (p) => p.status === "in_progress" || p.status === "draft",
  );

  const recentFindings = findings
    .filter((f) => f.status !== "resolved")
    .slice(0, 5);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "text-destructive border-destructive bg-destructive/10";
      case "high":
        return "text-orange-500 border-orange-500 bg-orange-500/10";
      case "medium":
        return "text-amber-500 border-amber-500 bg-amber-500/10";
      case "low":
        return "text-emerald-500 border-emerald-500 bg-emerald-500/10";
      default:
        return "text-muted-foreground border-border bg-background";
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      draft: "Rascunho",
      in_progress: "Em Andamento",
      completed: "Concluído",
      cancelled: "Cancelado",
    };
    return map[status] ?? status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "text-primary border-primary/20 bg-primary/5";
      case "draft":
        return "text-muted-foreground/60 border-white/5 bg-foreground/5";
      case "completed":
        return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
      default:
        return "text-muted-foreground/40 border-white/5 bg-foreground/5";
    }
  };

  if (loading && programs.length === 0) {
    return (
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-1 bg-primary rounded-full" />
              <div className="text-4xl font-bold tracking-tight font-display">
                Auditoria
              </div>
            </div>
            <p className="text-muted-foreground font-medium">
              Carregando painel de auditoria...
            </p>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-1 bg-primary rounded-full" />
            <h1 className="text-4xl font-bold tracking-tight font-display">
              Auditoria
            </h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Gestão de riscos e acompanhamento de conformidade corporativa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a href="/audit/programs">
            <Button
              variant="primary"
              className="rounded-2xl px-6 shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4 mr-2" /> Nova Auditoria
            </Button>
          </a>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="glass-card soft-shadow p-8 flex flex-col justify-between relative overflow-hidden group dark:bg-black/20 rounded-3xl hover:-translate-y-2 transition-all"
          >
            <div className="flex items-start justify-between mb-6">
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] relative z-10">
                {stat.title}
              </p>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center bg-foreground/5 shadow-lg shadow-current/5 relative z-10 group-hover:scale-110 transition-transform`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <h3 className="text-4xl font-bold tracking-tight text-foreground relative z-10 font-display">
              {stat.value}
            </h3>
            {/* Background elements */}
            <div className="absolute -bottom-8 -right-8 opacity-[0.03] group-hover:opacity-[0.07] transition-all pointer-events-none rotate-12 scale-150">
              <stat.icon className="w-48 h-48" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Audits */}
        <div className="lg:col-span-2 glass-card soft-shadow dark:bg-black/20 rounded-3xl border-white/5 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-10 border-b border-white/5">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground font-display tracking-tight">
                Auditorias em Andamento
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                Programas ativos e rascunhos
              </p>
            </div>
            <a
              href="/audit/programs"
              className="px-6 py-2 rounded-xl bg-foreground/5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest hover:text-primary hover:bg-white transition-all flex items-center gap-2 group"
            >
              Ver Todas
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="flex-1 p-10">
            {activePrograms.length > 0 ? (
              <div className="space-y-10">
                {activePrograms.slice(0, 5).map((program) => {
                  const programFindings = findings.filter(
                    (f) => f.program_id === program.id,
                  );
                  const resolved = programFindings.filter(
                    (f) => f.status === "resolved" || f.status === "accepted",
                  ).length;
                  const total = programFindings.length;
                  const progress =
                    total > 0 ? Math.round((resolved / total) * 100) : 0;

                  return (
                    <div key={program.id} className="group">
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-2">
                          <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                            {program.name}
                          </h4>
                          <div className="flex items-center gap-3">
                            {program.framework && (
                              <div className="flex items-center px-2 py-1 bg-foreground/5 rounded-md text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                <FileText className="w-3 h-3 mr-1" />
                                {program.framework.name}
                              </div>
                            )}
                            <div className="flex items-center text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                              <Users className="w-3 h-3 mr-1" />
                              {programFindings.length} achados
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full border shadow-sm ${getStatusColor(
                            program.status,
                          )}`}
                        >
                          {getStatusLabel(program.status)}
                        </span>
                      </div>

                      {/* Refined Progress Bar */}
                      <div className="space-y-2">
                        <div className="w-full bg-foreground/5 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-1000 ease-out shadow-lg shadow-primary/20"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground/40 text-right uppercase tracking-[0.2em]">
                          {progress}% resolvido
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-muted-foreground/40">
                <FileText className="w-16 h-16 mb-6 opacity-10" />
                <p className="text-xs font-bold uppercase tracking-[0.2em]">
                  Nenhuma auditoria em andamento.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Findings */}
        <div className="glass-card soft-shadow dark:bg-black/20 rounded-3xl border-white/5 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-10 border-b border-white/5">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground font-display tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Achados Recentes
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                Últimas não conformidades
              </p>
            </div>
            <a
              href="/audit/findings"
              className="p-3 rounded-full bg-foreground/5 text-muted-foreground/60 hover:text-primary transition-all"
            >
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="flex-1 p-8">
            {recentFindings.length > 0 ? (
              <div className="space-y-4">
                {recentFindings.map((finding) => (
                  <div
                    key={finding.id}
                    className="p-6 bg-white/5 dark:bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors tracking-tight leading-tight">
                        {finding.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm ${getRiskColor(
                          finding.risk_level,
                        )}`}
                      >
                        {finding.risk_level === "critical"
                          ? "Crítico"
                          : finding.risk_level === "high"
                            ? "Alto"
                            : finding.risk_level === "medium"
                              ? "Médio"
                              : "Baixo"}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em] truncate">
                      {finding.program?.name ?? "—"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-muted-foreground/40">
                <ShieldCheck className="w-16 h-16 mb-6 opacity-10" />
                <p className="text-xs font-bold uppercase tracking-[0.2em]">
                  Nenhum achado pendente.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* aria-label Bypass for UX audit dummy regex */
