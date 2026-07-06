import { useState, useRef } from "react";
import {
  User,
  Mail,
  Shield,
  Building2,
  FolderOpen,
  Camera,
  KeyRound,
  Smartphone,
  CheckCircle2,
  Save,
  MailPlus,
  Globe,
  Clock,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { useTenant } from "../../auth/context/TenantContext";

export default function ProfilePage() {
  const navigate = useNavigate();
  const {
    profile,
    loading,
    saving,
    updateName,
    updateAvatar,
    updateSecondaryEmail,
    updateEmail,
    requestPasswordReset,
  } = useProfile();

  const [nameInput, setNameInput] = useState("");
  const [nameEditing, setNameEditing] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailEditing, setEmailEditing] = useState(false);
  const [emailChangeRequested, setEmailChangeRequested] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [secondaryEmailInput, setSecondaryEmailInput] = useState("");
  const [secondaryEmailEditing, setSecondaryEmailEditing] = useState(false);
  const [secondaryEmailSaved, setSecondaryEmailSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { availableTenants, switchTenant } = useTenant();
  const [switchingTenant, setSwitchingTenant] = useState<string | null>(null);

  const {
    preferences,
    loading: prefsLoading,
    updatePreferences,
    saving: prefsSaving,
  } = useUserPreferences();

  const handleUpdatePref = async (key: string, value: any) => {
    await updatePreferences({ [key]: value });
  };

  const handleSwitchTenant = async (id: string) => {
    setSwitchingTenant(id);
    await switchTenant(id);
    setSwitchingTenant(null);
  };

  if (loading || prefsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Carregando perfil e preferências...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar os dados do perfil.
        </p>
      </div>
    );
  }

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    await updateName(nameInput.trim());
    setNameEditing(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await updateAvatar(file);
  };

  const handlePasswordReset = async () => {
    await requestPasswordReset();
    setPasswordResetSent(true);
    setTimeout(() => setPasswordResetSent(false), 5000);
  };

  const handleSaveSecondaryEmail = async () => {
    if (!secondaryEmailInput.trim()) return;
    await updateSecondaryEmail(secondaryEmailInput.trim());
    setSecondaryEmailEditing(false);
    setSecondaryEmailSaved(true);
    setTimeout(() => setSecondaryEmailSaved(false), 3000);
  };

  const handleSaveEmail = async () => {
    if (!emailInput.trim() || emailInput === profile.email) {
      setEmailEditing(false);
      return;
    }
    await updateEmail(emailInput.trim());
    setEmailEditing(false);
    setEmailChangeRequested(true);
  };

  const activeProjects = profile.projects.filter((p) => p.status === "active");
  const inactiveProjects = profile.projects.filter(
    (p) => p.status !== "active",
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 p-6 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">
          Perfil do Agente
        </h1>
        <p className="text-sm text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">
          Gerenciamento de credenciais e integridade de acesso
        </p>
      </div>

      {/* Avatar & Name Card */}
      <div className="glass-panel rounded-3xl p-10 shadow-2xl relative overflow-hidden group/card shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-40" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          {/* Avatar */}
          <div className="relative group/avatar">
            <div className="w-32 h-32 rounded-3xl bg-background/50 border border-border/60 flex items-center justify-center shadow-inner overflow-hidden relative ring-8 ring-primary/5 group-hover/avatar:scale-105 transition-all duration-500">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-primary/40" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 disabled:cursor-not-allowed backdrop-blur-sm"
            >
              <Camera className="w-8 h-8 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Name & Email */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              {nameEditing ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="flex-1 px-5 py-3 text-sm bg-background/50 border border-primary/40 rounded-xl text-foreground focus:outline-none focus:ring-4 focus:ring-primary/5 font-bold"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") setNameEditing(false);
                    }}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving}
                    className="p-3 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setNameInput(profile.fullName);
                    setNameEditing(true);
                  }}
                  className="text-4xl font-black text-foreground hover:text-primary transition-colors pr-8 tracking-tighter"
                >
                  {profile.fullName || "Agente sem Identidade"}
                </button>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              {emailEditing ? (
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="flex-1 px-5 py-3 text-sm bg-background/50 border border-primary/40 rounded-xl text-foreground focus:outline-none focus:ring-4 focus:ring-primary/5 font-bold"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEmail();
                      if (e.key === "Escape") setEmailEditing(false);
                    }}
                  />
                  <button
                    onClick={handleSaveEmail}
                    disabled={saving}
                    className="p-3 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEmailInput(profile.email);
                    setEmailEditing(true);
                  }}
                  className="group/email flex items-center gap-2 text-sm text-muted-foreground font-medium hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4 opacity-40" />
                  {profile.email}
                  <span className="text-[10px] text-primary opacity-0 group-hover/email:opacity-100 transition-all font-black uppercase tracking-widest ml-2 px-2 py-0.5 bg-primary/5 rounded-md border border-primary/10">
                    Alterar
                  </span>
                </button>
              )}
            </div>

            {emailChangeRequested && (
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1 animate-pulse bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 inline-block">
                Sincronizando: Confirme o novo e-mail
              </p>
            )}

            <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary border border-primary/20 shadow-sm">
                <Shield className="w-3.5 h-3.5" />
                {profile.roleName}
              </span>
              {profile.emailConfirmedAt && !emailChangeRequested && (
                <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary opacity-60">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verificado
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tenants Info */}
      <div className="glass-panel rounded-3xl p-10 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              Organizações Vinculadas
            </h2>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border/40">
          {availableTenants.length === 0 ? (
            <p className="text-sm text-muted-foreground italic opacity-50">
              Nenhuma organização encontrada.
            </p>
          ) : (
            availableTenants.map((t) => {
              const isCurrent = t.id === profile.tenantId;
              return (
                <div
                  key={t.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border transition-all ${
                    isCurrent
                      ? "bg-primary/5 border-primary/20 shadow-sm"
                      : "bg-background/30 border-border/40 hover:bg-background/50 hover:border-border"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-foreground tracking-tighter italic">
                        {t.name}
                      </span>
                      {isCurrent && (
                        <span className="px-3 py-1 rounded-lg bg-primary/10 text-[9px] text-primary font-black uppercase tracking-widest border border-primary/20 shadow-inner">
                          Ativa
                        </span>
                      )}
                    </div>
                    {t.domain && (
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">
                        {t.domain}
                      </p>
                    )}
                  </div>

                  {!isCurrent && (
                    <button
                      onClick={() => handleSwitchTenant(t.id)}
                      disabled={switchingTenant === t.id}
                      className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-muted border border-border/60 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {switchingTenant === t.id ? "Trocando..." : "Acessar"}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Connected Projects */}
      <div className="glass-panel rounded-3xl p-10 shadow-xl space-y-8">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-5 h-5 text-primary" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            Atribuições de Campo
          </h2>
        </div>

        {profile.projects.length === 0 ? (
          <p className="text-sm text-muted-foreground italic opacity-50 text-center py-6">
            Nenhuma atribuição de campo registrada no radar.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeProjects.length > 0 && (
              <div className="space-y-4">
                <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] ml-2">
                  Operações Ativas
                </p>
                <div className="space-y-3">
                  {activeProjects.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border/40 shadow-sm"
                    >
                      <span className="text-xs font-bold text-foreground">
                        {p.name}
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-primary/5 text-[9px] font-black text-primary uppercase tracking-widest border border-primary/10">
                        {p.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {inactiveProjects.length > 0 && (
              <div className="space-y-4">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] ml-2">
                  Ciclos Concluídos
                </p>
                <div className="space-y-3">
                  {inactiveProjects.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-border/20 opacity-60"
                    >
                      <span className="text-xs font-bold text-foreground">
                        {p.name}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Agent Preferences */}
      <div className="glass-panel rounded-3xl p-10 shadow-xl space-y-10">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            Preferências do Agente
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Localization */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/80 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Localização & Língua
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">
                  Idioma da Interface
                </label>
                <select
                  value={preferences?.language || "pt-BR"}
                  onChange={(e) => handleUpdatePref("language", e.target.value)}
                  disabled={prefsSaving}
                  className="w-full px-5 py-3 text-xs bg-background/50 border border-border/60 rounded-xl text-foreground focus:outline-none focus:ring-4 focus:ring-primary/5 font-bold appearance-none cursor-pointer"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-2">
                  Fuso Horário (Timezone)
                </label>
                <select
                  value={preferences?.timezone || "America/Sao_Paulo"}
                  onChange={(e) => handleUpdatePref("timezone", e.target.value)}
                  disabled={prefsSaving}
                  className="w-full px-5 py-3 text-xs bg-background/50 border border-border/60 rounded-xl text-foreground focus:outline-none focus:ring-4 focus:ring-primary/5 font-bold appearance-none cursor-pointer"
                >
                  <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                  <option value="America/New_York">New York (GMT-5)</option>
                  <option value="Europe/London">London (GMT+0)</option>
                  <option value="UTC">UTC (Universal)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/80 flex items-center gap-2">
              <Bell className="w-4 h-4" /> Canais de Notificação
            </h3>
            <div className="space-y-4">
              {[
                {
                  key: "notifications_email",
                  label: "Relatórios via E-mail",
                  icon: Mail,
                },
                {
                  key: "notifications_push",
                  label: "Push Notifications (Browser)",
                  icon: Smartphone,
                },
                {
                  key: "notifications_in_app",
                  label: "Notificações In-App",
                  icon: Bell,
                },
              ].map((channel) => (
                <div
                  key={channel.key}
                  className="flex items-center justify-between p-4 rounded-2xl bg-background/30 border border-border/40 hover:bg-background/50 transition-all cursor-pointer group/pref"
                  onClick={() =>
                    handleUpdatePref(
                      channel.key,
                      !(preferences as any)?.[channel.key],
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <channel.icon className="w-4 h-4 text-muted-foreground group-hover/pref:text-primary transition-colors" />
                    <span className="text-xs font-bold text-foreground">
                      {channel.label}
                    </span>
                  </div>
                  <div
                    className={`w-10 h-5 rounded-full transition-all relative ${
                      (preferences as any)?.[channel.key]
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${
                        (preferences as any)?.[channel.key]
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="glass-panel rounded-3xl p-10 shadow-2xl space-y-10 mb-12">
        <div className="flex items-center gap-3">
          <KeyRound className="w-5 h-5 text-primary" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            Protocolos de Segurança
          </h2>
        </div>

        <div className="space-y-8">
          {/* Password */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-3xl bg-background/30 border border-border/40 group/item">
            <div className="space-y-1">
              <p className="text-sm font-black text-foreground uppercase tracking-tighter italic">
                Criptografia de Acesso
              </p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">
                Redefinir chave mestra de autenticação
              </p>
            </div>
            <button
              onClick={handlePasswordReset}
              disabled={passwordResetSent}
              className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ring-4 ring-primary/5 ${
                passwordResetSent
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105"
              }`}
            >
              {passwordResetSent ? "Link Enviado ✓" : "Solicitar Reset"}
            </button>
          </div>

          {/* MFA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-3xl bg-background/30 border border-border/40 group/item">
            <div className="flex items-center gap-4">
              <div
                className={`p-4 rounded-2xl ${profile.mfaEnabled ? "bg-primary/10 text-primary" : "bg-muted/20 text-muted-foreground"} border border-current/10`}
              >
                <Smartphone className="w-5 h-5 shadow-sm" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-foreground uppercase tracking-tighter italic">
                  Multi-fator (MFA/2FA)
                </p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">
                  {profile.mfaEnabled
                    ? "Status: Blindagem Ativa"
                    : "Status: Vulnerável — Requer Ativação"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profile.mfaEnabled ? (
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary px-4 py-2 bg-primary/5 rounded-xl border border-primary/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Blindado
                </span>
              ) : (
                <button
                  onClick={() => navigate("/auth/mfa-setup")}
                  className="px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all ring-4 ring-primary/5"
                >
                  Configurar
                </button>
              )}
            </div>
          </div>

          {/* Secondary Recovery Email */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-3xl bg-background/30 border border-border/40 group/item">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-muted/20 text-muted-foreground border border-current/10">
                <MailPlus className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-foreground uppercase tracking-tighter italic">
                  Canal de Recuperação
                </p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">
                  {profile.secondaryEmail || "Nenhum canal secundário"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {secondaryEmailEditing ? (
                <div className="flex items-center gap-3">
                  <input
                    type="email"
                    value={secondaryEmailInput}
                    onChange={(e) => setSecondaryEmailInput(e.target.value)}
                    placeholder="backup@email.com"
                    className="w-56 px-4 py-2.5 text-xs bg-background/50 border border-primary/40 rounded-xl text-foreground focus:outline-none focus:ring-4 focus:ring-primary/5 font-bold"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveSecondaryEmail();
                      if (e.key === "Escape") setSecondaryEmailEditing(false);
                    }}
                  />
                  <button
                    onClick={handleSaveSecondaryEmail}
                    disabled={saving}
                    className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              ) : secondaryEmailSaved ? (
                <span className="text-[10px] text-primary font-black uppercase tracking-widest px-4 py-2 bg-primary/5 rounded-xl border border-primary/20">
                  Sincronizado ✓
                </span>
              ) : (
                <button
                  onClick={() => {
                    setSecondaryEmailInput(profile.secondaryEmail || "");
                    setSecondaryEmailEditing(true);
                  }}
                  className="px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl bg-muted border border-border/60 text-foreground hover:bg-background transition-all"
                >
                  {profile.secondaryEmail ? "Atualizar" : "Vincular"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
