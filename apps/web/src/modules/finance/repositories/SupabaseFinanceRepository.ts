// apps/web/src/infrastructure/repositories/SupabaseFinanceRepository.ts

import { SupabaseClient } from "@supabase/supabase-js";
import {
  IFinanceRepository,
  TrialBalanceEntry,
  IncomeStatementData,
  AccountBalanceDTO,
} from "@leadgers/core/repositories/IFinanceRepository";
import { Transaction } from "@leadgers/core/entities/Transaction";
import { Account } from "@leadgers/core/entities/Account";

/**
 * Implementação concreta do repositório usando Supabase
 */
export class SupabaseFinanceRepository implements IFinanceRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // === TRANSACTIONS ===

  async saveTransaction(transaction: Transaction): Promise<void> {
    const { error } = await this.supabase
      .from("transactions")
      .insert(transaction.toPersistence());

    if (error) {
      throw new Error(`Failed to save transaction: ${error.message}`);
    }
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    const { data, error } = await this.supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw new Error(`Failed to get transaction: ${error.message}`);
    }

    return Transaction.fromPersistence(data);
  }

  async getTransactionsByPeriod(
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from("transactions")
      .select("*")
      .gte("date", startDate.toISOString().split("T")[0])
      .lte("date", endDate.toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (error) {
      throw new Error(`Failed to get transactions: ${error.message}`);
    }

    return data.map(Transaction.fromPersistence);
  }

  async getTransactionsByAccount(accountId: string): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from("transactions")
      .select("*")
      .or(`account_debit_id.eq.${accountId},account_credit_id.eq.${accountId}`)
      .order("date", { ascending: false });

    if (error) {
      throw new Error(`Failed to get transactions: ${error.message}`);
    }

    return data.map(Transaction.fromPersistence);
  }

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete transaction: ${error.message}`);
    }
  }

  // === ACCOUNTS ===

  async getAccountById(id: string): Promise<Account | null> {
    const { data, error } = await this.supabase
      .from("accounts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to get account: ${error.message}`);
    }

    return Account.fromPersistence(data);
  }

  async getAllAccounts(): Promise<Account[]> {
    const { data, error } = await this.supabase
      .from("accounts")
      .select("*")
      .order("code", { ascending: true });

    if (error) {
      throw new Error(`Failed to get accounts: ${error.message}`);
    }

    return data.map(Account.fromPersistence);
  }

  async createAccount(account: Account): Promise<void> {
    const { error } = await this.supabase
      .from("accounts")
      .insert(account.toPersistence());

    if (error) {
      throw new Error(`Failed to create account: ${error.message}`);
    }
  }

  async updateAccount(account: Account): Promise<void> {
    const { error } = await this.supabase
      .from("accounts")
      .update(account.toPersistence())
      .eq("id", account.id);

    if (error) {
      throw new Error(`Failed to update account: ${error.message}`);
    }
  }

  async deleteAccount(id: string): Promise<void> {
    // Primeiro verifica se há transações
    const { count } = await this.supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .or(`account_debit_id.eq.${id},account_credit_id.eq.${id}`);

    if (count && count > 0) {
      throw new Error("Cannot delete account with existing transactions");
    }

    const { error } = await this.supabase
      .from("accounts")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete account: ${error.message}`);
    }
  }

  // === REPORTS ===

  async getAccountBalance(accountId: string, date: Date): Promise<number> {
    // Busca todas as transações até a data especificada
    const transactions = await this.getTransactionsByAccount(accountId);
    const filteredTransactions = transactions.filter((t) => t.date <= date);

    // Calcula saldo baseado no tipo de conta
    const account = await this.getAccountById(accountId);
    if (!account) throw new Error("Account not found");

    let balance = 0;
    for (const transaction of filteredTransactions) {
      if (transaction.accountDebitId === accountId) {
        // Natureza devedora: Ativo e Despesa
        balance += account.isDebitNature()
          ? transaction.amount
          : -transaction.amount;
      } else {
        // Natureza credora: Passivo, Patrimônio e Receita
        balance += account.isDebitNature()
          ? -transaction.amount
          : transaction.amount;
      }
    }

    return balance;
  }

  async getTrialBalance(date: Date): Promise<TrialBalanceEntry[]> {
    const accounts = await this.getAllAccounts();
    const analyticalAccounts = accounts.filter((a) => a.isAnalytical);

    const entries: TrialBalanceEntry[] = [];

    for (const account of analyticalAccounts) {
      const balance = await this.getAccountBalance(account.id, date);

      entries.push({
        accountCode: account.code,
        accountName: account.name,
        debitBalance: balance >= 0 ? balance : 0,
        creditBalance: balance < 0 ? Math.abs(balance) : 0,
      });
    }

    return entries;
  }

  async getIncomeStatement(
    startDate: Date,
    endDate: Date,
  ): Promise<IncomeStatementData> {
    const balances = await this.getAccountBalances(startDate, endDate);

    let revenue = 0;
    let expenses = 0;
    const revenueByCategory: Record<string, number> = {};
    const expensesByCategory: Record<string, number> = {};

    for (const account of balances) {
      const amount = account.balance;

      // Receita
      if (account.accountType === "Receita") {
        revenue += amount;
        revenueByCategory[account.accountName] =
          (revenueByCategory[account.accountName] || 0) + amount;
      }

      // Despesa
      if (account.accountType === "Despesa") {
        expenses += amount;
        expensesByCategory[account.accountName] =
          (expensesByCategory[account.accountName] || 0) + amount;
      }
    }

    return {
      revenue,
      expenses,
      netIncome: revenue - expenses,
      details: {
        revenueByCategory,
        expensesByCategory,
      },
    };
  }

  async getAccountBalances(
    startDate: Date,
    endDate: Date,
  ): Promise<AccountBalanceDTO[]> {
    const { data, error } = await this.supabase.rpc("get_account_balances", {
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString(),
    });

    if (error) {
      throw new Error(`Failed to get account balances: ${error.message}`);
    }

    return (data as Array<Record<string, unknown>>).map((item) => ({
      accountId: item.account_id as string,
      accountName: item.account_name as string,
      accountCode: item.account_code as string,
      accountType: item.account_type as string,
      isAnalytical: Boolean(item.is_analytical),
      debitTotal: Number(item.debit_total),
      creditTotal: Number(item.credit_total),
      balance: Number(item.balance),
    }));
  }

  // === CAP TABLE ===

  async deleteRound(id: string, tenantId: string): Promise<void> {
    const { error } = await this.supabase
      .from("cap_table_rounds")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);

    if (error) {
      throw new Error(`Failed to delete round: ${error.message}`);
    }
  }

  async deleteShareholder(id: string, tenantId: string): Promise<void> {
    const { error } = await this.supabase
      .from("cap_table_shareholders")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);

    if (error) {
      throw new Error(`Failed to delete shareholder: ${error.message}`);
    }
  }
}
