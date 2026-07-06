import { useState, useEffect, type FormEvent } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { supabase } from "../../../config/supabase";
import type { Invitation } from "../types/auth.types";
import { Activity, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";
import { Turnstile } from "@marsidev/react-turnstile";

export function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isInviteLink, setIsInviteLink] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchInvitation = async () => {
      const { data, error: fetchError } = await supabase.rpc(
        "check_invite_token",
        {
          raw_token: token,
        },
      );

      if (fetchError || !data) {
        setError("Convite inválido ou expirado.");
        setLoading(false);
        return;
      }

      const inviteData = data as any;

      if (new Date(inviteData.expires_at) < new Date()) {
        setError("Este convite expirou. Solicite um novo ao administrador.");
        setLoading(false);
        return;
      }

      if (inviteData.type === "link") {
        setIsInviteLink(true);
        setInvitation({
          id: inviteData.id,
          tenant_id: inviteData.tenant_id,
          email: "",
          role_id: inviteData.role_id,
          invited_by: inviteData.created_by,
          token: token || "",
          status: "pending",
          expires_at: inviteData.expires_at,
          created_at: new Date().toISOString(),
          accepted_at: null,
          role: inviteData.role,
          tenant: inviteData.tenant,
        } as Invitation);
      } else {
        setIsInviteLink(false);
        setInvitation({
          id: inviteData.id,
          tenant_id: inviteData.tenant_id,
          email: inviteData.email,
          role_id: inviteData.role_id,
          invited_by: inviteData.invited_by,
          token: token || "",
          status: "pending",
          expires_at: inviteData.expires_at,
          created_at: new Date().toISOString(),
          accepted_at: null,
          role: inviteData.role,
          tenant: inviteData.tenant,
        } as Invitation);
      }

      setLoading(false);
    };

    fetchInvitation();
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    // Captcha validation check
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    const isTestKey = siteKey === "1x00000000000000000000AA";
    const automationBypass =
      import.meta.env.DEV &&
      localStorage.getItem("LEADGERS_AUTOMATION_BYPASS") === "true";

    if (siteKey && !turnstileToken && !isTestKey && !automationBypass) {
      setError("Por favor, confirme que você não é um robô.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    const calculateStrength = (pwd: string) => {
      let score = 0;
      if (pwd.length >= 8) score++;
      if (/[A-Z]/.test(pwd)) score++;
      if (/[a-z]/.test(pwd)) score++;
      if (/[0-9]/.test(pwd)) score++;
      if (/[^A-Za-z0-9]/.test(pwd)) score++;
      return Math.min(score, 5);
    };

    if (calculateStrength(password) < 5) {
      setError(
        "Sua senha deve conter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos especiais.",
      );
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      // 1. Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: isInviteLink ? (undefined as any) : invitation.email,
          password,
          options: {
            captchaToken: turnstileToken || undefined,
            data: {
              name,
              signup_mode: isInviteLink ? "invite_link" : "invite",
              invite_token: token,
            },
          },
        },
      );

      // Same handling as AuthContext to correctly identify confirmation link email
      if (
        signUpError &&
        signUpError.message.includes("Error sending confirmation email")
      ) {
        // Technically this shouldn't fail the invite flow entirely but it will fail the session creation
        // The edge function trigger still runs if the user row is created.
        setError(
          "A conta foi criada, mas houve um erro ao enviar o e-mail de verificação.",
        );
        setSubmitting(false);
        return;
      }

      if (signUpError || !authData.user) {
        setError(signUpError?.message ?? "Erro ao criar conta.");
        setSubmitting(false);
        return;
      }

      // 2. Mark invitation as accepted (via service role edge function or RPC)
      await supabase
        .from("invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);

      setSuccess(true);
    } catch {
      setError("Erro inesperado. Tente novamente.");
    }
    setSubmitting(false);
  };

  if (success) {
    return <Navigate to="/dashboard" replace />;
  }

  const inputClass =
    "w-full px-5 py-3 text-sm bg-background/50 border border-border/40 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all rounded-xl font-medium placeholder:opacity-50 tracking-widest";
  const labelClass =
    "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1";
  const btnPrimary =
    "w-full bg-primary text-primary-foreground py-4 text-xs font-bold tracking-[0.2em] uppercase hover:brightness-110 shadow-lg shadow-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-50 transition-all rounded-xl active:scale-95";

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/30 selection:text-primary overflow-x-hidden text-foreground flex flex-col items-center justify-center relative">
      {/* SEO Metadata */}
      <div className="hidden" aria-hidden="true">
        <title>Aceitar Convite | Leadgers Governance</title>
        <meta
          name="description"
          content="Aceite seu convite para participar da plataforma Leadgers Governance."
        />
        <meta
          property="og:title"
          content="Aceitar Convite - Leadgers Governance"
        />
        <meta
          property="og:description"
          content="Inicie sua jornada na governança corporativa."
        />
      </div>
      <header className="fixed top-0 inset-x-0 z-50 px-6 py-5 bg-background/40 backdrop-blur-sm transition-all duration-300 flex items-center justify-between border-transparent">
        <div className="flex items-center gap-3">
          <Link to="/">
            <img
              src="/images/logo-light.webp"
              alt="Leadgers Governance"
              className="h-7 w-auto mix-blend-screen hidden dark:block"
              aria-hidden="true"
            />
            <img
              src="/images/logo-dark.webp"
              alt="Leadgers Governance"
              className="h-7 w-auto block dark:hidden"
              aria-hidden="true"
            />
          </Link>
          <span
            className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-50 px-2 py-0.5 border-l border-border ml-2"
            aria-label="Governance"
          >
            Governance
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Unified Background Layer */}
      <div
        className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 mix-blend-overlay dark:opacity-10 pointer-events-none z-0"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background pointer-events-none z-0"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10 pointer-events-none z-0"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary via-transparent to-transparent blur-3xl" />
      </div>

      <main className="w-full max-w-md relative z-10 px-6 py-24 sm:py-32">
        <div className="glass-panel p-8 sm:p-10 rounded-2xl soft-shadow w-full dark:border-white/5 mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Verificando Convite...
              </p>
            </div>
          ) : error && !invitation ? (
            <div className="space-y-6 pt-4 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive shadow-lg shadow-destructive/10">
                <Activity className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Convite Inválido
              </h2>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                {error}
              </p>
              <div className="pt-4 mt-8 pt-6 border-t border-border/30">
                <Link
                  to="/"
                  className="w-full inline-block bg-primary text-primary-foreground py-4 text-xs font-bold tracking-[0.2em] uppercase hover:brightness-110 shadow-xl shadow-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all duration-300 rounded-2xl active:scale-[0.98]"
                >
                  Voltar ao Início
                </Link>
              </div>
            </div>
          ) : invitation ? (
            <>
              <div className="mb-8 text-center sm:text-left">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Bem-vindo
                </h1>
                <p className="text-[11px] font-bold text-muted-foreground mt-3 leading-relaxed">
                  VOCÊ FOI CONVIDADO PARA{" "}
                  <span className="text-foreground">
                    {invitation.tenant?.name || "UMA ORGANIZAÇÃO"}
                  </span>
                  <br />
                  CARGO:{" "}
                  <span className="text-primary">
                    {invitation.role?.display_name || "MEMBRO"}
                  </span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {error && (
                  <div
                    className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2"
                    aria-live="polite"
                  >
                    <Activity className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {!isInviteLink && (
                    <div className="space-y-1.5 flex flex-col">
                      <label htmlFor="invite-email" className={labelClass}>
                        E-mail
                      </label>
                      <input
                        id="invite-email"
                        type="email"
                        value={invitation.email}
                        disabled
                        className="w-full px-5 py-3 text-sm bg-muted/40 border border-border/30 outline-none rounded-xl font-medium opacity-50 cursor-not-allowed tracking-widest"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5 flex flex-col">
                    <label htmlFor="name" className={labelClass}>
                      Nome Completo
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <div className="flex justify-between items-center">
                      <label htmlFor="invite-password" className={labelClass}>
                        Nova Senha de Acesso
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest"
                      >
                        Esqueceu a senha?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        id="invite-password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-1"
                        title={showPassword ? "Ocultar senha" : "Exibir senha"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <label htmlFor="confirm-password" className={labelClass}>
                      Confirmar Senha
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Turnstile */}
                  {import.meta.env.VITE_TURNSTILE_SITE_KEY && (
                    <div className="flex justify-center mt-2 h-[65px] w-full max-w-[300px] mx-auto overflow-x-hidden">
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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      (!!import.meta.env.VITE_TURNSTILE_SITE_KEY &&
                        !turnstileToken &&
                        import.meta.env.VITE_TURNSTILE_SITE_KEY !==
                          "1x00000000000000000000AA" &&
                        import.meta.env.DEV &&
                        localStorage.getItem("LEADGERS_AUTOMATION_BYPASS") !==
                          "true")
                    }
                    className={
                      btnPrimary +
                      " flex justify-center items-center gap-2 mt-4"
                    }
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Aceitar Convite e Acessar"
                    )}
                    {!submitting && (
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
