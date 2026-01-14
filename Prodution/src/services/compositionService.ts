import api from './api';
import { authService } from './authService';
import type {
    CompositionDTO,
    CreateCompositionDTO,
    UpdateCompositionDTO
} from '../types/composition';

const ENDPOINT = '/compositions';

export const compositionService = {
    // Listar todas as composições de uma empresa
    async findAllByCompany(companyId: string, activeOnly: boolean = false): Promise<CompositionDTO[]> {
        const user = authService.getUser();
        const response = await api.get<CompositionDTO[]>(ENDPOINT, {
            params: {
                companyId,
                activeOnly
            },
            headers: {
                'X-Company-ID': companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });
        return response.data;
    },

    // Buscar composição por ID
    async findById(id: string): Promise<CompositionDTO> {
        const response = await api.get<CompositionDTO>(`${ENDPOINT}/${id}`);
        return response.data;
    },

    // Buscar composições por produto
    async findByProduct(productId: string): Promise<CompositionDTO[]> {
        const response = await api.get<CompositionDTO[]>(`${ENDPOINT}/product/${productId}`);
        return response.data;
    },

    // Criar nova composição
    async create(data: CreateCompositionDTO): Promise<CompositionDTO> {
        const user = authService.getUser();
        const dataWithTenant = {
            ...data,
            tenantId: user?.tenantId
        };
        const response = await api.post<CompositionDTO>(ENDPOINT, dataWithTenant, {
            headers: {
                'X-Company-ID': data.companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });
        return response.data;
    },

    // Atualizar composição
    async update(id: string, data: UpdateCompositionDTO, companyId: string): Promise<CompositionDTO> {
        const user = authService.getUser();
        const response = await api.put<CompositionDTO>(`${ENDPOINT}/${id}`, data, {
            headers: {
                'X-Company-ID': companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });
        return response.data;
    },

    // Deletar composição
    async delete(id: string, companyId: string): Promise<void> {
        const user = authService.getUser();
        await api.delete(`${ENDPOINT}/${id}`, {
            headers: {
                'X-Company-ID': companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });
    },

    // Aprovar composição
    async approve(id: string, companyId: string): Promise<CompositionDTO> {
        const user = authService.getUser();
        const response = await api.post<CompositionDTO>(`${ENDPOINT}/${id}/approve`, {}, {
            headers: {
                'X-Company-ID': companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });
        return response.data;
    }
};