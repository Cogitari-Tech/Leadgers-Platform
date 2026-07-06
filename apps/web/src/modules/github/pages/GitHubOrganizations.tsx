import { useGitHub } from "../hooks/useGitHub";
import { Building2, RefreshCw, CheckCircle, XCircle } from "lucide-react";

export default function GitHubOrganizations() {
  const { organizations, installations, loading, loadOrganizations } =
    useGitHub();

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
          <h1 className="text-2xl font-bold tracking-tight">Organizações</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organizações GitHub conectadas à plataforma
          </p>
        </div>
        <button
          onClick={loadOrganizations}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sincronizar
        </button>
      </div>

      {organizations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="p-4 bg-muted/50 rounded-2xl">
            <Building2 className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Nenhuma organização conectada
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => {
            const install = installations.find(
              (i) => i.id === org.installation_id,
            );
            return (
              <div
                key={org.id}
                className="glass-panel rounded-2xl border-border/30 p-6 space-y-4 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {org.avatar_url ? (
                    <img
                      src={org.avatar_url}
                      alt={org.login}
                      className="w-12 h-12 rounded-xl"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-sm">
                      {org.name ?? org.login}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      @{org.login}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{org.repos_count} repos</span>
                  <span>{org.members_count} membros</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/20">
                  <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-semibold">
                    Status
                  </span>
                  {install?.status === "active" ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                      <CheckCircle className="w-3 h-3" />
                      Ativa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase tracking-widest">
                      <XCircle className="w-3 h-3" />
                      {install?.status ?? "Desconhecido"}
                    </span>
                  )}
                </div>

                {org.synced_at && (
                  <p className="text-[10px] text-muted-foreground/40">
                    Última sinc:{" "}
                    {new Date(org.synced_at).toLocaleString("pt-BR")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
