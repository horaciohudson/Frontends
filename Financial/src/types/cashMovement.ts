// Tipos para Movimento de Caixa
// Representa movimentações bancárias reais (diferentes de Cash Flow que é gerencial)

import type { AuditInfo, BaseFilters } from './common';

export interface CashMovementDTO extends AuditInfo {
    id: number;
    tenantId: string;
    companyId: string;

    // Tipo e valores
    movementType: string; // INFLOW / OUTFLOW
    amount: number;
    currency: string;

    // Datas
    movementDate: string;
    bankStatementDate?: string;

    // Conta bancária
    bankAccountId: number;
    bankReference?: string;

    // Categorização
    categoryId?: number;
    category?: string;
    costCenterId?: number;

    // Detalhes
    description?: string;
    paymentMethod?: string;
    documentNumber?: string;
    beneficiaryName?: string;

    // Status
    movementStatus: string;

    // Conciliação
    reconciliationId?: number;
    reconciledAt?: string;

    // Controle
    isActive: boolean;

    // Auditoria adicional
    cancelledAt?: string;
    cancelledBy?: string;
    cancellationReason?: string;
}

export interface CreateCashMovementDTO {
    companyId?: string; // Será preenchido pelo service
    movementType: string; // INFLOW / OUTFLOW
    amount: number;
    currency?: string;
    movementDate: string;
    bankStatementDate?: string;
    bankAccountId: number;
    bankReference?: string;
    categoryId?: number;
    category?: string;
    costCenterId?: number;
    description?: string;
    paymentMethod?: string;
    documentNumber?: string;
    beneficiaryName?: string;
    movementStatus?: string;
}

export interface UpdateCashMovementDTO extends CreateCashMovementDTO {
    id: number;
}

export interface CashMovementFilters extends BaseFilters {
    movementType?: string;
    bankAccountId?: number;
    movementStatus?: string;
    startDate?: string;
    endDate?: string;
}

export interface BankAccountBalance {
    bankAccountId: number;
    balance: number;
    startDate: string;
    endDate: string;
}
