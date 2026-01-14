// Service para Categorias Financeiras

import api from './api';
import type {
  FinancialCategoryDTO,
  CreateFinancialCategoryDTO,
  UpdateFinancialCategoryDTO,
  FinancialCategoryFilters,
  FinancialCategoryTreeNode,
  CategorySelectOption
} from '../types/financialCategory';

class FinancialCategoryService {
  private readonly basePath = '/financial-categories';

  async findAll(filters: FinancialCategoryFilters = {}): Promise<FinancialCategoryDTO[]> {
    const queryParams = new URLSearchParams();
    
    if (filters.searchText) queryParams.append('text', filters.searchText);
    if (filters.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
    if (filters.parentCategoryId) queryParams.append('parentCategoryId', filters.parentCategoryId);
    if (filters.level !== undefined) queryParams.append('level', String(filters.level));

    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    
    const response = await api.get<FinancialCategoryDTO[]>(url);
    return response.data;
  }

  async findById(id: string): Promise<FinancialCategoryDTO> {
    const response = await api.get<FinancialCategoryDTO>(`${this.basePath}/${id}`);
    return response.data;
  }

  async findByCode(code: string): Promise<FinancialCategoryDTO> {
    const response = await api.get<FinancialCategoryDTO>(`${this.basePath}/code/${code}`);
    return response.data;
  }

  async findByParent(parentId: string): Promise<FinancialCategoryDTO[]> {
    const response = await api.get<FinancialCategoryDTO[]>(`${this.basePath}/parent/${parentId}`);
    return response.data;
  }

  async findRootCategories(): Promise<FinancialCategoryDTO[]> {
    const response = await api.get<FinancialCategoryDTO[]>(`${this.basePath}/root`);
    return response.data;
  }

  async findActiveCategories(): Promise<FinancialCategoryDTO[]> {
    const response = await api.get<FinancialCategoryDTO[]>(`${this.basePath}/active`);
    return response.data;
  }


  async getTree(): Promise<FinancialCategoryTreeNode[]> {
    const response = await api.get<FinancialCategoryTreeNode[]>(`${this.basePath}/tree`);
    return response.data;
  }

  async getSelectOptions(): Promise<CategorySelectOption[]> {
    const response = await api.get<CategorySelectOption[]>(`${this.basePath}/select-options`);
    return response.data;
  }

  async search(text: string): Promise<FinancialCategoryDTO[]> {
    const response = await api.get<FinancialCategoryDTO[]>(
      `${this.basePath}/search?text=${encodeURIComponent(text)}`
    );
    return response.data;
  }

  async create(data: CreateFinancialCategoryDTO): Promise<FinancialCategoryDTO> {
    const response = await api.post<FinancialCategoryDTO>(this.basePath, data);
    return response.data;
  }

  async update(id: string, data: UpdateFinancialCategoryDTO): Promise<FinancialCategoryDTO> {
    const response = await api.put<FinancialCategoryDTO>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  async activate(id: string): Promise<FinancialCategoryDTO> {
    const response = await api.patch<FinancialCategoryDTO>(`${this.basePath}/${id}/activate`);
    return response.data;
  }

  async deactivate(id: string): Promise<FinancialCategoryDTO> {
    const response = await api.patch<FinancialCategoryDTO>(`${this.basePath}/${id}/deactivate`);
    return response.data;
  }

  async existsByCode(code: string): Promise<boolean> {
    const response = await api.get<boolean>(`${this.basePath}/exists/code/${code}`);
    return response.data;
  }

  async countByParent(parentId: string): Promise<number> {
    const response = await api.get<number>(`${this.basePath}/count/parent/${parentId}`);
    return response.data;
  }

  async countByLevel(level: number): Promise<number> {
    const response = await api.get<number>(`${this.basePath}/count/level/${level}`);
    return response.data;
  }

  // Método auxiliar para construir árvore a partir de lista plana
  buildTree(categories: FinancialCategoryDTO[]): FinancialCategoryTreeNode[] {
    const map = new Map<string, FinancialCategoryTreeNode>();
    const roots: FinancialCategoryTreeNode[] = [];

    // Primeiro, criar todos os nós
    categories.forEach(cat => {
      map.set(cat.id, {
        id: cat.id,
        categoryCode: cat.categoryCode,
        categoryName: cat.categoryName,
        level: cat.level,
        isActive: cat.isActive,
        color: cat.color,
        icon: cat.icon,
        children: [],
        expanded: false
      });
    });

    // Depois, construir a hierarquia
    categories.forEach(cat => {
      const node = map.get(cat.id)!;
      if (cat.parentCategoryId && map.has(cat.parentCategoryId)) {
        map.get(cat.parentCategoryId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  // Método auxiliar para achatar árvore em lista com indentação
  flattenTree(nodes: FinancialCategoryTreeNode[], level = 0): CategorySelectOption[] {
    const options: CategorySelectOption[] = [];
    
    nodes.forEach(node => {
      options.push({
        value: node.id,
        label: '  '.repeat(level) + node.categoryName,
        level: node.level,
        disabled: !node.isActive
      });
      
      if (node.children.length > 0) {
        options.push(...this.flattenTree(node.children, level + 1));
      }
    });
    
    return options;
  }
}

export const financialCategoryService = new FinancialCategoryService();
