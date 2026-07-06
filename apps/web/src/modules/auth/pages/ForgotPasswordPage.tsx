import { useState, type FormEvent } from "react";
import { supabase } from "../../../config/supabase";
import { Activity, ShieldCheck, Database } from "lucide-react";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";
import { Link } from "react-router-dom";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    );

    if (resetError) {
      setError("Erro ao enviar e-mail de recuperação. Tente novamente.");
    } else {
      setSent(true);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row relative overflow-x-hidden font-sans">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      {/* Dynamic Background decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
      </div>

      {/* Left side: Hero / Branding */}
      <div className="hidden md:flex flex-col justify-between w-[60%] p-16 lg:p-24 relative z-10 overflow-x-hidden">
        <div className="flex items-center justify-between">
          <img
            src="/images/logo-light.webp"
            alt="Leadgers"
            className="h-8 w-auto hidden dark:block transition-all opacity-90 hover:opacity-100"
          />
          <img
            src="/images/logo-dark.webp"
            alt="Leadgers"
            className="h-8 w-auto block dark:hidden transition-all opacity-90 hover:opacity-100"
          />
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase opacity-40 px-3 py-1 bg-foreground/5 rounded-full">
            Enterprise Security
          </span>
        </div>

        <div className="space-y-10 mt-12 flex-grow flex flex-col justify-center">
          <h1 className="text-6xl lg:text-[5rem] font-bold tracking-tight text-foreground leading-[1.05]">
            Relatórios com <br />
            <span className="text-primary">Precisão Absoluta.</span>
          </h1>
          <p className="max-w-md text-lg text-muted-foreground font-medium leading-relaxed">
            Plataforma avançada de auditoria e compliance financeiro. Gestão
            estratégica de dados com interface intuitiva e refinada.
          </p>

          <div className="flex gap-10 pt-10 border-t border-border/10 w-fit">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShieldCheck className="text-primary w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest leading-tight">
                Privacidade
                <br />
                Garantida
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Database className="text-primary w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest leading-tight">
                Dados
                <br />
                Estruturados
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="text-primary w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest leading-tight">
                Insight
                <br />
                Estratégico
              </span>
            </div>
          </div>
        </div>

        <div className="text-[10px] font-semibold text-muted-foreground/30 uppercase tracking-[0.4em]">
          © 2026 Leadgers Governance · Leadgers Tech
        </div>
      </div>

      {/* Right side: Form Card Section */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-16 relative z-20">
        <div className="glass-panel p-10 sm:p-12 rounded-2xl soft-shadow w-full max-w-md mx-auto space-y-8 dark:border-white/5">
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-8">
            <img
              src="/images/logo-light.webp"
              alt="Leadgers"
              className="h-8 w-auto hidden dark:block transition-all opacity-90 hover:opacity-100"
            />
            <img
              src="/images/logo-dark.webp"
              alt="Leadgers"
              className="h-8 w-auto block dark:hidden transition-all opacity-90 hover:opacity-100"
            />
          </div>

          {sent ? (
            <div className="space-y-6 pt-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 text-primary bg-primary/10">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                E-mail Enviado
              </h2>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                Verifique sua caixa de entrada em{" "}
                <span className="text-foreground font-bold">{email}</span> e
                siga as instruções para redefinir sua senha.
              </p>
              <div className="pt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:brightness-110 transition-colors uppercase tracking-widest"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Voltar ao login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tight">
                  Recuperação
                </h2>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">
                  Redefinição de Credenciais
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-1">
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1"
                    >
                      E-mail corporativo
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="auditor@empresa.com"
                      className="w-full px-5 py-3.5 text-sm bg-background/50 border border-border/40 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all rounded-xl font-medium placeholder:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground py-4 text-xs font-bold tracking-[0.2em] uppercase hover:brightness-110 shadow-lg shadow-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-50 transition-all rounded-xl active:scale-95"
                >
                  {submitting ? "Enviando..." : "Enviar Link"}
                </button>
              </form>

              <div className="pt-6 text-center">
                <Link
                  to="/"
                  className="font-bold uppercase tracking-widest text-brand-500 transition-colors hover:text-brand-400"
                >
                  ← Voltar à Autenticação
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
