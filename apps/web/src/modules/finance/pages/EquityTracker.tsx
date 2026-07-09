import { useState } from "react";
import {
  Award,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  CalendarClock,
  Settings2,
  UserX,
  PieChart,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import {
  useEquity,
  CreateGrantInput,
  EquityGrantView,
  VestingMilestone,
} from "../hooks/useEquity";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-emerald-500/15 text-emerald-600" },
  terminated: {
    label: "Desligado",
    className: "bg-amber-500/15 text-amber-600",
  },
  exercised: { label: "Exercido", className: "bg-sky-500/15 text-sky-600" },
  cancelled: {
    label: "Cancelado",
    className: "bg-destructive/15 text-destructive",
  },
};

const ACCELERATION_LABELS: Record<string, string> = {
  none: "Sem aceleração",
  single_trigger: "Single trigger",
  double_trigger: "Double trigger",
};

const INPUT_CLASS =
  "glass-input w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none figma-focus";

// Local calendar date — toISOString() is UTC and would yield yesterday/tomorrow
// for users near a day boundary (e.g. BRT evenings), storing a wrong grant_date.
const todayLocalIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const EMPTY_GRANT_FORM: CreateGrantInput = {
  beneficiary_name: "",
  beneficiary_email: "",
  options_total: 0,
  grant_date: todayLocalIso(),
  cliff_months: 12,
  vesting_months: 48,
  grant_price: 0,
  acceleration: "none",
  exercise_window_days: 90,
};

const formatNumber = (v: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(v);

const formatDate = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("pt-BR") : "—";

export default function EquityTracker() {
  const {
    grants,
    pool,
    loading,
    error,
    createGrant,
    terminateGrant,
    deleteGrant,
    savePool,
    loadTimeline,
  } = useEquity();

  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showPoolModal, setShowPoolModal] = useState(false);
  const [grantForm, setGrantForm] =
    useState<CreateGrantInput>(EMPTY_GRANT_FORM);
  const [poolForm, setPoolForm] = useState({
    total_options: 0,
    pool_percentage: 10,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [timeline, setTimeline] = useState<VestingMilestone[] | null>(null);
  const [timelineGrant, setTimelineGrant] = useState<EquityGrantView | null>(
    null,
  );

  const utilization = pool?.utilization_percentage ?? null;

  const submitGrant = async () => {
    setFormError(null);
    setSaving(true);
    try {
      await createGrant({
        ...grantForm,
        beneficiary_email: grantForm.beneficiary_email || null,
      });
      setShowGrantModal(false);
      setGrantForm(EMPTY_GRANT_FORM);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao criar grant");
    } finally {
      setSaving(false);
    }
  };

  const submitPool = async () => {
    setFormError(null);
    setSaving(true);
    try {
      await savePool(poolForm);
      setShowPoolModal(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao salvar pool");
    } finally {
      setSaving(false);
    }
  };

  const openTimeline = async (grant: EquityGrantView) => {
    setTimelineGrant(grant);
    setTimeline(null);
    try {
      setTimeline(await loadTimeline(grant.id));
    } catch {
      setTimeline([]);
    }
  };

  const handleTerminate = async (grant: EquityGrantView) => {
    if (
      window.confirm(
        `Desligar ${grant.beneficiary_name}? O vesting congela hoje e abre a janela de exercício de ${grant.exercise_window_days} dias.`,
      )
    ) {
      await terminateGrant(grant.id);
    }
  };

  const handleDelete = async (grant: EquityGrantView) => {
    if (
      window.confirm(
        `Excluir permanentemente o grant de ${grant.beneficiary_name}? Esta ação não pode ser desfeita.`,
      )
    ) {
      await deleteGrant(grant.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Award className="w-7 h-7 text-primary" aria-hidden="true" />
            Equity & Vesting
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ESOP pool, grants de stock options e cronogramas de vesting
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setPoolForm({
                total_options: pool?.pool?.total_options ?? 0,
                pool_percentage: pool?.pool?.pool_percentage ?? 10,
              });
              setFormError(null);
              setShowPoolModal(true);
            }}
            aria-label="Configurar pool de ESOP"
          >
            <Settings2 className="w-4 h-4 mr-2" aria-hidden="true" />
            Configurar Pool
          </Button>
          <Button
            onClick={() => {
              setFormError(null);
              setShowGrantModal(true);
            }}
            aria-label="Registrar novo grant de stock options"
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Novo Grant
          </Button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="glass-card rounded-xl p-4 flex items-center gap-3 text-destructive"
        >
          <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Pool alert (RN-06) */}
      {pool?.over_threshold && (
        <div
          role="alert"
          className="glass-card rounded-xl p-4 flex items-center gap-3 border border-amber-500/40 text-amber-600"
        >
          <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium">
            Pool acima de 80% de utilização ({utilization}%). Considere ampliar
            o ESOP antes de novos grants.
          </span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase">
            <PieChart className="w-4 h-4" aria-hidden="true" /> Pool Total
          </div>
          <p className="text-2xl font-bold mt-2 tabular-nums">
            {pool?.pool ? formatNumber(pool.pool.total_options) : "—"}
          </p>
          {pool?.pool?.pool_percentage != null && (
            <p className="text-xs text-muted-foreground mt-1">
              {pool.pool.pool_percentage}% da empresa
            </p>
          )}
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase">
            <Users className="w-4 h-4" aria-hidden="true" /> Emitidas
          </div>
          <p className="text-2xl font-bold mt-2 tabular-nums">
            {pool ? formatNumber(pool.issued_options) : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {pool?.beneficiaries ?? 0} beneficiário(s)
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase">
            <Award className="w-4 h-4" aria-hidden="true" /> Vestidas
          </div>
          <p className="text-2xl font-bold mt-2 tabular-nums">
            {pool ? formatNumber(pool.vested_options) : "—"}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase">
            <CalendarClock className="w-4 h-4" aria-hidden="true" /> Utilização
          </div>
          <p className="text-2xl font-bold mt-2 tabular-nums">
            {utilization != null ? `${utilization}%` : "—"}
          </p>
          {utilization != null && (
            <div
              className="w-full bg-border/40 h-1.5 rounded-full overflow-hidden mt-2"
              role="progressbar"
              aria-valuenow={utilization}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Utilização do pool de ESOP"
            >
              <div
                className={`h-full rounded-full transition-all ${
                  pool?.over_threshold ? "bg-amber-500" : "bg-primary"
                }`}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Grants table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border/40">
          <h2 className="text-lg font-bold">Grants</h2>
        </div>
        {loading ? (
          <div className="p-10 flex items-center justify-center text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span className="text-sm">Carregando grants...</span>
          </div>
        ) : grants.length === 0 ? (
          <div className="p-10 text-center">
            <Award
              className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              Nenhum grant registrado. Configure o pool e registre o primeiro
              grant de stock options.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border/40">
                  <th className="px-4 py-3 font-semibold">Beneficiário</th>
                  <th className="px-4 py-3 font-semibold">Opções</th>
                  <th className="px-4 py-3 font-semibold">Vesting</th>
                  <th className="px-4 py-3 font-semibold">Próximo Vesting</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {grants.map((g) => {
                  const status =
                    STATUS_LABELS[g.status] ?? STATUS_LABELS.active;
                  return (
                    <tr
                      key={g.id}
                      className="border-b border-border/20 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">
                          {g.beneficiary_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Grant {formatDate(g.grant_date)} · cliff{" "}
                          {g.cliff_months}m · {g.vesting_months}m ·{" "}
                          {ACCELERATION_LABELS[g.acceleration]}
                        </p>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatNumber(g.options_total)}
                      </td>
                      <td className="px-4 py-3 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-border/40 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${g.vested_percentage}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground w-14">
                            {g.vested_percentage}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 tabular-nums">
                          {formatNumber(g.vested_options)} vestidas
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(g.next_vesting_date)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openTimeline(g)}
                            aria-label={`Ver timeline de vesting de ${g.beneficiary_name}`}
                            className="p-2.5 rounded-lg hover:bg-muted/60 text-muted-foreground figma-focus"
                          >
                            <CalendarClock
                              className="w-4 h-4"
                              aria-hidden="true"
                            />
                          </button>
                          {g.status === "active" && (
                            <button
                              type="button"
                              onClick={() => handleTerminate(g)}
                              aria-label={`Registrar desligamento de ${g.beneficiary_name}`}
                              className="p-2.5 rounded-lg hover:bg-amber-500/10 text-amber-600 figma-focus"
                            >
                              <UserX className="w-4 h-4" aria-hidden="true" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(g)}
                            aria-label={`Excluir grant de ${g.beneficiary_name}`}
                            className="p-2.5 rounded-lg hover:bg-destructive/10 text-destructive figma-focus"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New grant modal */}
      {showGrantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Novo Grant</h3>
              <button
                type="button"
                onClick={() => setShowGrantModal(false)}
                aria-label="Fechar"
                className="p-2.5 rounded-lg hover:bg-muted/60 figma-focus"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="eq-name"
                  className="text-sm font-medium block mb-1.5"
                >
                  Beneficiário *
                </label>
                <input
                  id="eq-name"
                  value={grantForm.beneficiary_name}
                  onChange={(e) =>
                    setGrantForm({
                      ...grantForm,
                      beneficiary_name: e.target.value,
                    })
                  }
                  className={INPUT_CLASS}
                  placeholder="Nome do colaborador"
                />
              </div>
              <div>
                <label
                  htmlFor="eq-email"
                  className="text-sm font-medium block mb-1.5"
                >
                  E-mail
                </label>
                <input
                  id="eq-email"
                  type="email"
                  value={grantForm.beneficiary_email ?? ""}
                  onChange={(e) =>
                    setGrantForm({
                      ...grantForm,
                      beneficiary_email: e.target.value,
                    })
                  }
                  className={INPUT_CLASS}
                  placeholder="colaborador@empresa.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="eq-options"
                    className="text-sm font-medium block mb-1.5"
                  >
                    Opções *
                  </label>
                  <input
                    id="eq-options"
                    type="number"
                    min={1}
                    value={grantForm.options_total || ""}
                    onChange={(e) =>
                      setGrantForm({
                        ...grantForm,
                        options_total: Number(e.target.value),
                      })
                    }
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label
                    htmlFor="eq-price"
                    className="text-sm font-medium block mb-1.5"
                  >
                    Preço do grant (R$)
                  </label>
                  <input
                    id="eq-price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={grantForm.grant_price ?? 0}
                    onChange={(e) =>
                      setGrantForm({
                        ...grantForm,
                        grant_price: Number(e.target.value),
                      })
                    }
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="eq-date"
                    className="text-sm font-medium block mb-1.5"
                  >
                    Grant date *
                  </label>
                  <input
                    id="eq-date"
                    type="date"
                    value={grantForm.grant_date}
                    onChange={(e) =>
                      setGrantForm({ ...grantForm, grant_date: e.target.value })
                    }
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label
                    htmlFor="eq-cliff"
                    className="text-sm font-medium block mb-1.5"
                  >
                    Cliff (meses)
                  </label>
                  <input
                    id="eq-cliff"
                    type="number"
                    min={0}
                    max={120}
                    value={grantForm.cliff_months ?? 12}
                    onChange={(e) =>
                      setGrantForm({
                        ...grantForm,
                        cliff_months: Number(e.target.value),
                      })
                    }
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label
                    htmlFor="eq-vesting"
                    className="text-sm font-medium block mb-1.5"
                  >
                    Vesting (meses)
                  </label>
                  <input
                    id="eq-vesting"
                    type="number"
                    min={1}
                    max={240}
                    value={grantForm.vesting_months ?? 48}
                    onChange={(e) =>
                      setGrantForm({
                        ...grantForm,
                        vesting_months: Number(e.target.value),
                      })
                    }
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="eq-accel"
                    className="text-sm font-medium block mb-1.5"
                  >
                    Aceleração
                  </label>
                  <select
                    id="eq-accel"
                    value={grantForm.acceleration}
                    onChange={(e) =>
                      setGrantForm({
                        ...grantForm,
                        acceleration: e.target
                          .value as CreateGrantInput["acceleration"],
                      })
                    }
                    className={INPUT_CLASS}
                  >
                    <option value="none">Sem aceleração</option>
                    <option value="single_trigger">
                      Single trigger (M&A/IPO)
                    </option>
                    <option value="double_trigger">Double trigger</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="eq-window"
                    className="text-sm font-medium block mb-1.5"
                  >
                    Janela de exercício (dias)
                  </label>
                  <input
                    id="eq-window"
                    type="number"
                    min={0}
                    max={3650}
                    value={grantForm.exercise_window_days ?? 90}
                    onChange={(e) =>
                      setGrantForm({
                        ...grantForm,
                        exercise_window_days: Number(e.target.value),
                      })
                    }
                    className={INPUT_CLASS}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Prazo pós-desligamento (padrão 90 dias)
                  </p>
                </div>
              </div>
              {formError && (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowGrantModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={submitGrant}
                  disabled={
                    saving ||
                    !grantForm.beneficiary_name.trim() ||
                    grantForm.options_total <= 0
                  }
                >
                  {saving && (
                    <Loader2
                      className="w-4 h-4 mr-2 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  Registrar Grant
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pool modal */}
      {showPoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Configurar Pool de ESOP</h3>
              <button
                type="button"
                onClick={() => setShowPoolModal(false)}
                aria-label="Fechar"
                className="p-2.5 rounded-lg hover:bg-muted/60 figma-focus"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="pool-total"
                  className="text-sm font-medium block mb-1.5"
                >
                  Total de opções no pool *
                </label>
                <input
                  id="pool-total"
                  type="number"
                  min={1}
                  value={poolForm.total_options || ""}
                  onChange={(e) =>
                    setPoolForm({
                      ...poolForm,
                      total_options: Number(e.target.value),
                    })
                  }
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label
                  htmlFor="pool-pct"
                  className="text-sm font-medium block mb-1.5"
                >
                  Percentual da empresa (%)
                </label>
                <input
                  id="pool-pct"
                  type="number"
                  min={0.1}
                  max={100}
                  step="0.1"
                  value={poolForm.pool_percentage}
                  onChange={(e) =>
                    setPoolForm({
                      ...poolForm,
                      pool_percentage: Number(e.target.value),
                    })
                  }
                  className={INPUT_CLASS}
                />
              </div>
              {formError && (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPoolModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={submitPool}
                  disabled={saving || poolForm.total_options <= 0}
                >
                  {saving && (
                    <Loader2
                      className="w-4 h-4 mr-2 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  Salvar Pool
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline modal (RN-08) */}
      {timelineGrant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                Timeline — {timelineGrant.beneficiary_name}
              </h3>
              <button
                type="button"
                onClick={() => setTimelineGrant(null)}
                aria-label="Fechar timeline"
                className="p-2.5 rounded-lg hover:bg-muted/60 figma-focus"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            {timeline === null ? (
              <div className="p-6 flex items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span className="text-sm">Calculando marcos...</span>
              </div>
            ) : timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4">
                Sem novos marcos de vesting nos próximos 24 meses.
              </p>
            ) : (
              <ol className="space-y-3">
                {timeline.map((m) => (
                  <li key={m.date} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <span className="text-sm text-muted-foreground w-28 shrink-0">
                      {formatDate(m.date)}
                    </span>
                    <span className="text-sm font-medium tabular-nums">
                      {formatNumber(m.cumulativeVested)} opções acumuladas
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
