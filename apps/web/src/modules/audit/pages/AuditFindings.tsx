import { useState } from "react";
import { AlertTriangle, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { useAudit } from "../hooks/useAudit";
import { useGitHub } from "../../github/hooks/useGitHub";
import { Github, Loader2 } from "lucide-react";
import type {
  FindingRiskLevel,
  FindingStatus,
  CreateFindingInput,
} from "../types/audit.types";

const RISK_CONFIG: Record<FindingRiskLevel, { label: string; color: string }> =
  {
    critical: {
      label: "Crítico",
      color:
        "text-destructive border-destructive/20 bg-destructive/5 shadow-sm",
    },
    high: {
      label: "Alto",
      color: "text-orange-500 border-orange-500/20 bg-orange-500/5 shadow-sm",
    },
    medium: {
      label: "Médio",
      color: "text-amber-500 border-amber-500/20 bg-amber-500/5 shadow-sm",
    },
    low: {
      label: "Baixo",
      color:
        "text-emerald-500 border-emerald-500/20 bg-emerald-500/5 shadow-sm",
    },
  };

const STATUS_LABELS: Record<FindingStatus, string> = {
  draft: "Rascunho",
  open: "Aberto",
  in_progress: "Em Tratamento",
  resolved: "Resolvido",
  accepted: "Aceito",
};

export default function AuditFindings() {
  const { findings, programs, loading, createFinding, updateFinding } =
    useAudit();
  const { repositories, createIssue } = useGitHub();

  const [showModal, setShowModal] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState<string | null>(null); // finding id
  const [selectedRepoId, setSelectedRepoId] = useState("");
  const [creatingIssue, setCreatingIssue] = useState(false);

  const [search, setSearch] = useState("");
  const [filterRisk, setFilterRisk] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [form, setForm] = useState<CreateFindingInput>({
    program_id: "",
    title: "",
    description: "",
    risk_level: "medium",
  });

  const [editingFinding, setEditingFinding] = useState<
    (typeof findings)[0] | null
  >(null);

  const filtered = findings.filter((f) => {
    const matchSearch =
      !search ||
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.description?.toLowerCase().includes(search.toLowerCase());
    const matchRisk = !filterRisk || f.risk_level === filterRisk;
    const matchStatus = !filterStatus || f.status === filterStatus;
    return matchSearch && matchRisk && matchStatus;
  });

  const handleSave = async () => {
    try {
      if (editingFinding) {
        await updateFinding(editingFinding.id, {
          ...form,
          status:
            editingFinding.status === "draft" ? "open" : editingFinding.status,
          due_date: form.due_date,
        });
        setEditingFinding(null);
      } else {
        await createFinding(form);
      }
      setShowModal(false);
      setForm({
        program_id: "",
        title: "",
        description: "",
        risk_level: "medium",
      });
    } catch {
      // error shown via hook
    }
  };

  const handleCreateGitHubIssue = async (finding: (typeof findings)[0]) => {
    if (!selectedRepoId) return;
    setCreatingIssue(true);
    try {
      await createIssue(
        selectedRepoId,
        `[Auditoria] ${finding.title}`,
        finding.description || "",
        finding.id,
      );
      // Update local state is handled implicitly or we can just refresh
      setShowGithubModal(null);
      setSelectedRepoId("");
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingIssue(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-1 bg-primary rounded-full" />
            <h1 className="text-4xl font-bold tracking-tight font-display">
              Achados de Auditoria
            </h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Gestão de não conformidades e pontos críticos identificados.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingFinding(null);
            setForm({
              program_id: "",
              title: "",
              description: "",
              risk_level: "medium",
            });
            setShowModal(true);
          }}
          variant="primary"
          className="rounded-2xl px-6 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Achado
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 glass-card dark:bg-black/20 p-6 rounded-2xl border-white/5 soft-shadow">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
          <Input
            placeholder="Buscar por título ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-14 bg-foreground/5 border-transparent rounded-2xl py-4 focus:bg-white/10 transition-all font-medium h-12"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground/20 shrink-0" />
            <Select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="bg-foreground/5 border-transparent rounded-2xl px-4 h-12 min-w-[160px]"
            >
              <option value="" className="bg-background text-foreground">
                Risco (Todos)
              </option>
              {Object.entries(RISK_CONFIG).map(([val, cfg]) => (
                <option
                  key={val}
                  value={val}
                  className="bg-background text-foreground"
                >
                  {cfg.label}
                </option>
              ))}
            </Select>
          </div>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-foreground/5 border-transparent rounded-2xl px-4 h-12 min-w-[160px] w-full sm:w-auto"
          >
            <option value="" className="bg-background text-foreground">
              Status (Todos)
            </option>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option
                key={val}
                value={val}
                className="bg-background text-foreground"
              >
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Findings List */}
      {loading && findings.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground font-medium uppercase tracking-widest text-[10px]">
          Sincronizando registros...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 md:p-24 glass-card dark:bg-black/20 rounded-3xl border-white/5 soft-shadow text-center">
          <div className="w-24 h-24 rounded-3xl bg-foreground/5 flex items-center justify-center mx-auto mb-8 shadow-xl border border-white/5">
            <AlertTriangle className="w-10 h-10 text-muted-foreground/20" />
          </div>
          <h3 className="text-2xl font-bold text-foreground font-display tracking-tight mb-3">
            Nenhum achado
          </h3>
          <p className="text-muted-foreground/60 font-medium max-w-sm mx-auto mb-10">
            {search || filterRisk || filterStatus
              ? "Nenhum resultado corresponde aos filtros aplicados."
              : "Registre a primeira não conformidade para iniciar o monitoramento."}
          </p>
          {(search || filterRisk || filterStatus) && (
            <Button
              variant="ghost"
              className="rounded-2xl"
              onClick={() => {
                setSearch("");
                setFilterRisk("");
                setFilterStatus("");
              }}
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="glass-card dark:bg-black/20 rounded-3xl border-white/5 soft-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-10 py-8 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                    Achado
                  </th>
                  <th className="px-10 py-8 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                    Programa
                  </th>
                  <th className="px-10 py-8 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                    Nível de Risco
                  </th>
                  <th className="px-10 py-8 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                    Status Atual
                  </th>
                  <th className="px-10 py-8 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((finding) => (
                  <tr
                    key={finding.id}
                    className="group hover:bg-white/5 transition-all"
                  >
                    <td className="px-10 py-8">
                      <div className="space-y-1">
                        <p className="font-bold text-foreground font-display tracking-tight text-lg">
                          {finding.title}
                        </p>
                        {finding.description && (
                          <p className="text-sm text-muted-foreground/60 font-medium truncate max-w-sm">
                            {finding.description}
                          </p>
                        )}
                        <p className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-widest pt-2">
                          Identificado em{" "}
                          {new Date(finding.created_at).toLocaleDateString(
                            "pt-BR",
                          )}
                        </p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 rounded-xl text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest w-fit border border-white/5">
                        {finding.program?.name ?? "Geral"}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                          RISK_CONFIG[finding.risk_level].color
                        }`}
                      >
                        {RISK_CONFIG[finding.risk_level].label}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <span
                        className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${
                          finding.status === "resolved"
                            ? "text-emerald-500"
                            : finding.status === "in_progress"
                              ? "text-primary"
                              : "text-muted-foreground/60"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            finding.status === "resolved"
                              ? "bg-emerald-500 shadow-lg shadow-emerald-500/20"
                              : finding.status === "in_progress"
                                ? "bg-primary shadow-lg shadow-primary/20"
                                : finding.status === "draft"
                                  ? "bg-amber-500 shadow-lg shadow-amber-500/20"
                                  : "bg-muted-foreground/20"
                          }`}
                        />
                        {STATUS_LABELS[finding.status]}
                      </span>
                      {finding.source_type === "github" && (
                        <a
                          href={finding.source_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-3 px-2 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-md text-[9px] font-bold uppercase tracking-widest transition-colors w-fit"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Github className="w-3 h-3" />
                          Ver Alerta Original
                        </a>
                      )}
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {finding.status === "draft" && (
                          <Button
                            variant="primary"
                            onClick={() => {
                              setEditingFinding(finding);
                              setForm({
                                program_id: finding.program_id,
                                title: finding.title,
                                description: finding.description || "",
                                risk_level: finding.risk_level,
                                due_date: finding.due_date || undefined,
                              });
                              setShowModal(true);
                            }}
                            className="bg-amber-500 text-white hover:bg-amber-600 rounded-xl text-[10px] font-bold uppercase tracking-widest px-4 py-3 shadow-lg shadow-amber-500/20"
                          >
                            Consolidar
                          </Button>
                        )}
                        {finding.status === "open" && (
                          <Button
                            variant="ghost"
                            onClick={() =>
                              updateFinding(finding.id, {
                                status: "in_progress",
                              })
                            }
                            className="bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest px-4 py-3"
                          >
                            Tratar
                          </Button>
                        )}
                        {finding.status === "in_progress" && (
                          <Button
                            variant="primary"
                            onClick={() =>
                              updateFinding(finding.id, {
                                status: "resolved",
                                resolved_at: new Date().toISOString(),
                              })
                            }
                            className="rounded-xl text-[10px] font-bold uppercase tracking-widest px-4 py-3 shadow-lg shadow-primary/20"
                          >
                            Resolver
                          </Button>
                        )}
                        {finding.source_type !== "github" && (
                          <Button
                            variant="ghost"
                            onClick={() => setShowGithubModal(finding.id)}
                            className="bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800 rounded-xl text-[10px] font-bold uppercase tracking-widest px-4 py-3 flex items-center gap-2"
                          >
                            <Github className="w-4 h-4" />
                            Criar Issue
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-xl">
          <div className="glass-card rounded-3xl p-8 md:p-12 max-w-2xl w-full shadow-2xl space-y-10 relative scale-up">
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-foreground font-display tracking-tight">
                {editingFinding ? "Editar Achado" : "Registrar Achado"}
              </h3>
              <p className="text-sm text-muted-foreground/60 font-medium">
                {editingFinding
                  ? "Complete as informações do achado draft para consolidá-lo."
                  : "Identifique uma nova não conformidade ou ponto de atenção."}
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">
                  Programa Relacionado
                </label>
                <Select
                  value={form.program_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, program_id: e.target.value }))
                  }
                  className="bg-background/50 border-border rounded-2xl h-[54px]"
                >
                  <option value="" className="bg-background text-foreground">
                    Selecione o Ciclo...
                  </option>
                  {programs.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                      className="bg-background text-foreground"
                    >
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">
                  Título do Achado
                </label>
                <Input
                  placeholder="Resumo da observação..."
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="bg-background/50 border-border rounded-2xl px-6 h-[54px] focus:bg-background transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">
                  Descrição Detalhada
                </label>
                <textarea
                  rows={4}
                  placeholder="Descreva as evidências e o impacto..."
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="w-full bg-background/50 border border-border rounded-2xl px-6 py-4 outline-none focus:bg-background transition-all text-sm font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">
                    Nível de Risco
                  </label>
                  <Select
                    value={form.risk_level}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        risk_level: e.target.value as FindingRiskLevel,
                      }))
                    }
                    className="bg-background/50 border-border rounded-2xl h-[54px]"
                  >
                    {Object.entries(RISK_CONFIG).map(([val, cfg]) => (
                      <option
                        key={val}
                        value={val}
                        className="bg-background text-foreground"
                      >
                        {cfg.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">
                    Prazo de Resolução
                  </label>
                  <Input
                    type="date"
                    value={form.due_date ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, due_date: e.target.value }))
                    }
                    className="bg-background/50 border-border rounded-2xl px-6 h-[54px] [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowModal(false);
                  setEditingFinding(null);
                }}
                className="py-4 h-[54px] flex-1 rounded-2xl border border-border bg-foreground/5 text-muted-foreground hover:bg-foreground hover:text-background transition-all font-bold uppercase tracking-widest text-[10px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!form.program_id || !form.title || loading}
                className="py-4 h-[54px] flex-1 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all font-bold uppercase tracking-widest text-[10px] px-10"
              >
                {loading
                  ? "Processando..."
                  : editingFinding
                    ? "Salvar Achado"
                    : "Registrar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Issue Modal */}
      {showGithubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-xl">
          <div className="glass-card rounded-3xl p-8 md:p-12 max-w-lg w-full shadow-2xl space-y-8 relative scale-up">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground font-display tracking-tight flex items-center gap-2">
                <Github className="w-6 h-6" />
                Criar Issue no GitHub
              </h3>
              <p className="text-sm text-muted-foreground/60 font-medium">
                Selecione o repositório para abrir uma issue bidirecional
                vinculada a este achado permanentemente.
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">
                Repositório de Destino
              </label>
              <Select
                value={selectedRepoId}
                onChange={(e) => setSelectedRepoId(e.target.value)}
                className="bg-background/50 border-border rounded-2xl h-[54px] w-full"
              >
                <option value="" className="bg-background text-foreground">
                  Selecione o repositório...
                </option>
                {repositories.map((r) => (
                  <option
                    key={r.id}
                    value={r.id}
                    className="bg-background text-foreground"
                  >
                    {r.full_name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowGithubModal(null);
                  setSelectedRepoId("");
                }}
                className="py-4 h-[54px] flex-1 rounded-2xl border border-border bg-foreground/5 text-muted-foreground hover:bg-foreground hover:text-background font-bold uppercase tracking-widest text-[10px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  const f = findings.find((x) => x.id === showGithubModal);
                  if (f) handleCreateGitHubIssue(f);
                }}
                disabled={!selectedRepoId || creatingIssue}
                className="py-4 h-[54px] flex-[2] rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black hover:scale-105 active:scale-95 transition-all font-bold uppercase tracking-widest text-[10px] px-8 flex items-center justify-center gap-2"
              >
                {creatingIssue && <Loader2 className="w-4 h-4 animate-spin" />}
                {creatingIssue ? "Criando..." : "Confirmar e Criar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
