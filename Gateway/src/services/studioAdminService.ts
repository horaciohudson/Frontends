import api from './api';
import { StudioAdminUser, StudioCostSync, StudioCreateUserRequest, StudioSetting } from '../types';

export const studioAdminService = {
    async listUsers(): Promise<StudioAdminUser[]> {
        const response = await api.get<StudioAdminUser[]>('/studio-admin/users');
        return response.data;
    },

    async createUser(payload: StudioCreateUserRequest): Promise<StudioAdminUser> {
        const response = await api.post<StudioAdminUser>('/studio-admin/users', payload);
        return response.data;
    },

    async updateUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<StudioAdminUser> {
        const response = await api.patch<StudioAdminUser>(`/studio-admin/users/${userId}/status`, null, {
            params: { value: status },
        });
        return response.data;
    },

    async resetPassword(userId: string, newPassword: string): Promise<{ message: string }> {
        const response = await api.post<{ message: string }>(`/studio-admin/users/${userId}/reset-password`, {
            newPassword,
        });
        return response.data;
    },

    async listSettings(): Promise<StudioSetting[]> {
        const response = await api.get<StudioSetting[]>('/studio-admin/settings');
        return response.data;
    },

    async updateSetting(key: string, value: string): Promise<StudioSetting> {
        const response = await api.put<StudioSetting>(`/studio-admin/settings/${key}`, { value });
        return response.data;
    },

    async listCostSync(status?: string, correlationId?: string): Promise<StudioCostSync[]> {
        const params: Record<string, string> = {};
        if (status) params.status = status;
        if (correlationId) params.correlationId = correlationId;
        const response = await api.get<StudioCostSync[]>('/studio-modelagem/custos', {
            params: Object.keys(params).length > 0 ? params : undefined,
        });
        return response.data;
    },

    async sendCostToFinancial(costId: string): Promise<StudioCostSync> {
        const response = await api.post<StudioCostSync>(`/studio-modelagem/custos/${costId}/enviar-financeiro`);
        return response.data;
    },

    async reprocessPendingCosts(): Promise<StudioCostSync[]> {
        const response = await api.post<StudioCostSync[]>('/studio-modelagem/custos/reprocessar-pendentes');
        return response.data;
    },

    async reprocessCosts(status?: string, correlationId?: string): Promise<StudioCostSync[]> {
        const params: Record<string, string> = {};
        if (status) params.status = status;
        if (correlationId) params.correlationId = correlationId;
        const response = await api.post<StudioCostSync[]>('/studio-modelagem/custos/reprocessar', null, {
            params: Object.keys(params).length > 0 ? params : undefined,
        });
        return response.data;
    },
};
