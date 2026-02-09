export interface ProductionCost {
    id: string;
    tenantId: string;
    companyId: string;
    productionOrderId: string;
    costType: ProductionCostType;
    referenceId?: string;
    costDate?: string;
    quantity?: number;
    unitCost?: number;
    totalCost: number;
    notes?: string;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
    approvedBy?: string;
    approvedAt?: string;
}

export interface CreateProductionCostRequest {
    companyId: string;
    productionOrderId: string;
    costType: ProductionCostType;
    referenceId?: string;
    costDate?: string;
    quantity?: number;
    unitCost?: number;
    totalCost: number;
    notes?: string;
}

export interface UpdateProductionCostRequest {
    costType?: ProductionCostType;
    referenceId?: string;
    costDate?: string;
    quantity?: number;
    unitCost?: number;
    totalCost?: number;
    notes?: string;
}

export type ProductionCostType = 'MATERIAL' | 'SERVICE' | 'LABOR' | 'INDIRECT';

export const ProductionCostTypeLabels: Record<ProductionCostType, string> = {
    'MATERIAL': 'Material',
    'SERVICE': 'Serviço',
    'LABOR': 'Mão de Obra',
    'INDIRECT': 'Custo Indireto'
};

export const ProductionCostTypeColors: Record<ProductionCostType, string> = {
    'MATERIAL': '#4caf50',
    'SERVICE': '#2196f3',
    'LABOR': '#ff9800',
    'INDIRECT': '#9c27b0'
};