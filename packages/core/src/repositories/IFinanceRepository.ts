// packages/core/src/repositories/IFinanceRepository.ts

import { Transaction } from "../entities/Transaction";
import { Account } from "../entities/Account";

/**
 * Interface do Repositório Financeiro (Port)
 *
 * Define o contrato para persistência de dados financeiros.
 * Implementações concretas (Adapters) podem usar Supabase,
 * LocalStorage, ou qualquer outro storage.
 */
export interface IFinanceRepository {
  // === TRANSACTIONS ===

  /**
   * Salva uma nova transação
   */
  saveTransaction(transaction: Transaction): Promise<void>;

  /**
   * Busca transação por ID
   */
  getTransactionById(id: string): Promise<Transaction | null>;

  /**
   * Lista transações de um período
   */
  getTransactionsByPeriod(
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]>;

  /**
   * Lista transações por conta
   */
  getTransactionsByAccount(accountId: string): Promise<Transaction[]>;

  /**
   * Deleta uma transação
   */
  deleteTransaction(id: string): Promise<void>;

  // === ACCOUNTS ===

  /**
   * Busca conta por ID
   */
  getAccountById(id: string): Promise<Account | null>;

  /**
   * Lista todo o plano de contas
   */
  getAllAccounts(): Promise<Account[]>;

  /**
   * Cria uma nova conta
   */
  createAccount(account: Account): Promise<void>;

  /**
   * Atualiza uma conta existente
   */
  updateAccount(account: Account): Promise<void>;

  /**
   * Deleta uma conta (só se não tiver lançamentos)
   */
  deleteAccount(id: string): Promise<void>;

  // === REPORTS ===

  /**
   * Calcula o saldo de uma conta em uma data específica
   */
  getAccountBalance(accountId: string, date: Date): Promise<number>;

  /**
   * Gera balancete de verificação
   */
  getTrialBalance(date: Date): Promise<TrialBalanceEntry[]>;

  /**
   * Gera DRE (Demonstração de Resultado do Exercício)
   */
  getIncomeStatement(
    startDate: Date,
    endDate: Date,
  ): Promise<IncomeStatementData>;
  /**
   * Obtém saldos de todas as contas em um período (para DRE e Balanço)
   */
  getAccountBalances(
    startDate: Date,
    endDate: Date,
  ): Promise<AccountBalanceDTO[]>;

  // === CAP TABLE ===

  /**
   * Deleta um round da cap table
   */
  deleteRound(id: string, tenantId: string): Promise<void>;

  /**
   * Deleta um shareholder
   */
  deleteShareholder(id: string, tenantId: string): Promise<void>;
}

// DTOs para relatórios
export interface TrialBalanceEntry {
  accountCode: string;
  accountName: string;
  debitBalance: number;
  creditBalance: number;
}

export interface IncomeStatementData {
  revenue: number;
  expenses: number;
  netIncome: number;
  details: {
    revenueByCategory: Record<string, number>;
    expensesByCategory: Record<string, number>;
  };
}

export interface AccountBalanceDTO {
  accountId: string;
  accountName: string;
  accountCode: string;
  accountType: string;
  isAnalytical: boolean;
  debitTotal: number;
  creditTotal: number;
  balance: number;
}
