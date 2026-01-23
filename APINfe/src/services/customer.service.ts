import api from './api';
import { Customer } from '../types';

// Backend DTOs
interface FiscalCustomerRequestDTO {
    companyId: string;
    tipoPessoa: 'FISICA' | 'JURIDICA';
    cpfCnpj: string;
    nome: string;
    ie?: string;
    emailNfe?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    codigoMunicipio?: number;
    nomeMunicipio?: string;
    uf?: string;
    cep?: string;
    telefone?: string;
    active?: boolean;
}

interface FiscalCustomerResponseDTO {
    customerId: string;
    companyId: string;
    tipoPessoa: 'FISICA' | 'JURIDICA';
    cpfCnpj: string;
    nome: string;
    ie?: string;
    emailNfe?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    codigoMunicipio?: number;
    nomeMunicipio?: string;
    uf?: string;
    cep?: string;
    telefone?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

// Mapper functions
function toBackendDTO(customer: Omit<Customer, 'id'>): FiscalCustomerRequestDTO {
    return {
        companyId: customer.companyId,
        tipoPessoa: customer.tipoPessoa,
        cpfCnpj: customer.cpfCnpj.replace(/\D/g, ''), // Remove formatação (pontos, barras, hífen)
        nome: customer.nome,
        ie: customer.ie,
        emailNfe: customer.emailNfe,
        logradouro: customer.logradouro,
        numero: customer.numero,
        complemento: customer.complemento,
        bairro: customer.bairro,
        codigoMunicipio: customer.codigoMunicipio,
        nomeMunicipio: customer.nomeMunicipio,
        uf: customer.uf,
        cep: customer.cep?.replace(/\D/g, ''), // Remove formatação do CEP também
        telefone: customer.telefone,
        active: customer.active
    };
}

function fromBackendDTO(dto: FiscalCustomerResponseDTO): Customer {
    return {
        id: dto.customerId,
        companyId: dto.companyId,
        tipoPessoa: dto.tipoPessoa,
        cpfCnpj: dto.cpfCnpj,
        nome: dto.nome,
        ie: dto.ie,
        emailNfe: dto.emailNfe,
        logradouro: dto.logradouro,
        numero: dto.numero,
        complemento: dto.complemento,
        bairro: dto.bairro,
        codigoMunicipio: dto.codigoMunicipio,
        nomeMunicipio: dto.nomeMunicipio,
        uf: dto.uf,
        cep: dto.cep,
        telefone: dto.telefone,
        active: dto.active
    };
}

export const customerService = {
    async getAll(companyId: string): Promise<Customer[]> {
        const response = await api.get<FiscalCustomerResponseDTO[]>('/fiscal/customers', {
            params: { companyId }
        });
        return response.data.map(fromBackendDTO);
    },

    async getById(id: string): Promise<Customer> {
        const response = await api.get<FiscalCustomerResponseDTO>(`/fiscal/customers/${id}`);
        return fromBackendDTO(response.data);
    },

    async create(customer: Omit<Customer, 'id'>): Promise<Customer> {
        const response = await api.post<FiscalCustomerResponseDTO>('/fiscal/customers', toBackendDTO(customer));
        return fromBackendDTO(response.data);
    },

    async update(id: string, customer: Partial<Customer>): Promise<Customer> {
        const fullCustomer = { ...customer, id } as Customer;
        const response = await api.put<FiscalCustomerResponseDTO>(`/fiscal/customers/${id}`, toBackendDTO(fullCustomer as Omit<Customer, 'id'>));
        return fromBackendDTO(response.data);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/fiscal/customers/${id}`);
    },

    async searchByCpfCnpj(cpfCnpj: string, companyId: string): Promise<Customer | null> {
        const response = await api.get<FiscalCustomerResponseDTO>('/fiscal/customers/search', {
            params: { cpfCnpj, companyId }
        });
        return response.data ? fromBackendDTO(response.data) : null;
    }
};
