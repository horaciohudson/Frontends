import type { Transfer, CreateTransferDTO } from '../types/transfer';
import type { PageResponse, PaginationParams } from '../types/common';

/**
 * Service para Transferências Bancárias
 */
class TransferService {
    private readonly API_BASE_URL = 'http://localhost:8081/api/transfers';

    /**
     * Obtém token de autenticação
     */
    private getAuthToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    /**
     * Cria headers para requisições
     */
    private createHeaders(): HeadersInit {
        const token = this.getAuthToken();
        const companyId = sessionStorage.getItem('selectedCompanyId');

        // Obter tenantId do usuário logado
        const userStr = localStorage.getItem('auth_user');
        const user = userStr ? JSON.parse(userStr) : null;
        const tenantId = user?.tenantId;

        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...(tenantId && { 'X-Tenant-ID': tenantId }),
            ...(companyId && { 'X-Company-ID': companyId })
        };
    }

    /**
     * Lista todas as transferências
     */
    async findAll(pagination?: PaginationParams): Promise<PageResponse<Transfer>> {
        const params = new URLSearchParams();
        if (pagination) {
            params.append('page', pagination.page.toString());
            params.append('size', pagination.size.toString());
            if (pagination.sort) {
                params.append('sort', pagination.sort);
            }
        }

        const response = await fetch(`${this.API_BASE_URL}?${params}`, {
            headers: this.createHeaders(),
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar transferências');
        }

        return response.json();
    }

    /**
     * Busca transferência por ID
     */
    async findById(id: number): Promise<Transfer> {
        const response = await fetch(`${this.API_BASE_URL}/${id}`, {
            headers: this.createHeaders(),
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar transferência');
        }

        return response.json();
    }

    /**
     * Cria uma nova transferência
     */
    async create(dto: CreateTransferDTO): Promise<Transfer> {
        const response = await fetch(this.API_BASE_URL, {
            method: 'POST',
            headers: this.createHeaders(),
            body: JSON.stringify(dto),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Erro ao criar transferência');
        }

        return response.json();
    }

    /**
     * Cancela uma transferência
     */
    async cancel(id: number): Promise<void> {
        const response = await fetch(`${this.API_BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: this.createHeaders(),
        });

        if (!response.ok) {
            throw new Error('Erro ao cancelar transferência');
        }
    }
}

export const transferService = new TransferService();
