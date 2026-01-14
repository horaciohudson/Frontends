import { authService } from './authService';
import type { ProductionOrder, CreateProductionOrderRequest, UpdateProductionOrderRequest } from '../types/productionOrder';

const API_BASE_URL = '/api';

interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

class ProductionOrderService {
    async findAll(page: number = 0, size: number = 20, companyId?: string, status?: string): Promise<PagedResponse<ProductionOrder>> {
        try {
            console.log('📋 ProductionOrderService - Buscando ordens de produção paginadas...');

            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString()
            });

            if (companyId) params.append('companyId', companyId);
            if (status) params.append('status', status);

            const response = await authService.makeAuthenticatedRequest(
                `${API_BASE_URL}/production-orders/paged?${params}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Erro ao buscar ordens: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ ProductionOrderService - Ordens carregadas:', result.totalElements);
            return result;
        } catch (error) {
            console.error('Erro ao buscar ordens de produção:', error);
            // Fallback para método existente
            try {
                const orders = await this.getAllByCompany(companyId || '', status);
                return {
                    content: orders.slice(page * size, (page + 1) * size),
                    totalElements: orders.length,
                    totalPages: Math.ceil(orders.length / size),
                    size,
                    number: page
                };
            } catch (fallbackError) {
                console.error('Erro no fallback:', fallbackError);
                return {
                    content: [],
                    totalElements: 0,
                    totalPages: 0,
                    size,
                    number: page
                };
            }
        }
    }

    async getAllByCompany(companyId: string, status?: string): Promise<ProductionOrder[]> {
        try {
            console.log('📋 ProductionOrderService - Buscando ordens de produção...');

            const params = new URLSearchParams({ companyId });
            if (status) params.append('status', status);

            const response = await authService.makeAuthenticatedRequest(
                `${API_BASE_URL}/production-orders?${params}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Erro ao buscar ordens: ${response.status}`);
            }

            const orders = await response.json();
            console.log('✅ ProductionOrderService - Ordens carregadas:', orders.length);
            return orders;
        } catch (error) {
            console.error('Erro ao buscar ordens de produção:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<ProductionOrder> {
        try {
            const response = await authService.makeAuthenticatedRequest(
                `${API_BASE_URL}/production-orders/${id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Ordem de produção não encontrada');
                }
                throw new Error(`Erro ao buscar ordem: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('Erro ao buscar ordem de produção:', error);
            throw error;
        }
    }

    async create(request: CreateProductionOrderRequest): Promise<ProductionOrder> {
        try {
            console.log('➕ ProductionOrderService - Criando ordem:', request);

            const response = await authService.makeAuthenticatedRequest(
                `${API_BASE_URL}/production-orders`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erro ao criar ordem:', errorText);
                throw new Error(`Erro ao criar ordem: ${response.status}`);
            }

            const created = await response.json();
            console.log('✅ ProductionOrderService - Ordem criada:', created);
            return created;
        } catch (error) {
            console.error('Erro ao criar ordem de produção:', error);
            throw error;
        }
    }

    async update(id: string, request: UpdateProductionOrderRequest): Promise<ProductionOrder> {
        try {
            console.log('✏️ ProductionOrderService - Atualizando ordem:', id, request);

            const response = await authService.makeAuthenticatedRequest(
                `${API_BASE_URL}/production-orders/${id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erro ao atualizar ordem:', errorText);
                throw new Error(`Erro ao atualizar ordem: ${response.status}`);
            }

            const updated = await response.json();
            console.log('✅ ProductionOrderService - Ordem atualizada:', updated);
            return updated;
        } catch (error) {
            console.error('Erro ao atualizar ordem de produção:', error);
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            console.log('🗑️ ProductionOrderService - Deletando ordem:', id);

            const response = await authService.makeAuthenticatedRequest(
                `${API_BASE_URL}/production-orders/${id}`,
                {
                    method: 'DELETE',
                }
            );

            if (!response.ok) {
                throw new Error(`Erro ao deletar ordem: ${response.status}`);
            }

            console.log('✅ ProductionOrderService - Ordem deletada');
        } catch (error) {
            console.error('Erro ao deletar ordem de produção:', error);
            throw error;
        }
    }

    async approve(id: string): Promise<ProductionOrder> {
        try {
            const response = await authService.makeAuthenticatedRequest(
                `${API_BASE_URL}/production-orders/${id}/approve`,
                {
                    method: 'POST',
                }
            );

            if (!response.ok) {
                throw new Error(`Erro ao aprovar ordem: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('Erro ao aprovar ordem:', error);
            throw error;
        }
    }

    async start(id: string): Promise<ProductionOrder> {
        try {
            const response = await authService.makeAuthenticatedRequest(
                `${API_BASE_URL}/production-orders/${id}/start`,
                {
                    method: 'POST',
                }
            );

            if (!response.ok) {
                throw new Error(`Erro ao iniciar ordem: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('Erro ao iniciar ordem:', error);
            throw error;
        }
    }

    async finish(id: string): Promise<ProductionOrder> {
        try {
            const response = await authService.makeAuthenticatedRequest(
                `${API_BASE_URL}/production-orders/${id}/finish`,
                {
                    method: 'POST',
                }
            );

            if (!response.ok) {
                throw new Error(`Erro ao finalizar ordem: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('Erro ao finalizar ordem:', error);
            throw error;
        }
    }

    async cancel(id: string, reason: string): Promise<ProductionOrder> {
        try {
            const params = new URLSearchParams({ reason });

            const response = await authService.makeAuthenticatedRequest(
                `${API_BASE_URL}/production-orders/${id}/cancel?${params}`,
                {
                    method: 'POST',
                }
            );

            if (!response.ok) {
                throw new Error(`Erro ao cancelar ordem: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('Erro ao cancelar ordem:', error);
            throw error;
        }
    }
}

export const productionOrderService = new ProductionOrderService();
