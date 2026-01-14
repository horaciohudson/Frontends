import api from './api';
import { authService } from './authService';
import type { ProductionClosure, CreateProductionClosureRequest } from '../types/productionClosure';

interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export const productionClosureService = {
    async findAll(page: number = 0, size: number = 20): Promise<PagedResponse<ProductionClosure>> {
        try {
            const user = authService.getUser();
            const response = await api.get(`/production-closures/paged?page=${page}&size=${size}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar fechamentos paginados:', error);
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

    async getByCompany(companyId: string): Promise<ProductionClosure[]> {
        try {
            const user = authService.getUser();
            const response = await api.get(`/production-closures/company/${companyId}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar fechamentos por empresa:', error);
            throw error;
        }
    },

    async getByProductionOrder(productionOrderId: string): Promise<ProductionClosure | null> {
        try {
            const user = authService.getUser();
            const response = await api.get(`/production-closures/production-order/${productionOrderId}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error('Erro ao buscar fechamento por ordem:', error);
            throw error;
        }
    },

    async getByExportStatus(companyId: string, exported: boolean): Promise<ProductionClosure[]> {
        try {
            const user = authService.getUser();
            const response = await api.get(`/production-closures/export-status`, {
                params: { companyId, exported },
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar fechamentos por status de exportação:', error);
            throw error;
        }
    },

    async create(data: CreateProductionClosureRequest): Promise<ProductionClosure> {
        try {
            const user = authService.getUser();
            const createData = {
                ...data,
                tenantId: user?.tenantId
            } as CreateProductionClosureRequest;

            const response = await api.post('/production-closures', createData, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao criar fechamento:', error);
            throw error;
        }
    },

    async exportToFinancial(id: string, financialDocumentId: string): Promise<ProductionClosure> {
        try {
            const user = authService.getUser();
            const response = await api.post(`/production-closures/${id}/export-to-financial`, null, {
                params: { financialDocumentId },
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao exportar fechamento para financeiro:', error);
            throw error;
        }
    }
};