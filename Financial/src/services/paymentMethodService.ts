// Service para Métodos de Pagamento (Payment Methods)

import api from './api';
import type {
  PaymentMethodDTO,
  CreatePaymentMethodDTO,
  UpdatePaymentMethodDTO,
  PaymentMethodFilters,
  PaymentMethodSelectOption
} from '../types/paymentMethod';

class PaymentMethodService {
  private readonly basePath = '/payment-methods';

  async findAll(filters: PaymentMethodFilters = {}): Promise<PaymentMethodDTO[]> {
    const queryParams = new URLSearchParams();

    if (filters.companyId) queryParams.append('companyId', filters.companyId);
    if (filters.searchText) queryParams.append('text', filters.searchText);
    if (filters.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
    if (filters.methodType) queryParams.append('methodType', filters.methodType);

    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

    const response = await api.get<{ content: PaymentMethodDTO[] }>(url);
    return response.data.content || [];
  }

  async findById(id: string): Promise<PaymentMethodDTO> {
    const response = await api.get<PaymentMethodDTO>(`${this.basePath}/${id}`);
    return response.data;
  }

  async findByCode(code: string, companyId: string): Promise<PaymentMethodDTO> {
    const response = await api.get<PaymentMethodDTO>(`${this.basePath}/code/${code}?companyId=${companyId}`);
    return response.data;
  }

  async findActiveSimple(companyId: string): Promise<PaymentMethodDTO[]> {
    const response = await api.get<PaymentMethodDTO[]>(`${this.basePath}/simple?companyId=${companyId}`);
    return response.data;
  }

  async getSelectOptions(companyId: string): Promise<PaymentMethodSelectOption[]> {
    const response = await api.get<PaymentMethodDTO[]>(`${this.basePath}/simple?companyId=${companyId}`);
    return response.data.map(method => ({
      value: method.id,
      label: `${method.methodCode} - ${method.methodName}`,
      methodType: method.methodType,
      disabled: !method.isActive
    }));
  }

  async search(text: string, companyId: string): Promise<PaymentMethodDTO[]> {
    const response = await api.get<{ content: PaymentMethodDTO[] }>(
      `${this.basePath}?companyId=${companyId}&text=${encodeURIComponent(text)}`
    );
    return response.data.content || [];
  }

  async create(data: CreatePaymentMethodDTO): Promise<PaymentMethodDTO> {
    const response = await api.post<PaymentMethodDTO>(this.basePath, data);
    return response.data;
  }

  async update(id: string, data: UpdatePaymentMethodDTO): Promise<PaymentMethodDTO> {
    const response = await api.put<PaymentMethodDTO>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  async activate(id: string): Promise<PaymentMethodDTO> {
    const response = await api.patch<PaymentMethodDTO>(`${this.basePath}/${id}/activate`);
    return response.data;
  }

  async deactivate(id: string): Promise<PaymentMethodDTO> {
    const response = await api.patch<PaymentMethodDTO>(`${this.basePath}/${id}/deactivate`);
    return response.data;
  }

  async existsByCode(code: string, companyId: string): Promise<boolean> {
    try {
      await this.findByCode(code, companyId);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const paymentMethodService = new PaymentMethodService();