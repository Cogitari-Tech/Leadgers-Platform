import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type FormEvent,
} from "react";
import { supabase } from "../../../config/supabase";
import { apiClient } from "../../../shared/utils/apiClient";
import { useAuth } from "../../auth/context/AuthContext";
import type { BankAccount } from "../../auth/types/auth.types";
import {
  Building2,
  Save,
  Loader2,
  Shield,
  Github,
  FileText,
  ExternalLink,
  ChevronRight,
  Globe,
  Link2,
  Camera,
  Brain,
  Landmark,
  BellRing,
  ShieldCheck,
  Sparkles,
  Mail,
} from "lucide-react";

import { Link } from "react-router-dom";
import { TwoFactorSetup } from "../../auth/components/TwoFactorSetup";
import { GitHubConnect } from "../../github/components/GitHubConnect";
import { GoogleWorkspaceConnect } from "../components/GoogleWorkspaceConnect";
import { BankAccountForm } from "../components/BankAccountForm";

interface AiSettings {
  proactivity_level: string;
  tone: string;
  insight_focus: string[];
}

const PROACTIVITY_LEVELS = [
  { value: "low", label: "Discreto", desc: "Apenas quando solicitado" },
  { value: "medium", label: "Moderado", desc: "Alertas relevantes" },
  { value: "high", label: "Proativo", desc: "Insights frequentes" },
];

const TONE_OPTIONS = [
  { value: "professional", label: "Profissional" },
  { value: "casual", label: "Conversacional" },
  { value: "executive", label: "Executivo" },
];

const FOCUS_AREAS = [
  { value: "finance", label: "Financeiro" },
  { value: "burn_rate", label: "Burn Rate" },
  { value: "product", label: "Produto" },
  { value: "compliance", label: "Compliance" },
  { value: "team", label: "Equipe" },
  { value: "commercial", label: "Comercial" },
];

export function TenantSettings() {
  const { tenant } = useAuth();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [domain, setDomain] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Settings state
  const [aiSettings, setAiSettings] = useState<AiSettings>({
    proactivity_level: "medium",
    tone: "professional",
    insight_focus: ["finance", "burn_rate"],
  });
  const [aiSaving, setAiSaving] = useState(false);
  const [aiSaved, setAiSaved] = useState(false);

  // Open Finance — Bank Accounts
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankLoading, setBankLoading] = useState(true);

  const fetchBankAccounts = useCallback(async () => {
    if (!tenant) return;
    setBankLoading(true);
    const { data } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("is_primary", { ascending: false });
    setBankAccounts(data ?? []);
    setBankLoading(false);
  }, [tenant]);

  useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);

  useEffect(() => {
    apiClient
      .get<AiSettings>("/ai/config")
      .then((data) => {
        if (data) setAiSettings(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!tenant) return;
    setName(tenant.name);
    setSlug(tenant.slug);
    setDomain(tenant.domain ?? "");
    setLogoUrl(tenant.logo_url ?? "");
  }, [tenant]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tenant) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `tenant-logos/${tenant.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("audit-evidences")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("audit-evidences").getPublicUrl(path);

      setLogoUrl(publicUrl);
    } catch (err) {
      console.error("Logo upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    setSaving(true);
    setSaved(false);

    await supabase
      .from("tenants")
      .update({
        name,
        domain: domain || null,
        logo_url: logoUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tenant.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateTenantSetting = async (key: string, value: any) => {
    if (!tenant) return;
    const newSettings = { ...(tenant.settings || {}), [key]: value };
    await supabase
      .from("tenants")
      .update({ settings: newSettings })
      .eq("id", tenant.id);
    // Note: Local state update would be better via context but for now we rely on re-fetch or page reload for simple toggles
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-foreground font-display flex items-center gap-4">
              <Building2 className="w-10 h-10 text-primary" />
              Gestão Organizacional
            </h1>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">
              Identidade visual, governança e parâmetros globais
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="glass-panel rounded-3xl p-8 md:p-12 space-y-12 shadow-2xl relative overflow-hidden group/form transition-all"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 opacity-40 group-hover/form:opacity-100 transition-opacity" />

          <div className="flex flex-col md:flex-row items-center gap-8 pb-12 border-b border-border/40">
            <div className="relative group/logo">
              <div className="h-32 w-32 rounded-3xl bg-background/50 border border-border/60 flex items-center justify-center shadow-inner overflow-hidden group-hover/logo:scale-105 transition-all duration-500 relative ring-8 ring-primary/5">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={name}
                    className="h-28 w-28 rounded-3xl object-cover shadow-2xl"
                  />
                ) : (
                  <Building2 className="h-12 w-12 text-primary/40" />
                )}
                <button
                  type="button"
                  aria-label="Fazer upload de logotipo"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-all duration-300 disabled:cursor-not-allowed backdrop-blur-sm"
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <div className="absolute -bottom-2 -right-2 bg-background border border-border/40 rounded-full p-2 shadow-xl ring-4 ring-background">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
              </div>
            </div>
            <div className="text-center md:text-left space-y-2">
              <h2 className="text-3xl font-black text-foreground tracking-tight">
                {name || "Sua Empresa"}
              </h2>
              <div className="flex items-center gap-4 mt-2 justify-center md:justify-start">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                  Ambiente Seguro
                </span>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">
                  Business Plan:{" "}
                  <span className="text-foreground opacity-100">
                    {tenant?.plan ?? "Enterprise"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
            <div className="space-y-3">
              <label
                htmlFor="companyName"
                className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 ml-2"
              >
                Razão Social / Nome Fantasia
              </label>
              <div className="relative group/input">
                <input
                  id="companyName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nome da Organização"
                  className="glass-input w-full rounded-2xl px-6 py-5 text-sm font-bold text-foreground"
                />
              </div>
            </div>

            <div className="space-y-3 opacity-60 focus-within:opacity-100 transition-opacity">
              <label
                htmlFor="companySlug"
                className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 ml-2"
              >
                Identificador da Instância (Slug)
              </label>
              <div className="relative">
                <input
                  id="companySlug"
                  type="text"
                  value={slug}
                  disabled
                  className="glass-input w-full rounded-2xl px-6 py-5 text-sm font-bold text-muted-foreground cursor-not-allowed italic opacity-70"
                />
                <Link2 className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/20" />
              </div>
              <p className="px-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">
                Imutável para integridade de dados.
              </p>
            </div>

            <div className="space-y-3">
              <label
                htmlFor="companyDomain"
                className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 ml-2"
              >
                Domínio Autorizado
              </label>
              <div className="relative group/input">
                <input
                  id="companyDomain"
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="empresa.com.br"
                  className="glass-input w-full rounded-2xl px-6 py-5 text-sm font-bold text-foreground"
                />
                <Globe className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-hover/input:text-primary transition-colors" />
              </div>
            </div>

            <div className="space-y-3">
              <label
                htmlFor="companyLogoUrl"
                className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 ml-2"
              >
                Logotipo Remoto (CDN)
              </label>
              <div className="relative group/input">
                <input
                  id="companyLogoUrl"
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://cdn.empresa.com/logo.png"
                  className="glass-input w-full rounded-2xl px-6 py-5 text-sm font-bold text-foreground"
                />
                <FileText className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-hover/input:text-primary transition-colors" />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-pulse ring-4 ring-primary/5" />
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">
                Privilégios de Administrador Master
              </p>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto">
              {saved && (
                <span className="text-[10px] text-primary font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-4">
                  ✓ Sincronizado com Sucesso
                </span>
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-4 rounded-2xl bg-primary px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-primary-foreground shadow-2xl shadow-primary/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 w-full md:w-auto ring-4 ring-primary/5"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {saving ? "Salvando..." : "Aplicar Alterações"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Security & System Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Security Settings Section */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="space-y-1 px-4">
            <h2 className="text-3xl font-black text-foreground font-display flex items-center gap-4">
              <Shield className="w-8 h-8 text-primary" /> Multi-fator
            </h2>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">
              Controle de acesso e redundância de proteção
            </p>
          </div>
          <div className="glass-panel rounded-3xl shadow-xl overflow-hidden min-h-[400px]">
            <TwoFactorSetup />
          </div>
        </div>

        {/* GitHub Integration Section */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
          <div className="space-y-1 px-4">
            <h2 className="text-3xl font-black text-foreground font-display flex items-center gap-4">
              <Github className="w-9 h-9" /> Ecossistema
            </h2>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">
              Integração nativa com Cloud Provider e Repos
            </p>
          </div>
          <div className="glass-panel rounded-3xl shadow-xl overflow-hidden min-h-[400px]">
            <GitHubConnect />
          </div>
        </div>
      </div>

      {/* Google Workspace Integration */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        <div className="space-y-1 px-4">
          <h2 className="text-3xl font-black text-foreground font-display flex items-center gap-4">
            <Globe className="w-8 h-8 text-[#4285F4]" /> Google Workspace
          </h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">
            Integração com Gmail, Calendar e Drive
          </p>
        </div>
        <div className="glass-panel rounded-3xl shadow-xl overflow-hidden min-h-[320px]">
          <GoogleWorkspaceConnect />
        </div>
      </div>

      {/* Open Finance — Bank Accounts */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        <div className="space-y-1 px-4">
          <h2 className="text-3xl font-black text-foreground font-display flex items-center gap-4">
            <Landmark className="w-8 h-8 text-primary" /> Open Finance
          </h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">
            Contas bancárias vinculadas à organização
          </p>
        </div>
        <div className="glass-panel rounded-3xl shadow-xl overflow-hidden p-8 md:p-12">
          {bankLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <BankAccountForm
              accounts={bankAccounts}
              onUpdate={fetchBankAccounts}
            />
          )}
        </div>
      </div>

      {/* AI Intelligence Configuration */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        <div className="space-y-1 px-4">
          <h2 className="text-3xl font-black text-foreground font-display flex items-center gap-4">
            <Brain className="w-8 h-8 text-primary" /> Inteligência Artificial
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
              Em breve
            </span>
          </h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">
            Configuração Granular de IA — Proatividade, Tom e Foco
          </p>
        </div>

        <div className="glass-panel rounded-3xl shadow-xl overflow-hidden p-8 md:p-12 space-y-10 opacity-50 pointer-events-none select-none relative">
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="bg-card/80 backdrop-blur-sm border border-border/60 rounded-2xl px-8 py-4 shadow-xl">
              <p className="text-sm font-black text-foreground uppercase tracking-wider">
                Funcionalidade em desenvolvimento
              </p>
              <p className="text-[10px] text-muted-foreground text-center mt-1">
                Estará disponível em breve
              </p>
            </div>
          </div>
          {/* Proactivity Level */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 ml-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Nível de Proatividade
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PROACTIVITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() =>
                    setAiSettings((prev) => ({
                      ...prev,
                      proactivity_level: level.value,
                    }))
                  }
                  className={`group relative flex flex-col p-6 rounded-2xl border transition-all duration-300 text-left ${
                    aiSettings.proactivity_level === level.value
                      ? "border-primary bg-primary/5 ring-4 ring-primary/10 shadow-lg"
                      : "border-border/40 bg-background/30 hover:border-primary/30 hover:bg-background/50"
                  }`}
                >
                  <span
                    className={`text-sm font-black ${
                      aiSettings.proactivity_level === level.value
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {level.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-1 opacity-70">
                    {level.desc}
                  </span>
                  {aiSettings.proactivity_level === level.value && (
                    <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 ml-2">
              Tom de Comunicação
            </label>
            <div className="flex flex-wrap gap-3">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone.value}
                  type="button"
                  onClick={() =>
                    setAiSettings((prev) => ({ ...prev, tone: tone.value }))
                  }
                  className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                    aiSettings.tone === tone.value
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "border border-border/40 bg-background/30 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {tone.label}
                </button>
              ))}
            </div>
          </div>

          {/* Focus Areas */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 ml-2">
              Áreas de Foco dos Insights
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {FOCUS_AREAS.map((area) => {
                const isActive = aiSettings.insight_focus.includes(area.value);
                return (
                  <button
                    key={area.value}
                    type="button"
                    onClick={() => {
                      setAiSettings((prev) => ({
                        ...prev,
                        insight_focus: isActive
                          ? prev.insight_focus.filter((f) => f !== area.value)
                          : [...prev.insight_focus, area.value],
                      }));
                    }}
                    className={`px-5 py-4 rounded-2xl text-xs font-bold transition-all duration-300 ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/30 shadow-sm"
                        : "border border-border/30 text-muted-foreground hover:border-primary/20 bg-background/20"
                    }`}
                  >
                    {area.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save AI Settings */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-border/30">
            {aiSaved && (
              <span className="text-[10px] text-primary font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-4">
                ✓ Configuração de IA Salva
              </span>
            )}
            <button
              type="button"
              disabled={aiSaving}
              onClick={async () => {
                setAiSaving(true);
                setAiSaved(false);
                try {
                  await apiClient.patch("/ai/config", aiSettings);
                  setAiSaved(true);
                  setTimeout(() => setAiSaved(false), 3000);
                } catch (err) {
                  console.error("Error saving AI config:", err);
                } finally {
                  setAiSaving(false);
                }
              }}
              className="flex items-center gap-3 rounded-2xl bg-primary px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 ring-4 ring-primary/5"
            >
              {aiSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
              {aiSaving ? "Salvando..." : "Salvar Configuração IA"}
            </button>
          </div>
        </div>
      </div>

      {/* Global Notification Policies */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        <div className="space-y-1 px-4 text-center">
          <h2 className="text-3xl font-black text-foreground font-display flex items-center justify-center gap-4">
            <BellRing className="w-8 h-8 text-primary" /> Políticas de
            Notificação
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
              Em breve
            </span>
          </h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">
            Governança de comunicação e alertas automáticos
          </p>
        </div>

        <div className="glass-panel rounded-3xl shadow-xl overflow-hidden p-8 md:p-12 opacity-50 pointer-events-none select-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                key: "silence_all_emails",
                label: "Silenciar E-mails Globais",
                desc: "Desabilita todos os disparos de e-mail automatizados para membros desta organização.",
                icon: Mail,
              },
              {
                key: "enforce_mfa_alerts",
                label: "Alertas de Integridade MFA",
                desc: "Notificar administradores quando usuários acessarem sem blindagem multi-fator.",
                icon: ShieldCheck,
              },
              {
                key: "activity_digest",
                label: "Resumo Diário de Atividade",
                desc: "Enviar um sumário de todas as ações de auditoria nas últimas 24h para os gestores.",
                icon: FileText,
              },
              {
                key: "security_anomaly_alerts",
                label: "Alertas de Anomalia",
                desc: "IA detecta e notifica acessos ou alterações atípicas no padrão de segurança.",
                icon: Brain,
              },
            ].map((policy) => {
              const isActive = (tenant?.settings as any)?.[policy.key] ?? false;
              return (
                <div
                  key={policy.key}
                  className="glass-card flex items-center justify-between p-6 rounded-3xl cursor-pointer group/policy hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                  onClick={() => updateTenantSetting(policy.key, !isActive)}
                >
                  <div className="flex items-center gap-4 pr-6">
                    <div
                      className={`p-4 rounded-2xl ${isActive ? "bg-primary/20 text-primary" : "bg-muted/30 text-muted-foreground"} border border-current/10 transition-colors`}
                    >
                      <policy.icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-foreground uppercase tracking-tighter italic">
                        {policy.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium leading-relaxed opacity-60">
                        {policy.desc}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${
                      isActive
                        ? "bg-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                        : "bg-muted"
                    }`}
                  >
                    <div
                      className={`absolute top-1.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${
                        isActive ? "left-7" : "left-2"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legal Documentation Section */}
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-600">
        <div className="space-y-1 px-4 text-center">
          <h2 className="text-3xl font-black text-foreground font-display flex items-center justify-center gap-4">
            <FileText className="w-8 h-8 text-primary" /> Conformidade e
            Governança
          </h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">
            Base legal e diretrizes de privacidade
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
          {[
            {
              to: "/termos",
              label: "Termos de Uso",
              desc: "Parâmetros e permissões de utilização da licença corporativa.",
              color: "primary",
            },
            {
              to: "/privacidade",
              label: "Proteção LGPD",
              desc: "Tratamento de dados sensíveis e auditoria de logs criptografados.",
              color: "emerald",
            },
            {
              to: "/disclaimer",
              label: "Limites Legais",
              desc: "Isenções, responsabilidades e avisos de segurança preditiva.",
              color: "amber",
            },
          ].map((doc) => (
            <Link
              key={doc.to}
              to={doc.to}
              target="_blank"
              className="glass-card group relative flex flex-col p-10 rounded-3xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-500"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-xl font-black text-foreground group-hover:text-primary transition-colors pr-6 leading-tight">
                  {doc.label}
                </span>
                <ExternalLink className="w-6 h-6 text-muted-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-1 group-hover:-translate-y-1 duration-300" />
              </div>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed opacity-80">
                {doc.desc}
              </p>
              <div className="mt-10 flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary opacity-0 group-hover:opacity-100 transition-all duration-500">
                  Visualizar Documento
                </span>
                <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 duration-500" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="py-16 flex flex-col items-center gap-6 opacity-30">
        <div className="h-px w-48 bg-gradient-to-r from-transparent via-border to-transparent" />
        <p className="text-[11px] font-black uppercase tracking-[0.6em] text-muted-foreground">
          Leadgers Cyber-Intelligence Protocol 2026
        </p>
      </div>
    </div>
  );
}
