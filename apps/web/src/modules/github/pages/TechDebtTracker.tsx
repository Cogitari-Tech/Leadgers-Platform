import { useTechDebt } from "../hooks/useTechDebt";
import {
  ShieldAlert,
  GitPullRequest,
  Clock,
  AlertTriangle,
  ListTodo,
  Server,
} from "lucide-react";

export default function TechDebtTracker() {
  const { data, loading, error, refresh } = useTechDebt();

  if (loading && !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center text-destructive">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <p className="font-bold">Falha ao carregar dados do Tech Debt</p>
        <p className="text-sm mt-2 opacity-80">{error}</p>
        <button
          onClick={refresh}
          className="mt-4 px-4 py-2 border rounded-xl hover:bg-muted"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <Server className="w-8 h-8 text-primary" />
            Tech Debt Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1 uppercase tracking-widest font-bold opacity-60">
            Acompanhe a saúde técnica, vulnerabilidades de segurança e acúmulo
            de trabalho de desenvolvimento.
          </p>
        </div>
      </div>

      {/* Hero Debt Score */}
      <div className="glass-panel p-8 rounded-3xl border-border/30 flex items-center gap-10">
        <div className="relative">
          <div
            className={`w-32 h-32 rounded-full border-8 flex flex-col items-center justify-center ${
              data.healthScore >= 80
                ? "border-emerald-500 text-emerald-500"
                : data.healthScore >= 50
                  ? "border-amber-500 text-amber-500"
                  : "border-red-500 text-red-500"
            }`}
          >
            <span className="text-4xl font-black leading-none">
              {data.healthScore}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Score
            </span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <h2 className="text-2xl font-black tracking-tight">
            Tech Debt Health Score
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg">
            Esta pontuação consolida vulnerabilidades críticas (deduz pontos
            altos), PRs antigos sem code review e issues atrasadas muito além do
            prazo. Mantenha acima de 80 para um crescimento sustentável.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-3xl border-border/30 flex items-center gap-4 hover:border-red-500/30 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Alertas de Segurança
            </p>
            <p className="text-3xl font-black text-foreground">
              {data.totals.securityAlerts}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl border-border/30 flex items-center gap-4 hover:border-amber-500/30 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Issues Entupidas {">"}30d
            </p>
            <p className="text-3xl font-black text-foreground">
              {data.totals.staleIssues}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl border-border/30 flex items-center gap-4 hover:border-blue-500/30 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <GitPullRequest className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              PRs Sem Revisão
            </p>
            <p className="text-3xl font-black text-foreground">
              {data.totals.unreviewedPrs}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <ListTodo className="w-5 h-5" /> Backlog de Dívida Técnica
        </h3>

        {data.items.length === 0 ? (
          <div className="glass-panel p-10 text-center rounded-3xl border-border/30 flex flex-col items-center gap-3">
            <ShieldAlert className="w-12 h-12 text-emerald-500 opacity-20" />
            <p className="font-bold text-muted-foreground">
              Nenhuma dívida crítica encontrada! Parabéns.
            </p>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl border-border/30 overflow-hidden">
            <div className="divide-y divide-border/20">
              {data.items.map((item) => (
                <div
                  key={item.id}
                  className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors gap-4"
                >
                  <div className="flex-1 min-w-0 flex items-center gap-4">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        item.severity === "critical"
                          ? "bg-red-600"
                          : item.severity === "high"
                            ? "bg-red-400"
                            : item.severity === "medium"
                              ? "bg-amber-400"
                              : "bg-blue-400"
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-muted px-2 py-0.5 rounded-md text-muted-foreground">
                          {item.repo || "Desconhecido"}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {item.type === "vulnerability"
                            ? "Vulnerabilidade"
                            : item.type === "stale_issue"
                              ? "Issue Entupida"
                              : "PR sem Code Review"}
                        </span>
                      </div>
                      <p className="font-bold text-sm text-foreground truncate mt-1">
                        {item.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">
                      Idade
                    </p>
                    <p className="text-sm font-bold text-foreground flex items-center gap-1.5 justify-end">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {item.age_days} dias
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
