// Service para Fornecedores (usando Companies API)

import api from './api';

export interface SupplierDTO {
  id: string; // UUID no backend
  corporateName: string;
  tradeName?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  supplierFlag: boolean;
  isActive: boolean;
}

class SupplierService {
  private readonly basePath = '/companies';

  async findSuppliers(): Promise<SupplierDTO[]> {
    try {
      console.log('🔍 SupplierService.findSuppliers() - Iniciando...');
      
      const url = `${this.basePath}/suppliers/simple`;
      console.log('🔍 URL da requisição:', url);
      
      // Buscar fornecedores usando o endpoint específico
      const response = await api.get<SupplierDTO[]>(`${this.basePath}/suppliers/simple`);
      
      console.log('✅ Response status:', response.status);
      console.log('✅ Response data:', response.data);
      console.log('✅ Fornecedores encontrados:', response.data.length);
      
      // Filtrar apenas os ativos com supplierFlag = true
      const activeSuppliers = response.data.filter(company => 
        company.isActive && company.supplierFlag
      );
      console.log('✅ Fornecedores ativos:', activeSuppliers.length);
      return activeSuppliers;
    } catch (error: any) {
      console.error('❌ Erro detalhado ao buscar fornecedores:', error);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error stack:', error?.stack);
      return [];
    }
  }

  async findById(id: string): Promise<SupplierDTO> {
    const response = await api.get<SupplierDTO>(`${this.basePath}/${id}`);
    return response.data;
  }
}

export const supplierService = new SupplierService();