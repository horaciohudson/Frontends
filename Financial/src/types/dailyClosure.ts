// Tipos para Fechamento Diário
// Alinhado com DailyClosure do backend

import type { BaseFilters } from './common';

export enum ClosureScope {
    DAILY = 'DAILY',
    MONTHLY = 'MONTHLY'
}

export enum ClosureStatus {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
    LOCKED = 'LOCKED'
}

export interface DailyClosureDTO {
    id: number;
    tenantId: string;
    companyId: string;

    // Data e escopo
    closureDate: string;
    closureScope: ClosureScope;

    // Conta bancária
    bankAccountId?: number;
    bankAccountName?: string;

    // Saldos
    openingBalance: number;
    totalInflows: number;
    totalOutflows: number;
    closingBalance: number;

    // Contadores
    transactionCount: number;
    inflowCount: number;
    outflowCount: number;

    // Status
    closureStatus: ClosureStatus;

    // Datas de controle
    closedAt?: string;
    closedBy?: string;
    lockedAt?: string;
    lockedBy?: string;

    // Observações
    notes?: string;
    discrepancyNotes?: string;

    // Auditoria
    createdAt: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;

    // Flags de conveniência
    canBeModified?: boolean;
    canBeClosed?: boolean;
    canBeReopened?: boolean;
    canBeLocked?: boolean;
}

export interface CreateDailyClosureDTO {
    companyId?: string;
    closureDate: string;
    closureScope?: ClosureScope;
    bankAccountId?: number;
    openingBalance?: number;
    totalInflows?: number;
    totalOutflows?: number;
    notes?: string;
}

export interface UpdateDailyClosureDTO {
    openingBalance?: number;
    totalInflows?: number;
    totalOutflows?: number;
    notes?: string;
    discrepancyNotes?: string;
}

export interface DailyClosureFilters extends BaseFilters {
    status?: ClosureStatus;
    bankAccountId?: number;
}
