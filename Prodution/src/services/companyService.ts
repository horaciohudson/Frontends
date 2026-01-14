import api from './api';
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

export interface CreateCompanyDTO {
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

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

class CompanyService {
    async getAllCompanies(page: number = 0, size: number = 100): Promise<PageResponse<Company>> {
        try {
            const user = authService.getUser();
            const response = await api.get<PageResponse<Company>>(`/companies?page=${page}&size=${size}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar empresas:', error);
            throw error;
        }
    }

    async getCompanyById(id: string): Promise<Company> {
        try {
            const user = authService.getUser();
            const response = await api.get<Company>(`/companies/${id}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar empresa:', error);
            throw error;
        }
    }

    async createCompany(companyData: CreateCompanyDTO): Promise<Company> {
        try {
            const user = authService.getUser();
            console.log('🏢 [COMPANY SERVICE] Creating company:', companyData);
            
            const response = await api.post<Company>('/companies', companyData, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            
            console.log('✅ [COMPANY SERVICE] Company created successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('💥 [COMPANY SERVICE] Error creating company:', error);
            throw error;
        }
    }

    async updateCompany(id: string, companyData: Partial<CreateCompanyDTO>): Promise<Company> {
        try {
            const user = authService.getUser();
            console.log('🏢 [COMPANY SERVICE] Updating company:', id, companyData);
            
            const response = await api.put<Company>(`/companies/${id}`, companyData, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            
            console.log('✅ [COMPANY SERVICE] Company updated successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('💥 [COMPANY SERVICE] Error updating company:', error);
            throw error;
        }
    }

    async deleteCompany(id: string): Promise<void> {
        try {
            const user = authService.getUser();
            console.log('🏢 [COMPANY SERVICE] Deleting company:', id);
            
            await api.delete(`/companies/${id}`, {
                headers: {
                    'X-Tenant-ID': user?.tenantId
                }
            });
            
            console.log('✅ [COMPANY SERVICE] Company deleted successfully');
        } catch (error) {
            console.error('💥 [COMPANY SERVICE] Error deleting company:', error);
            throw error;
        }
    }
}

export const companyService = new CompanyService();
