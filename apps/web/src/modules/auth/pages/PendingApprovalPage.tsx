import { Link } from "react-router-dom";
import { Clock, ArrowLeft, Mail } from "lucide-react";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";

export function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative overflow-x-hidden font-sans">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Background decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="glass-panel p-10 sm:p-12 rounded-2xl soft-shadow w-full max-w-md mx-6 space-y-8 dark:border-white/5 text-center relative z-10">
        <div className="flex justify-center mb-4">
          <img
            src="/images/logo-light.webp"
            alt="Leadgers"
            className="h-8 w-auto hidden dark:block opacity-90"
          />
          <img
            src="/images/logo-dark.webp"
            alt="Leadgers"
            className="h-8 w-auto block dark:hidden opacity-90"
          />
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-5 bg-amber-500/10 rounded-2xl">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">
            Aguardando Aprovação
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Sua solicitação de acesso foi enviada com sucesso. O administrador
            da empresa será notificado e avaliará sua solicitação.
          </p>
        </div>

        {/* Status info */}
        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
          <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground text-left">
            Você receberá um e-mail quando sua solicitação for aprovada ou
            rejeitada.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-left">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              ✓
            </div>
            <span className="text-sm text-muted-foreground">Conta criada</span>
          </div>
          <div className="flex items-center gap-3 text-left">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              ✓
            </div>
            <span className="text-sm text-muted-foreground">
              Solicitação enviada
            </span>
          </div>
          <div className="flex items-center gap-3 text-left">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <span className="text-sm font-medium">Aguardando aprovação</span>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex w-full items-center justify-center rounded-xl bg-brand-500 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-brand-500/20 outline-none transition-all hover:brightness-110 focus:ring-4 focus:ring-brand-500/20 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o login
        </Link>
      </div>
    </div>
  );
}
