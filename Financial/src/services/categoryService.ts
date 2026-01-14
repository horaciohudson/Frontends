// Service para Categorias Financeiras

import api from './api';

export interface CategoryDTO {
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  categoryKind: string; // REVENUE, EXPENSE, TRANSFER, TAX
  description?: string;
  isActive: boolean;
  level?: number;
  color?: string;
  icon?: string;
  parentCategoryId?: number;
  tenantId: string;
  companyId: string;
  createdAt: string;
}

class CategoryService {
  private readonly basePath = '/financial-categories';

  async findAll(): Promise<CategoryDTO[]> {
    try {
      console.log('🔍 CategoryService.findAll() - Iniciando...');

      // Verificar se temos companyId
      const selectedCompanyId = sessionStorage.getItem('selectedCompanyId');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const companyId = selectedCompanyId || user.tenantId;

      console.log('🔍 CompanyId para categorias:', companyId);
      console.log('🔍 User:', user);
      console.log('🔍 SelectedCompanyId:', selectedCompanyId);

      const url = `${this.basePath}?isActive=true`;
      console.log('🔍 URL da requisição:', url);

      // As categorias usam apenas headers, não query parameters
      // O companyId já é adicionado automaticamente pelo interceptor da API
      const response = await api.get<CategoryDTO[]>(`${this.basePath}`, {
        params: {
          isActive: true
        }
      });

      console.log('✅ Response status:', response.status);
      console.log('✅ Response data:', response.data);
      console.log('✅ Categorias encontradas:', response.data.length);

      // Mapear os dados do backend para o formato esperado pelo frontend
      const mappedData = response.data.map((item: any) => ({
        categoryId: item.id || item.categoryId, // Mapear id do backend para categoryId do frontend
        categoryCode: item.categoryCode,
        categoryName: item.categoryName,
        categoryKind: item.categoryKind,
        description: item.description,
        isActive: item.isActive,
        level: item.level,
        color: item.color,
        icon: item.icon,
        parentCategoryId: item.parentCategoryId,
        tenantId: item.tenantId,
        companyId: item.companyId,
        createdAt: item.createdAt,
      })) as CategoryDTO[];

      const activeCategories = mappedData.filter(category => category.isActive);
      console.log('✅ Categorias ativas:', activeCategories.length);
      return activeCategories;
    } catch (error: any) {
      console.error('❌ Erro detalhado ao buscar categorias:', error);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error response:', error?.response?.data);
      console.error('❌ Error status:', error?.response?.status);
      return [];
    }
  }

  async findById(id: number): Promise<CategoryDTO> {
    const response = await api.get<CategoryDTO>(`${this.basePath}/${id}`);
    return response.data;
  }
}

export const categoryService = new CategoryService();