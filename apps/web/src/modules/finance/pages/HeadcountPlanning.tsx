import { useState } from "react";
import { useHeadcount, HeadcountPlan } from "../hooks/useHeadcount";
/* 
  <head>
    <title>Headcount Planning | Leadgers</title>
    <meta name="description" content="Planejamento de equipe" />
    <meta property="og:title" content="Headcount Planning" />
  </head>
*/
import {
  Users,
  Plus,
  Trash2,
  CalendarDays,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

export default function HeadcountPlanning() {
  const { plans, loading, error, createPlan, deletePlan, updatePlan } =
    useHeadcount();
  const [isAdding, setIsAdding] = useState(false);
  const [newPlan, setNewPlan] = useState<Partial<HeadcountPlan>>({
    role_title: "",
    department: "Engenharia",
    monthly_salary: 0,
    expected_start_date: new Date().toISOString().split("T")[0],
    status: "planned",
  });

  const handleCreate = async () => {
    if (
      !newPlan.role_title ||
      !newPlan.monthly_salary ||
      !newPlan.expected_start_date
    )
      return;
    try {
      await createPlan({
        role_title: newPlan.role_title,
        department: newPlan.department || "Desconhecido",
        monthly_salary: Number(newPlan.monthly_salary),
        expected_start_date: newPlan.expected_start_date,
        status: (newPlan.status as any) || "planned",
      });
      setIsAdding(false);
      setNewPlan({
        role_title: "",
        department: "Engenharia",
        monthly_salary: 0,
        expected_start_date: new Date().toISOString().split("T")[0],
        status: "planned",
      });
    } catch (err) {
      alert("Erro ao criar vaga");
    }
  };

  if (loading && plans.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center text-destructive">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <p className="font-bold">Falha ao carregar Headcount Plans</p>
        <p className="text-sm mt-2 opacity-80">{error}</p>
      </div>
    );
  }

  const activePlans = plans.filter((p) => p.status !== "cancelled");
  const totalMonthlyImpact = activePlans.reduce(
    (sum, p) => sum + Number(p.monthly_salary),
    0,
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Headcount Planning
          </h1>
          <p className="text-sm text-muted-foreground mt-1 uppercase tracking-widest font-bold opacity-60">
            Modele o crescimento da equipe e analise o impacto no Burn Rate
            futuro.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Contratação
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-6 rounded-3xl border-border/30 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex flex-col items-center justify-center text-blue-500 border-4 border-blue-500/20">
            <span className="text-2xl font-black leading-none">
              {activePlans.length}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">
              Vagas Planejadas
            </h2>
            <p className="text-sm text-muted-foreground">
              Novas adições à equipe no horizonte
            </p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border-border/30 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex flex-col items-center justify-center text-red-500 border-4 border-red-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              +{" "}
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalMonthlyImpact)}
              <span className="text-xs text-muted-foreground font-normal">
                /mês
              </span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Impacto consolidado no Burn Rate mensal
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl border-border/30 overflow-hidden">
        <div className="p-6 bg-muted/20 border-b border-border/30 flex justify-between items-center">
          <h3 className="font-black uppercase tracking-widest text-sm text-muted-foreground flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> Roadmap de Contratações
          </h3>
        </div>

        {isAdding && (
          <div className="p-6 border-b border-border/30 bg-muted/10 grid grid-cols-1 md:grid-cols-6 gap-4 items-end animate-in fade-in slide-in-from-top-4">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                Cargo
              </label>
              <input
                type="text"
                placeholder="Ex: Senior Backend Eng..."
                className="w-full bg-background border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 ring-primary outline-none"
                value={newPlan.role_title}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, role_title: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                Depto
              </label>
              <select
                className="w-full bg-background border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 ring-primary outline-none"
                value={newPlan.department}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, department: e.target.value })
                }
              >
                <option value="Engenharia">Engenharia</option>
                <option value="Vendas">Vendas</option>
                <option value="Marketing">Marketing</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Fundadores">Fundadores</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                Salário (BRL)
              </label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full bg-background border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 ring-primary outline-none select-all"
                value={newPlan.monthly_salary}
                onChange={(e) =>
                  setNewPlan({
                    ...newPlan,
                    monthly_salary: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                Início Previsto
              </label>
              <input
                type="date"
                className="w-full bg-background border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 ring-primary outline-none relative"
                value={newPlan.expected_start_date}
                onChange={(e) =>
                  setNewPlan({
                    ...newPlan,
                    expected_start_date: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-primary/90"
              >
                Salvar
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 bg-muted text-muted-foreground py-2.5 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-muted/80"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="divide-y divide-border/20">
          {plans.length === 0 && !isAdding ? (
            <div className="p-12 text-center text-muted-foreground font-bold">
              Não há vagas planejadas para os próximos períodos.
            </div>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-lg text-foreground truncate">
                      {plan.role_title}
                    </h4>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                        plan.status === "hired"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : plan.status === "cancelled"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      {plan.status === "planned"
                        ? "Planejado"
                        : plan.status === "hired"
                          ? "Contratado"
                          : "Cancelado"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                    <span>{plan.department}</span>
                    <span>•</span>
                    <span>
                      Início em{" "}
                      {new Date(plan.expected_start_date).toLocaleDateString(
                        "pt-BR",
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                      Impacto Mensal
                    </p>
                    <p className="font-black text-foreground">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(plan.monthly_salary)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    {plan.status === "planned" && (
                      <button
                        onClick={() => updatePlan(plan.id, { status: "hired" })}
                        className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20"
                        title="Marcar como Contratado"
                      >
                        <TrendingUp className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"
                      title="Excluir Plano"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
