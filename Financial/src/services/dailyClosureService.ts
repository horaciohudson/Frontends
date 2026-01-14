// Service para Fechamento Diário

import api from './api';
import type { Page, PaginationParams } from '../types/common';
import type {
    DailyClosureDTO,
    CreateDailyClosureDTO,
    UpdateDailyClosureDTO,
    DailyClosureFilters,
    ClosureStatus
} from '../types/dailyClosure';

class DailyClosureService {
    private readonly basePath = '/daily-closures';

    /**
     * Lista todos os fechamentos com paginação e filtros
     */
    async findAll(params: PaginationParams & DailyClosureFilters = {}): Promise<Page<DailyClosureDTO>> {
        const { page = 0, size = 20, sortBy = 'closureDate', sortDir = 'desc', ...filters } = params;

        const queryParams = new URLSearchParams({
            page: String(page),
            size: String(size),
            sortBy,
            sortDir,
        });

        // Adiciona filtros
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.bankAccountId) queryParams.append('bankAccountId', String(filters.bankAccountId));
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);

        const response = await api.get<Page<DailyClosureDTO>>(`${this.basePath}?${queryParams}`);
        return response.data;
    }

    /**
     * Busca fechamento por ID
     */
    async findById(id: number): Promise<DailyClosureDTO> {
        const response = await api.get<DailyClosureDTO>(`${this.basePath}/${id}`);
        return response.data;
    }

    /**
     * Cria um novo fechamento
     */
    async create(data: CreateDailyClosureDTO): Promise<DailyClosureDTO> {
        const selectedCompanyId = sessionStorage.getItem('selectedCompanyId');

        const payload = {
            ...data,
            companyId: data.companyId || selectedCompanyId,
        };

        const response = await api.post<DailyClosureDTO>(this.basePath, payload);
        return response.data;
    }

    /**
     * Atualiza um fechamento existente
     */
    async update(id: number, data: UpdateDailyClosureDTO): Promise<DailyClosureDTO> {
        const response = await api.put<DailyClosureDTO>(`${this.basePath}/${id}`, data);
        return response.data;
    }

    /**
     * Fecha um fechamento (muda status para CLOSED)
     */
    async close(id: number): Promise<DailyClosureDTO> {
        const response = await api.patch<DailyClosureDTO>(`${this.basePath}/${id}/close`);
        return response.data;
    }

    /**
     * Bloqueia um fechamento (muda status para LOCKED)
     */
    async lock(id: number): Promise<DailyClosureDTO> {
        const response = await api.patch<DailyClosureDTO>(`${this.basePath}/${id}/lock`);
        return response.data;
    }

    /**
     * Reabre um fechamento (muda status para OPEN)
     */
    async reopen(id: number): Promise<DailyClosureDTO> {
        const response = await api.patch<DailyClosureDTO>(`${this.basePath}/${id}/reopen`);
        return response.data;
    }

    /**
     * Deleta um fechamento
     */
    async delete(id: number): Promise<void> {
        await api.delete(`${this.basePath}/${id}`);
    }

    /**
     * Busca fechamentos por status
     */
    async findByStatus(status: ClosureStatus, params: PaginationParams = {}): Promise<Page<DailyClosureDTO>> {
        return this.findAll({ ...params, status });
    }

    /**
     * Busca fechamentos por intervalo de datas
     */
    async findByDateRange(
        startDate: string,
        endDate: string,
        params: PaginationParams = {}
    ): Promise<Page<DailyClosureDTO>> {
        return this.findAll({ ...params, startDate, endDate });
    }

    /**
     * Busca fechamentos por conta bancária
     */
    async findByBankAccount(bankAccountId: number, params: PaginationParams = {}): Promise<Page<DailyClosureDTO>> {
        return this.findAll({ ...params, bankAccountId });
    }
}

export const dailyClosureService = new DailyClosureService();
export default dailyClosureService;
