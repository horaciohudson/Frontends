import { authService } from './authService';

export interface Tenant {
  id: string;
  code: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
  updatedBy?: string;
}

export interface CreateTenantRequest {
  code: string;
  name: string;
  status: string;
}

export interface UpdateTenantRequest {
  name: string;
  status: string;
}

class TenantService {
  private baseUrl = 'http://localhost:8081/api';

  async getAllTenants(): Promise<Tenant[]> {
    try {
      const response = await authService.makeAuthenticatedRequest(`${this.baseUrl}/tenants`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar tenants: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar tenants:', error);
      throw error;
    }
  }

  async getTenantById(id: string): Promise<Tenant> {
    try {
      const response = await authService.makeAuthenticatedRequest(`${this.baseUrl}/tenants/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar tenant: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar tenant:', error);
      throw error;
    }
  }

  async createTenant(tenant: CreateTenantRequest): Promise<Tenant> {
    try {
      const response = await authService.makeAuthenticatedRequest(`${this.baseUrl}/tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tenant),
      });

      if (!response.ok) {
        // Se receber 401 ou 403, pode ser token expirado
        if (response.status === 401 || response.status === 403) {
          authService.logout();
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        throw new Error(`Erro ao criar tenant: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar tenant:', error);
      throw error;
    }
  }

  async updateTenant(id: string, tenant: UpdateTenantRequest): Promise<Tenant> {
    try {
      const response = await authService.makeAuthenticatedRequest(`${this.baseUrl}/tenants/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tenant),
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar tenant: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar tenant:', error);
      throw error;
    }
  }

  async deleteTenant(id: string): Promise<void> {
    try {
      const response = await authService.makeAuthenticatedRequest(`${this.baseUrl}/tenants/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao deletar tenant: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao deletar tenant:', error);
      throw error;
    }
  }
}

export const tenantService = new TenantService();