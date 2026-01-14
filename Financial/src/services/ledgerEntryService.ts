// Service para Lançamentos Contábeis (Ledger Entries)

import api from './api';
import type { Page, PaginationParams } from '../types/common';
import type {
  LedgerEntryDTO,
  CreateLedgerEntryDTO,
  UpdateLedgerEntryDTO,
  LedgerEntryFilters,
  LedgerEntryFormData
} from '../types/ledgerEntry';

class LedgerEntryService {
  private readonly basePath = '/ledger-entries';

  async findAll(
    filters: LedgerEntryFilters = {},
    pagination: PaginationParams = {}
  ): Promise<Page<LedgerEntryDTO>> {
    const queryParams = new URLSearchParams();

    if (filters.searchText) queryParams.append('text', filters.searchText);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.ledgerAccountId) queryParams.append('ledgerAccountId', filters.ledgerAccountId);
    if (filters.costCenterId) queryParams.append('costCenterId', filters.costCenterId);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.minAmount !== undefined) queryParams.append('minAmount', String(filters.minAmount));
    if (filters.maxAmount !== undefined) queryParams.append('maxAmount', String(filters.maxAmount));

    if (pagination.page !== undefined) queryParams.append('page', String(pagination.page));
    if (pagination.size !== undefined) queryParams.append('size', String(pagination.size));
    if (pagination.sortBy) queryParams.append('sortBy', pagination.sortBy);
    if (pagination.sortDir) queryParams.append('sortDir', pagination.sortDir);

    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

    const response = await api.get<Page<LedgerEntryDTO>>(url);
    return response.data;
  }

  async findById(id: string): Promise<LedgerEntryDTO> {
    const response = await api.get<LedgerEntryDTO>(`${this.basePath}/${id}`);
    return response.data;
  }

  async findByDateRange(startDate: string, endDate: string): Promise<LedgerEntryDTO[]> {
    const response = await api.get<LedgerEntryDTO[]>(
      `${this.basePath}/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  async findByAccount(accountId: string): Promise<LedgerEntryDTO[]> {
    const response = await api.get<LedgerEntryDTO[]>(`${this.basePath}/account/${accountId}`);
    return response.data;
  }

  async findByCostCenter(costCenterId: string): Promise<LedgerEntryDTO[]> {
    const response = await api.get<LedgerEntryDTO[]>(`${this.basePath}/cost-center/${costCenterId}`);
    return response.data;
  }

  /**
   * Cria um lançamento duplo (débito e crédito)
   * Converte os dados do formulário em dois DTOs separados
   */
  async createDoubleEntry(formData: LedgerEntryFormData): Promise<LedgerEntryDTO[]> {
    console.log('📝 FormData recebido:', formData);

    // Cria DTO para débito
    const debitDTO: CreateLedgerEntryDTO = {
      entryDate: formData.entryDate,
      ledgerAccountId: Number(formData.debitAccountId),
      entryType: 'DEBIT' as const,
      amount: formData.amount,
      description: formData.description,
      costCenterId: formData.costCenterId ? Number(formData.costCenterId) : undefined,
      notes: formData.notes,
      documentNumber: formData.documentNumber,
      referenceType: formData.referenceType,
    };

    // Cria DTO para crédito (mesmos dados, apenas muda a conta e o tipo)
    const creditDTO: CreateLedgerEntryDTO = {
      ...debitDTO,
      ledgerAccountId: Number(formData.creditAccountId),
      entryType: 'CREDIT' as const,
    };

    console.log('📤 Enviando para backend:', [debitDTO, creditDTO]);

    // Envia array com 2 DTOs para o endpoint de lançamento duplo
    const response = await api.post<LedgerEntryDTO[]>(
      `${this.basePath}/double-entry`,
      [debitDTO, creditDTO]
    );

    console.log('✅ Resposta do backend:', response.data);
    return response.data;
  }

  async create(data: CreateLedgerEntryDTO): Promise<LedgerEntryDTO> {
    const response = await api.post<LedgerEntryDTO>(this.basePath, data);
    return response.data;
  }

  async update(id: string, data: UpdateLedgerEntryDTO): Promise<LedgerEntryDTO> {
    const response = await api.put<LedgerEntryDTO>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  async post(id: string): Promise<LedgerEntryDTO> {
    const response = await api.patch<LedgerEntryDTO>(`${this.basePath}/${id}/post`);
    return response.data;
  }

  async cancel(id: string): Promise<LedgerEntryDTO> {
    const response = await api.patch<LedgerEntryDTO>(`${this.basePath}/${id}/cancel`);
    return response.data;
  }

  async getAccountBalance(accountId: string, date?: string): Promise<number> {
    const url = date
      ? `${this.basePath}/balance/${accountId}?date=${date}`
      : `${this.basePath}/balance/${accountId}`;
    const response = await api.get<number>(url);
    return response.data;
  }
}

export const ledgerEntryService = new LedgerEntryService();
