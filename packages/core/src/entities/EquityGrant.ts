// packages/core/src/entities/EquityGrant.ts

/**
 * Entidade de Domínio: Grant de Stock Options (ESOP)
 *
 * Representa a concessão de opções a um beneficiário com cliff e vesting
 * linear mensal (PRD §7.6). Regras:
 * - Antes do cliff nada vesta; ao atingir o cliff, o período acumulado vesta
 *   de uma vez (RN-01/RN-02).
 * - Aceleração single trigger vesta 100% em evento de M&A/IPO (RN-04);
 *   double trigger exige também desligamento sem justa causa (RN-05).
 * - Desligamento congela o vesting na data do término e abre janela de
 *   exercício (RN-07, padrão 90 dias).
 */

export type AccelerationType = "none" | "single_trigger" | "double_trigger";
export type GrantStatus = "active" | "terminated" | "exercised" | "cancelled";

export interface VestingMilestone {
  date: Date;
  cumulativeVested: number;
}

export interface CreateEquityGrantProps {
  tenantId: string;
  beneficiaryName: string;
  beneficiaryEmail?: string | null;
  optionsTotal: number;
  grantDate: Date;
  cliffMonths?: number;
  vestingMonths?: number;
  grantPrice: number;
  acceleration?: AccelerationType;
  exerciseWindowDays?: number;
  createdBy?: string | null;
}

export class EquityGrant {
  private constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly beneficiaryName: string,
    public readonly beneficiaryEmail: string | null,
    public readonly optionsTotal: number,
    public readonly grantDate: Date,
    public readonly cliffMonths: number,
    public readonly vestingMonths: number,
    public readonly grantPrice: number,
    public readonly acceleration: AccelerationType,
    public status: GrantStatus,
    public terminatedAt: Date | null,
    public readonly exerciseWindowDays: number,
    public readonly createdAt: Date,
  ) {
    this.validate();
  }

  static create(props: CreateEquityGrantProps): EquityGrant {
    return new EquityGrant(
      crypto.randomUUID(),
      props.tenantId,
      props.beneficiaryName,
      props.beneficiaryEmail ?? null,
      props.optionsTotal,
      props.grantDate,
      props.cliffMonths ?? 12,
      props.vestingMonths ?? 48,
      props.grantPrice,
      props.acceleration ?? "none",
      "active",
      null,
      props.exerciseWindowDays ?? 90,
      new Date(),
    );
  }

  static fromPersistence(data: Record<string, unknown>): EquityGrant {
    return new EquityGrant(
      String(data.id),
      String(data.tenant_id),
      String(data.beneficiary_name),
      data.beneficiary_email ? String(data.beneficiary_email) : null,
      Number(data.options_total),
      new Date(String(data.grant_date)),
      Number(data.cliff_months),
      Number(data.vesting_months),
      Number(data.grant_price),
      data.acceleration as AccelerationType,
      data.status as GrantStatus,
      data.terminated_at ? new Date(String(data.terminated_at)) : null,
      Number(data.exercise_window_days),
      new Date(String(data.created_at)),
    );
  }

  toPersistence(): Record<string, unknown> {
    return {
      id: this.id,
      tenant_id: this.tenantId,
      beneficiary_name: this.beneficiaryName,
      beneficiary_email: this.beneficiaryEmail,
      options_total: this.optionsTotal,
      grant_date: this.grantDate,
      cliff_months: this.cliffMonths,
      vesting_months: this.vestingMonths,
      grant_price: this.grantPrice,
      acceleration: this.acceleration,
      status: this.status,
      terminated_at: this.terminatedAt,
      exercise_window_days: this.exerciseWindowDays,
      created_at: this.createdAt,
    };
  }

  /** Meses completos decorridos entre grantDate e a data informada. */
  private monthsElapsed(at: Date): number {
    const months =
      (at.getFullYear() - this.grantDate.getFullYear()) * 12 +
      at.getMonth() -
      this.grantDate.getMonth();
    return at.getDate() >= this.grantDate.getDate() ? months : months - 1;
  }

  /**
   * Soma meses a uma data preservando o dia quando possível.
   * setMonth() puro estoura pra frente quando o dia de origem (29-31) não
   * existe no mês de destino (ex.: 31 jan + 1 mês vira 3 mar, não 28/29 fev).
   * Aqui o resultado é grampeado no último dia do mês de destino.
   */
  private static addMonthsClamped(date: Date, monthsToAdd: number): Date {
    const day = date.getDate();
    const firstOfTargetMonth = new Date(
      date.getFullYear(),
      date.getMonth() + monthsToAdd,
      1,
    );
    const daysInTargetMonth = new Date(
      firstOfTargetMonth.getFullYear(),
      firstOfTargetMonth.getMonth() + 1,
      0,
    ).getDate();
    firstOfTargetMonth.setDate(Math.min(day, daysInTargetMonth));
    return firstOfTargetMonth;
  }

  /**
   * Opções vestidas na data informada.
   * accelerationEvent = M&A/IPO ocorreu (RN-04); involuntaryTermination
   * combinada ao evento cobre o double trigger (RN-05).
   */
  vestedOptions(
    at: Date = new Date(),
    opts: {
      accelerationEvent?: boolean;
      involuntaryTermination?: boolean;
    } = {},
  ): number {
    if (this.status === "cancelled") return 0;

    const singleTriggerFired =
      this.acceleration === "single_trigger" && opts.accelerationEvent === true;
    const doubleTriggerFired =
      this.acceleration === "double_trigger" &&
      opts.accelerationEvent === true &&
      opts.involuntaryTermination === true;
    if (singleTriggerFired || doubleTriggerFired) return this.optionsTotal;

    // Desligamento congela o vesting na data do término (RN-07)
    const effectiveDate =
      this.status === "terminated" &&
      this.terminatedAt &&
      this.terminatedAt < at
        ? this.terminatedAt
        : at;

    const elapsed = this.monthsElapsed(effectiveDate);
    if (elapsed < this.cliffMonths) return 0;
    if (elapsed >= this.vestingMonths) return this.optionsTotal;
    return Math.floor((this.optionsTotal * elapsed) / this.vestingMonths);
  }

  /** Próxima data em que novas opções vestem, ou null se totalmente vestido. */
  nextVestingDate(at: Date = new Date()): Date | null {
    const elapsed = this.monthsElapsed(at);
    if (elapsed >= this.vestingMonths || this.status !== "active") return null;
    const nextMonth = Math.max(this.cliffMonths, elapsed + 1);
    return EquityGrant.addMonthsClamped(this.grantDate, nextMonth);
  }

  /** Timeline de marcos de vesting para os próximos N meses (RN-08). */
  vestingTimeline(months = 24, from: Date = new Date()): VestingMilestone[] {
    const milestones: VestingMilestone[] = [];
    let previous = -1;
    for (let i = 0; i <= months; i++) {
      const date = EquityGrant.addMonthsClamped(from, i);
      const cumulativeVested = this.vestedOptions(date);
      if (cumulativeVested !== previous) {
        milestones.push({ date, cumulativeVested });
        previous = cumulativeVested;
      }
    }
    return milestones;
  }

  /** Janela de exercício pós-desligamento (RN-07). */
  isExerciseWindowOpen(at: Date = new Date()): boolean {
    if (this.status !== "terminated" || !this.terminatedAt) {
      return this.status === "active";
    }
    const deadline = new Date(this.terminatedAt);
    deadline.setDate(deadline.getDate() + this.exerciseWindowDays);
    return at <= deadline;
  }

  terminate(at: Date = new Date()): void {
    if (this.status !== "active") {
      throw new Error(`Cannot terminate grant with status "${this.status}"`);
    }
    this.status = "terminated";
    this.terminatedAt = at;
  }

  private validate(): void {
    if (!this.tenantId) throw new Error("EquityGrant requires tenantId");
    if (!this.beneficiaryName?.trim()) {
      throw new Error("EquityGrant requires beneficiaryName");
    }
    if (!Number.isFinite(this.optionsTotal) || this.optionsTotal <= 0) {
      throw new Error("optionsTotal must be greater than 0");
    }
    if (isNaN(this.grantDate.getTime())) {
      throw new Error("grantDate must be a valid date");
    }
    if (!Number.isInteger(this.vestingMonths) || this.vestingMonths <= 0) {
      throw new Error("vestingMonths must be a positive integer");
    }
    if (!Number.isInteger(this.cliffMonths) || this.cliffMonths < 0) {
      throw new Error("cliffMonths cannot be negative");
    }
    if (this.cliffMonths > this.vestingMonths) {
      throw new Error("cliffMonths must not exceed vestingMonths");
    }
    if (!Number.isFinite(this.grantPrice) || this.grantPrice < 0) {
      throw new Error("grantPrice cannot be negative");
    }
    if (
      !Number.isInteger(this.exerciseWindowDays) ||
      this.exerciseWindowDays < 0
    ) {
      throw new Error("exerciseWindowDays cannot be negative");
    }
  }
}
