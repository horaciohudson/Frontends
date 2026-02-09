import api from './api';
import { authService } from './authService';
import type { ProductionExecution, CreateProductionExecutionRequest, UpdateProductionExecutionRequest } from '../types/productionExecution';

interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export const productionExecutionService = {
    async findAll(page: number = 0, size: number = 20): Promise<PagedResponse<ProductionExecution>> {
        try {
            const user = authService.getUser();
            const response = await api.get(`/production-executions/paged?page=${page}&size=${size}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar execuções paginadas:', error);
            // Fallback: retornar estrutura vazia
            return {
                content: [],
                totalElements: 0,
                totalPages: 0,
                size,
                number: page
            };
        }
    },

    async getByProductionOrder(productionOrderId: string): Promise<ProductionExecution[]> {
        try {
            const user = authService.getUser();
            const response = await api.get(`/production-executions/production-order/${productionOrderId}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar execuções por ordem de produção:', error);
            throw error;
        }
    },

    async getByStep(stepId: string): Promise<ProductionExecution[]> {
        try {
            const user = authService.getUser();
            const response = await api.get(`/production-executions/step/${stepId}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar execuções por etapa:', error);
            throw error;
        }
    },

    async getById(id: string): Promise<ProductionExecution> {
        try {
            const user = authService.getUser();
            const response = await api.get(`/production-executions/${id}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar execução:', error);
            throw error;
        }
    },

    async create(data: CreateProductionExecutionRequest): Promise<ProductionExecution> {
        try {
            const user = authService.getUser();
            const response = await api.post('/production-executions', data, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao criar execução:', error);
            throw error;
        }
    },

    async update(id: string, data: UpdateProductionExecutionRequest): Promise<ProductionExecution> {
        try {
            const user = authService.getUser();
            const response = await api.put(`/production-executions/${id}`, data, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar execução:', error);
            throw error;
        }
    },

    async delete(id: string): Promise<void> {
        try {
            const user = authService.getUser();
            await api.delete(`/production-executions/${id}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
        } catch (error) {
            console.error('Erro ao excluir execução:', error);
            throw error;
        }
    }
};
