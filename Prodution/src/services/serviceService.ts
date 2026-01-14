import api from './api';
import type { ServiceDTO, CreateServiceDTO, UpdateServiceDTO } from '../types/service';

export const serviceService = {
    async findAll(companyId: string, activeOnly?: boolean): Promise<ServiceDTO[]> {
        const params = new URLSearchParams({ companyId });
        if (activeOnly) {
            params.append('activeOnly', 'true');
        }
        const response = await api.get<ServiceDTO[]>(`/services?${params}`);
        return response.data;
    },

    async findById(id: string): Promise<ServiceDTO> {
        const response = await api.get<ServiceDTO>(`/services/${id}`);
        return response.data;
    },

    async findByCode(companyId: string, code: string): Promise<ServiceDTO> {
        const response = await api.get<ServiceDTO>(`/services/code/${code}?companyId=${companyId}`);
        return response.data;
    },

    async create(data: CreateServiceDTO): Promise<ServiceDTO> {
        const response = await api.post<ServiceDTO>('/services', data);
        return response.data;
    },

    async update(id: string, data: UpdateServiceDTO): Promise<ServiceDTO> {
        const response = await api.put<ServiceDTO>(`/services/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/services/${id}`);
    },

    async activate(id: string): Promise<ServiceDTO> {
        const response = await api.post<ServiceDTO>(`/services/${id}/activate`);
        return response.data;
    },

    async deactivate(id: string): Promise<ServiceDTO> {
        const response = await api.post<ServiceDTO>(`/services/${id}/deactivate`);
        return response.data;
    }
};