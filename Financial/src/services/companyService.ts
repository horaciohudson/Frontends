import { authService } from './authService';

export interface Company {
  id: string;
  tenantId: string;
  corporateName: string;
  tradeName?: string;
  cnpj?: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  whatsapp?: string;
  issRate?: number;
  funruralRate?: number;
  manager?: string;
  factory?: boolean;
  supplierFlag?: boolean;
  customerFlag?: boolean;
  transporterFlag?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateCompanyRequest {
  tenantId: string;
  corporateName: string;
  tradeName?: string;
  cnpj?: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  whatsapp?: string;
  issRate?: number;
  funruralRate?: number;
  manager?: string;
  factory?: boolean;
  supplierFlag?: boolean;
  customerFlag?: boolean;
  transporterFlag?: boolean;
  isActive?: boolean;
}

export interface UpdateCompanyRequest extends CreateCompanyRequest { }

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

class CompanyService {
  private baseUrl = 'http://localhost:8081/api';

  public getTenantId(): string {
    const user = authService.getUser();
    return user?.tenantId?.toString() || '';
  }

  private getUserId(): string {
    const user = authService.getUser();
    return user?.id?.toString() || 'system';
  }

  async getAllCompanies(page: number = 0, size: number = 20): Promise<PageResponse<Company>> {
    try {
      const tenantId = this.getTenantId();
      const response = await authService.makeAuthenticatedRequest(
        `${this.baseUrl}/companies?page=${page}&size=${size}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenantId,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar empresas: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      throw error;
    }
  }

  async getCompanyById(id: string): Promise<Company> {
    try {
      const tenantId = this.getTenantId();
      const response = await authService.makeAuthenticatedRequest(
        `${this.baseUrl}/companies/${id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenantId,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar empresa: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      throw error;
    }
  }

  async createCompany(company: CreateCompanyRequest): Promise<Company> {
    try {
      const tenantId = this.getTenantId();
      const userId = this.getUserId();

      const response = await authService.makeAuthenticatedRequest(
        `${this.baseUrl}/companies`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenantId,
            'X-User-ID': userId,
          },
          body: JSON.stringify({ ...company, tenantId }),
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          authService.logout();
          throw new Error('Sessão expirada. Faça login novamente.');
        }

        // Tenta extrair a mensagem de erro do backend
        let errorMessage = `Erro ao criar empresa: ${response.status}`;

        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            if (errorData && errorData.message) {
              errorMessage = errorData.message;
            }
          } else {
            // Se não for JSON, tenta ler como texto
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText;
            }
          }
        } catch (parseError) {
          // Se falhar ao parsear, mantém a mensagem padrão
          console.warn('Não foi possível extrair mensagem de erro:', parseError);
        }

        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      throw error;
    }
  }

  async updateCompany(id: string, company: UpdateCompanyRequest): Promise<Company> {
    try {
      const tenantId = this.getTenantId();
      const userId = this.getUserId();

      const response = await authService.makeAuthenticatedRequest(
        `${this.baseUrl}/companies/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenantId,
            'X-User-ID': userId,
          },
          body: JSON.stringify({ ...company, tenantId }),
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          authService.logout();
          throw new Error('Sessão expirada. Faça login novamente.');
        }

        // Tenta extrair a mensagem de erro do backend
        let errorMessage = `Erro ao atualizar empresa: ${response.status}`;

        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            if (errorData && errorData.message) {
              errorMessage = errorData.message;
            }
          } else {
            // Se não for JSON, tenta ler como texto
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText;
            }
          }
        } catch (parseError) {
          // Se falhar ao parsear, mantém a mensagem padrão
          console.warn('Não foi possível extrair mensagem de erro:', parseError);
        }

        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      throw error;
    }
  }

  async deleteCompany(id: string): Promise<void> {
    try {
      const tenantId = this.getTenantId();
      const userId = this.getUserId();

      const response = await authService.makeAuthenticatedRequest(
        `${this.baseUrl}/companies/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenantId,
            'X-User-ID': userId,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao deletar empresa: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao deletar empresa:', error);
      throw error;
    }
  }

  async searchCompanies(text: string, page: number = 0, size: number = 20): Promise<PageResponse<Company>> {
    try {
      const tenantId = this.getTenantId();
      const response = await authService.makeAuthenticatedRequest(
        `${this.baseUrl}/companies/search?text=${encodeURIComponent(text)}&page=${page}&size=${size}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenantId,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar empresas: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      throw error;
    }
  }

  async getSuppliersSimple(): Promise<Company[]> {
    try {
      const tenantId = this.getTenantId();
      const response = await authService.makeAuthenticatedRequest(
        `${this.baseUrl}/companies/suppliers/simple`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenantId,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar fornecedores: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      throw error;
    }
  }

  async getCustomersSimple(): Promise<Company[]> {
    try {
      const tenantId = this.getTenantId();
      const response = await authService.makeAuthenticatedRequest(
        `${this.baseUrl}/companies/customers/simple`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenantId,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar clientes: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  }
}

export const companyService = new CompanyService();
