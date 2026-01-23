import api from './api';
import { Sale, SaleCreateDTO } from '../models/Sale';

export const SaleService = {
    // Create a new sale
    create: async (data: SaleCreateDTO): Promise<Sale> => {
        const response = await api.post<Sale>('/sales', data);
        return response.data;
    },

    // Get all sales
    getAll: async (): Promise<Sale[]> => {
        const response = await api.get<Sale[]>('/sales');
        return response.data;
    },

    // Get sale by ID
    getById: async (id: string): Promise<Sale> => {
        const response = await api.get<Sale>(`/sales/${id}`);
        return response.data;
    },

    // Delete sale
    delete: async (id: string): Promise<void> => {
        await api.delete(`/sales/${id}`);
    },

    // Update sale (if backend supports it in the future)
    update: async (id: string, data: SaleCreateDTO): Promise<Sale> => {
        const response = await api.put<Sale>(`/sales/${id}`, data);
        return response.data;
    }
};
