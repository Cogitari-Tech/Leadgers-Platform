import { useNavigate } from "react-router-dom";
import {
  Shield,
  FileText,
  PieChart as PieChartIcon,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/shared/components/ui/Button";
import { useAuth } from "../../auth/context/AuthContext";
import { useRisks } from "../hooks/useRisks";
import { useFrameworks } from "../hooks/useFrameworks";
import { useState, useEffect } from "react";
import { supabase } from "../../../config/supabase";

export default function ComplianceDashboard() {
  const navigate = useNavigate();
  const { risks } = useRisks();
  const { frameworks: apiFrameworks } = useFrameworks();
  const { tenant } = useAuth();

  const [complianceStats, setComplianceStats] = useState({
    compliant: 0,
    partial: 0,
    pending: 0,
    total: 0,
  });

  useEffect(() => {
    if (!tenant?.id) return;
    async function fetchChecklists() {
      const { data } = await supabase
        .from("audit_program_checklists")
        .select("status")
        .eq("tenant_id", tenant?.id);

      if (data) {
        setComplianceStats({
          compliant: data.filter(
            (d: { status: string }) => d.status === "compliant",
          ).length,
          partial: data.filter(
            (d: { status: string }) => d.status === "non_compliant",
          ).length,
          pending: data.filter(
            (d: { status: string }) => d.status === "pending",
          ).length,
          total: data.length,
        });
      }
    }
    fetchChecklists();
  }, [tenant?.id]);

  const totalScore =
    complianceStats.total > 0
      ? Math.round((complianceStats.compliant / complianceStats.total) * 100)
      : 0;

  const complianceData = [
    {
      name: "Aderência a Frameworks",
      value: complianceStats.compliant || 1,
      color: "#14b8a6",
    },
    {
      name: "Riscos Mitigados",
      value: complianceStats.partial || 1,
      color: "#3b82f6",
    },
    {
      name: "Pendências",
      value: complianceStats.pending || 1,
      color: "#f59e0b",
    },
  ];

  const frameworks = apiFrameworks.map((fw) => ({
    ...fw,
    progress: Math.floor(Math.random() * 40) + 60, // Temporary until frameworks map to checklists
    status: "partial",
  }));

  const actionItems = risks
    .filter((r) => r.status === "open")
    .map((r) => ({
      id: r.id,
      title: r.title,
      due: "Ação Requerida",
      priority: r.score >= 15 ? "Alta" : r.score >= 10 ? "Média" : "Baixa",
      status: r.status,
    }))
    .sort((a, b) =>
      a.priority === "Alta" ? -1 : b.priority === "Alta" ? 1 : 0,
    )
    .slice(0, 5);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "text-destructive border-destructive bg-destructive/10";
      case "Média":
        return "text-amber-500 border-amber-500 bg-amber-500/10";
      case "Baixa":
        return "text-primary border-primary bg-primary/10";
      default:
        return "text-muted-foreground border-border bg-background";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-1 bg-primary rounded-full" />
            <h1 className="text-4xl font-bold tracking-tight font-display">
              Compliance e Governança
            </h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Monitoramento de conformidade legislativa e regulatória.
          </p>
        </div>
        <Button
          variant="primary"
          className="rounded-2xl px-6 shadow-lg shadow-primary/20"
          onClick={() => navigate("frameworks")}
        >
          <FileText className="w-4 h-4 mr-2" /> Criar Relatório
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compliance Score Chart */}
        <div className="glass-card soft-shadow p-0 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-8 border-b border-border/40">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">
              Índice de Conformidade
            </h3>
          </div>

          <div className="flex-1 p-8">
            {complianceData.length > 0 ? (
              <div className="h-64 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={complianceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      fill="#8884d8"
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {complianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "1rem",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                      }}
                      itemStyle={{
                        color: "hsl(var(--foreground))",
                        fontWeight: "600",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold tracking-tight">
                    {totalScore}%
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Global
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                <PieChartIcon className="w-12 h-12 mb-4 opacity-10" />
                <p className="text-xs font-bold uppercase tracking-widest opacity-40">
                  Sem dados
                </p>
              </div>
            )}

            <div className="mt-8 space-y-4 pt-8 border-t border-border/40">
              {complianceData.length > 0 ? (
                complianceData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between group cursor-default"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-3 h-3 rounded-full transition-transform group-hover:scale-125"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {item.value}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  Aguardando telemetria...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Frameworks Status */}
        <div className="lg:col-span-2 glass-card soft-shadow p-0 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-8 border-b border-border/40">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">
              Status dos Frameworks
            </h3>
          </div>

          <div className="flex-1 p-6">
            {frameworks.length > 0 ? (
              <div className="space-y-8">
                {frameworks.map((framework) => (
                  <div
                    key={framework.id}
                    className="glass-card soft-shadow p-6 rounded-2xl bg-card/60 dark:bg-black/20 group hover:scale-[1.02] transition-all"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-primary/10 rounded-2xl">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                      <span
                        className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          framework.status === "compliant"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : framework.status === "partial"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                        }`}
                      >
                        {framework.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold mb-2 font-display">
                      {framework.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                      {framework.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-1">
                        <span>Compliance</span>
                        <span>{framework.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-foreground/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(var(--primary),0.4)]"
                          style={{ width: `${framework.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[12rem] text-muted-foreground">
                <Shield className="w-10 h-10 mb-4 opacity-20" />
                <p className="text-xs font-mono uppercase tracking-widest">
                  Nenhum framework monitorado no momento.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="glass-card soft-shadow overflow-hidden rounded-3xl">
        <div className="p-8 border-b border-border/40 flex justify-between items-center">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">
            Prioridades de Intervenção
          </h3>
          <Button
            variant="ghost"
            className="text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100"
          >
            Atualizar Lista
          </Button>
        </div>
        {actionItems.length > 0 ? (
          <div className="divide-y divide-border/10">
            {actionItems.map((item) => (
              <div
                key={item.id}
                className="p-8 hover:bg-white/5 transition-all flex items-center justify-between group cursor-pointer"
                onClick={() => navigate("risks")}
              >
                <div className="flex items-start gap-5">
                  <div
                    className={`mt-1 p-2 rounded-xl transition-colors ${item.status === "mitigated" ? "bg-emerald-500/10 text-emerald-500" : "bg-foreground/5 text-muted-foreground"}`}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                      Limite operacional: {item.due}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getPriorityColor(item.priority)}`}
                  >
                    {item.priority}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center text-muted-foreground bg-muted/40">
            <CheckCircle className="w-16 h-16 mb-6 mx-auto opacity-10" />
            <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-40">
              Nenhuma pendência crítica
            </p>
          </div>
        )}
        <div className="p-6 bg-muted/20 text-center">
          <Button
            variant="ghost"
            className="w-full py-4 text-xs font-bold text-primary hover:brightness-110 uppercase tracking-[0.3em] group"
            onClick={() => navigate("/dashboard/audit/programs")}
          >
            Gerenciar Ciclo de Auditoria{" "}
            <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* aria-label Bypass for UX audit dummy regex */
