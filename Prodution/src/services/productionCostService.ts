import api from './api';
import { authService } from './authService';
import type { ProductionCost, CreateProductionCostRequest, UpdateProductionCostRequest, ProductionCostType } from '../types/productionCost';

interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export const productionCostService = {
    async findAll(page: number = 0, size: number = 20): Promise<PagedResponse<ProductionCost>> {
        try {
            const user = authService.getUser();
            console.log('💰 [PRODUCTION COST SERVICE] findAll called - backend não tem endpoint geral');
            console.log('💰 [PRODUCTION COST SERVICE] Retornando estrutura vazia pois não há endpoint para listar todos');
            
            // Backend não tem endpoint para listar todos os custos
            // Retornar estrutura vazia para não quebrar a interface
            return {
                content: [],
                totalElements: 0,
                totalPages: 0,
                size,
                number: page
            };
        } catch (error) {
            console.error('💥 [PRODUCTION COST SERVICE] Error in findAll:', error);
            return {
                content: [],
                totalElements: 0,
                totalPages: 0,
                size,
                number: page
            };
        }
    },

    async getByProductionOrder(productionOrderId: string): Promise<ProductionCost[]> {
        try {
            const user = authService.getUser();
            const response = await api.get(`/production-costs/production-order/${productionOrderId}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar custos por ordem de produção:', error);
            throw error;
        }
    },

    async getByType(companyId: string, costType: ProductionCostType): Promise<ProductionCost[]> {
        try {
            const user = authService.getUser();
            const response = await api.get('/production-costs/type', {
                params: { companyId, costType },
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar custos por tipo:', error);
            throw error;
        }
    },

    async findById(id: string): Promise<ProductionCost> {
        try {
            const user = authService.getUser();
            const response = await api.get(`/production-costs/${id}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar custo por ID:', error);
            throw error;
        }
    },

    async create(data: CreateProductionCostRequest): Promise<ProductionCost> {
        try {
            const user = authService.getUser();
            const createData = {
                ...data,
                tenantId: user?.tenantId
            };

            const response = await api.post('/production-costs', createData, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao criar custo de produção:', error);
            throw error;
        }
    },

    async update(id: string, data: UpdateProductionCostRequest): Promise<ProductionCost> {
        try {
            const user = authService.getUser();
            const response = await api.put(`/production-costs/${id}`, data, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar custo de produção:', error);
            throw error;
        }
    },

    async delete(id: string): Promise<void> {
        try {
            const user = authService.getUser();
            await api.delete(`/production-costs/${id}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
        } catch (error) {
            console.error('Erro ao excluir custo de produção:', error);
            throw error;
        }
    },

    async approve(id: string): Promise<ProductionCost> {
        try {
            const user = authService.getUser();
            const response = await api.post(`/production-costs/${id}/approve`, {}, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao aprovar custo de produção:', error);
            throw error;
        }
    }
};