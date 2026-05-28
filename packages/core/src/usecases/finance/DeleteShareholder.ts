import { IFinanceRepository } from "../../repositories/IFinanceRepository";
import { DomainError } from "../../errors/DomainErrors";

export interface DeleteShareholderInput {
  shareholderId: string;
  tenantId: string;
  userRole: string;
}

/**
 * Use Case: Delete a Shareholder
 *
 * Security Rule: Only 'admin' or 'manager' roles can delete shareholders.
 */
export class DeleteShareholder {
  constructor(private financeRepository: IFinanceRepository) {}

  async execute(input: DeleteShareholderInput): Promise<{ success: boolean }> {
    // 1. Authorization Check (Blue Team: Role-based Access Control)
    if (input.userRole !== "admin" && input.userRole !== "manager") {
      throw new DomainError(
        "Unauthorized: Only admins and managers can delete shareholders",
        "UNAUTHORIZED",
      );
    }

    await this.financeRepository.deleteShareholder(
      input.shareholderId,
      input.tenantId,
    );

    return { success: true };
  }
}
