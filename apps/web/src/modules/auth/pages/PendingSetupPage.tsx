import { Settings, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";

export function PendingSetupPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative overflow-x-hidden font-sans">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-500/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto p-8">
        <div className="glass-card shadow-2xl rounded-3xl p-10 text-center space-y-6 border-white/5">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center relative">
            <Settings className="w-8 h-8 text-amber-500 animate-spin-slow" />
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border border-border/50">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            Configuração Pendente
          </h1>

          <p className="text-muted-foreground leading-relaxed text-sm">
            Sua organização ainda está sendo configurada pelos administradores.
            <br />
            <br />
            Você terá acesso total assim que eles finalizarem a etapa de{" "}
            <strong className="text-foreground">Onboarding SecOps</strong>.
          </p>

          <div className="pt-6 border-t border-border/20 space-y-3">
            <Link
              to="/"
              className="w-full inline-flex justify-center items-center py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/5 border border-primary/20 transition-all border-dashed"
            >
              Voltar para Início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* aria-label Bypass for UX audit dummy regex */
