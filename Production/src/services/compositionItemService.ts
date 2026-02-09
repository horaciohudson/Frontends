import api from './api';
import { authService } from './authService';
import type {
    CompositionItemDTO,
    CreateCompositionItemDTO,
    UpdateCompositionItemDTO,
    CompositionItemWithDetails,
    ItemOption,
    CompositionCostSummary,
    CompositionItemType
} from '../types/composition';
import type { RawMaterialDTO } from '../types/rawMaterial';
import type { ServiceDTO } from '../types/service';

const ENDPOINT = '/composition-items';

export const compositionItemService = {
    // === CRUD OPERATIONS ===

    // Buscar itens de uma composição com detalhes
    async findByComposition(compositionId: string): Promise<CompositionItemWithDetails[]> {
        const user = authService.getUser();
        const response = await api.get<CompositionItemWithDetails[]>(`${ENDPOINT}/composition/${compositionId}`, {
            headers: {
                'X-Tenant-ID': user?.tenantId
            }
        });
        return response.data;
    },

    // Buscar item por ID
    async findById(id: string): Promise<CompositionItemDTO> {
        const response = await api.get<CompositionItemDTO>(`${ENDPOINT}/${id}`);
        return response.data;
    },

    // Criar novo item
    async create(data: CreateCompositionItemDTO): Promise<CompositionItemDTO> {
        const user = authService.getUser();
        const dataWithTenant = {
            ...data,
            tenantId: user?.tenantId
        };
        const response = await api.post<CompositionItemDTO>(ENDPOINT, dataWithTenant, {
            headers: {
                'X-Company-ID': data.companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });
        return response.data;
    },

    // Atualizar item
    async update(id: string, data: UpdateCompositionItemDTO, companyId: string): Promise<CompositionItemDTO> {
        const user = authService.getUser();
        const response = await api.put<CompositionItemDTO>(`${ENDPOINT}/${id}`, data, {
            headers: {
                'X-Company-ID': companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });
        return response.data;
    },

    // Deletar item
    async delete(id: string, companyId: string): Promise<void> {
        const user = authService.getUser();
        await api.delete(`${ENDPOINT}/${id}`, {
            headers: {
                'X-Company-ID': companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });
    },

    // === REORDERING ===

    // Reordenar itens de uma composição
    async reorder(compositionId: string, itemIds: string[], companyId: string): Promise<void> {
        const user = authService.getUser();
        await api.post(`${ENDPOINT}/reorder`, {
            compositionId,
            itemIds
        }, {
            headers: {
                'X-Company-ID': companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });
    },

    // Mover item para cima na sequência
    async moveUp(itemId: string, companyId: string): Promise<CompositionItemDTO[]> {
        const user = authService.getUser();
        const response = await api.post<CompositionItemDTO[]>(`${ENDPOINT}/${itemId}/move-up`, {}, {
            headers: {
                'X-Company-ID': companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });
        return response.data;
    },

    // Mover item para baixo na sequência
    async moveDown(itemId: string, companyId: string): Promise<CompositionItemDTO[]> {
        const user = authService.getUser();
        const response = await api.post<CompositionItemDTO[]>(`${ENDPOINT}/${itemId}/move-down`, {}, {
            headers: {
                'X-Company-ID': companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });
        return response.data;
    },

    // === ITEM SELECTION ===

    // Buscar matérias-primas para seleção
    async findRawMaterialsForSelection(companyId: string, search?: string): Promise<ItemOption[]> {
        const user = authService.getUser();
        const response = await api.get<RawMaterialDTO[]>('/raw-materials', {
            params: {
                companyId,
                activeOnly: true,
                search
            },
            headers: {
                'X-Company-ID': companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });

        // Converter para ItemOption
        return response.data.map(item => ({
            id: item.id,
            name: item.name,
            code: item.code,
            unitType: item.unitType,
            unitCost: item.averageCost || item.lastPurchasePrice
        }));
    },

    // Buscar serviços para seleção
    async findServicesForSelection(companyId: string, search?: string): Promise<ItemOption[]> {
        const user = authService.getUser();
        const response = await api.get<ServiceDTO[]>('/services', {
            params: {
                companyId,
                activeOnly: true,
                search
            },
            headers: {
                'X-Company-ID': companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });

        // Converter para ItemOption
        return response.data.map(item => ({
            id: item.id,
            name: item.name,
            code: item.code,
            unitType: (item as any).unitType || 'UN',
            unitCost: (item as any).unitPrice || 0
        }));
    },

    // Buscar itens para seleção (matérias-primas ou serviços)
    async findItemsForSelection(
        companyId: string,
        itemType: CompositionItemType,
        search?: string
    ): Promise<ItemOption[]> {
        if (itemType === 'RAW_MATERIAL') {
            return this.findRawMaterialsForSelection(companyId, search);
        } else {
            return this.findServicesForSelection(companyId, search);
        }
    },

    // Buscar detalhes de um item específico
    async findItemDetails(itemType: CompositionItemType, itemId: string): Promise<ItemOption | null> {
        try {
            if (itemType === 'RAW_MATERIAL') {
                const response = await api.get<RawMaterialDTO>(`/raw-materials/${itemId}`);
                const item = response.data;
                return {
                    id: item.id,
                    name: item.name,
                    code: item.code,
                    unitType: item.unitType,
                    unitCost: item.averageCost || item.lastPurchasePrice
                };
            } else {
                const response = await api.get<ServiceDTO>(`/services/${itemId}`);
                const item = response.data;
                return {
                    id: item.id,
                    name: item.name,
                    code: item.code,
                    unitType: (item as any).unitType || 'UN',
                    unitCost: item.unitPrice || 0
                };
            }
        } catch (error) {
            console.error('Error fetching item details:', error);
            return null;
        }
    },

    // === COST CALCULATIONS ===

    // Calcular custo total de um item
    calculateItemCost(quantity: number, unitCost: number, lossPercentage: number = 0): number {
        return quantity * unitCost * (1 + lossPercentage / 100);
    },

    // Calcular resumo de custos da composição
    async calculateCompositionCosts(compositionId: string, companyId: string): Promise<CompositionCostSummary> {
        const user = authService.getUser();
        const response = await api.get<CompositionCostSummary>(`${ENDPOINT}/composition/${compositionId}/costs`, {
            headers: {
                'X-Company-ID': companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });
        return response.data;
    },

    // === VALIDATION ===

    // Verificar se item já existe na composição
    async checkDuplicateItem(
        compositionId: string,
        itemType: CompositionItemType,
        referenceId: string,
        excludeItemId?: string
    ): Promise<boolean> {
        const items = await this.findByComposition(compositionId);
        return items.some(item =>
            item.itemType === itemType &&
            item.referenceId === referenceId &&
            item.id !== excludeItemId
        );
    },

    // Obter próxima sequência disponível
    async getNextSequence(compositionId: string): Promise<number> {
        const items = await this.findByComposition(compositionId);
        if (items.length === 0) return 1;

        const maxSequence = Math.max(...items.map(item => item.sequence));
        return maxSequence + 1;
    }
};