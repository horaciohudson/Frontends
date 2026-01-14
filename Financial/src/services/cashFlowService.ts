// Service para Fluxo de Caixa

import api from './api';
import type { Page, PaginationParams } from '../types/common';
import type {
  CashFlowDTO,
  CreateCashFlowDTO,
  UpdateCashFlowDTO,
  CashFlowFilters
} from '../types/cashFlow';

class CashFlowService {
  private readonly basePath = '/cash-flow';

  async findAll(params: PaginationParams & CashFlowFilters = {}): Promise<Page<CashFlowDTO>> {
    const { page = 0, size = 20, sortBy = 'flowDate', sortDir = 'desc', ...filters } = params;

    const queryParams = new URLSearchParams({
      page: String(page),
      size: String(size),
      sortBy,
      sortDir,
    });

    // Adiciona filtros
    if (filters.flowType) queryParams.append('flowType', filters.flowType);
    if (filters.bankAccountId) queryParams.append('bankAccountId', String(filters.bankAccountId));
    if (filters.categoryId) queryParams.append('categoryId', String(filters.categoryId));
    if (filters.costCenterId) queryParams.append('costCenterId', String(filters.costCenterId));
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.searchText) queryParams.append('text', filters.searchText);

    const response = await api.get<Page<CashFlowDTO>>(`${this.basePath}?${queryParams}`);
    return response.data;
  }

  async findById(id: number): Promise<CashFlowDTO> {
    const response = await api.get<CashFlowDTO>(`${this.basePath}/${id}`);
    return response.data;
  }

  async findByDateRange(startDate: string, endDate: string, page = 0, size = 20): Promise<Page<CashFlowDTO>> {
    const response = await api.get<Page<CashFlowDTO>>(
      `${this.basePath}/date-range?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`
    );
    return response.data;
  }

  async findByType(flowType: string, page = 0, size = 20): Promise<Page<CashFlowDTO>> {
    const response = await api.get<Page<CashFlowDTO>>(
      `${this.basePath}/by-type?flowType=${flowType}&page=${page}&size=${size}`
    );
    return response.data;
  }

  async search(text: string, page = 0, size = 20): Promise<Page<CashFlowDTO>> {
    const response = await api.get<Page<CashFlowDTO>>(
      `${this.basePath}/search?text=${encodeURIComponent(text)}&page=${page}&size=${size}`
    );
    return response.data;
  }

  async findUnreconciled(bankAccountId?: number, page = 0, size = 20): Promise<Page<CashFlowDTO>> {
    const queryParams = new URLSearchParams({
      page: String(page),
      size: String(size),
      sortBy: 'flowDate',
      sortDir: 'desc'
    });

    if (bankAccountId) {
      queryParams.append('bankAccountId', String(bankAccountId));
    }

    // Filtrar apenas transações não conciliadas (reconciliationId null)
    // O backend deve implementar este filtro ou usaremos o findAll e filtraremos no frontend
    const response = await api.get<Page<CashFlowDTO>>(`${this.basePath}?${queryParams}`);
    return response.data;
  }

  async create(data: CreateCashFlowDTO): Promise<CashFlowDTO> {
    const selectedCompanyId = sessionStorage.getItem('selectedCompanyId');

    if (!selectedCompanyId) {
      throw new Error('❌ ERRO: selectedCompanyId não está configurado no sessionStorage. O usuário deve selecionar uma empresa antes de criar lançamentos.');
    }

    const payload = {
      ...data,
      companyId: selectedCompanyId,
    };

    const response = await api.post<CashFlowDTO>(this.basePath, payload);
    return response.data;
  }

  async update(id: number, data: UpdateCashFlowDTO): Promise<CashFlowDTO> {
    const selectedCompanyId = sessionStorage.getItem('selectedCompanyId');

    if (!selectedCompanyId) {
      throw new Error('❌ ERRO: selectedCompanyId não está configurado no sessionStorage. O usuário deve selecionar uma empresa antes de atualizar lançamentos.');
    }

    const payload = {
      ...data,
      id,
      companyId: selectedCompanyId,
    };

    const response = await api.put<CashFlowDTO>(`${this.basePath}/${id}`, payload);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  // Estatísticas
  async getSumByType(): Promise<Array<{ type: string; total: number }>> {
    const response = await api.get<Array<[string, number]>>(`${this.basePath}/stats/sum-by-type`);
    return response.data.map(([type, total]) => ({ type, total }));
  }

  async getSummary(startDate: string, endDate: string): Promise<{
    totalInflows: number;
    totalOutflows: number;
    balance: number;
    pendingInflows: number;
    pendingOutflows: number;
  }> {
    const response = await api.get(`${this.basePath}/summary?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }

  async markAsPaid(id: number): Promise<CashFlowDTO> {
    const response = await api.patch<CashFlowDTO>(`${this.basePath}/${id}/mark-paid`);
    return response.data;
  }

  async reconcile(id: number): Promise<CashFlowDTO> {
    const response = await api.patch<CashFlowDTO>(`${this.basePath}/${id}/reconcile`);
    return response.data;
  }

  async unreconcile(id: number): Promise<CashFlowDTO> {
    const response = await api.patch<CashFlowDTO>(`${this.basePath}/${id}/unreconcile`);
    return response.data;
  }

  async getChartData(startDate: string, endDate: string): Promise<Array<{
    date: string;
    inflows: number;
    outflows: number;
    balance: number;
  }>> {
    const response = await api.get(`${this.basePath}/chart-data?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }
}

export const cashFlowService = new CashFlowService();
