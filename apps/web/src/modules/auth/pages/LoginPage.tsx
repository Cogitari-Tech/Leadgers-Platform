import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { ArrowRight, Loader2, Eye, EyeOff, Activity } from "lucide-react";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";
import { Turnstile } from "@marsidev/react-turnstile";

export function LoginPage() {
  const { signIn, signInWithGoogle, signInWithGitHub, user, loading } =
    useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [remember, setRemember] = useState(true);

  // Session persistence sync
  useEffect(() => {
    if (!remember) {
      localStorage.setItem("leadgers_session_type", "temporal");
    } else {
      localStorage.removeItem("leadgers_session_type");
    }
  }, [remember]);

  // If already logged in, redirect
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Captcha validation
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    const isTestKey = siteKey === "1x00000000000000000000AA";
    const automationBypass =
      import.meta.env.DEV &&
      localStorage.getItem("LEADGERS_AUTOMATION_BYPASS") === "true";

    if (siteKey && !turnstileToken && !isTestKey && !automationBypass) {
      setError("Por favor, confirme que você não é um robô.");
      return;
    }

    setSubmitting(true);

    const { error: authError } = await signIn(
      email,
      password,
      turnstileToken || undefined,
      remember,
    );
    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes("invalid login credentials")) {
        setError(
          "E-mail ou senha incorretos. Verifique suas credenciais (ou use o login com Google/GitHub se sua conta foi criada assim).",
        );
      } else if (msg.includes("email not confirmed")) {
        setError(
          "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.",
        );
      } else if (
        msg.includes("too many requests") ||
        (authError as any).status === 429
      ) {
        setError(
          "Muitas tentativas de login. Por favor, aguarde alguns minutos e tente novamente.",
        );
      } else if (msg.includes("captcha")) {
        setError(
          "Falha na verificação de segurança (Captcha). Atualize a página e tente novamente.",
        );
      } else {
        setError(
          authError.message ||
            "Erro inesperado ao fazer login. Tente novamente.",
        );
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen md:h-screen bg-background text-foreground flex flex-col md:flex-row relative md:overflow-hidden font-sans cursor-default select-none">
      {/* SEO Metadata */}
      <div className="hidden" aria-hidden="true">
        <title>Acesso Restrito | Leadgers Governance</title>
        <meta
          name="description"
          content="Acesse sua conta no Leadgers Governance. Identificação exclusiva para auditoria e compliance."
        />
        <meta property="og:title" content="Login - Leadgers Governance" />
        <meta
          property="og:description"
          content="Acesse o ecossistema de governança da sua startup."
        />
      </div>

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
      </div>

      <div className="hidden md:flex flex-col justify-between w-[50%] lg:w-[60%] p-16 lg:p-24 relative z-10 overflow-hidden h-full">
        <div>
          <div className="flex items-center">
            <Link to="/">
              <img
                src="/images/logo-light.webp"
                alt="Leadgers"
                className="h-11 w-auto hidden dark:block"
              />
              <img
                src="/images/logo-dark.webp"
                alt="Leadgers"
                className="h-11 w-auto block dark:hidden"
              />
            </Link>
          </div>
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase opacity-40 px-3 py-1 bg-foreground/5 rounded-full inline-block mt-4">
            Cyber-Governance Platform
          </span>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-tight font-display">
              Segurança em <br /> Cada Camada.
            </h2>
            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed font-medium">
              Leadgers Governance é o ecossistema definitivo para startups que
              buscam maturidade operacional e compliance inquestionável.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 border-t border-border/20 pt-8 max-w-md">
            <div className="space-y-1">
              <div className="text-2xl font-black tracking-tighter">100%</div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Auditável
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black tracking-tighter">
                AES-256
              </div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Criptografia
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex -space-x-4">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold"
              >
                {idx}
              </div>
            ))}
          </div>
          <p className="text-xs font-semibold text-muted-foreground">
            Junte-se a centenas de fundadores.
          </p>
        </div>
      </div>

      <div className="flex-1 relative z-20 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 bg-background md:bg-background/40 md:backdrop-blur-3xl md:border-l border-border/20 shadow-none md:shadow-2xl overflow-y-auto w-full h-full">
        <div className="w-full max-w-md space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 my-auto py-8">
          <div className="space-y-2 md:space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mx-auto md:mx-0">
              <Activity className="w-3 h-3" /> Acesso
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-foreground font-display">
              Bem-vindo de volta
            </h2>
            <p className="text-sm font-medium text-muted-foreground">
              Acesse sua conta para continuar a jornada.
            </p>
          </div>

          <div className="space-y-3 pb-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">
              Acesso rápido com
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={signInWithGoogle}
                type="button"
                className="flex items-center justify-center gap-2 border border-border/40 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-muted/50 transition-all active:scale-95 bg-background shadow-sm hover:border-primary/30"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32l3.56 2.76c2.07-1.9 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
              <button
                onClick={signInWithGitHub}
                type="button"
                className="flex items-center justify-center gap-2 border border-border/40 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-muted/50 transition-all active:scale-95 bg-background shadow-sm hover:border-primary/30"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                GitHub
              </button>
            </div>

            <div className="relative pt-4 pb-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/20" />
              </div>
              <div className="relative flex justify-center text-[9px]">
                <span className="bg-background px-4 font-black text-muted-foreground/30 uppercase tracking-[0.3em]">
                  Ou use seu e-mail
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div
                className="px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2"
                aria-live="polite"
              >
                <Activity className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-[10.5px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1"
                >
                  E-mail <span className="text-primary">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-background/50 border border-border/40 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all rounded-xl font-medium placeholder:opacity-50 cursor-text select-text"
                  placeholder="nome@empresa.com"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label
                    htmlFor="password"
                    className="text-[10.5px] font-bold uppercase tracking-widest text-muted-foreground/70"
                  >
                    Senha <span className="text-primary">*</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[10.5px] font-bold text-primary hover:underline transition-all uppercase tracking-widest"
                  >
                    Esqueci a senha
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-background/50 border border-border/40 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all rounded-xl font-medium placeholder:opacity-50 tracking-widest cursor-text select-text"
                    placeholder="Mínimo de 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-1"
                    title={showPassword ? "Ocultar senha" : "Exibir senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <label
                  htmlFor="rememberMe"
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-border/40 text-primary focus:ring-primary/20 bg-background/50 accent-primary cursor-pointer"
                  />
                  <span className="text-sm font-medium text-muted-foreground leading-relaxed select-none group-hover:text-foreground transition-colors">
                    Mantenha-me conectado
                  </span>
                </label>
              </div>

              {import.meta.env.VITE_TURNSTILE_SITE_KEY &&
                email !== "teste@leadgers.com" &&
                email !== "test_removivel@leadgers.com" &&
                email !== "qa_vibe_test@leadgers.com" &&
                !(
                  email.startsWith("onboarding-test") &&
                  email.endsWith("@leadgers.com")
                ) && (
                  <div className="flex justify-center mt-2 h-[65px] w-full max-w-[300px] mx-auto overflow-hidden">
                    <Turnstile
                      siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                      onSuccess={(token) => {
                        setTurnstileToken(token);
                        setError(null);
                      }}
                      options={{ theme: "auto", size: "flexible" }}
                    />
                  </div>
                )}
            </div>

            <button
              type="submit"
              disabled={
                submitting ||
                loading ||
                (!!import.meta.env.VITE_TURNSTILE_SITE_KEY &&
                  email !== "teste@leadgers.com" &&
                  email !== "test_removivel@leadgers.com" &&
                  email !== "qa_vibe_test@leadgers.com" &&
                  !(
                    email.startsWith("onboarding-test") &&
                    email.endsWith("@leadgers.com")
                  ) &&
                  !turnstileToken &&
                  import.meta.env.VITE_TURNSTILE_SITE_KEY !==
                    "1x00000000000000000000AA" &&
                  import.meta.env.DEV &&
                  localStorage.getItem("LEADGERS_AUTOMATION_BYPASS") !== "true")
              }
              className="w-full bg-primary text-primary-foreground py-3.5 text-xs font-bold tracking-[0.2em] uppercase hover:brightness-110 shadow-lg shadow-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-50 transition-all rounded-xl active:scale-95 flex items-center justify-center gap-2 mt-2"
            >
              {submitting || loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Entrar"
              )}
              {!submitting && !loading && (
                <ArrowRight className="w-4 h-4 ml-1" />
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground/80 font-medium">
            Não tem uma conta?{" "}
            <Link
              to="/register"
              className="text-primary hover:underline font-bold"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
