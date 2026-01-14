// Tipos para Impostos (Taxes)

import type { AuditInfo } from './common';

export type TaxCategory = 'FEDERAL' | 'STATE' | 'MUNICIPAL' | 'OTHER';

export const TAX_CATEGORY_LABELS: Record<TaxCategory, string> = {
  FEDERAL: 'Federal',
  STATE: 'Estadual',
  MUNICIPAL: 'Municipal',
  OTHER: 'Outro',
};

export interface TaxDTO extends AuditInfo {
  id: string;
  tenantId: string;
  companyId: string;

  // Dados principais
  taxCode: string;
  taxName: string;
  defaultRate: number;  // Alinhado com backend
  taxCategory: TaxCategory;  // Alinhado com backend

  // Status
  isActive: boolean;

  // Detalhes
  description?: string;
  ledgerAccountId?: number;
  parentTaxTypeId?: number;
}

export interface CreateTaxDTO {
  taxCode: string;
  taxName: string;
  defaultRate: number;  // Alinhado com backend
  taxCategory: TaxCategory;  // Alinhado com backend
  description?: string;
  isActive?: boolean;
  ledgerAccountId?: number;
  parentTaxTypeId?: number;
}

export interface UpdateTaxDTO {
  taxCode?: string;
  taxName?: string;
  defaultRate?: number;  // Alinhado com backend
  taxCategory?: TaxCategory;  // Alinhado com backend
  description?: string;
  isActive?: boolean;
  ledgerAccountId?: number;
  parentTaxTypeId?: number;
}

export interface TaxFilters {
  searchText?: string;
  isActive?: boolean;
  taxType?: TaxCategory;  // Mantido para compatibilidade com filtros
}

// Opção para select de impostos
export interface TaxSelectOption {
  value: string;
  label: string;
  rate: number;
  disabled?: boolean;
}
