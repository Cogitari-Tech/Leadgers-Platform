import { useState } from "react";
import { useGitHub } from "../hooks/useGitHub";
import {
  GitPullRequest,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Loader2,
} from "lucide-react";
import { useAudit } from "../../audit/hooks/useAudit";
import { Select, Button } from "@/shared/components/ui";

type Tab = "prs" | "issues";

export default function GitHubIssuesPRs() {
  const { pullRequests, issues, loading, linkPullRequestToFinding } =
    useGitHub();
  const { findings } = useAudit();

  const [activeTab, setActiveTab] = useState<Tab>("prs");
  const [filterState, setFilterState] = useState<string>("all");

  const [linkModalPrId, setLinkModalPrId] = useState<string | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState("");
  const [linking, setLinking] = useState(false);

  const handleLinkPR = async () => {
    if (!linkModalPrId || !selectedFindingId) return;
    setLinking(true);
    try {
      await linkPullRequestToFinding(linkModalPrId, selectedFindingId);
      setLinkModalPrId(null);
      setSelectedFindingId("");
    } catch (err) {
      console.error(err);
    } finally {
      setLinking(false);
    }
  };

  const filteredPRs =
    filterState === "all"
      ? pullRequests
      : pullRequests.filter((pr) => pr.state === filterState);

  const filteredIssues =
    filterState === "all"
      ? issues
      : issues.filter((i) => i.state === filterState);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Issues & PRs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Rastreamento de pull requests e issues
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border/20 pb-3">
        <button
          onClick={() => {
            setActiveTab("prs");
            setFilterState("all");
          }}
          className={`text-sm font-bold uppercase tracking-widest pb-2 border-b-2 transition-colors ${
            activeTab === "prs"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Pull Requests ({pullRequests.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("issues");
            setFilterState("all");
          }}
          className={`text-sm font-bold uppercase tracking-widest pb-2 border-b-2 transition-colors ${
            activeTab === "issues"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Issues ({issues.length})
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          className="text-xs bg-background border border-border/40 rounded-lg px-3 py-1.5 outline-none focus:border-primary"
        >
          <option value="all">Todos</option>
          <option value="open">Abertos</option>
          {activeTab === "prs" && <option value="merged">Mergiados</option>}
          <option value="closed">Fechados</option>
        </select>
      </div>

      {/* Pull Requests */}
      {activeTab === "prs" && (
        <div className="space-y-3">
          {filteredPRs.length === 0 ? (
            <EmptyState label="Nenhum pull request encontrado" />
          ) : (
            filteredPRs.map((pr) => (
              <div
                key={pr.id}
                className="glass-panel rounded-2xl border-border/30 p-5 space-y-3 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <PRStateIcon state={pr.state} />
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm leading-tight">
                        {pr.title}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        #{pr.github_pr_number} · {pr.author} · aberto em{" "}
                        {new Date(pr.opened_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {pr.linked_finding_id && (
                      <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest">
                        Vinculado
                      </span>
                    )}
                    {pr.review_count === 0 && pr.state === "merged" && (
                      <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        Sem Review
                      </span>
                    )}
                    {pr.merged_by_admin && (
                      <span className="text-[9px] font-bold bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        Admin Merge
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {pr.review_count} reviews
                  </span>
                  <span>
                    +{pr.additions} -{pr.deletions}
                  </span>
                  <span>{pr.files_changed} arquivos</span>
                  {pr.time_to_merge_hours && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {pr.time_to_merge_hours}h para merge
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground mt-4 pt-4 border-t border-border/10">
                  {!pr.linked_finding_id && (
                    <button
                      onClick={() => setLinkModalPrId(pr.id)}
                      className="flex items-center gap-1.5 hover:text-primary transition-colors hover:bg-primary/5 px-3 py-2 rounded-lg font-bold uppercase tracking-widest"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Vincular a Achado
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Issues */}
      {activeTab === "issues" && (
        <div className="space-y-3">
          {filteredIssues.length === 0 ? (
            <EmptyState label="Nenhuma issue encontrada" />
          ) : (
            filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="glass-panel rounded-2xl border-border/30 p-5 space-y-3 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <IssueStateIcon
                      state={issue.state}
                      breached={issue.sla_breached}
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm leading-tight">
                        {issue.title}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        #{issue.github_issue_number} · {issue.author} · aberta
                        em{" "}
                        {new Date(issue.opened_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {issue.sla_breached && (
                      <span className="text-[9px] font-bold bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        SLA Violado
                      </span>
                    )}
                    {issue.is_critical && (
                      <span className="text-[9px] font-bold bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        Crítica
                      </span>
                    )}
                    {issue.linked_finding_id && (
                      <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest">
                        Vinculada
                      </span>
                    )}
                  </div>
                </div>
                {issue.labels.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-2">
                    {issue.labels.map((label, i) => (
                      <span
                        key={i}
                        className="text-[9px] bg-foreground/5 text-muted-foreground px-2 py-0.5 rounded-full"
                      >
                        {String(label)}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground mt-4 pt-4 border-t border-border/10">
                  {issue.state === "open" ? (
                    <button className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors hover:bg-emerald-500/5 px-3 py-2 rounded-lg font-bold uppercase tracking-widest">
                      <CheckCircle className="w-3 h-3" />
                      Resolver via Plano de Ação
                    </button>
                  ) : null}
                  {!issue.linked_finding_id && (
                    <button className="flex items-center gap-1.5 hover:text-primary transition-colors hover:bg-primary/5 px-3 py-2 rounded-lg font-bold uppercase tracking-widest">
                      <AlertCircle className="w-3 h-3" />
                      Criar Achado
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Link PR Modal */}
      {linkModalPrId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-xl">
          <div className="glass-card rounded-3xl p-12 max-w-lg w-full shadow-2xl space-y-8 relative scale-up">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground font-display tracking-tight flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Vincular a Achado
              </h3>
              <p className="text-sm text-muted-foreground/60 font-medium">
                Selecione o achado de auditoria que motivou ou está resolvido
                por este Pull Request.
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">
                Achado de Auditoria
              </label>
              <Select
                value={selectedFindingId}
                onChange={(e) => setSelectedFindingId(e.target.value)}
                className="bg-foreground/5 border-white/5 rounded-2xl px-6 py-4 w-full"
              >
                <option value="">Selecione o achado...</option>
                {findings.map((f) => (
                  <option key={f.id} value={f.id}>
                    [{f.risk_level.toUpperCase()}] {f.title}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setLinkModalPrId(null);
                  setSelectedFindingId("");
                }}
                className="py-4 rounded-2xl bg-foreground/5 text-muted-foreground hover:bg-white hover:text-black font-bold uppercase tracking-widest text-[10px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleLinkPR}
                disabled={!selectedFindingId || linking}
                className="py-4 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-bold uppercase tracking-widest text-[10px] px-8 flex items-center gap-2"
              >
                {linking && <Loader2 className="w-4 h-4 animate-spin" />}
                {linking ? "Vinculando..." : "Confirmar Vínculo"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PRStateIcon({ state }: { state: string }) {
  if (state === "merged")
    return (
      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 flex-shrink-0">
        <GitPullRequest className="w-4 h-4" />
      </div>
    );
  if (state === "open")
    return (
      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 flex-shrink-0">
        <GitPullRequest className="w-4 h-4" />
      </div>
    );
  return (
    <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500 flex-shrink-0">
      <GitPullRequest className="w-4 h-4" />
    </div>
  );
}

function IssueStateIcon({
  state,
  breached,
}: {
  state: string;
  breached: boolean;
}) {
  if (breached)
    return (
      <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500 flex-shrink-0">
        <AlertCircle className="w-4 h-4" />
      </div>
    );
  if (state === "open")
    return (
      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 flex-shrink-0">
        <AlertCircle className="w-4 h-4" />
      </div>
    );
  return (
    <div className="p-1.5 rounded-lg bg-muted/50 text-muted-foreground flex-shrink-0">
      <CheckCircle className="w-4 h-4" />
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
