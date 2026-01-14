import api from './api';
import { authService } from './authService';
import type { RawMaterialStock } from '../types/rawMaterialStock';

interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export const rawMaterialStockService = {
    async findAll(page: number = 0, size: number = 20): Promise<PagedResponse<RawMaterialStock>> {
        try {
            const user = authService.getUser();
            const response = await api.get(`/raw-material-stocks/paged?page=${page}&size=${size}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar estoques paginados:', error);
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

    async getByCompany(companyId: string): Promise<RawMaterialStock[]> {
        try {
            const user = authService.getUser();
            const response = await api.get(`/raw-material-stocks/company/${companyId}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar estoques por empresa:', error);
            throw error;
        }
    },

    async getByRawMaterial(rawMaterialId: string): Promise<RawMaterialStock | null> {
        try {
            const user = authService.getUser();
            const response = await api.get(`/raw-material-stocks/raw-material/${rawMaterialId}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error('Erro ao buscar estoque por matéria-prima:', error);
            throw error;
        }
    },

    async getLowStock(companyId: string, threshold: number = 10): Promise<RawMaterialStock[]> {
        try {
            const user = authService.getUser();
            const response = await api.get(`/raw-material-stocks/low-stock`, {
                params: { companyId, threshold },
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar estoques baixos:', error);
            throw error;
        }
    }
};