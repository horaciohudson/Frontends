import api from './api';
import { authService } from './authService';
import type { RawMaterialDTO, CreateRawMaterialDTO, UpdateRawMaterialDTO } from '../types/rawMaterial';

const ENDPOINT = '/raw-materials';

export const rawMaterialService = {
    // Listar todas as matérias-primas de uma empresa
    async findAllByCompany(companyId: string, activeOnly: boolean = false): Promise<RawMaterialDTO[]> {
        const user = authService.getUser();
        console.log(`🌐 [RAW MATERIAL SERVICE] GET ${ENDPOINT}`, { companyId, activeOnly, tenantId: user?.tenantId });
        const response = await api.get<RawMaterialDTO[]>(ENDPOINT, {
            params: {
                companyId,
                activeOnly
            },
            headers: {
                'X-Company-ID': companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });
        console.log(`🌐 [RAW MATERIAL SERVICE] Response from ${ENDPOINT}:`, response.data);
        return response.data;
    },

    // Buscar matéria-prima por ID
    async findById(id: string): Promise<RawMaterialDTO> {
        const response = await api.get<RawMaterialDTO>(`${ENDPOINT}/${id}`);
        return response.data;
    },

    // Buscar matéria-prima por código
    async findByCode(companyId: string, code: string): Promise<RawMaterialDTO | null> {
        try {
            const user = authService.getUser();
            const response = await api.get<RawMaterialDTO>(`${ENDPOINT}/code/${code}`, {
                params: { companyId },
                headers: {
                    'X-Company-ID': companyId,
                    'X-Tenant-ID': user?.tenantId
                }
            });
            return response.data;
        } catch (error) {
            return null;
        }
    },

    // Criar nova matéria-prima
    async create(data: CreateRawMaterialDTO): Promise<RawMaterialDTO> {
        const user = authService.getUser();
        const dataWithTenant = {
            ...data,
            tenantId: user?.tenantId
        };
        const response = await api.post<RawMaterialDTO>(ENDPOINT, dataWithTenant, {
            headers: {
                'X-Company-ID': data.companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });
        return response.data;
    },

    // Atualizar matéria-prima
    async update(id: string, data: UpdateRawMaterialDTO, companyId: string): Promise<RawMaterialDTO> {
        const user = authService.getUser();
        const response = await api.put<RawMaterialDTO>(`${ENDPOINT}/${id}`, data, {
            headers: {
                'X-Company-ID': companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });
        return response.data;
    },

    // Deletar matéria-prima
    async delete(id: string, companyId: string): Promise<void> {
        const user = authService.getUser();
        await api.delete(`${ENDPOINT}/${id}`, {
            headers: {
                'X-Company-ID': companyId,
                'X-Tenant-ID': user?.tenantId
            }
        });
    },

    // Buscar por categoria
    async findByCategory(categoryId: string): Promise<RawMaterialDTO[]> {
        const response = await api.get<RawMaterialDTO[]>(`${ENDPOINT}/category/${categoryId}`);
        return response.data;
    },

    // Buscar por fornecedor
    async findBySupplier(supplierId: string): Promise<RawMaterialDTO[]> {
        const response = await api.get<RawMaterialDTO[]>(`${ENDPOINT}/supplier/${supplierId}`);
        return response.data;
    }
};