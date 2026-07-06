import { useState } from "react";
import { useTeamManagement } from "../hooks/useTeamManagement";
import { useAuth } from "../../auth/context/AuthContext";
import {
  UserPlus,
  Shield,
  Search,
  X,
  Users,
  Link2,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  Loader2,
  MoreVertical,
  Trash2,
  Ban,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

type ActiveTab = "members" | "requests" | "links";

export function TeamManagement() {
  const { user } = useAuth();
  const {
    members,
    roles,
    accessRequests,
    inviteLinks,
    loading,
    error,
    approveRequest,
    rejectRequest,
    generateInviteLink,
    revokeInviteLink,
    changeMemberRole,
    removeMember,
    suspendMember,
    reactivateMember,
  } = useTeamManagement();

  const [activeTab, setActiveTab] = useState<ActiveTab>("members");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionMemberId, setActionMemberId] = useState<string | null>(null);

  // Invite link creation
  const [showCreateLink, setShowCreateLink] = useState(false);
  const [linkRoleId, setLinkRoleId] = useState("");
  const [linkMaxUses, setLinkMaxUses] = useState(1);
  const [linkExpiresDays, setLinkExpiresDays] = useState(7);
  const [linkLabel, setLinkLabel] = useState("");
  const [linkEmail, setLinkEmail] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Approve request
  const [approveRoleId, setApproveRoleId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const currentUserRole = user?.role;
  const canManageTeam =
    currentUserRole?.name === "owner" || currentUserRole?.name === "admin";

  const getRoleBadgeColor = (roleName: string) => {
    const map: Record<string, string> = {
      owner: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      admin: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      manager: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      auditor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      analyst: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      viewer: "bg-zinc-500/10 text-muted-foreground border-zinc-500/20",
    };
    return map[roleName] ?? "bg-muted text-muted-foreground border-border/40";
  };

  const handleGenerateLink = async () => {
    if (!linkRoleId) return;
    setGenerating(true);
    const url = await generateInviteLink(
      linkRoleId,
      linkMaxUses,
      linkExpiresDays,
      linkLabel || undefined,
      linkEmail || undefined,
    );
    if (url) setGeneratedLink(url);
    setGenerating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleApprove = async (requestId: string, roleId: string) => {
    setApprovingId(requestId);
    await approveRequest(requestId, roleId);
    setApprovingId(null);
    setApproveRoleId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const tabs: {
    key: ActiveTab;
    label: string;
    icon: typeof Users;
    count?: number;
  }[] = [
    {
      key: "members",
      label: "Equipe Ativa",
      icon: Users,
      count: members.length,
    },
    {
      key: "requests",
      label: "Solicitações",
      icon: Clock,
      count: accessRequests.length,
    },
    {
      key: "links",
      label: "Links de Convite",
      icon: Link2,
      count: inviteLinks.length,
    },
  ];

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
            Gestão de Equipe
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Gerencie membros da organização, solicitações pendentes e convites
            externos.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-2xl text-sm text-destructive font-bold animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex p-1.5 bg-muted/30 border border-border/20 backdrop-blur-sm rounded-2xl shadow-inner max-w-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex-1 justify-center whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-background shadow-xl text-foreground scale-[1.02] border border-border/40"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <tab.icon
              className={`w-4 h-4 ${activeTab === tab.key ? "text-primary" : ""}`}
            />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tracking-tighter ${
                  activeTab === tab.key
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-muted-foreground/10 text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════ TAB: Members ═══════════ */}
      {activeTab === "members" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Search */}
          <div className="relative group max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              id="search-team"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-11 pr-4 py-3 glass-input"
            />
          </div>

          <div className="grid gap-3">
            {members
              .filter(
                (m) =>
                  !searchTerm ||
                  m.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  m.role?.display_name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()),
              )
              .map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-5 bg-background/50 rounded-2xl hover:border-primary/20 hover:bg-background/80 transition-all soft-shadow glass-panel"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                      <span className="text-base font-black text-primary">
                        {member.user_id.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-base font-bold text-foreground">
                        {member.user_id.slice(0, 12)}...
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${getRoleBadgeColor(
                            member.role?.name || "",
                          )}`}
                        >
                          {member.role?.display_name || "Sem cargo"}
                        </span>
                        {member.status === "suspended" && (
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border bg-destructive/10 text-destructive border-destructive/20">
                            Suspenso
                          </span>
                        )}
                        <span className="text-[10px] font-medium text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-md">
                          Ativo desde{" "}
                          {new Date(member.joined_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {canManageTeam && member.user_id !== user?.id && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActionMemberId(
                            actionMemberId === member.id ? null : member.id,
                          )
                        }
                        className={`p-2 rounded-xl transition-all border ${actionMemberId === member.id ? "bg-primary/10 border-primary/30 text-primary" : "hover:bg-muted/50 border-transparent text-muted-foreground"}`}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {actionMemberId === member.id && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-background/95 backdrop-blur-md border border-border/60 rounded-2xl shadow-2xl z-[100] py-2 animate-in fade-in slide-in-from-top-2">
                          <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                            Alterar Atribuição
                          </div>
                          <div className="space-y-0.5 mt-1">
                            {roles
                              .filter(
                                (r) =>
                                  r.name !== "owner" && r.id !== member.role_id,
                              )
                              .map((role) => (
                                <button
                                  key={role.id}
                                  onClick={async () => {
                                    await changeMemberRole(member.id, role.id);
                                    setActionMemberId(null);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-primary/5 hover:text-primary transition-colors flex items-center justify-between group"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <Shield className="w-4 h-4 transition-transform group-hover:scale-110" />
                                    {role.display_name}
                                  </div>
                                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-40" />
                                </button>
                              ))}
                          </div>

                          <div className="h-px bg-border/40 my-2 mx-2" />

                          <div className="px-2 space-y-1">
                            {member.status === "active" ? (
                              <button
                                onClick={async () => {
                                  await suspendMember(member.id);
                                  setActionMemberId(null);
                                }}
                                className="w-full text-left px-3 py-2.5 text-sm font-bold hover:bg-amber-500/10 transition-colors flex items-center gap-3 text-amber-500 rounded-xl"
                              >
                                <Ban className="w-4 h-4" />
                                Suspender Acesso
                              </button>
                            ) : (
                              <button
                                onClick={async () => {
                                  await reactivateMember(member.id);
                                  setActionMemberId(null);
                                }}
                                className="w-full text-left px-3 py-2.5 text-sm font-bold hover:bg-emerald-500/10 transition-colors flex items-center gap-3 text-emerald-500 rounded-xl"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Reativar Acesso
                              </button>
                            )}
                            <button
                              onClick={async () => {
                                if (
                                  confirm(
                                    "Tem certeza que deseja remover este membro definitivamente?",
                                  )
                                ) {
                                  await removeMember(member.id);
                                }
                                setActionMemberId(null);
                              }}
                              className="w-full text-left px-3 py-2.5 text-sm font-bold hover:bg-destructive/10 transition-colors flex items-center gap-3 text-destructive rounded-xl"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remover da Equipe
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

            {members.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-muted/10 rounded-3xl border border-dashed border-border/40">
                <Users className="w-12 h-12 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground font-medium">
                  Nenhum membro encontrado ou cadastrado.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ TAB: Access Requests ═══════════ */}
      {activeTab === "requests" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {accessRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-muted/10 rounded-3xl border border-dashed border-border/40">
              <Clock className="w-12 h-12 text-muted-foreground/20" />
              <div className="space-y-1">
                <p className="text-base font-bold text-foreground">
                  Tudo limpo por aqui
                </p>
                <p className="text-sm text-muted-foreground">
                  Não há solicitações de acesso pendentes.
                </p>
              </div>
            </div>
          ) : (
            accessRequests.map((req) => (
              <div
                key={req.id}
                className="p-6 bg-background/50 rounded-2xl space-y-5 hover:border-primary/20 transition-all glass-panel soft-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground leading-tight">
                        {req.user_email || req.user_id.slice(0, 16) + "..."}
                      </p>
                      {req.message && (
                        <div className="mt-2 p-3 bg-muted/30 rounded-xl border border-border/20">
                          <p className="text-sm text-muted-foreground font-medium italic">
                            "{req.message}"
                          </p>
                        </div>
                      )}
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">
                        Solicitado em{" "}
                        {new Date(req.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Aguardando
                  </span>
                </div>

                {canManageTeam && (
                  <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                    <label
                      htmlFor={`assign-role-${req.id}`}
                      className="sr-only"
                    >
                      Atribuir Cargo
                    </label>
                    <select
                      id={`assign-role-${req.id}`}
                      value={approveRoleId || ""}
                      onChange={(e) => setApproveRoleId(e.target.value)}
                      className="flex-1 glass-input py-3 px-4"
                    >
                      <option value="">Atribuir Cargo...</option>
                      {roles
                        .filter((r) => r.name !== "owner")
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.display_name}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={() =>
                        approveRoleId && handleApprove(req.id, approveRoleId)
                      }
                      disabled={!approveRoleId || approvingId === req.id}
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      {approvingId === req.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Aprovar
                    </button>
                    <button
                      onClick={() => rejectRequest(req.id)}
                      className="flex items-center gap-2 px-6 py-3 bg-destructive/10 text-destructive rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-destructive/20 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      Recusar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ═══════════ TAB: Invite Links ═══════════ */}
      {activeTab === "links" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {canManageTeam && (
            <div className="space-y-4">
              {!showCreateLink ? (
                <button
                  onClick={() => {
                    setShowCreateLink(true);
                    setGeneratedLink(null);
                    setLinkRoleId(
                      roles.find((r) => r.name === "auditor")?.id || "",
                    );
                  }}
                  className="flex items-center gap-2.5 px-6 py-3.5 bg-primary text-primary-foreground rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-xl shadow-primary/20"
                >
                  <UserPlus className="w-4 h-4" /> Criar Novo Convite
                </button>
              ) : (
                <div className="p-8 bg-background/80 border-primary/20 rounded-2xl space-y-6 glass-panel soft-shadow animate-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold">Configurar Convite</h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        Plano atual permite links ilimitados.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowCreateLink(false);
                        setGeneratedLink(null);
                        setLinkEmail("");
                      }}
                      className="p-2 hover:bg-muted/50 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="linkRoleId"
                        className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/60 ml-2"
                      >
                        Função Atribuída
                      </label>
                      <select
                        id="linkRoleId"
                        value={linkRoleId}
                        onChange={(e) => setLinkRoleId(e.target.value)}
                        className="w-full glass-input px-5 py-3.5"
                      >
                        {roles
                          .filter((r) => r.name !== "owner")
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.display_name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="linkMaxUses"
                        className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/60 ml-2 flex justify-between"
                      >
                        Usos Máximos
                      </label>
                      <input
                        type="number"
                        id="linkMaxUses"
                        min={1}
                        max={100}
                        value={linkMaxUses}
                        onChange={(e) => setLinkMaxUses(Number(e.target.value))}
                        className="w-full glass-input px-5 py-3.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="linkExpiresDays"
                        className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/60 ml-2"
                      >
                        Expiração (Dias)
                      </label>
                      <input
                        type="number"
                        id="linkExpiresDays"
                        min={1}
                        max={90}
                        value={linkExpiresDays}
                        onChange={(e) =>
                          setLinkExpiresDays(Number(e.target.value))
                        }
                        className="w-full glass-input px-5 py-3.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="linkLabel"
                        className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/60 ml-2"
                      >
                        Rótulo Interno
                      </label>
                      <input
                        type="text"
                        id="linkLabel"
                        value={linkLabel}
                        onChange={(e) => setLinkLabel(e.target.value)}
                        placeholder="Ex: Novos Auditores"
                        className="w-full glass-input px-5 py-3.5"
                      />
                    </div>
                    <div className="space-y-2 col-span-full">
                      <label
                        htmlFor="linkEmail"
                        className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/60 ml-2 flex items-center justify-between"
                      >
                        E-mail do Destinatário
                        <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          Automático
                        </span>
                      </label>
                      <input
                        type="email"
                        id="linkEmail"
                        value={linkEmail}
                        onChange={(e) => setLinkEmail(e.target.value)}
                        placeholder="exemplo@gmail.com"
                        className="w-full glass-input px-5 py-3.5"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/20 flex flex-col md:flex-row gap-4">
                    <button
                      onClick={handleGenerateLink}
                      disabled={generating || !linkRoleId}
                      className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:brightness-110 disabled:opacity-50 transition-all flex-1 shadow-xl shadow-primary/20 active:scale-[0.98]"
                    >
                      {generating ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <Link2 className="w-4 h-4 text-white" />
                      )}
                      Gerar e Ativar Link
                    </button>
                    {generatedLink && (
                      <div className="flex-1 flex items-center gap-3 p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                        <input
                          type="text"
                          readOnly
                          value={generatedLink}
                          aria-label="Link gerado"
                          className="flex-1 text-[11px] bg-transparent outline-none font-mono font-bold px-3 text-emerald-600 dark:text-emerald-400"
                        />
                        <button
                          onClick={() => copyToClipboard(generatedLink)}
                          className="p-3 bg-emerald-500 text-white rounded-xl hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20"
                          title="Copiar link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Existing links */}
          {inviteLinks.length > 0 ? (
            <div className="grid gap-3">
              <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                Links Ativos
              </div>
              {inviteLinks.map((link) => {
                const isExpired = new Date(link.expires_at) < new Date();
                const isUsedUp =
                  link.max_uses > 0 && link.current_uses >= link.max_uses;
                return (
                  <div
                    key={link.id}
                    className={`flex items-center justify-between p-5 border rounded-2xl transition-all glass-panel soft-shadow ${
                      isExpired || isUsedUp
                        ? "bg-muted/10 border-border/10 grayscale opacity-50"
                        : "bg-background/50 border-border/20 hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-xl border ${isExpired || isUsedUp ? "bg-muted/30 border-border/20" : "bg-primary/5 border-primary/20 text-primary"}`}
                      >
                        <Link2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-foreground">
                          {link.label || "Link de Convite Geral"}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${getRoleBadgeColor(
                              link.role?.name || "",
                            )}`}
                          >
                            {link.role?.display_name}
                          </span>
                          <span className="text-[10px] font-extrabold text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                            {link.current_uses} / {link.max_uses} ACESSOS
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-widest ${isExpired ? "text-destructive" : "text-muted-foreground"}`}
                          >
                            {isExpired
                              ? "Link Expirado"
                              : `Expira em: ${new Date(link.expires_at).toLocaleDateString()}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    {canManageTeam && !isExpired && !isUsedUp && (
                      <button
                        onClick={() => revokeInviteLink(link.id)}
                        className="text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/20 px-4 py-2 rounded-xl transition-all active:scale-95"
                      >
                        Desativar Link
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            !showCreateLink && (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4 bg-muted/10 rounded-3xl border border-dashed border-border/40">
                <div className="p-6 bg-muted/20 rounded-full">
                  <Link2 className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-foreground">
                    Nenhum link ativo
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Converta novos membros gerando um link acima.
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
