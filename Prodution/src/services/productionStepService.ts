import api from './api';
import type { ProductionStepDTO, CreateProductionStepDTO, UpdateProductionStepDTO } from '../types/productionStep';

export const productionStepService = {
    async findAll(companyId: string, activeOnly: boolean = false): Promise<ProductionStepDTO[]> {
        const params = new URLSearchParams({
            companyId,
            activeOnly: String(activeOnly)
        });
        const response = await api.get<ProductionStepDTO[]>(`/production-steps?${params}`);
        return response.data;
    },

    async findById(id: string): Promise<ProductionStepDTO> {
        const response = await api.get<ProductionStepDTO>(`/production-steps/${id}`);
        return response.data;
    },

    async create(data: CreateProductionStepDTO): Promise<ProductionStepDTO> {
        const response = await api.post<ProductionStepDTO>('/production-steps', data);
        return response.data;
    },

    async update(id: string, data: UpdateProductionStepDTO): Promise<ProductionStepDTO> {
        const response = await api.put<ProductionStepDTO>(`/production-steps/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/production-steps/${id}`);
    },

    async activate(id: string): Promise<ProductionStepDTO> {
        return this.update(id, { isActive: true });
    },

    async deactivate(id: string): Promise<ProductionStepDTO> {
        return this.update(id, { isActive: false });
    }
};
