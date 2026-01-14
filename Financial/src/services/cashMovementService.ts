// Service para Movimento de Caixa

import api from './api';
import type { CashMovementDTO, CreateCashMovementDTO, UpdateCashMovementDTO, CashMovementFilters } from '../types/cashMovement';
import type { PageResponse } from '../types/common';

class CashMovementService {
    private readonly basePath = '/cash-movements';

    async findAll(filters?: CashMovementFilters): Promise<PageResponse<CashMovementDTO>> {
        const params: any = {
            page: filters?.page || 0,
            size: filters?.size || 20
        };

        if (filters?.searchText) params.text = filters.searchText;
        if (filters?.movementType) params.type = filters.movementType;
        if (filters?.bankAccountId) params.bankAccountId = filters.bankAccountId;
        if (filters?.movementStatus) params.status = filters.movementStatus;
        if (filters?.startDate) params.startDate = filters.startDate;
        if (filters?.endDate) params.endDate = filters.endDate;

        const response = await api.get<PageResponse<CashMovementDTO>>(this.basePath, { params });
        return response.data;
    }

    async findById(id: number): Promise<CashMovementDTO> {
        const response = await api.get<CashMovementDTO>(`${this.basePath}/${id}`);
        return response.data;
    }

    async create(data: CreateCashMovementDTO): Promise<CashMovementDTO> {
        const selectedCompanyId = sessionStorage.getItem('selectedCompanyId');
        if (!selectedCompanyId) {
            throw new Error('Company ID not found. Please select a company first.');
        }

        const payload = { ...data, companyId: selectedCompanyId };
        const response = await api.post<CashMovementDTO>(this.basePath, payload);
        return response.data;
    }

    async update(id: number, data: UpdateCashMovementDTO): Promise<CashMovementDTO> {
        const response = await api.put<CashMovementDTO>(`${this.basePath}/${id}`, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await api.delete(`${this.basePath}/${id}`);
    }

    async markAsCleared(id: number): Promise<CashMovementDTO> {
        const response = await api.put<CashMovementDTO>(`${this.basePath}/${id}/clear`);
        return response.data;
    }

    async markAsReconciled(id: number, reconciliationId?: number): Promise<CashMovementDTO> {
        const params = reconciliationId ? { reconciliationId } : {};
        const response = await api.put<CashMovementDTO>(`${this.basePath}/${id}/reconcile`, null, { params });
        return response.data;
    }

    async cancel(id: number, reason?: string): Promise<CashMovementDTO> {
        const params = reason ? { reason } : {};
        const response = await api.put<CashMovementDTO>(`${this.basePath}/${id}/cancel`, null, { params });
        return response.data;
    }

    async getBankAccountBalance(bankAccountId: number, startDate: string, endDate: string): Promise<number> {
        const response = await api.get<number>(`${this.basePath}/bank-account/${bankAccountId}/balance`, {
            params: { startDate, endDate }
        });
        return response.data;
    }
}

export const cashMovementService = new CashMovementService();
