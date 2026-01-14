import api from './api';
import { LaunchRequest, LaunchResponse } from '../types';

export const launcherService = {
    async launchModule(request: LaunchRequest): Promise<LaunchResponse> {
        const response = await api.post<LaunchResponse>('/launcher', request);
        return response.data;
    },

    async startModule(module: string): Promise<LaunchResponse> {
        const response = await api.post<LaunchResponse>(`/launcher/start/${module}`);
        return response.data;
    },

    async stopModule(module: string): Promise<LaunchResponse> {
        const response = await api.post<LaunchResponse>(`/launcher/stop/${module}`);
        return response.data;
    },

    async restartModule(module: string): Promise<LaunchResponse> {
        const response = await api.post<LaunchResponse>(`/launcher/restart/${module}`);
        return response.data;
    },
};
