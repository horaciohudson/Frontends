// Service para Notas Fiscais (Invoices)

import api from './api';
import type { Page, PaginationParams } from '../types/common';
import type {
  InvoiceDTO,
  CreateInvoiceDTO,
  UpdateInvoiceDTO,
  InvoiceFilters
} from '../types/invoice';

class InvoiceService {
  private readonly basePath = '/invoices';

  async findAll(
    filters: InvoiceFilters = {},
    pagination: PaginationParams = {}
  ): Promise<Page<InvoiceDTO>> {
    const queryParams = new URLSearchParams();
    
    if (filters.searchText) queryParams.append('text', filters.searchText);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.invoiceType) queryParams.append('invoiceType', filters.invoiceType);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.customerId) queryParams.append('customerId', filters.customerId);
    if (filters.supplierId) queryParams.append('supplierId', filters.supplierId);
    
    if (pagination.page !== undefined) queryParams.append('page', String(pagination.page));
    if (pagination.size !== undefined) queryParams.append('size', String(pagination.size));
    if (pagination.sortBy) queryParams.append('sortBy', pagination.sortBy);
    if (pagination.sortDir) queryParams.append('sortDir', pagination.sortDir);

    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    
    const response = await api.get<Page<InvoiceDTO>>(url);
    return response.data;
  }

  async findById(id: string): Promise<InvoiceDTO> {
    const response = await api.get<InvoiceDTO>(`${this.basePath}/${id}`);
    return response.data;
  }

  async findByNumber(number: string, series: string): Promise<InvoiceDTO> {
    const response = await api.get<InvoiceDTO>(
      `${this.basePath}/number/${number}/series/${series}`
    );
    return response.data;
  }

  async findByDateRange(startDate: string, endDate: string): Promise<InvoiceDTO[]> {
    const response = await api.get<InvoiceDTO[]>(
      `${this.basePath}/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  async create(data: CreateInvoiceDTO): Promise<InvoiceDTO> {
    const response = await api.post<InvoiceDTO>(this.basePath, data);
    return response.data;
  }

  async update(id: string, data: UpdateInvoiceDTO): Promise<InvoiceDTO> {
    const response = await api.put<InvoiceDTO>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  async issue(id: string): Promise<InvoiceDTO> {
    const response = await api.patch<InvoiceDTO>(`${this.basePath}/${id}/issue`);
    return response.data;
  }

  async cancel(id: string): Promise<InvoiceDTO> {
    const response = await api.patch<InvoiceDTO>(`${this.basePath}/${id}/cancel`);
    return response.data;
  }

  // Método auxiliar para calcular totais
  calculateTotals(items: { quantity: number; unitPrice: number; taxRate?: number }[]): {
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
  } {
    let subtotal = 0;
    let taxAmount = 0;

    items.forEach(item => {
      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;
      if (item.taxRate) {
        taxAmount += itemTotal * (item.taxRate / 100);
      }
    });

    return {
      subtotal,
      taxAmount,
      totalAmount: subtotal + taxAmount,
    };
  }
}

export const invoiceService = new InvoiceService();
