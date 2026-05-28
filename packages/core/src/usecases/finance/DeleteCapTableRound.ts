import { IFinanceRepository } from "../../repositories/IFinanceRepository";
import { DomainError } from "../../errors/DomainErrors";

export interface DeleteCapTableRoundInput {
  roundId: string;
  tenantId: string;
  userRole: string;
}

/**
 * Use Case: Delete a Cap Table Round
 *
 * Security Rule: Only 'admin' or 'manager' roles can delete rounds.
 */
export class DeleteCapTableRound {
  constructor(private financeRepository: IFinanceRepository) {}

  async execute(
    input: DeleteCapTableRoundInput,
  ): Promise<{ success: boolean }> {
    // 1. Authorization Check (Blue Team: Role-based Access Control)
    if (input.userRole !== "admin" && input.userRole !== "manager") {
      throw new DomainError(
        "Unauthorized: Only admins and managers can delete rounds",
        "UNAUTHORIZED",
      );
    }

    // 2. Resource Access Check (Is handled by repo usually, but let's be explicit if needed)
    // Here we trust the repo to filter by tenant_id

    await this.financeRepository.deleteRound(input.roundId, input.tenantId);

    return { success: true };
  }
}
