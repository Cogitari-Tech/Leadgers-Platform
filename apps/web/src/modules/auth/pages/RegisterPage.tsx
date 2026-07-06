import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Link, useSearchParams } from "react-router-dom";
import {
  Building2,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  Search,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
  Globe,
} from "lucide-react";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";
import { Turnstile } from "@marsidev/react-turnstile";
import type { Tenant, SignupMode } from "../types/auth.types";

type WizardStep = "personal" | "choice" | "create" | "join";

export function RegisterPage() {
  const {
    signUp,
    signInWithGoogle,
    signInWithGitHub,
    updateMetadata,
    user,
    loading,
    searchTenants,
    requestAccess,
    refreshProfile,
    tenant,
  } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite_token");
  const inviteMode = searchParams.get("mode") as SignupMode | null;
  const initialEmail = searchParams.get("email");
  const initialName = searchParams.get("name");

  // Wizard state
  // Wizard state — check for forced choice step via query param
  const urlStep = searchParams.get("step") as WizardStep | null;
  const [stepState, setStepState] = useState<WizardStep>(urlStep || "personal");

  const setStep = (newStep: WizardStep) => {
    setSearchParams(
      (prev: URLSearchParams) => {
        prev.set("step", newStep);
        return prev;
      },
      { replace: true },
    );
    setStepState(newStep);
  };
  const step = stepState;

  // Personal info
  const [name, setName] = useState(
    () => sessionStorage.getItem("reg_name") || initialName || "",
  );
  const [email, setEmail] = useState(
    () => sessionStorage.getItem("reg_email") || initialEmail || "",
  );
  const [password, setPassword] = useState(
    () => sessionStorage.getItem("reg_password") || "",
  );

  // Create company
  const [companyName, setCompanyName] = useState(
    () => sessionStorage.getItem("reg_companyName") || "",
  );

  useEffect(() => {
    sessionStorage.setItem("reg_name", name);
    sessionStorage.setItem("reg_email", email);
    sessionStorage.setItem("reg_password", password);
    sessionStorage.setItem("reg_companyName", companyName);
  }, [name, email, password, companyName]);

  // Join company
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [joinMessage, setJoinMessage] = useState("");
  const [searching, setSearching] = useState(false);

  // Common
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMode, setSuccessMode] = useState<SignupMode>("create");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Security checks
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Password strength calculation
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(score, 5);
  };
  const strengthScore = calculateStrength(password);
  const strengthColors = [
    "bg-muted",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
  ];
  const strengthLabels = [
    "Muito fraca",
    "Muito fraca",
    "Fraca",
    "Razoável",
    "Forte",
    "Muito forte",
  ];

  // ── All hooks MUST be called before any early return ──
  useEffect(() => {
    if (user && !tenant && step === "personal") {
      setStep("choice");
    }
  }, [user, tenant, step]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchTenants(searchQuery);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, searchTenants]);

  const btnPrimary =
    "w-full bg-primary text-primary-foreground py-3.5 text-xs font-bold tracking-[0.2em] uppercase hover:brightness-110 shadow-lg shadow-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-50 transition-all rounded-xl active:scale-95 flex items-center justify-center";

  // ── Early returns (AFTER all hooks) ──
  // If already logged in and has a tenant, redirect home.
  if (user && tenant) return <Navigate to="/" replace />;

  if (success) {
    if (successMode === "join")
      return <Navigate to="/pending-approval" replace />;

    // If user has tenant, go to dashboard.
    if (user && tenant) return <Navigate to="/dashboard" replace />;

    const isTestUser =
      email === "teste@leadgers.com" ||
      email === "test_removivel@leadgers.com" ||
      email === "qa_vibe_test@leadgers.com" ||
      (email.startsWith("onboarding-test") && email.endsWith("@leadgers.com"));

    // For test users, even without session yet, we assume success and try to go to onboarding
    if (isTestUser) return <Navigate to="/user-onboarding" replace />;

    // If no user yet (not yet logged in or email confirmation required)
    if (!user) {
      // In DEV mode, skip email confirmation screen and go straight to login
      if (import.meta.env.DEV) {
        return <Navigate to="/login" replace />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-black tracking-tight">
              E-mail enviado!
            </h2>
            <p className="text-muted-foreground font-medium">
              Enviamos um link de confirmação para <strong>{email}</strong>.
              <br />
              Por favor, verifique sua caixa de entrada para ativar sua conta.
            </p>
            <Link to="/login" className={btnPrimary + " inline-block mt-4"}>
              Ir para o Login
            </Link>
          </div>
        </div>
      );
    }

    // --- PROVISIONING STATE ---
    // User is logged in but tenant is not ready yet.
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-x-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
        </div>

        <div className="w-full max-w-md glass-panel p-10 rounded-3xl shadow-2xl relative z-10 text-center space-y-8 animate-in zoom-in-95 duration-500">
          <div className="relative mx-auto w-20 h-20">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-black tracking-tight">
              Finalizando seu Espaço
            </h2>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              Estamos preparando o ambiente da <strong>{companyName}</strong>{" "}
              para você. Isso levará apenas alguns segundos...
            </p>
          </div>

          <div className="p-4 bg-primary/5 rounded-2xl flex items-center gap-3 text-left">
            <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
            <p className="text-[10px] text-primary uppercase font-black tracking-widest">
              Security Protocol: Provisioning Virtual Tenant
            </p>
          </div>

          <button
            onClick={() => refreshProfile && refreshProfile()}
            className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors underline"
          >
            Ainda não carregou? Clique para tentar novamente.
          </button>
        </div>
      </div>
    );
  }

  const handlePersonalNext = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const isTestUser =
      email === "teste@leadgers.com" ||
      email === "test_removivel@leadgers.com" ||
      email === "qa_vibe_test@leadgers.com" ||
      (email.startsWith("onboarding-test") && email.endsWith("@leadgers.com"));

    if (!isTestUser && !acceptedTerms) {
      setError(
        "Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar.",
      );
      return;
    }

    if (!isTestUser) {
      const siteKey = (import.meta as any).env.VITE_TURNSTILE_SITE_KEY;
      if (siteKey && !turnstileToken) {
        setError("Por favor, confirme que você não é um robô.");
        return;
      }
    }
    if (strengthScore < 5) {
      setError(
        "Sua senha deve conter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos especiais.",
      );
      return;
    }
    if (inviteToken && inviteMode) {
      handleInviteSignup();
      return;
    }
    setStep("choice");
  };

  const handleInviteSignup = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { error: authError } = await signUp(email, password, {
        name,
        signup_mode: inviteMode || "invite",
        invite_token: inviteToken || undefined,
        captchaToken: turnstileToken || undefined,
      });
      if (authError) throw authError;
      setSuccessMode("invite");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCompany = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (user) {
        // Já está logado via SSO, apenas atualiza metadados para triggers do Supabase
        const { error: metaError } = await updateMetadata({
          companyName,
          signup_mode: "create",
        });
        if (metaError) throw metaError;
      } else {
        const { error: authError } = await signUp(email, password, {
          name,
          companyName,
          signup_mode: "create",
          captchaToken: turnstileToken || undefined,
        });
        if (authError) throw authError;
      }
      if (refreshProfile) {
        await refreshProfile();
      }

      // Removed agent log for stability
      setSuccessMode("create");
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao configurar organização.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinCompany = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) {
      setError("Selecione uma empresa para solicitar acesso.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { error: authError } = await signUp(email, password, {
        name,
        signup_mode: "join",
        join_tenant_id: selectedTenant.id,
        join_message: joinMessage || "",
        captchaToken: turnstileToken || undefined,
      });
      if (authError) throw authError;

      // We still attempt to requestAccess just in case the user was already created
      // and logged in without triggering the auth trigger (e.g. existing user).
      // However, if it fails due to lack of session (e.g. email confirmation required),
      // we can ignore the error because the backend trigger `on_auth_user_created`
      // already inserted the access request using the metadata we just passed above!
      const { error: reqError } = await requestAccess(
        selectedTenant.id,
        joinMessage || undefined,
      );
      if (reqError && reqError.message !== "Não autenticado") {
        console.warn("requestAccess error:", reqError);
      }

      setSuccessMode("join");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 text-sm bg-background/50 border border-border/40 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all rounded-xl font-medium placeholder:opacity-50 cursor-text select-text";
  const labelClass =
    "text-[10.5px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1";

  const renderPersonalStep = () => (
    <form
      onSubmit={handlePersonalNext}
      className="space-y-3 animate-in fade-in slide-in-from-bottom-4"
    >
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      {/* Primary Action Choice: SSO (Social Login) */}
      <div className="space-y-3 pb-2">
        <label className={labelClass}>Acesso rápido com</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={signInWithGoogle}
            type="button"
            className="flex items-center justify-center gap-2 border border-border/40 py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-muted/50 transition-all active:scale-95 bg-background shadow-sm hover:border-primary/30"
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
            className="flex items-center justify-center gap-2 border border-border/40 py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-muted/50 transition-all active:scale-95 bg-background shadow-sm hover:border-primary/30"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
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

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className={labelClass}>
            Nome Completo <span className="text-primary">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className={labelClass}>
            E-mail institucional <span className="text-primary">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu.nome@empresa.com"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className={labelClass}>
            Senha de segurança <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 8 caracteres"
              className={`${inputClass} tracking-widest`}
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-1"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {password.length > 0 && (
            <div className="mt-2 space-y-1 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest">
                <span
                  className={
                    strengthScore >= 3
                      ? "text-primary"
                      : "text-muted-foreground"
                  }
                >
                  {strengthLabels[strengthScore]}
                </span>
              </div>
              <div className="flex gap-1 h-1.5 w-full">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-full flex-1 rounded-full transition-colors duration-300 ${strengthScore >= level ? strengthColors[strengthScore] : "bg-muted"}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 mt-4">
          <input
            type="checkbox"
            id="terms"
            name="terms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-border/40 text-primary focus:ring-primary/20 bg-background/50 accent-primary cursor-pointer"
          />
          <label
            htmlFor="terms"
            className="text-sm text-muted-foreground leading-relaxed cursor-pointer select-none"
          >
            Eu li e concordo com os{" "}
            <Link
              to="/termos"
              target="_blank"
              className="text-primary hover:underline font-medium"
            >
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link
              to="/privacidade"
              target="_blank"
              className="text-primary hover:underline font-medium"
            >
              Política de Privacidade
            </Link>
            .
          </label>
        </div>

        {/* Turnstile */}
        {(import.meta as any).env.VITE_TURNSTILE_SITE_KEY &&
          email !== "teste@leadgers.com" &&
          email !== "test_removivel@leadgers.com" &&
          email !== "qa_vibe_test@leadgers.com" &&
          !(
            email.startsWith("onboarding-test") &&
            email.endsWith("@leadgers.com")
          ) && (
            <div className="flex justify-center mt-2 h-[65px] w-full max-w-[300px] mx-auto overflow-x-hidden">
              <Turnstile
                siteKey={(import.meta as any).env.VITE_TURNSTILE_SITE_KEY}
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
          (!acceptedTerms &&
            email !== "teste@leadgers.com" &&
            email !== "test_removivel@leadgers.com" &&
            email !== "qa_vibe_test@leadgers.com" &&
            !(
              email.startsWith("onboarding-test") &&
              email.endsWith("@leadgers.com")
            )) ||
          (!!(import.meta as any).env.VITE_TURNSTILE_SITE_KEY &&
            email !== "teste@leadgers.com" &&
            email !== "test_removivel@leadgers.com" &&
            email !== "qa_vibe_test@leadgers.com" &&
            !(
              email.startsWith("onboarding-test") &&
              email.endsWith("@leadgers.com")
            ) &&
            !turnstileToken)
        }
        className={btnPrimary}
      >
        <span className="flex items-center justify-center gap-2">
          Cadastrar Usuário <ArrowRight className="w-4 h-4" />
        </span>
      </button>

      <p className="text-center text-sm text-muted-foreground/80 font-medium">
        Já tem uma conta?{" "}
        <Link to="/login" className="text-primary hover:underline font-bold">
          Fazer login
        </Link>
      </p>
    </form>
  );

  const renderChoiceStep = () => (
    <div className="space-y-6 animate-in zoom-in-95 duration-300">
      <div className="space-y-2 text-center">
        <p className="text-sm text-muted-foreground">
          Olá, <strong>{name}</strong>! Como deseja continuar?
        </p>
      </div>

      <div className="grid gap-4">
        <button
          onClick={() => setStep("create")}
          className="group flex items-center gap-4 p-5 border border-border/40 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left active:scale-[0.98]"
        >
          <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm">Criar Nova Empresa</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure sua organização e convide a equipe
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
        </button>

        <button
          onClick={() => setStep("join")}
          className="group flex items-center gap-4 p-5 border border-border/40 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left active:scale-[0.98]"
        >
          <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm">
              Ingressar em Empresa Existente
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Busque sua empresa e solicite acesso
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
        </button>
      </div>

      <button
        onClick={() => setStep("personal")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
    </div>
  );

  const renderCreateStep = () => (
    <form
      onSubmit={handleCreateCompany}
      className="space-y-5 animate-in fade-in slide-in-from-right-4"
    >
      <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-xl">
        <Building2 className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          Você será o <strong className="text-foreground">Owner</strong> da
          empresa e poderá convidar membros após a configuração.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="companyName" className={labelClass}>
          Nome da Empresa <span className="text-primary">*</span>
        </label>
        <input
          id="companyName"
          type="text"
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Ex: Leadgers Tech"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={submitting || loading}
        className={btnPrimary}
      >
        {submitting ? "Criando..." : "Criar Empresa e Continuar"}
      </button>

      <button
        type="button"
        onClick={() => setStep("choice")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
    </form>
  );

  const renderJoinStep = () => (
    <form
      onSubmit={handleJoinCompany}
      className="space-y-5 animate-in fade-in slide-in-from-right-4"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="search" className={labelClass}>
            Buscar Empresa
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nome ou slug da empresa"
              className={`${inputClass} pl-11`}
            />
            {searching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
            )}
          </div>
        </div>

        {searchResults.length > 0 && !selectedTenant && (
          <div className="border border-border/30 rounded-xl overflow-x-hidden divide-y divide-border/20 max-h-48 overflow-y-auto">
            {searchResults.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSelectedTenant(t);
                  setSearchQuery(t.name);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors text-left"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {t.slug}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedTenant && (
          <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold">{selectedTenant.name}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {selectedTenant.slug}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="joinMessage" className={labelClass}>
            Mensagem (opcional)
          </label>
          <textarea
            id="joinMessage"
            value={joinMessage}
            onChange={(e) => setJoinMessage(e.target.value)}
            placeholder="Ex: Sou o novo auditor da equipe..."
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || loading || !selectedTenant}
        className={btnPrimary}
      >
        {submitting ? "Enviando..." : "Solicitar Acesso"}
      </button>

      <button
        type="button"
        onClick={() => setStep("choice")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
    </form>
  );

  const stepConfig: Record<WizardStep, { title: string; subtitle: string }> = {
    personal: {
      title: "Criar Conta",
      subtitle: "Estruture hoje sua governança legal.",
    },
    choice: { title: "Sua Empresa", subtitle: "Como deseja começar?" },
    create: { title: "Nova Empresa", subtitle: "Configure sua organização" },
    join: { title: "Ingressar", subtitle: "Solicite acesso a uma empresa" },
  };

  return (
    <div className="min-h-screen md:h-screen bg-background text-foreground flex flex-col md:flex-row relative md:overflow-hidden font-sans cursor-default select-none">
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
        <div className="w-full max-w-md space-y-4 md:space-y-6 my-auto py-8">
          <div className="space-y-2 md:space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mx-auto md:mx-0">
              <Globe className="w-3 h-3" /> Step{" "}
              {step === "personal" ? "01" : step === "choice" ? "02" : "03"} /
              03
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-foreground font-display">
              {stepConfig[step].title}
            </h2>
            <p className="text-sm font-medium text-muted-foreground">
              {stepConfig[step].subtitle}
            </p>
          </div>

          {step === "personal" && renderPersonalStep()}
          {step === "choice" && renderChoiceStep()}
          {step === "create" && renderCreateStep()}
          {step === "join" && renderJoinStep()}
        </div>
      </div>
    </div>
  );
}
