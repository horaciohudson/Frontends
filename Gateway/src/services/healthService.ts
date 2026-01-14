import api from './api';
import { SystemHealthResponse, ModuleStatus } from '../types';

export const healthService = {
    async checkAllModules(): Promise<SystemHealthResponse> {
        const response = await api.get<SystemHealthResponse>('/health');
        return response.data;
    },

    async checkModule(moduleName: string): Promise<ModuleStatus> {
        const response = await api.get<ModuleStatus>(`/health/${moduleName}`);
        return response.data;
    },
};
