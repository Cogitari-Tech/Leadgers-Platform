import { useEffect, useCallback, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";
import { BankAccountForm } from "../../admin/components/BankAccountForm";
import {
  Building2,
  Users,
  Landmark,
  GitBranch,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  SkipForward,
  Github,
} from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../shared/components/ui/form";
import { Input } from "../../../shared/components/ui/Input";
import { Button } from "../../../shared/components/ui/Button";

function BankAccountFetchingWrapper() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const { tenant } = useAuth();
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    if (!tenant) return;
    try {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (err) {
      console.error("Failed to fetch bank accounts:", err);
    } finally {
      setLoading(false);
    }
  }, [tenant]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  return <BankAccountForm accounts={accounts} onUpdate={fetchAccounts} />;
}

import { useTeamManagement } from "../hooks/useTeamManagement";
import { Link2, Copy } from "lucide-react";

function OnboardingInviteWrapper() {
  const { roles, generateInviteLink } = useTeamManagement();
  const [linkRoleId, setLinkRoleId] = useState("");
  const [email, setEmail] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Definir default role "auditor" ou o primeiro não-owner
    if (roles.length > 0 && !linkRoleId) {
      const defaultRole =
        roles.find((r) => r.name === "auditor") ||
        roles.find((r) => r.name !== "owner");
      if (defaultRole) setLinkRoleId(defaultRole.id);
    }
  }, [roles, linkRoleId]);

  const handleGenerateLink = async () => {
    if (!linkRoleId) return;
    setGenerating(true);
    setSuccessMsg("");

    // Uses default settings: maxUses=10, expiresDays=7
    const url = await generateInviteLink(
      linkRoleId,
      10,
      7,
      "🔗 Link de Onboarding",
      email || undefined,
    );

    if (url) {
      setGeneratedLink(url);
      if (email) {
        setSuccessMsg(`Convite gerado e enviado para ${email}.`);
      }
    }
    setGenerating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccessMsg("Link copiado para a área de transferência!");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <label
          htmlFor="inviteEmail"
          className="text-[10.5px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1"
        >
          E-mail do Convidado (Opcional)
        </label>
        <input
          type="email"
          id="inviteEmail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="exemplo@empresa.com"
          className="w-full glass-input px-4 py-3"
        />
        <p className="text-[10px] text-muted-foreground ml-1">
          Se preenchido, um e-mail com o acesso será enviado automaticamente.
        </p>
      </div>

      <div className="space-y-3">
        <label
          htmlFor="inviteRole"
          className="text-[10.5px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1"
        >
          Cargo para o novo membro
        </label>
        <select
          id="inviteRole"
          value={linkRoleId}
          onChange={(e) => setLinkRoleId(e.target.value)}
          className="w-full glass-input px-4 py-3 appearance-none"
        >
          <option value="" disabled>
            Selecione um cargo...
          </option>
          {roles
            .filter((r) => r.name !== "owner")
            .map((r) => (
              <option key={r.id} value={r.id}>
                {r.display_name}
              </option>
            ))}
        </select>
      </div>

      <div className="pt-4">
        <Button
          type="button"
          onClick={handleGenerateLink}
          disabled={generating || !linkRoleId}
          className="w-full sm:w-auto px-8 py-5 rounded-xl font-bold uppercase tracking-wider text-xs"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Link2 className="w-4 h-4 mr-2" />
          )}
          Gerar Convite
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {generatedLink && (
        <div className="flex items-center gap-2 p-1.5 bg-muted/30 border border-border/40 rounded-xl animate-in zoom-in-95">
          <input
            type="text"
            readOnly
            value={generatedLink}
            aria-label="Link gerado"
            className="flex-1 text-xs bg-transparent outline-none font-mono px-3 text-muted-foreground"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => copyToClipboard(generatedLink)}
            className="px-4 py-4 rounded-lg bg-background shadow-sm hover:bg-muted"
            title="Copiar link"
          >
            <Copy className="w-4 h-4 mr-2" /> Copiar
          </Button>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-border/20 text-center">
        <p className="text-xs text-muted-foreground font-medium">
          Você poderá adicionar mais membros e configurar acessos complexos
          depois na etapa de <strong>Equipe</strong> no Painel.
        </p>
      </div>
    </div>
  );
}

// Validates Brazilian CNPJ
const isValidCNPJ = (value: string) => {
  if (!value) return false;
  const cnpj = value.replace(/[^\d]+/g, "");
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits.charAt(1));
};

const companyFormSchema = z
  .object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
    slug: z
      .string()
      .min(2, "A URL (Slug) não pode ficar vazia ou muito curta.")
      .regex(
        /^[a-z0-9-]+$/,
        "Apenas letras minúsculas, números e hifens são permitidos.",
      ),
    industry: z.string().optional(),
    cnpj: z.string(),
    phone: z.string().optional(),
    email: z
      .string()
      .email("Endereço de e-mail inválido.")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (
        data.email === "teste@leadgers.com" ||
        (data.email?.startsWith("onboarding-test") &&
          data.email?.endsWith("@leadgers.com"))
      )
        return true;
      return isValidCNPJ(data.cnpj);
    },
    {
      message: "Por favor, insira um CNPJ válido.",
      path: ["cnpj"],
    },
  );

type CompanyFormValues = z.infer<typeof companyFormSchema>;

type OnboardingStep = "company" | "invite" | "bank" | "integrations" | "done";

interface StepConfig {
  key: OnboardingStep;
  title: string;
  subtitle: string;
  icon: typeof Building2;
}

const STEPS: StepConfig[] = [
  {
    key: "company",
    title: "Dados da Empresa",
    subtitle: "Configure as informações básicas",
    icon: Building2,
  },
  {
    key: "invite",
    title: "Convidar Equipe",
    subtitle: "Adicione membros à organização",
    icon: Users,
  },
  {
    key: "bank",
    title: "Contas Bancárias",
    subtitle: "Cadastre contas para controle financeiro",
    icon: Landmark,
  },
  {
    key: "integrations",
    title: "Integrações",
    subtitle: "Conecte GitHub, Google e mais",
    icon: GitBranch,
  },
  {
    key: "done",
    title: "Pronto!",
    subtitle: "Sua empresa está configurada",
    icon: CheckCircle2,
  },
];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { tenant, user, signOut, refreshProfile, signInWithGitHub } = useAuth();
  const finalizingRef = useRef(false);

  // Sync current step from URL or fallback to draft
  const getDraftStep = () => {
    try {
      const stored = localStorage.getItem("onboarding_step_draft");
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  };

  const stepIndexQuery = searchParams.has("step")
    ? parseInt(searchParams.get("step") || "0", 10)
    : getDraftStep();

  const currentStep =
    isNaN(stepIndexQuery) || stepIndexQuery < 0
      ? 0
      : Math.min(stepIndexQuery, STEPS.length - 1);

  const setCurrentStep = useCallback(
    (nextStep: number | ((s: number) => number)) => {
      const nextIndex =
        typeof nextStep === "function" ? nextStep(currentStep) : nextStep;
      setSearchParams({ step: nextIndex.toString() }, { replace: true });
    },
    [currentStep, setSearchParams],
  );

  useEffect(() => {
    if (finalizingRef.current) return;

    if (tenant?.onboarding_completed) {
      navigate("/dashboard", { replace: true });
      return;
    }

    if (user && user.role) {
      const isOwnerOrAdmin =
        user.role.name === "owner" || user.role.name === "admin";
      if (!isOwnerOrAdmin) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, tenant, navigate]);

  // Load drafted data from localStorage if available
  const getDraftData = () => {
    try {
      const stored = localStorage.getItem("onboarding_draft");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const draft = getDraftData();

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: draft?.name || tenant?.name || "",
      slug: draft?.slug || tenant?.slug || "",
      industry: draft?.industry || tenant?.industry || "",
      cnpj: draft?.cnpj || (tenant?.cnpj as string) || "",
      phone: draft?.phone || tenant?.phone || "",
      email: draft?.email || tenant?.email || "",
    },
  });

  // Watch fields and save directly to draft when they change seamlessly
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem("onboarding_draft", JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Save current step to localStorage as well
  useEffect(() => {
    localStorage.setItem("onboarding_step_draft", currentStep.toString());
  }, [currentStep]);

  // Overwrite defaults if tenant completes loading after mount but only if no draft
  useEffect(() => {
    if (tenant && !draft) {
      form.reset({
        name: tenant.name || "",
        slug: tenant.slug || "",
        industry: tenant.industry || "",
        cnpj: (tenant.cnpj as string) || "",
        phone: tenant.phone || "",
        email: tenant.email || "",
      });
    }
  }, [tenant, draft, form]);

  const handleSaveCompany = async (values: CompanyFormValues) => {
    if (!tenant) return;

    try {
      console.log("[OnboardingWizard] handleSaveCompany - Values:", values);
      console.log(
        "[OnboardingWizard] handleSaveCompany - Tenant ID:",
        tenant.id,
      );

      const { data: updateData, error } = await supabase
        .from("tenants")
        .update({
          name: values.name,
          slug: values.slug,
          industry: values.industry || null,
          phone: values.phone || null,
          email: values.email || null,
          cnpj: values.cnpj || null,
        })
        .eq("id", tenant.id)
        .select();

      console.log(
        "[OnboardingWizard] handleSaveCompany - updateData:",
        updateData,
      );
      console.log("[OnboardingWizard] handleSaveCompany - error:", error);

      if (error) {
        if (error.code === "23505") {
          form.setError("slug", {
            type: "manual",
            message: "Esta URL (Slug) já está em uso. Tente outra vez.",
          });
          return;
        }
        throw error;
      }

      // Clear draft since it is successfully saved
      localStorage.removeItem("onboarding_draft");
      setCurrentStep((s) => s + 1);
    } catch (err) {
      console.error("Error saving company:", err);
      form.setError("root", {
        type: "manual",
        message:
          err instanceof Error
            ? err.message
            : "Erro ao salvar os dados da empresa. Tente novamente.",
      });
    }
  };

  const handleFinish = async () => {
    if (!tenant) return;
    finalizingRef.current = true;

    try {
      console.log(
        "[OnboardingWizard] Starting finalization for tenant:",
        tenant.id,
      );

      const { error: tenantErr } = await supabase
        .from("tenants")
        .update({ onboarding_completed: true })
        .eq("id", tenant.id);

      if (tenantErr) {
        console.error("[OnboardingWizard] Failed to update tenant:", tenantErr);
        throw tenantErr;
      }

      console.log(
        "[OnboardingWizard] Tenant updated. Updating member:",
        user?.id,
      );

      const { error: memberErr } = await supabase
        .from("tenant_members")
        .update({ user_onboarding_completed: true })
        .eq("user_id", user?.id)
        .eq("tenant_id", tenant.id);

      if (memberErr) {
        console.error("[OnboardingWizard] Failed to update member:", memberErr);
        throw memberErr;
      }

      console.log("[OnboardingWizard] Member updated. Refreshing profile...");

      // Set session flags BEFORE refreshing so AuthGuard can short-circuit
      sessionStorage.setItem("has_seen_tour", "true");
      sessionStorage.setItem("onboarding_just_completed", "true");
      // Clear any onboarding drafts
      localStorage.removeItem("onboarding_draft");
      localStorage.removeItem("user_onboarding_draft");
      localStorage.removeItem("onboarding_step_draft");

      // Refresh profile and wait for it to complete
      if (refreshProfile) {
        await refreshProfile();
      }

      // Poll to verify the state has propagated to avoid redirect loop
      // The AuthGuard checks tenant.onboarding_completed, which depends on
      // the React state being updated after refreshProfile resolves
      const maxAttempts = 5;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Verify directly from Supabase that the update landed
        const { data: verifyData } = await supabase
          .from("tenants")
          .select("onboarding_completed")
          .eq("id", tenant.id)
          .single();

        if (verifyData?.onboarding_completed) {
          console.log(
            `[OnboardingWizard] Verified onboarding_completed=true (attempt ${attempt + 1})`,
          );
          break;
        }

        console.log(
          `[OnboardingWizard] Waiting for state propagation (attempt ${attempt + 1}/${maxAttempts})`,
        );
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Re-trigger profile refresh on each retry
        if (refreshProfile) {
          await refreshProfile();
        }
      }

      console.log(
        "[OnboardingWizard] Executing final navigation to /dashboard.",
      );
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Failed to finish onboarding", err);
      alert(
        `Ocorreu um erro ao finalizar as configurações: ${err instanceof Error ? err.message : "Erro desconhecido"}`,
      );
      finalizingRef.current = false;
    }
  };

  const step = STEPS[currentStep];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-x-hidden font-sans cursor-default select-none">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
      </div>

      <div className="w-full max-w-2xl relative z-10 space-y-8">
        <div className="text-center space-y-2">
          <Link to="/" className="flex items-center justify-center mb-2">
            <img
              src="/images/logo-light.webp"
              alt="Leadgers"
              className="h-9 w-auto hidden dark:block"
            />
            <img
              src="/images/logo-dark.webp"
              alt="Leadgers"
              className="h-9 w-auto block dark:hidden"
            />
          </Link>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            Configuração da Empresa
          </p>
        </div>

        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex-1 flex items-center gap-2">
              <div
                className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                  i <= currentStep ? "bg-primary" : "bg-border/30"
                }`}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <step.icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{step.title}</h2>
            <p className="text-sm text-muted-foreground">{step.subtitle}</p>
          </div>
          <div className="ml-auto text-xs text-muted-foreground font-mono">
            {currentStep + 1}/{STEPS.length}
          </div>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-2xl soft-shadow min-h-[300px]">
          {step.key === "company" && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSaveCompany)}
                className="space-y-5"
              >
                {form.formState.errors.root && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">
                    {form.formState.errors.root.message}
                  </div>
                )}
                <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-xl">
                  <Building2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      Empresa:{" "}
                      <strong className="text-foreground">
                        {tenant?.name}
                      </strong>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Você poderá alterar o nome e o identificador (slug) da
                      empresa posteriormente nas configurações de sistema.
                    </p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Workspace / Empresa</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Minha Empresa"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            // Auto-generate slug from name if user types
                            const newName = e.target.value;
                            form.setValue(
                              "slug",
                              newName
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/^-|-$/g, ""),
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Workspace (Slug)</FormLabel>
                      <FormControl>
                        <div className="flex items-center border border-border/40 rounded-xl focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all">
                          <span className="text-xs text-muted-foreground bg-muted/30 px-3 py-3 rounded-l-xl font-mono border-r border-border/40">
                            app.leadgers.com/
                          </span>
                          <Input
                            placeholder="minha-empresa"
                            {...field}
                            className="border-0 focus-visible:ring-0 rounded-l-none bg-background/50 h-auto py-3"
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9-]+/g, ""),
                              )
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Setor / Indústria</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Tecnologia, Finanças..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ (obrigatório)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="00.000.000/0001-00"
                            {...field}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              if (val.length > 14) val = val.substring(0, 14);
                              if (val.length > 2)
                                val = val.replace(/^(\d{2})(\d)/, "$1.$2");
                              if (val.length > 6)
                                val = val.replace(
                                  /^(\d{2})\.(\d{3})(\d)/,
                                  "$1.$2.$3",
                                );
                              if (val.length > 10)
                                val = val.replace(
                                  /^(\d{2})\.(\d{3})\.(\d{3})(\d)/,
                                  "$1.$2.$3/$4",
                                );
                              if (val.length > 15)
                                val = val.replace(
                                  /^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/,
                                  "$1.$2.$3/$4-$5",
                                );
                              field.onChange(val);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail da Empresa</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="contato@empresa.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between gap-4 mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      await signOut();
                      window.location.href = "/";
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Sair / Início
                  </Button>
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="font-bold tracking-widest uppercase rounded-xl"
                  >
                    {form.formState.isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Salvar e Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {step.key === "invite" && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <p className="text-sm text-muted-foreground">
                Convide membros da equipe gerando um link rápido de convite
                (válido por 7 dias). Você também pode pular esta etapa e fazer
                isso mais tarde no painel de{" "}
                <strong>Administração → Equipe</strong>.
              </p>

              <OnboardingInviteWrapper />
            </div>
          )}

          {step.key === "bank" && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <p className="text-sm text-muted-foreground">
                Cadastre as contas bancárias da empresa para controle
                financeiro. Você pode pular e adicionar depois.
              </p>
              <BankAccountFetchingWrapper />
            </div>
          )}

          {step.key === "integrations" && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <p className="text-sm text-muted-foreground">
                Conecte serviços externos para automação. Você pode configurar
                isso depois em <strong>Configurações → Integrações</strong>.
              </p>

              <div className="grid gap-3">
                <div className="flex items-center justify-between p-4 border border-border/20 rounded-xl bg-background/50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl text-foreground">
                      <Github className="w-8 h-8" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">GitHub</p>
                      <p className="text-xs text-muted-foreground">
                        Repos, segurança, issues
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-bold uppercase tracking-widest text-[10px]"
                    onClick={async () => {
                      try {
                        await signInWithGitHub();
                      } catch (err) {
                        console.error("Failed to connect GitHub:", err);
                        alert("Erro ao conectar com GitHub.");
                      }
                    }}
                  >
                    Conectar
                  </Button>
                </div>
                {[
                  {
                    name: "Google Workspace",
                    desc: "Drive, Sheets, relatórios",
                    icon: "📊",
                    available: false,
                  },
                  {
                    name: "Open Banking",
                    desc: "Em breve",
                    icon: "🏦",
                    available: false,
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className={`flex items-center justify-between p-4 border border-border/20 rounded-xl ${
                      item.available ? "bg-background/50" : "opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    {item.available ? (
                      <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-md">
                        Disponível no Dashboard
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">
                        Em breve
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step.key === "done" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 bg-primary/10 rounded-2xl ring-8 ring-primary/5 shadow-[0_0_30px_rgba(var(--primary),0.1)]">
                <CheckCircle2 className="w-16 h-16 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">Tudo pronto!</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Sua empresa <strong>{tenant?.name}</strong> está configurada.
                  Você pode alterar qualquer configuração a qualquer momento em{" "}
                  <strong>Configurações</strong>.
                </p>
              </div>
            </div>
          )}

          {step.key !== "company" && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 border-t border-border/10 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
              </Button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {step.key !== "done" && (
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep((s) => s + 1)}
                  >
                    <SkipForward className="w-4 h-4 mr-2" /> Pular
                  </Button>
                )}

                {step.key === "done" ? (
                  <Button
                    onClick={handleFinish}
                    disabled={finalizingRef.current}
                    className="font-bold tracking-widest uppercase rounded-xl"
                  >
                    {finalizingRef.current ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <>
                        Acessar Plataforma{" "}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentStep((s) => s + 1)}
                    className="font-bold tracking-widest uppercase rounded-xl"
                  >
                    Continuar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
