import api, { TokenManager, handleApiError } from './api';
import { Product } from '../types';

/**
 * Interface para o DTO de requisição do backend
 */
interface FiscalProductRequestDTO {
    companyId: string;
    code: string;
    description: string;
    ncm: string;
    cfop: string;
    unit: string;
    unitPrice: number;
    ean?: string;
    cest?: string;
    active?: boolean;
}

/**
 * Interface para o DTO de resposta do backend
 */
interface FiscalProductResponseDTO {
    productId: string;
    companyId: string;
    code: string;
    description: string;
    ncm: string;
    cfop: string;
    unit: string;
    unitPrice: number;
    ean?: string;
    cest?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Converte Product do frontend para FiscalProductRequestDTO do backend
 */
function toBackendDTO(product: Omit<Product, 'id'>): FiscalProductRequestDTO {
    return {
        companyId: product.companyId,
        code: product.productCode,
        description: product.description,
        ncm: product.ncm,
        cfop: product.cfop,
        origem: product.origem || '0',
        unit: 'UN', // Unidade padrão
        unitPrice: product.unitValue,
        ean: undefined,
        cest: product.cest,
        active: product.active
    };
}

/**
 * Converte FiscalProductResponseDTO do backend para Product do frontend
 */
function fromBackendDTO(dto: FiscalProductResponseDTO): Product {
    return {
        id: dto.productId,
        companyId: dto.companyId,
        productCode: dto.code,
        description: dto.description,
        ncm: dto.ncm,
        cest: dto.cest,
        cfop: dto.cfop,
        origem: '0', // Origem padrão (Nacional)
        unitValue: dto.unitPrice,
        active: dto.active,
        cstIcms: undefined,
        csosn: undefined,
        cstPis: undefined,
        cstCofins: undefined,
        aliquotaIcms: undefined,
        aliquotaPis: undefined,
        aliquotaCofins: undefined
    };
}

/**
 * Serviço para gerenciar produtos fiscais via API
 */
export const productService = {
    async getAll(companyId: string): Promise<Product[]> {
        try {
            if (!companyId || companyId.trim() === '') {
                throw new Error('ID da empresa é obrigatório para buscar produtos');
            }

            if (!TokenManager.isAuthenticated()) {
                throw new Error('Usuário não autenticado. Faça login para acessar os produtos.');
            }

            console.log(`🔍 Buscando produtos fiscais para empresa: ${companyId}`);

            const response = await api.get<FiscalProductResponseDTO[]>('/fiscal/products', {
                params: { companyId },
            });

            console.log(`✅ Produtos fiscais carregados: ${response.data?.length || 0} itens`);
            return response.data.map(fromBackendDTO);
        } catch (error: any) {
            console.error('❌ Erro ao buscar produtos fiscais:', error);

            if (error.response?.status === 403) {
                throw new Error('Acesso negado ao endpoint de produtos fiscais. Verifique suas permissões.');
            }

            if (error.response?.status === 401) {
                throw new Error('Sessão expirada. Faça login novamente para acessar os produtos.');
            }

            throw new Error(handleApiError(error));
        }
    },

    async getById(id: string): Promise<Product> {
        try {
            if (!id || id.trim() === '') {
                throw new Error('ID do produto é obrigatório');
            }

            if (!TokenManager.isAuthenticated()) {
                throw new Error('Usuário não autenticado. Faça login para acessar o produto.');
            }

            console.log(`🔍 Buscando produto fiscal: ${id}`);

            const response = await api.get<FiscalProductResponseDTO>(`/fiscal/products/${id}`);

            console.log(`✅ Produto fiscal encontrado: ${response.data.description}`);
            return fromBackendDTO(response.data);
        } catch (error: any) {
            console.error(`❌ Erro ao buscar produto ${id}:`, error);

            if (error.response?.status === 404) {
                throw new Error(`Produto fiscal com ID ${id} não foi encontrado`);
            }

            if (error.response?.status === 403) {
                throw new Error('Acesso negado ao produto fiscal. Verifique suas permissões.');
            }

            throw new Error(handleApiError(error));
        }
    },

    async create(product: Omit<Product, 'id'>): Promise<Product> {
        try {
            if (!product.productCode || product.productCode.trim() === '') {
                throw new Error('Código do produto é obrigatório');
            }

            if (!product.description || product.description.trim() === '') {
                throw new Error('Descrição do produto é obrigatória');
            }

            if (!TokenManager.isAuthenticated()) {
                throw new Error('Usuário não autenticado. Faça login para criar produtos.');
            }

            console.log(`📝 Criando produto fiscal: ${product.productCode} - ${product.description}`);

            const backendDTO = toBackendDTO(product);
            console.log('📤 Enviando para backend:', backendDTO);

            const response = await api.post<FiscalProductResponseDTO>('/fiscal/products', backendDTO);

            console.log(`✅ Produto fiscal criado com sucesso: ${response.data.productId}`);
            return fromBackendDTO(response.data);
        } catch (error: any) {
            console.error('❌ Erro ao criar produto fiscal:', error);

            if (error.response?.status === 400) {
                throw new Error('Dados do produto inválidos. Verifique as informações fornecidas.');
            }

            if (error.response?.status === 403) {
                throw new Error('Sem permissão para criar produtos fiscais.');
            }

            if (error.response?.status === 409) {
                throw new Error('Já existe um produto com este código. Use um código diferente.');
            }

            throw new Error(handleApiError(error));
        }
    },

    async update(id: string, product: Partial<Product>): Promise<Product> {
        try {
            if (!id || id.trim() === '') {
                throw new Error('ID do produto é obrigatório para atualização');
            }

            if (!TokenManager.isAuthenticated()) {
                throw new Error('Usuário não autenticado. Faça login para atualizar produtos.');
            }

            console.log(`📝 Atualizando produto fiscal: ${id}`);

            const backendDTO: Partial<FiscalProductRequestDTO> = {
                companyId: product.companyId,
                code: product.productCode,
                description: product.description,
                ncm: product.ncm,
                cfop: product.cfop,
                unit: 'UN',
                unitPrice: product.unitValue,
                cest: product.cest,
                active: product.active
            };

            const response = await api.put<FiscalProductResponseDTO>(`/fiscal/products/${id}`, backendDTO);

            console.log(`✅ Produto fiscal atualizado com sucesso: ${response.data.description}`);
            return fromBackendDTO(response.data);
        } catch (error: any) {
            console.error(`❌ Erro ao atualizar produto ${id}:`, error);

            if (error.response?.status === 404) {
                throw new Error(`Produto fiscal com ID ${id} não foi encontrado para atualização`);
            }

            if (error.response?.status === 400) {
                throw new Error('Dados de atualização inválidos. Verifique as informações fornecidas.');
            }

            if (error.response?.status === 403) {
                throw new Error('Sem permissão para atualizar este produto fiscal.');
            }

            throw new Error(handleApiError(error));
        }
    },

    async delete(id: string): Promise<void> {
        try {
            if (!id || id.trim() === '') {
                throw new Error('ID do produto é obrigatório para exclusão');
            }

            if (!TokenManager.isAuthenticated()) {
                throw new Error('Usuário não autenticado. Faça login para excluir produtos.');
            }

            console.log(`🗑️ Excluindo produto fiscal: ${id}`);

            await api.delete(`/fiscal/products/${id}`);

            console.log(`✅ Produto fiscal excluído com sucesso: ${id}`);
        } catch (error: any) {
            console.error(`❌ Erro ao excluir produto ${id}:`, error);

            if (error.response?.status === 404) {
                throw new Error(`Produto fiscal com ID ${id} não foi encontrado para exclusão`);
            }

            if (error.response?.status === 403) {
                throw new Error('Sem permissão para excluir este produto fiscal.');
            }

            if (error.response?.status === 409) {
                throw new Error('Não é possível excluir este produto pois ele está sendo usado em outras operações.');
            }

            throw new Error(handleApiError(error));
        }
    },
};
