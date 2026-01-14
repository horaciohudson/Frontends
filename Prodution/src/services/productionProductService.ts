import api from './api';
import { authService } from './authService';
import type { ProductionProductDTO, CreateProductionProductDTO, UpdateProductionProductDTO } from '../types/productionProduct';

const ENDPOINT = '/production-products';

export const productionProductService = {
    // Listar todos os produtos de produção
    async findAll(companyId: string): Promise<ProductionProductDTO[]> {
        const user = authService.getUser();
        const response = await api.get<ProductionProductDTO[]>(ENDPOINT, {
            headers: {
                'X-Company-ID': companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });
        return response.data;
    },

    // Buscar produto por ID
    async findById(id: string): Promise<ProductionProductDTO> {
        const response = await api.get<ProductionProductDTO>(`${ENDPOINT}/${id}`);
        return response.data;
    },

    // Criar novo produto
    async create(data: CreateProductionProductDTO): Promise<ProductionProductDTO> {
        const user = authService.getUser();
        
        // Debug temporário
        console.log('🔍 [DEBUG] User from authService:', user);
        console.log('🔍 [DEBUG] Data received:', data);
        
        // Garantir que o tenantId está presente
        if (!user?.tenantId) {
            console.error('🚨 [ERROR] User or tenantId not found:', user);
            throw new Error('Usuário não autenticado ou tenantId não encontrado');
        }
        
        const dataWithTenant = {
            ...data,
            tenantId: user.tenantId
        };
        
        console.log('🔍 [DEBUG] Data being sent to API:', dataWithTenant);
        console.log('🔍 [DEBUG] JSON.stringify of data:', JSON.stringify(dataWithTenant, null, 2));
        
        const response = await api.post<ProductionProductDTO>(ENDPOINT, dataWithTenant, {
            headers: {
                'X-Company-ID': data.companyId,
                'X-Tenant-ID': user.tenantId
            }
        });
        return response.data;
    },

    // Atualizar produto
    async update(id: string, data: UpdateProductionProductDTO, companyId: string): Promise<ProductionProductDTO> {
        const user = authService.getUser();
        const response = await api.put<ProductionProductDTO>(`${ENDPOINT}/${id}`, data, {
            headers: {
                'X-Company-ID': companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });
        return response.data;
    },

    // Deletar produto
    async delete(id: string, companyId: string): Promise<void> {
        const user = authService.getUser();
        await api.delete(`${ENDPOINT}/${id}`, {
            headers: {
                'X-Company-ID': companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });
    },

    // Ativar/Desativar produto
    async toggleActive(id: string, isActive: boolean): Promise<ProductionProductDTO> {
        const response = await api.patch<ProductionProductDTO>(`${ENDPOINT}/${id}/active`, { isActive });
        return response.data;
    },

    // Buscar por SKU
    async findBySku(companyId: string, sku: string): Promise<ProductionProductDTO | null> {
        try {
            const user = authService.getUser();
            const response = await api.get<ProductionProductDTO>(`${ENDPOINT}/sku/${sku}`, {
                headers: {
                    'X-Company-ID': companyId,
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            return null;
        }
    }
};
