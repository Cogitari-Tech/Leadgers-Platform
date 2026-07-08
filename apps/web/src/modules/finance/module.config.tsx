// apps/web/src/modules/finance/module.config.ts
import { lazy } from "react";
import type { ModuleConfig } from "../registry";

const CashFlow = lazy(() => import("./pages/CashFlow"));
const BalanceSheet = lazy(() => import("./pages/BalanceSheet"));
const FinanceDashboard = lazy(() => import("./pages/FinanceDashboard"));
const IncomeStatement = lazy(() => import("./pages/IncomeStatement"));
const RunwayCalculator = lazy(() => import("./pages/RunwayCalculator"));
const CapTable = lazy(() => import("./pages/CapTable"));
const EquityTracker = lazy(() => import("./pages/EquityTracker"));
const HeadcountPlanning = lazy(() => import("./pages/HeadcountPlanning"));
const UnitEconomics = lazy(() => import("./pages/UnitEconomics"));
const BurnRate = lazy(() => import("./pages/BurnRate"));
const FinancialProjections = lazy(() => import("./pages/FinancialProjections"));

export const financeModuleConfig: ModuleConfig = {
  id: "finance",
  name: "Gerir Finanças",
  description:
    "Gestão financeira completa: caixa, balanço, DRE, runway, cap table, unit economics, burn rate e projeções",
  icon: "Banknote",
  version: "2.0.0",

  // Permissões necessárias
  permissions: [
    "finance.view",
    "finance.create",
    "finance.edit",
    "finance.delete",
    "finance.export",
    "finance.cap_table",
    "finance.projections",
  ],

  // Rotas do módulo (lazy loaded)
  routes: [
    {
      path: "finance",
      element: <FinanceDashboard />,
      handle: { title: "Visão Geral" },
    },
    {
      path: "finance/cash-flow",
      element: <CashFlow />,
      handle: { title: "Acompanhar Caixa" },
    },
    {
      path: "finance/balance-sheet",
      element: <BalanceSheet />,
      handle: { title: "Analisar Balanço" },
    },
    {
      path: "finance/income-statement",
      element: <IncomeStatement />,
      handle: { title: "Consultar DRE" },
    },
    {
      path: "finance/runway",
      element: <RunwayCalculator />,
      handle: { title: "Calcular Runway" },
    },
    {
      path: "finance/cap-table",
      element: <CapTable />,
      handle: { title: "Cap Table" },
    },
    {
      path: "finance/equity",
      element: <EquityTracker />,
      handle: { title: "Equity & Vesting" },
    },
    {
      path: "finance/headcount",
      element: <HeadcountPlanning />,
      handle: { title: "Headcount Planning" },
    },
    {
      path: "finance/unit-economics",
      element: <UnitEconomics />,
      handle: { title: "Avaliar Economics" },
    },
    {
      path: "finance/burn-rate",
      element: <BurnRate />,
      handle: { title: "Acompanhar Burn Rate" },
    },
    {
      path: "finance/projections",
      element: <FinancialProjections />,
      handle: { title: "Criar Projeções" },
    },
  ],

  // Links da sidebar
  navigation: [
    {
      label: "Visão Geral",
      path: "finance",
      icon: "LayoutDashboard",
    },
    {
      label: "Acompanhar Caixa",
      path: "finance/cash-flow",
      icon: "TrendingUp",
    },
    {
      label: "Analisar Balanço",
      path: "finance/balance-sheet",
      icon: "BarChart3",
    },
    {
      label: "Consultar DRE",
      path: "finance/income-statement",
      icon: "FileText",
    },
    {
      label: "Calcular Runway",
      path: "finance/runway",
      icon: "Fuel",
    },
    {
      label: "Cap Table",
      path: "finance/cap-table",
      icon: "PieChart",
    },
    {
      label: "Equity & Vesting",
      path: "finance/equity",
      icon: "Award",
    },
    {
      label: "Headcount",
      path: "finance/headcount",
      icon: "Users",
    },
    {
      label: "Avaliar Economics",
      path: "finance/unit-economics",
      icon: "Target",
    },
    {
      label: "Acompanhar Burn Rate",
      path: "finance/burn-rate",
      icon: "Flame",
    },
    {
      label: "Criar Projeções",
      path: "finance/projections",
      icon: "Presentation",
    },
  ],

  // Configurações específicas do módulo
  settings: {
    currency: "BRL",
    fiscalYearStart: "01-01",
    taxRegime: "lucro_real", // ou 'simples_nacional', 'lucro_presumido'
  },

  // Lifecycle hooks
  onModuleLoad: async () => {
    console.log("✅ Controle Financeiro carregado");
  },

  onModuleUnload: async () => {
    console.log("🔌 Controle Financeiro descarregado");
  },
};

export default financeModuleConfig;
