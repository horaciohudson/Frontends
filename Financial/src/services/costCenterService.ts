// Service para Centros de Custo

import api from './api';
import type { CostCenterDTO, CreateCostCenterDTO, CostCenterFilters } from '../types/costCenter';

// Re-exportar o tipo para uso em outros arquivos
export type { CostCenterDTO };

class CostCenterService {
  private readonly basePath = '/cost-centers';

  async findAll(filters?: CostCenterFilters): Promise<CostCenterDTO[]> {
    try {
      console.log('🔍 CostCenterService.findAll() - Iniciando...');
      console.log('🔍 Filtros:', filters);

      const params: any = {};
      if (filters?.isActive !== undefined) {
        params.isActive = filters.isActive;
      }
      if (filters?.searchText) {
        params.text = filters.searchText;
      }

      console.log('🔍 Parâmetros da requisição:', params);

      const response = await api.get<CostCenterDTO[]>(`${this.basePath}`, { params });

      console.log('✅ Response status:', response.status);
      console.log('✅ Response data:', response.data);
      console.log('✅ Centros de custo encontrados:', response.data.length);

      // Mapear os dados do backend para o formato esperado pelo frontend
      const mappedData = response.data.map((item: any) => ({
        id: item.costCenterId || item.id,
        tenantId: item.tenantId,
        companyId: item.companyId,
        costCenterCode: item.code || item.costCenterCode,
        costCenterName: item.name || item.costCenterName,
        parentCostCenterId: item.parentId || item.parentCostCenterId,
        level: item.level || 1,
        isActive: item.isActive,
        description: item.description,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        createdBy: item.createdBy,
        updatedBy: item.updatedBy
      })) as CostCenterDTO[];

      console.log('✅ Dados mapeados:', mappedData);
      return mappedData;
    } catch (error: any) {
      console.error('❌ Erro detalhado ao buscar centros de custo:', error);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error response:', error?.response?.data);
      console.error('❌ Error status:', error?.response?.status);
      return [];
    }
  }

  async findById(id: number): Promise<CostCenterDTO> {
    const response = await api.get<any>(`${this.basePath}/${id}`);
    const item = response.data;

    // Mapear os dados do backend para o formato esperado pelo frontend
    return {
      id: item.costCenterId || item.id,
      tenantId: item.tenantId,
      companyId: item.companyId,
      costCenterCode: item.code || item.costCenterCode,
      costCenterName: item.name || item.costCenterName,
      parentCostCenterId: item.parentId || item.parentCostCenterId,
      level: item.level || 1,
      isActive: item.isActive,
      description: item.description,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      createdBy: item.createdBy,
      updatedBy: item.updatedBy
    } as CostCenterDTO;
  }

  async create(data: CreateCostCenterDTO): Promise<CostCenterDTO> {
    console.log('🔍 CostCenterService.create() - Dados recebidos:', data);

    const selectedCompanyId = sessionStorage.getItem('selectedCompanyId');

    if (!selectedCompanyId) {
      throw new Error('❌ ERRO: selectedCompanyId não está configurado no sessionStorage. O usuário deve selecionar uma empresa antes de criar centros de custo.');
    }

    console.log('🔍 CompanyId para criação:', selectedCompanyId);

    // Mapear os dados do frontend para o formato esperado pelo backend
    // IMPORTANTE: Backend espera companyId como UUID, não como string
    const backendData = {
      companyId: selectedCompanyId, // Já é UUID string
      costCenterCode: data.costCenterCode?.trim(),
      costCenterName: data.costCenterName?.trim(),
      parentCostCenterId: data.parentCostCenterId || null,
      description: data.description?.trim() || null,
      isActive: data.isActive !== false // Default true
    };

    // Validar campos obrigatórios antes de enviar
    if (!backendData.companyId) {
      throw new Error('Company ID é obrigatório');
    }
    if (!backendData.costCenterCode) {
      throw new Error('Código do centro de custo é obrigatório');
    }
    if (!backendData.costCenterName) {
      throw new Error('Nome do centro de custo é obrigatório');
    }

    console.log('🔍 Dados finais para o backend:', backendData);

    const response = await api.post<any>(`${this.basePath}`, backendData);
    const item = response.data;

    // Mapear a resposta do backend para o formato esperado pelo frontend
    return {
      id: item.costCenterId || item.id,
      tenantId: item.tenantId,
      companyId: item.companyId,
      costCenterCode: item.code || item.costCenterCode,
      costCenterName: item.name || item.costCenterName,
      parentCostCenterId: item.parentId || item.parentCostCenterId,
      level: item.level || 1,
      isActive: item.isActive,
      description: item.description,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      createdBy: item.createdBy,
      updatedBy: item.updatedBy
    } as CostCenterDTO;
  }

  async update(id: number, data: Partial<CreateCostCenterDTO>): Promise<CostCenterDTO> {
    console.log('🔍 CostCenterService.update() - ID:', id, 'Dados:', data);

    // Mapear os dados do frontend para o formato esperado pelo backend
    const backendData = {
      companyId: data.companyId,
      costCenterCode: data.costCenterCode,
      costCenterName: data.costCenterName,
      parentCostCenterId: data.parentCostCenterId,
      description: data.description,
      isActive: data.isActive
    };

    console.log('🔍 Dados para o backend:', backendData);

    const response = await api.put<any>(`${this.basePath}/${id}`, backendData);
    const item = response.data;

    // Mapear a resposta do backend para o formato esperado pelo frontend
    return {
      id: item.costCenterId || item.id,
      tenantId: item.tenantId,
      companyId: item.companyId,
      costCenterCode: item.code || item.costCenterCode,
      costCenterName: item.name || item.costCenterName,
      parentCostCenterId: item.parentId || item.parentCostCenterId,
      level: item.level || 1,
      isActive: item.isActive,
      description: item.description,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      createdBy: item.createdBy,
      updatedBy: item.updatedBy
    } as CostCenterDTO;
  }

  async deactivate(id: number): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  // Método para construir árvore de centros de custo
  buildTree(costCenters: CostCenterDTO[]): CostCenterDTO[] {
    const map = new Map<number, CostCenterDTO>();
    const roots: CostCenterDTO[] = [];

    // Criar mapa de todos os centros de custo
    costCenters.forEach(cc => {
      map.set(cc.id, { ...cc, children: [] });
    });

    // Construir a árvore
    costCenters.forEach(cc => {
      const node = map.get(cc.id)!;
      if (cc.parentCostCenterId && map.has(cc.parentCostCenterId)) {
        const parent = map.get(cc.parentCostCenterId)!;
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}

export const costCenterService = new CostCenterService();