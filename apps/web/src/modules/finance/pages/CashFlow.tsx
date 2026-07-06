// apps/web/src/modules/finance/pages/CashFlow.tsx

import React, { useState } from "react";
import { useFinance } from "../hooks/useFinance";
import { Button } from "@/shared/components/ui/Button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Plus, TrendingUp, TrendingDown, DollarSign, X } from "lucide-react";
import { Select } from "@/shared/components/ui/Select";

/**
 * Página de Fluxo de Caixa
 *
 * Exibe gráfico de entradas/saídas e lista de transações.
 * Permite adicionar novas transações via modal.
 */
export default function CashFlow() {
  const {
    transactions,
    accounts,
    loading,
    error,
    createTransaction,
    getMonthSummary,
    formatCurrency,
    formatDate,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    accountDebitId: "",
    accountCreditId: "",
    amount: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const summary = getMonthSummary();

  // Prepara dados para o gráfico
  const chartData = transactions.reduce(
    (acc, transaction) => {
      const dateKey = formatDate(transaction.date);

      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, inflow: 0, outflow: 0 };
      }

      const creditAccount = accounts.find(
        (a) => a.id === transaction.accountCreditId,
      );
      const debitAccount = accounts.find(
        (a) => a.id === transaction.accountDebitId,
      );

      if (creditAccount?.type === "Receita") {
        acc[dateKey].inflow += transaction.amount;
      }
      if (debitAccount?.type === "Despesa") {
        acc[dateKey].outflow += transaction.amount;
      }

      return acc;
    },
    {} as Record<string, { date: string; inflow: number; outflow: number }>,
  );

  const chartDataArray = Object.values(chartData);

  // Handler do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createTransaction({
        date: new Date(formData.date),
        description: formData.description,
        accountDebitId: formData.accountDebitId,
        accountCreditId: formData.accountCreditId,
        amount: parseFloat(formData.amount),
      });

      // Reseta formulário e fecha modal
      setFormData({
        date: new Date().toISOString().split("T")[0],
        description: "",
        accountDebitId: "",
        accountCreditId: "",
        amount: "",
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create transaction:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtra apenas contas analíticas (folhas)
  const analyticalAccounts = accounts.filter((a) => a.isAnalytical);

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-1 bg-primary rounded-full" />
            <h1 className="text-4xl font-bold tracking-tight font-display">
              Fluxo de Caixa
            </h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Controle de entradas e saídas do mês vigente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            className="rounded-2xl px-6 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Transação
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card soft-shadow p-8 rounded-3xl group hover:-translate-y-2 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-4 bg-emerald-500/10 rounded-3xl">
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-full">
                Entradas
              </span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-bold font-display tracking-tight text-foreground">
              {formatCurrency(summary.revenue)}
            </h3>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Fluxo operacional mensal
            </p>
          </div>
        </div>

        <div className="glass-card soft-shadow p-8 rounded-3xl group hover:-translate-y-2 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-4 bg-destructive/10 rounded-3xl">
              <TrendingDown className="w-8 h-8 text-destructive" />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-destructive uppercase tracking-widest px-3 py-1 bg-destructive/5 rounded-full">
                Saídas
              </span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-bold font-display tracking-tight text-foreground">
              {formatCurrency(summary.expenses)}
            </h3>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Comprometimento de caixa
            </p>
          </div>
        </div>

        <div className="glass-card soft-shadow p-8 rounded-3xl group hover:-translate-y-2 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-4 bg-primary/10 rounded-3xl">
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-3 py-1 bg-primary/5 rounded-full">
                Saldo
              </span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-bold font-display tracking-tight text-foreground">
              {formatCurrency(summary.netIncome)}
            </h3>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Disponibilidade imediata
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card soft-shadow p-10 rounded-3xl">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">
              Evolução do Fluxo de Caixa
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
              Histórico consolidado de movimentações
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartDataArray}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{
                fill: "rgba(255,255,255,0.4)",
                fontSize: 10,
                fontWeight: 700,
              }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{
                fill: "rgba(255,255,255,0.4)",
                fontSize: 10,
                fontWeight: 700,
              }}
              axisLine={false}
              tickLine={false}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                color: "#fff",
                padding: "12px 16px",
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
              }}
              formatter={(value) => [formatCurrency(Number(value)), ""]}
              labelStyle={{
                fontWeight: 800,
                marginBottom: "8px",
                color: "rgba(255,255,255,0.5)",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{
                paddingBottom: "30px",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            />
            <Line
              type="monotone"
              dataKey="inflow"
              stroke="#10b981"
              strokeWidth={4}
              dot={{ r: 0 }}
              activeDot={{ r: 6, fill: "#10b981", strokeWidth: 0 }}
              name="Entradas"
            />
            <Line
              type="monotone"
              dataKey="outflow"
              stroke="#ef4444"
              strokeWidth={4}
              dot={{ r: 0 }}
              activeDot={{ r: 6, fill: "#ef4444", strokeWidth: 0 }}
              name="Saídas"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions Table */}
      <div className="glass-card soft-shadow overflow-hidden rounded-3xl">
        <div className="p-10 border-b border-border/40 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">
              Transações Recentes
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
              {summary.transactionCount} lançamentos registrados no mês
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] border-b border-white/5">
                <th className="px-10 py-6 text-left">Data</th>
                <th className="px-10 py-6 text-left">Descrição</th>
                <th className="px-10 py-6 text-left">Débito</th>
                <th className="px-10 py-6 text-left">Crédito</th>
                <th className="px-10 py-6 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((transaction) => {
                const debitAccount = accounts.find(
                  (a) => a.id === transaction.accountDebitId,
                );
                const creditAccount = accounts.find(
                  (a) => a.id === transaction.accountCreditId,
                );

                return (
                  <tr
                    key={transaction.id}
                    className="hover:bg-muted/50 transition-all group"
                  >
                    <td className="px-10 py-8 text-xs font-bold text-muted-foreground/60 group-hover:text-foreground">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-10 py-8">
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {transaction.description}
                      </p>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-2 py-1 bg-foreground/5 rounded-md">
                        {debitAccount?.name || "-"}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-2 py-1 bg-foreground/5 rounded-md">
                        {creditAccount?.name || "-"}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <span className="text-sm font-bold text-foreground">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Nova Transação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-xl transition-all animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative glass-panel soft-shadow p-10 w-full max-w-2xl z-10 rounded-3xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">
                  Nova Transação
                </h3>
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                  Registro de movimentação financeira
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-3 rounded-full bg-foreground/5 text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    Data da Operação
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    Valor (BRL)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Descrição / Histórico
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="Ex: Pagamento de honorários mensais"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    Conta de Débito
                  </label>
                  <Select
                    value={formData.accountDebitId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountDebitId: e.target.value,
                      })
                    }
                  >
                    <option value="" className="bg-background text-foreground">
                      Selecione...
                    </option>
                    {analyticalAccounts.map((account) => (
                      <option
                        key={account.id}
                        value={account.id}
                        className="bg-background text-foreground"
                      >
                        {account.code} - {account.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                    Conta de Crédito
                  </label>
                  <Select
                    value={formData.accountCreditId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountCreditId: e.target.value,
                      })
                    }
                  >
                    <option value="" className="bg-background text-foreground">
                      Selecione...
                    </option>
                    {analyticalAccounts.map((account) => (
                      <option
                        key={account.id}
                        value={account.id}
                        className="bg-background text-foreground"
                      >
                        {account.code} - {account.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                >
                  {submitting ? "Processando..." : "Salvar Transação"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
