import { PrismaClient } from "@prisma/client";
import {
  IFinanceRepository,
  AccountBalanceDTO,
  IncomeStatementData,
  TrialBalanceEntry,
} from "@leadgers/core";
import { Transaction } from "@leadgers/core";
import { Account } from "@leadgers/core";

export class PrismaFinanceRepository implements IFinanceRepository {
  constructor(
    private prisma: PrismaClient,
    private tenantId: string,
  ) {}

  async saveTransaction(transaction: Transaction): Promise<void> {
    const data = transaction.toPersistence();
    await this.prisma.$executeRaw`
      INSERT INTO transactions (id, tenant_id, date, description, account_debit_id, account_credit_id, amount, created_by, created_at)
      VALUES (${data.id}::uuid, ${this.tenantId}::uuid, ${data.date}::date, ${data.description}, ${data.account_debit_id}::uuid, ${data.account_credit_id}::uuid, ${data.amount}, ${data.created_by}::uuid, ${data.created_at}::timestamptz)
      ON CONFLICT (id) DO UPDATE SET
        date = EXCLUDED.date,
        description = EXCLUDED.description,
        amount = EXCLUDED.amount;
    `;
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    const raw = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM transactions WHERE id = ${id}::uuid AND tenant_id = ${this.tenantId}::uuid
    `;
    if (!raw || raw.length === 0) return null;
    return Transaction.fromPersistence(raw[0]);
  }

  async getTransactionsByPeriod(
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]> {
    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];

    const raw = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM transactions 
      WHERE tenant_id = ${this.tenantId}::uuid 
        AND date >= ${startStr}::date 
        AND date <= ${endStr}::date
      ORDER BY date DESC
    `;
    return raw.map(Transaction.fromPersistence);
  }

  async getTransactionsByAccount(accountId: string): Promise<Transaction[]> {
    const raw = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM transactions 
      WHERE tenant_id = ${this.tenantId}::uuid 
        AND (account_debit_id = ${accountId}::uuid OR account_credit_id = ${accountId}::uuid)
      ORDER BY date DESC
    `;
    return raw.map(Transaction.fromPersistence);
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.prisma
      .$executeRaw`DELETE FROM transactions WHERE id = ${id}::uuid AND tenant_id = ${this.tenantId}::uuid`;
  }

  async getAccountById(id: string): Promise<Account | null> {
    const raw = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM accounts WHERE id = ${id}::uuid AND tenant_id = ${this.tenantId}::uuid
    `;
    if (!raw || raw.length === 0) return null;
    return Account.fromPersistence(raw[0]);
  }

  async getAllAccounts(): Promise<Account[]> {
    const raw = await this.prisma.$queryRaw<
      any[]
    >`SELECT * FROM accounts WHERE tenant_id = ${this.tenantId}::uuid`;
    return raw.map(Account.fromPersistence);
  }

  async createAccount(account: Account): Promise<void> {
    const data = account.toPersistence();
    await this.prisma.$executeRaw`
      INSERT INTO accounts (id, tenant_id, name, code, type, is_analytical, balance, currency)
      VALUES (${data.id}::uuid, ${this.tenantId}::uuid, ${data.name}, ${data.code}, ${data.type}, ${data.is_analytical}, ${data.balance}, ${data.currency})
    `;
  }

  async updateAccount(account: Account): Promise<void> {
    const data = account.toPersistence();
    await this.prisma.$executeRaw`
      UPDATE accounts 
      SET name = ${data.name}, code = ${data.code}, type = ${data.type}, is_analytical = ${data.is_analytical}, balance = ${data.balance}
      WHERE id = ${data.id}::uuid AND tenant_id = ${this.tenantId}::uuid
    `;
  }

  async deleteAccount(id: string): Promise<void> {
    await this.prisma
      .$executeRaw`DELETE FROM accounts WHERE id = ${id}::uuid AND tenant_id = ${this.tenantId}::uuid`;
  }

  async getAccountBalance(accountId: string, date: Date): Promise<number> {
    const dateStr = date.toISOString().split("T")[0];
    const raw = await this.prisma.$queryRaw<any[]>`
      SELECT 
        COALESCE(SUM(CASE WHEN account_debit_id = ${accountId}::uuid THEN amount ELSE 0 END), 0) as total_debit,
        COALESCE(SUM(CASE WHEN account_credit_id = ${accountId}::uuid THEN amount ELSE 0 END), 0) as total_credit
      FROM transactions 
      WHERE tenant_id = ${this.tenantId}::uuid AND date <= ${dateStr}::date 
        AND (account_debit_id = ${accountId}::uuid OR account_credit_id = ${accountId}::uuid)
    `;

    if (!raw || raw.length === 0) return 0;

    const account = await this.getAccountById(accountId);
    if (!account) return 0;

    const isDebit = account.isDebitNature();
    return isDebit
      ? Number(raw[0].total_debit) - Number(raw[0].total_credit)
      : Number(raw[0].total_credit) - Number(raw[0].total_debit);
  }

  async getTrialBalance(_date: Date): Promise<TrialBalanceEntry[]> {
    throw new Error("Method not implemented.");
  }

  async getIncomeStatement(
    startDate: Date,
    endDate: Date,
  ): Promise<IncomeStatementData> {
    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];

    // Busca transações em contas de Receita e Despesa
    const raw = await this.prisma.$queryRaw<any[]>`
      SELECT 
        a.type as account_type,
        a.name as account_name,
        COALESCE(SUM(t.amount), 0) as total
      FROM transactions t
      JOIN accounts a ON (t.account_debit_id = a.id OR t.account_credit_id = a.id)
      WHERE t.tenant_id = ${this.tenantId}::uuid
        AND t.date >= ${startStr}::date 
        AND t.date <= ${endStr}::date
        AND a.type IN ('Receita', 'Despesa')
      GROUP BY a.type, a.name
    `;

    let revenue = 0;
    let expenses = 0;
    const revenueByCategory: Record<string, number> = {};
    const expensesByCategory: Record<string, number> = {};

    for (const row of raw) {
      const amount = Number(row.total);
      if (row.account_type === "Receita") {
        revenue += amount;
        revenueByCategory[row.account_name] = amount;
      } else if (row.account_type === "Despesa") {
        expenses += amount;
        expensesByCategory[row.account_name] = amount;
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
    _startDate: Date,
    _endDate: Date,
  ): Promise<AccountBalanceDTO[]> {
    throw new Error("Method not implemented.");
  }

  // === CAP TABLE ===

  async deleteRound(id: string, tenantId: string): Promise<void> {
    await this.prisma.cap_table_rounds.delete({
      where: { id, tenant_id: tenantId },
    });
  }

  async deleteShareholder(id: string, tenantId: string): Promise<void> {
    await this.prisma.cap_table_shareholders.delete({
      where: { id, tenant_id: tenantId },
    });
  }
}
