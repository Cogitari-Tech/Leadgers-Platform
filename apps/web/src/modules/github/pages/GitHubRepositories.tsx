import { useGitHub } from "../hooks/useGitHub";
import {
  GitBranch,
  ShieldCheck,
  ShieldX,
  Bug,
  RefreshCw,
  Lock,
  Unlock,
} from "lucide-react";

export default function GitHubRepositories() {
  const { repositories, loading, loadRepositories } = useGitHub();

  const scoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-500 bg-emerald-500/10";
    if (s >= 60) return "text-amber-500 bg-amber-500/10";
    return "text-red-500 bg-red-500/10";
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Repositórios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {repositories.length} repositórios monitorados
          </p>
        </div>
        <button
          onClick={loadRepositories}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Atualizar
        </button>
      </div>

      {repositories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="p-4 bg-muted/50 rounded-2xl">
            <GitBranch className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Nenhum repositório sincronizado
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {repositories.map((repo) => (
            <div
              key={repo.id}
              className="glass-panel rounded-2xl border-border/30 p-5 flex items-center gap-4 hover:border-primary/20 transition-colors"
            >
              {/* Health Score */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${scoreColor(repo.health_score)}`}
              >
                {repo.health_score}
              </div>

              {/* Repo Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm truncate">
                    {repo.full_name}
                  </h3>
                  {repo.is_private ? (
                    <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <Unlock className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {repo.description ?? "Sem descrição"}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                  {repo.language && <span>{repo.language}</span>}
                  <span>{repo.default_branch}</span>
                  {repo.last_push_at && (
                    <span>
                      Último push:{" "}
                      {new Date(repo.last_push_at).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {repo.has_branch_protection ? (
                  <div className="flex items-center gap-1 text-emerald-500">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:block">
                      Protegido
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-amber-500">
                    <ShieldX className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:block">
                      Sem Proteção
                    </span>
                  </div>
                )}

                {repo.open_vulnerabilities_count > 0 && (
                  <div className="flex items-center gap-1 text-red-500">
                    <Bug className="w-4 h-4" />
                    <span className="text-xs font-bold">
                      {repo.open_vulnerabilities_count}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
