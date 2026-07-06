import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Users,
  Plus,
  Trash2,
  TrendingUp,
  X,
  Layers,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Select } from "@/shared/components/ui/Select";
import {
  useCapTable,
  SimulationInput,
  VestingSchedule,
} from "../hooks/useCapTable";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#14b8a6",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
];
const ROUND_TYPE_LABELS: Record<string, string> = {
  pre_seed: "Pré-Seed",
  seed: "Seed",
  series_a: "Série A",
  series_b: "Série B",
  series_c: "Série C",
  bridge: "Bridge",
  other: "Outro",
};

export default function CapTable() {
  const {
    rounds,
    shareholders,
    loading,
    totalInvested,
    latestValuation,
    createRound,
    addShareholder,
    deleteShareholder,
    deleteRound,
    simulateDilution,
  } = useCapTable();

  const [showRoundModal, setShowRoundModal] = useState(false);
  const [showShareholderModal, setShowShareholderModal] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [simInput, setSimInput] = useState<SimulationInput>({
    roundName: "",
    roundType: "seed",
    preMoneyValuation: 0,
    amountRaised: 0,
    newInvestorName: "",
    newInvestorShares: 0,
  });
  const [roundForm, setRoundForm] = useState({
    round_name: "",
    round_type: "seed",
    pre_money_valuation: 0,
    amount_raised: 0,
    round_date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [shareholderForm, setShareholderForm] = useState({
    round_id: "",
    shareholder_name: "",
    shareholder_type: "founder",
    shares_count: 0,
    share_price: 0,
    ownership_percentage: 0,
    investment_amount: 0,
    vesting_schedule: {} as VestingSchedule,
    notes: "",
  });
  const [vestingError, setVestingError] = useState<string | null>(null);

  const pieData = shareholders.map((s) => ({
    name: s.shareholder_name,
    value: s.ownership_percentage,
  }));

  const dilutionPreview = showSimulation ? simulateDilution(simInput) : [];

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-1 bg-primary rounded-full" />
            <h1 className="text-4xl font-bold tracking-tight font-display">
              Cap Table
            </h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Tabela de capitalização e simulação de rodadas.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="rounded-2xl px-6"
            onClick={() => setShowSimulation(!showSimulation)}
          >
            <TrendingUp className="w-4 h-4 mr-2" /> Simular Rodada
          </Button>
          <Button
            variant="primary"
            className="rounded-2xl px-6 shadow-lg shadow-primary/20"
            onClick={() => setShowRoundModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Rodada
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Valuation",
            value: formatCurrency(latestValuation),
            icon: TrendingUp,
            color: "text-primary",
          },
          {
            label: "Total Investido",
            value: formatCurrency(totalInvested),
            icon: Layers,
            color: "text-emerald-500",
          },
          {
            label: "Acionistas",
            value: shareholders.length.toString(),
            icon: Users,
            color: "text-amber-500",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="glass-card soft-shadow p-8 rounded-3xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-2xl bg-foreground/5">
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
              {kpi.label}
            </p>
            <h3 className="text-3xl font-bold tracking-tight text-foreground mt-1">
              {kpi.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pie Chart */}
        <div className="glass-card soft-shadow p-0 rounded-3xl flex flex-col overflow-hidden">
          <div className="p-8 border-b border-border/40">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">
              Distribuição Acionária
            </h3>
          </div>
          <div className="flex-1 p-8">
            {pieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.85)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "16px",
                        color: "#fff",
                      }}
                      formatter={(v: number) => [`${v.toFixed(2)}%`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                <Users className="w-12 h-12 mb-4 opacity-10" />
                <p className="text-xs font-bold uppercase tracking-widest opacity-40">
                  Sem acionistas
                </p>
              </div>
            )}
            <div className="mt-4 space-y-3">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold">
                    {item.value.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shareholders Table */}
        <div className="lg:col-span-2 glass-card soft-shadow overflow-hidden rounded-3xl">
          <div className="p-8 border-b border-border/40 flex justify-between items-center">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">
              Quadro Societário
            </h3>
            <Button
              variant="ghost"
              className="text-[10px] font-bold uppercase tracking-widest"
              onClick={() => setShowShareholderModal(true)}
            >
              <Plus className="w-4 h-4 mr-1" /> Adicionar
            </Button>
          </div>

          {shareholders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] border-b border-border/10">
                    <th className="px-8 py-5 text-left">Nome</th>
                    <th className="px-8 py-5 text-left">Tipo</th>
                    <th className="px-8 py-5 text-center">Vesting</th>
                    <th className="px-8 py-5 text-right">Ações</th>
                    <th className="px-8 py-5 text-right">%</th>
                    <th className="px-8 py-5 text-right">Investido</th>
                    <th className="px-8 py-5 text-center">–</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {shareholders.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-muted/50 transition-all group"
                    >
                      <td className="px-8 py-6 text-sm font-bold text-foreground">
                        {s.shareholder_name}
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-2 py-1 bg-foreground/5 rounded-md">
                          {s.shareholder_type}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-center">
                        {s.calculated_vesting ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-full bg-border/40 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-primary h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${s.calculated_vesting.percentage}%`,
                                }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                              {s.calculated_vesting.percentage}% Vested
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">
                            N/A
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-right">
                        {Number(s.shares_count).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-right text-primary">
                        {Number(s.ownership_percentage).toFixed(2)}%
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-right">
                        {formatCurrency(Number(s.investment_amount))}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button
                          onClick={() => deleteShareholder(s.id)}
                          className="p-2 rounded-full hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center text-muted-foreground">
              <Users className="w-16 h-16 mb-6 mx-auto opacity-10" />
              <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-40">
                Nenhum acionista registrado
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Simulation Panel */}
      {showSimulation && (
        <div className="glass-card soft-shadow p-8 rounded-3xl">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" /> Simulação de Nova
            Rodada
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Nome do Investidor
              </label>
              <input
                value={simInput.newInvestorName}
                onChange={(e) =>
                  setSimInput({ ...simInput, newInvestorName: e.target.value })
                }
                className="glass-input w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
                placeholder="Ex: Sequoia Capital"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Valor Levantado (R$)
              </label>
              <input
                type="number"
                value={simInput.amountRaised}
                onChange={(e) =>
                  setSimInput({
                    ...simInput,
                    amountRaised: Number(e.target.value),
                  })
                }
                className="glass-input w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Pre-Money Valuation
              </label>
              <input
                type="number"
                value={simInput.preMoneyValuation}
                onChange={(e) =>
                  setSimInput({
                    ...simInput,
                    preMoneyValuation: Number(e.target.value),
                  })
                }
                className="glass-input w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
              />
            </div>
          </div>

          {dilutionPreview.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] border-b border-border/10">
                    <th className="px-6 py-4 text-left">Acionista</th>
                    <th className="px-6 py-4 text-right">% Atual</th>
                    <th className="px-6 py-4 text-center">
                      <ArrowRight className="w-4 h-4 mx-auto" />
                    </th>
                    <th className="px-6 py-4 text-right">% Projetado</th>
                    <th className="px-6 py-4 text-right">Diluição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {dilutionPreview.map((d, i) => (
                    <tr key={i} className="hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm font-bold">
                        {d.shareholderName}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        {d.currentPct.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ArrowRight className="w-4 h-4 mx-auto text-muted-foreground/30" />
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-right text-primary">
                        {d.newPct.toFixed(2)}%
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-bold text-right ${d.dilution > 0 ? "text-destructive" : "text-emerald-500"}`}
                      >
                        {d.dilution > 0 ? "-" : "+"}
                        {Math.abs(d.dilution).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Rounds Timeline */}
      {rounds.length > 0 && (
        <div className="glass-card soft-shadow p-8 rounded-3xl">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6">
            Histórico de Rodadas
          </h3>
          <div className="space-y-4">
            {rounds.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-6 rounded-2xl bg-card/30 border border-border/20 group hover:scale-[1.01] transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{r.round_name}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {ROUND_TYPE_LABELS[r.round_type] || r.round_type} •{" "}
                      {r.round_date || "Sem data"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      Levantado
                    </p>
                    <p className="text-sm font-bold">
                      {formatCurrency(r.amount_raised)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      Post-Money
                    </p>
                    <p className="text-sm font-bold text-primary">
                      {formatCurrency(r.post_money_valuation)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteRound(r.id)}
                    className="p-2 rounded-full hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Round Creation Modal */}
      {showRoundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            onClick={() => setShowRoundModal(false)}
          />
          <div className="relative glass-panel soft-shadow p-10 w-full max-w-2xl z-10 rounded-3xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold font-display tracking-tight">
                Nova Rodada
              </h3>
              <button
                onClick={() => setShowRoundModal(false)}
                className="p-3 rounded-full bg-foreground/5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await createRound(roundForm as any);
                setShowRoundModal(false);
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Nome da Rodada
                  </label>
                  <input
                    value={roundForm.round_name}
                    onChange={(e) =>
                      setRoundForm({ ...roundForm, round_name: e.target.value })
                    }
                    className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Tipo
                  </label>
                  <Select
                    value={roundForm.round_type}
                    onChange={(e) =>
                      setRoundForm({ ...roundForm, round_type: e.target.value })
                    }
                  >
                    {Object.entries(ROUND_TYPE_LABELS).map(([k, v]) => (
                      <option
                        key={k}
                        value={k}
                        className="bg-background text-foreground"
                      >
                        {v}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Pre-Money Valuation (R$)
                  </label>
                  <input
                    type="number"
                    value={roundForm.pre_money_valuation}
                    onChange={(e) =>
                      setRoundForm({
                        ...roundForm,
                        pre_money_valuation: Number(e.target.value),
                      })
                    }
                    className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Valor Levantado (R$)
                  </label>
                  <input
                    type="number"
                    value={roundForm.amount_raised}
                    onChange={(e) =>
                      setRoundForm({
                        ...roundForm,
                        amount_raised: Number(e.target.value),
                      })
                    }
                    className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowRoundModal(false)}
                  className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                >
                  {loading ? "Salvando..." : "Salvar Rodada"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shareholder Modal */}
      {showShareholderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            onClick={() => setShowShareholderModal(false)}
          />
          <div className="relative glass-panel soft-shadow p-10 w-full max-w-2xl z-10 rounded-3xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold font-display tracking-tight">
                Novo Acionista
              </h3>
              <button
                onClick={() => setShowShareholderModal(false)}
                className="p-3 rounded-full bg-foreground/5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setVestingError(null);

                const vs = shareholderForm.vesting_schedule;
                if (vs?.start_date || vs?.cliff_months || vs?.duration_months) {
                  if (!vs.start_date) {
                    setVestingError(
                      "Data de início é obrigatória quando vesting é definido.",
                    );
                    return;
                  }
                  if (!vs.duration_months || vs.duration_months <= 0) {
                    setVestingError("Duração deve ser maior que 0.");
                    return;
                  }
                  if (
                    vs.cliff_months &&
                    vs.cliff_months >= vs.duration_months
                  ) {
                    setVestingError(
                      "Cliff deve ser menor que a duração total.",
                    );
                    return;
                  }
                }

                await addShareholder(shareholderForm as any);
                setShowShareholderModal(false);
                setVestingError(null);
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Nome
                  </label>
                  <input
                    value={shareholderForm.shareholder_name}
                    onChange={(e) =>
                      setShareholderForm({
                        ...shareholderForm,
                        shareholder_name: e.target.value,
                      })
                    }
                    className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Tipo
                  </label>
                  <Select
                    value={shareholderForm.shareholder_type}
                    onChange={(e) =>
                      setShareholderForm({
                        ...shareholderForm,
                        shareholder_type: e.target.value,
                      })
                    }
                  >
                    <option
                      value="founder"
                      className="bg-background text-foreground"
                    >
                      Fundador
                    </option>
                    <option
                      value="investor"
                      className="bg-background text-foreground"
                    >
                      Investidor
                    </option>
                    <option
                      value="employee"
                      className="bg-background text-foreground"
                    >
                      Colaborador
                    </option>
                    <option
                      value="advisor"
                      className="bg-background text-foreground"
                    >
                      Advisor
                    </option>
                    <option
                      value="other"
                      className="bg-background text-foreground"
                    >
                      Outro
                    </option>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Ações
                  </label>
                  <input
                    type="number"
                    value={shareholderForm.shares_count}
                    onChange={(e) =>
                      setShareholderForm({
                        ...shareholderForm,
                        shares_count: Number(e.target.value),
                      })
                    }
                    className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    % Participação
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={shareholderForm.ownership_percentage}
                    onChange={(e) =>
                      setShareholderForm({
                        ...shareholderForm,
                        ownership_percentage: Number(e.target.value),
                      })
                    }
                    className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Investido (R$)
                  </label>
                  <input
                    type="number"
                    value={shareholderForm.investment_amount}
                    onChange={(e) =>
                      setShareholderForm({
                        ...shareholderForm,
                        investment_amount: Number(e.target.value),
                      })
                    }
                    className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
                  />
                </div>
              </div>

              {/* Vesting Schedule */}
              <div className="p-6 rounded-2xl bg-foreground/5 border border-border/10 space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">
                  Vesting Schedule (Opcional)
                </h4>
                {vestingError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {vestingError}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Data Início
                    </label>
                    <input
                      type="date"
                      value={shareholderForm.vesting_schedule?.start_date || ""}
                      onChange={(e) =>
                        setShareholderForm({
                          ...shareholderForm,
                          vesting_schedule: {
                            ...shareholderForm.vesting_schedule,
                            start_date: e.target.value,
                          },
                        })
                      }
                      className="glass-input w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Cliff (Meses)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={
                        shareholderForm.vesting_schedule?.cliff_months || ""
                      }
                      onChange={(e) =>
                        setShareholderForm({
                          ...shareholderForm,
                          vesting_schedule: {
                            ...shareholderForm.vesting_schedule,
                            cliff_months: Number(e.target.value),
                          },
                        })
                      }
                      className="glass-input w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
                      placeholder="Ex: 12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Duração (Meses)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={
                        shareholderForm.vesting_schedule?.duration_months || ""
                      }
                      onChange={(e) =>
                        setShareholderForm({
                          ...shareholderForm,
                          vesting_schedule: {
                            ...shareholderForm.vesting_schedule,
                            duration_months: Number(e.target.value),
                          },
                        })
                      }
                      className="glass-input w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
                      placeholder="Ex: 48"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowShareholderModal(false)}
                  className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                >
                  {loading ? "Salvando..." : "Adicionar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
