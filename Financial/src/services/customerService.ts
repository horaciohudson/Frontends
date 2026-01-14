import type { CustomerDTO, CreateCustomerDTO, UpdateCustomerDTO, CustomerFilters } from '../types/customer';
import { apiClient } from './apiClient';

// Re-export types for convenience
export type { CustomerDTO, CreateCustomerDTO, UpdateCustomerDTO, CustomerFilters };

export const customerService = {
  /**
   * Lista todos os clientes com filtros
   */
  async findAll(filters: CustomerFilters = {}): Promise<CustomerDTO[]> {
    const params = new URLSearchParams();

    if (filters.companyId) {
      params.append('companyId', filters.companyId);
    }
    if (filters.searchText) {
      params.append('searchText', filters.searchText);
    }
    if (filters.isActive !== undefined) {
      params.append('isActive', String(filters.isActive));
    }

    const response = await apiClient.get(`/customers?${params.toString()}`);
    return response.data;
  },

  /**
   * Busca cliente por ID
   */
  async findById(id: string): Promise<CustomerDTO> {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  /**
   * Cria um novo cliente
   */
  async create(data: CreateCustomerDTO): Promise<CustomerDTO> {
    const response = await apiClient.post('/customers', data);
    return response.data;
  },

  /**
   * Atualiza um cliente
   */
  async update(id: string, data: UpdateCustomerDTO): Promise<CustomerDTO> {
    const response = await apiClient.put(`/customers/${id}`, data);
    return response.data;
  },

  /**
   * Desativa um cliente
   */
  async deactivate(id: string): Promise<void> {
    await apiClient.patch(`/customers/${id}/deactivate`);
  },

  /**
   * Ativa um cliente
   */
  async activate(id: string): Promise<void> {
    await apiClient.patch(`/customers/${id}/activate`);
  }
};