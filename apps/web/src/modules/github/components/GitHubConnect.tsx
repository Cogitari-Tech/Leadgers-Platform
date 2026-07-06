import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Github,
  Loader2,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { supabase } from "../../../config/supabase";

export function GitHubConnect() {
  const { tenant, signInWithGitHub } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkInstallation() {
      if (!tenant) return;
      try {
        const { data, error } = await supabase
          .from("github_installations")
          .select("id")
          .eq("tenant_id", tenant.id)
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      } catch (err) {
        console.error("Erro ao verificar instalação do GitHub", err);
      } finally {
        setChecking(false);
      }
    }

    checkInstallation();
  }, [tenant]);

  const handleDisconnect = async () => {
    if (!tenant) return;
    if (
      !confirm(
        "Tem certeza que deseja desconectar o GitHub da sua organização?",
      )
    )
      return;
    setConnecting(true);
    try {
      const { error } = await supabase
        .from("github_installations")
        .delete()
        .eq("tenant_id", tenant.id);

      if (!error) {
        setIsConnected(false);
      } else {
        alert("Erro ao desconectar GitHub: " + error.message);
      }
    } catch (err) {
      console.error("Erro na desconexão:", err);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="p-8 md:p-10 flex flex-col justify-between h-full group/connector relative overflow-hidden transition-all">
      <div className="absolute top-0 right-0 w-48 h-48 bg-foreground/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover/connector:bg-foreground/10 transition-colors duration-700" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -ml-16 -mb-16 transition-colors duration-700" />

      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 relative z-10 flex-1">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left flex-1">
          <div className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center flex-shrink-0 shadow-2xl shadow-foreground/20 group-hover/connector:scale-105 transition-transform duration-500">
            <Github className="w-8 h-8 text-background" />
          </div>
          <div className="space-y-2 max-w-lg">
            <h3 className="text-2xl font-black text-foreground flex flex-col md:flex-row md:items-center gap-3">
              Ecossistema GitHub
              {isConnected && (
                <span className="inline-flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full animate-in zoom-in-50 duration-500 w-fit mx-auto md:mx-0">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Conectado
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              Integre sua organização para centralizar auditorias de código e
              monitorar o{" "}
              <strong className="text-foreground">Advanced Security</strong> em
              tempo real, garantindo maior visibilidade para a governança.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto mt-4 md:mt-0">
          {checking ? (
            <button
              disabled
              className="w-full md:w-48 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground border-2 border-border/40 bg-muted/20 rounded-2xl opacity-50 flex items-center justify-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Verificando...
            </button>
          ) : isConnected ? (
            <button
              onClick={handleDisconnect}
              disabled={connecting}
              className="w-full md:w-48 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-destructive border-2 border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-all rounded-2xl disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
            >
              {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {connecting ? "Desconectando..." : "Desconectar"}
            </button>
          ) : (
            <button
              onClick={async () => {
                setConnecting(true);
                try {
                  await signInWithGitHub();
                } catch (err) {
                  console.error(err);
                  setConnecting(false);
                }
              }}
              disabled={connecting}
              className="w-full md:w-48 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-background bg-foreground hover:brightness-110 transition-all rounded-2xl disabled:opacity-50 shadow-2xl shadow-foreground/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {connecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Github className="w-4 h-4" />
              )}
              {connecting ? "Aguarde..." : "Vincular GitHub"}
            </button>
          )}

          <div className="flex items-center gap-2 opacity-50 justify-center md:justify-end w-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">
              OAuth 2.0 Secure
            </span>
          </div>
        </div>
      </div>

      {/* Footer sections pushed to bottom via justify-between logic above */}
      <div className="mt-8 z-10 w-full">
        {isConnected ? (
          <div className="pt-6 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in duration-700">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11px] text-muted-foreground font-medium">
                Sincronização ativa. Acesse o painel para ver as auditorias.
              </p>
            </div>
            <Link
              to="/dashboard/github"
              className="group/link flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:brightness-110 transition-all bg-primary/10 px-4 py-2 rounded-xl"
            >
              Dashboard{" "}
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1" />
            </Link>
          </div>
        ) : (
          <div className="pt-6 border-t border-border/20 flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-3 opacity-40">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">
                Vulnerabilidade CodeQL
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">Dependabot Alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">
                Secret Scanning Logs
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
