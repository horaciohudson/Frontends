import type { UnitType } from './rawMaterial';

// Tipo de Item na Composição
export type CompositionItemType = 'RAW_MATERIAL' | 'SERVICE';

export const CompositionItemType = {
    RAW_MATERIAL: 'RAW_MATERIAL' as const,
    SERVICE: 'SERVICE' as const
};

export const CompositionItemTypeLabels: Record<CompositionItemType, string> = {
    RAW_MATERIAL: 'Matéria-Prima',
    SERVICE: 'Serviço Terceirizado'
};

// DTO de Composição
export interface CompositionDTO {
    id: string;
    tenantId: string;
    companyId: string;
    productionProductId: string;

    name: string;
    version: number;

    effectiveDate?: string;
    expirationDate?: string;

    isActive: boolean;
    notes?: string;

    // Auditoria
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;

    // Aprovação
    approvedBy?: string;
    approvedAt?: string;

    // Detalhes adicionais
    productName?: string;
    itemsCount?: number;
    totalCost?: number;
}

// DTO para criação de composição
export interface CreateCompositionDTO {
    tenantId: string;
    companyId: string;
    productionProductId: string;

    name: string;
    version?: number;

    effectiveDate?: string;
    expirationDate?: string;

    isActive?: boolean;
    notes?: string;
}

// DTO para atualização de composição
export interface UpdateCompositionDTO {
    name?: string;
    version?: number;

    effectiveDate?: string;
    expirationDate?: string;

    isActive?: boolean;
    notes?: string;
}

// DTO de Item da Composição
export interface CompositionItemDTO {
    id: string;
    tenantId: string;
    companyId: string;
    compositionId: string;

    itemType: CompositionItemType;
    referenceId: string;

    sequence: number;
    unitType: UnitType;
    quantity: number;
    lossPercentage?: number;

    unitCost?: number;
    totalCost?: number;

    isOptional: boolean;
    notes?: string;

    // Auditoria
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
}

// DTO para criação de item de composição
export interface CreateCompositionItemDTO {
    tenantId: string;
    companyId: string;
    compositionId: string;

    itemType: CompositionItemType;
    referenceId: string;

    sequence?: number;
    unitType: UnitType;
    quantity: number;
    lossPercentage?: number;

    unitCost?: number;

    isOptional?: boolean;
    notes?: string;
}

// DTO para atualização de item de composição
export interface UpdateCompositionItemDTO {
    itemType?: CompositionItemType;
    referenceId?: string;

    sequence?: number;
    unitType?: UnitType;
    quantity?: number;
    lossPercentage?: number;

    unitCost?: number;

    isOptional?: boolean;
    notes?: string;
}

// Interface para exibição com dados relacionados
export interface CompositionWithDetails extends CompositionDTO {
    // Todos os campos já estão em CompositionDTO
}

export interface CompositionItemWithDetails extends CompositionItemDTO {
    itemName?: string;
    itemCode?: string;
}

// Interface para opções de seleção de itens
export interface ItemOption {
    id: string;
    name: string;
    code?: string;
    unitType: UnitType;
    unitCost?: number;
}

// Interface para resumo de custos da composição
export interface CompositionCostSummary {
    totalItems: number;
    totalCost: number;
    itemsCost: CompositionItemCost[];
}

export interface CompositionItemCost {
    itemId: string;
    quantity: number;
    unitCost: number;
    lossPercentage: number;
    totalCost: number;
}