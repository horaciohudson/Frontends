import api from './api';
import { authService } from './authService';
import type { RawMaterialMovement, CreateRawMaterialMovementRequest } from '../types/rawMaterialStock';

export const rawMaterialMovementService = {
    async getByCompany(companyId: string): Promise<RawMaterialMovement[]> {
        try {
            const user = authService.getUser();
            const response = await api.get(`/raw-material-movements/company/${companyId}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar movimentações por empresa:', error);
            throw error;
        }
    },

    async getByRawMaterial(rawMaterialId: string): Promise<RawMaterialMovement[]> {
        try {
            const user = authService.getUser();
            const response = await api.get(`/raw-material-movements/raw-material/${rawMaterialId}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar movimentações por matéria-prima:', error);
            throw error;
        }
    },

    async create(data: CreateRawMaterialMovementRequest): Promise<RawMaterialMovement> {
        try {
            const user = authService.getUser();
            const createData = {
                ...data,
                tenantId: user?.tenantId
            } as CreateRawMaterialMovementRequest;

            const response = await api.post('/raw-material-movements', createData, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao criar movimentação:', error);
            throw error;
        }
    },

    async update(id: string, data: CreateRawMaterialMovementRequest): Promise<RawMaterialMovement> {
        try {
            const user = authService.getUser();
            const updateData = {
                ...data,
                tenantId: user?.tenantId
            } as CreateRawMaterialMovementRequest;

            const response = await api.put(`/raw-material-movements/${id}`, updateData, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar movimentação:', error);
            throw error;
        }
    },

    async delete(id: string): Promise<void> {
        try {
            const user = authService.getUser();
            await api.delete(`/raw-material-movements/${id}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
        } catch (error) {
            console.error('Erro ao excluir movimentação:', error);
            throw error;
        }
    },

    async findById(id: string): Promise<RawMaterialMovement> {
        try {
            const user = authService.getUser();
            const response = await api.get(`/raw-material-movements/${id}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar movimentação por ID:', error);
            throw error;
        }
    }
};