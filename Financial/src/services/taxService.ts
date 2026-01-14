// Service para Impostos (Taxes)

import api from './api';
import type {
  TaxDTO,
  CreateTaxDTO,
  UpdateTaxDTO,
  TaxFilters,
  TaxSelectOption
} from '../types/tax';

class TaxService {
  private readonly basePath = '/tax-types';  // Alinhado com backend TaxTypeController

  async findAll(filters: TaxFilters = {}): Promise<TaxDTO[]> {
    const queryParams = new URLSearchParams();

    if (filters.searchText) queryParams.append('text', filters.searchText);
    if (filters.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
    if (filters.taxType) queryParams.append('taxType', filters.taxType);

    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

    const response = await api.get<TaxDTO[]>(url);
    return response.data;
  }

  async findById(id: string): Promise<TaxDTO> {
    const response = await api.get<TaxDTO>(`${this.basePath}/${id}`);
    return response.data;
  }

  async findByCode(code: string): Promise<TaxDTO> {
    const response = await api.get<TaxDTO>(`${this.basePath}/code/${code}`);
    return response.data;
  }

  async findActiveTaxes(): Promise<TaxDTO[]> {
    const response = await api.get<TaxDTO[]>(`${this.basePath}/active`);
    return response.data;
  }

  async getSelectOptions(): Promise<TaxSelectOption[]> {
    const taxes = await this.findActiveTaxes();
    return taxes.map(tax => ({
      value: tax.id.toString(),
      label: `${tax.taxCode} - ${tax.taxName} (${tax.defaultRate}%)`,
      rate: tax.defaultRate,
      disabled: !tax.isActive,
    }));
  }

  async create(data: CreateTaxDTO): Promise<TaxDTO> {
    const response = await api.post<TaxDTO>(this.basePath, data);
    return response.data;
  }

  async update(id: string, data: UpdateTaxDTO): Promise<TaxDTO> {
    const response = await api.put<TaxDTO>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  async activate(id: string): Promise<TaxDTO> {
    const response = await api.patch<TaxDTO>(`${this.basePath}/${id}/activate`);
    return response.data;
  }

  async deactivate(id: string): Promise<TaxDTO> {
    const response = await api.patch<TaxDTO>(`${this.basePath}/${id}/deactivate`);
    return response.data;
  }

  async existsByCode(code: string): Promise<boolean> {
    const response = await api.get<boolean>(`${this.basePath}/exists/code/${code}`);
    return response.data;
  }

  // Método auxiliar para calcular imposto
  calculateTax(amount: number, rate: number): number {
    return amount * (rate / 100);
  }
}

export const taxService = new TaxService();
