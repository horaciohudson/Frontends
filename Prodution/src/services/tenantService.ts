import api from './api';
import type { TenantDTO, CreateTenantDTO, UpdateTenantDTO } from '../types/tenant';

export const tenantService = {
    async findAll(): Promise<TenantDTO[]> {
        const response = await api.get<TenantDTO[]>('/tenants');
        return response.data;
    },

    async findById(id: string): Promise<TenantDTO> {
        const response = await api.get<TenantDTO>(`/tenants/${id}`);
        return response.data;
    },

    async findByCode(code: string): Promise<TenantDTO> {
        const response = await api.get<TenantDTO>(`/tenants/code/${code}`);
        return response.data;
    },

    async create(data: CreateTenantDTO): Promise<TenantDTO> {
        const response = await api.post<TenantDTO>('/tenants', data);
        return response.data;
    },

    async update(id: string, data: UpdateTenantDTO): Promise<TenantDTO> {
        const response = await api.put<TenantDTO>(`/tenants/${id}`, data);
        return response.data;
    },

    async deactivate(id: string): Promise<void> {
        await api.delete(`/tenants/${id}`);
    }
};
