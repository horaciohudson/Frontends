// Tipos para Categorias Financeiras

import type { AuditInfo } from './common';

export interface FinancialCategoryDTO extends AuditInfo {
  id: string;
  tenantId: string;
  
  // Dados principais
  categoryCode: string;
  categoryName: string;
  
  // Hierarquia
  parentCategoryId?: string;
  parentCategoryName?: string;
  level: number;
  
  // Status
  isActive: boolean;
  
  // Detalhes
  description?: string;
  color?: string;
  icon?: string;
  
  // Campos calculados
  fullCategoryCode?: string;
  fullCategoryName?: string;
  isParentCategory?: boolean;
  isLeafCategory?: boolean;
  childrenCount?: number;
  
  // Filhos (para árvore)
  children?: FinancialCategoryDTO[];
}

export interface CreateFinancialCategoryDTO {
  categoryCode: string;
  categoryName: string;
  parentCategoryId?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export interface UpdateFinancialCategoryDTO extends CreateFinancialCategoryDTO {
  id: string;
}

export interface FinancialCategoryFilters {
  searchText?: string;
  isActive?: boolean;
  parentCategoryId?: string;
  level?: number;
}

export interface FinancialCategoryTreeNode {
  id: string;
  categoryCode: string;
  categoryName: string;
  level: number;
  isActive: boolean;
  color?: string;
  icon?: string;
  children: FinancialCategoryTreeNode[];
  expanded?: boolean;
}

// Opção para select de categorias
export interface CategorySelectOption {
  value: string;
  label: string;
  level: number;
  disabled?: boolean;
}
