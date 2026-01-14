// Tipos para Centros de Custo

import type { AuditInfo } from './common';

export interface CostCenterDTO extends AuditInfo {
  id: number;
  tenantId: string;
  companyId: string;
  companyName?: string;

  // Dados principais
  costCenterCode: string;
  costCenterName: string;

  // Hierarquia
  parentCostCenterId?: number;
  parentCostCenterName?: string;
  level: number;

  // Status
  isActive: boolean;

  // Detalhes
  description?: string;

  // Campos calculados
  fullCostCenterCode?: string;
  fullCostCenterName?: string;
  isParentCostCenter?: boolean;
  isLeafCostCenter?: boolean;
  childrenCount?: number;

  // Filhos (para árvore)
  children?: CostCenterDTO[];

  // Campos do backend (para compatibilidade)
  costCenterId?: number;
  code?: string;
  name?: string;
  parentId?: number;
}

export interface CreateCostCenterDTO {
  companyId: string;
  costCenterCode: string;
  costCenterName: string;
  parentCostCenterId?: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCostCenterDTO extends CreateCostCenterDTO {
  id: string;
}

export interface CostCenterFilters {
  searchText?: string;
  isActive?: boolean;
  companyId?: string;
  parentCostCenterId?: number;
  level?: number;
}

export interface CostCenterTreeNode {
  id: number;
  costCenterCode: string;
  costCenterName: string;
  level: number;
  isActive: boolean;
  children: CostCenterTreeNode[];
  expanded?: boolean;
}

// Opção para select de centros de custo
export interface CostCenterSelectOption {
  value: number;
  label: string;
  level: number;
  disabled?: boolean;
}
