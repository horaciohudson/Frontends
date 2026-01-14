// Tipos para Lançamentos Contábeis (Ledger Entries)

import type { AuditInfo } from './common';

export type LedgerEntryStatus = 'DRAFT' | 'POSTED' | 'CANCELLED';

export const LEDGER_ENTRY_STATUS_LABELS: Record<LedgerEntryStatus, string> = {
  DRAFT: 'Rascunho',
  POSTED: 'Lançado',
  CANCELLED: 'Cancelado',
};

export const LEDGER_ENTRY_STATUS_COLORS: Record<LedgerEntryStatus, string> = {
  DRAFT: '#f59e0b',
  POSTED: '#22c55e',
  CANCELLED: '#ef4444',
};

export type EntryType = 'DEBIT' | 'CREDIT';

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  DEBIT: 'Débito',
  CREDIT: 'Crédito',
};

// Tipo para o formulário (interface amigável com débito e crédito)
export interface LedgerEntryFormData {
  entryDate: string;
  description: string;
  debitAccountId: string;   // Conta de débito
  creditAccountId: string;  // Conta de crédito
  amount: number;
  costCenterId?: string;
  notes?: string;
  documentNumber?: string;
  referenceNumber?: string;
  referenceType?: string;
}

// DTO para criação de lançamento (alinhado com backend)
export interface CreateLedgerEntryDTO {
  entryDate: string;
  ledgerAccountId: number;  // Backend espera Long (número)
  entryType: 'DEBIT' | 'CREDIT';  // Obrigatório no backend
  amount: number;
  description: string;
  costCenterId?: number;  // Backend espera Long (número)
  notes?: string;
  documentNumber?: string;
  referenceId?: number;
  referenceType?: string;
  // Campos opcionais do backend
  financialCategoryId?: number;
  documentType?: string;
  dueDate?: string;
  tags?: string;
  attachmentUrl?: string;
}

// DTO de resposta (alinhado com backend)
export interface LedgerEntryDTO extends AuditInfo {
  id: string;
  tenantId: string;
  companyId: string;

  // Dados principais
  entryDate: string;
  description: string;

  // Conta contábil
  ledgerAccountId: string;
  ledgerAccountCode?: string;
  ledgerAccountName?: string;

  // Tipo e valor
  entryType: EntryType;  // DEBIT ou CREDIT
  amount: number;

  // Referências
  costCenterId?: string;
  costCenterName?: string;
  financialCategoryId?: string;
  financialCategoryName?: string;

  // Status
  status: LedgerEntryStatus;

  // Lote (para lançamentos duplos)
  batchId?: string;
  batchSequence?: number;

  // Detalhes
  notes?: string;
  documentNumber?: string;
  documentType?: string;
  referenceNumber?: string;
  referenceType?: string;
}

export interface UpdateLedgerEntryDTO extends CreateLedgerEntryDTO {
  id: string;
}

export interface LedgerEntryFilters {
  searchText?: string;
  startDate?: string;
  endDate?: string;
  ledgerAccountId?: string;
  costCenterId?: string;
  status?: LedgerEntryStatus;
  minAmount?: number;
  maxAmount?: number;
}
