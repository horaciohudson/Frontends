// Tipos para Plano de Contas (Ledger Accounts)

import type { AuditInfo } from './common';

// Tipos de conta contábil
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  ASSET: 'Ativo',
  LIABILITY: 'Passivo',
  EQUITY: 'Patrimônio Líquido',
  REVENUE: 'Receita',
  EXPENSE: 'Despesa',
};

export const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  ASSET: '#3b82f6',
  LIABILITY: '#ef4444',
  EQUITY: '#8b5cf6',
  REVENUE: '#22c55e',
  EXPENSE: '#f97316',
};

export interface LedgerAccountDTO extends AuditInfo {
  id: string | number;
  tenantId: string;
  companyId?: string;

  // Dados principais
  accountCode: string;
  accountName: string;
  accountType: AccountType;

  // Hierarquia
  parentAccountId?: string | number;
  parentAccountName?: string;
  level: number;

  // Status e controle
  isActive: boolean;
  acceptsEntries?: boolean;
  currentBalance?: number;

  // Detalhes
  description?: string;

  // Campos calculados
  fullAccountCode?: string;
  fullAccountName?: string;
  isParentAccount?: boolean;
  isLeafAccount?: boolean;
  childrenCount?: number;

  // Filhos (para árvore)
  children?: LedgerAccountDTO[];
}

export interface CreateLedgerAccountDTO {
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  parentAccountId?: string;
  description?: string;
  isActive?: boolean;
  acceptsEntries?: boolean;
}

export interface UpdateLedgerAccountDTO extends CreateLedgerAccountDTO {
  id: string;
}

export interface LedgerAccountFilters {
  searchText?: string;
  isActive?: boolean;
  accountType?: AccountType;
  parentAccountId?: string;
  level?: number;
}

export interface LedgerAccountTreeNode {
  id: string | number;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  level: number;
  isActive: boolean;
  children: LedgerAccountTreeNode[];
  expanded?: boolean;
}

// Opção para select de contas
export interface LedgerAccountSelectOption {
  value: string;
  label: string;
  level: number;
  accountType: AccountType;
  disabled?: boolean;
}
