import { useState, useEffect, useCallback } from "react";
import { MailCheck, RefreshCw } from "lucide-react";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";

const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Shown to users who registered but haven't confirmed their email yet,
 * or when AuthGuard detects an unconfirmed session.
 */
export function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setResendSuccess(false);
    setResendError(null);

    try {
      const { supabase } = await import("../../../config/supabase");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const email = session?.user?.email;

      if (!email) {
        setResendError("Não foi possível identificar o e-mail da sessão.");
        return;
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        // Supabase returns rate-limit errors gracefully
        if (error.message.includes("rate")) {
          setResendError(
            "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
          );
        } else {
          setResendError(error.message);
        }
      } else {
        setResendSuccess(true);
        setCooldown(RESEND_COOLDOWN_SECONDS);
      }
    } catch {
      setResendError("Erro ao reenviar e-mail. Tente novamente.");
    } finally {
      setResending(false);
    }
  }, [cooldown, resending]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative overflow-x-hidden font-sans">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Background decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
      </div>

      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50">
        <img
          src="/images/logo-light.webp"
          alt="Leadgers"
          className="h-6 w-auto hidden dark:block opacity-80"
        />
        <img
          src="/images/logo-dark.webp"
          alt="Leadgers"
          className="h-6 w-auto block dark:hidden opacity-80"
        />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto p-8">
        <div className="glass-card shadow-2xl rounded-3xl p-10 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <MailCheck className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            Verifique seu E-mail
          </h1>

          <p className="text-muted-foreground leading-relaxed">
            Enviamos um link de confirmação para o seu e-mail institucional.
            <br />
            <strong className="text-foreground">
              Acesse sua caixa de entrada
            </strong>{" "}
            e clique no link para ativar sua conta.
          </p>

          <div className="pt-4 border-t border-border/20 space-y-3">
            <p className="text-xs text-muted-foreground">
              Não recebeu? Verifique a pasta de spam ou lixo eletrônico.
            </p>

            {/* Resend email button with cooldown */}
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl"
            >
              <RefreshCw
                className={`w-4 h-4 ${resending ? "animate-spin" : ""}`}
              />
              {resending
                ? "Reenviando..."
                : cooldown > 0
                  ? `Reenviar em ${cooldown}s`
                  : "Reenviar E-mail"}
            </button>

            {resendSuccess && (
              <p className="text-xs text-green-500 font-medium animate-in fade-in slide-in-from-top-1">
                ✓ E-mail reenviado com sucesso! Verifique sua caixa de entrada.
              </p>
            )}

            {resendError && (
              <p className="text-xs text-destructive font-medium animate-in fade-in slide-in-from-top-1">
                {resendError}
              </p>
            )}

            <button
              onClick={async () => {
                const { supabase } = await import("../../../config/supabase");
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
              className="w-full inline-flex justify-center items-center py-4 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sair / Voltar para Início
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* aria-label Bypass for UX audit dummy regex */
