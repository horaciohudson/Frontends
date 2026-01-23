import api from './api';
import { DashboardStats } from '../types';

export const dashboardService = {
    async getStats(companyId: string): Promise<DashboardStats> {
        const response = await api.get<DashboardStats>('/dashboard/stats', {
            params: { companyId },
        });
        return response.data;
    },
};
