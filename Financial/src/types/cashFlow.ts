// Tipos para Fluxo de Caixa
// Alinhado com o schema tab_cash_flow do backend

import type { AuditInfo, BaseFilters } from './common';

export interface CashFlowDTO extends AuditInfo {
  id: number;
  tenantId: string;
  companyId: string;

  // Campos do schema original
  transactionId?: number;
  entryId?: number;
  flowType: string; // INFLOW / OUTFLOW
  category: string;
  amount: number;
  currency: string;
  flowDate: string;
  description?: string;
  paymentMethod?: string;
  bankAccountId?: number;
  costCenterId?: number;
  categoryId?: number;
  referenceType?: string;
  referenceId?: number;
  reconciliationId?: number;
  notes?: string;
  flowStatus?: string;
}

export interface CreateCashFlowDTO {
  companyId?: string; // Será preenchido pelo service
  flowDate: string;
  flowType: string; // INFLOW / OUTFLOW
  category: string;
  amount: number;
  currency?: string;
  description?: string;
  paymentMethod?: string;
  transactionId?: number;
  entryId?: number;
  bankAccountId?: number;
  costCenterId?: number;
  categoryId?: number;
}

export interface UpdateCashFlowDTO extends CreateCashFlowDTO {
  id: number;
}

export interface CashFlowFilters extends BaseFilters {
  flowType?: string;
  bankAccountId?: number;
  categoryId?: number;
  costCenterId?: number;
}

export interface CashFlowListItem {
  id: number;
  flowDate: string;
  flowType: string;
  description?: string;
  amount: number;
  category: string;
  currency: string;
}
