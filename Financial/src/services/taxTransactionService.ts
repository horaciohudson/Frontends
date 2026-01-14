import { authService } from './authService';

export interface TaxTransaction {
    id: number;
    tenantId: string;
    companyId: string;
    taxTypeId: number;
    taxTypeCode?: string;
    taxTypeName?: string;
    taxRate: number;
    taxAmount: number;
    baseAmount?: number;
    competenceDate: string;
    dueDate: string;
    paidAt?: string;
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    documentNumber?: string;
    paymentReference?: string;
    costCenterId?: number;
    costCenterName?: string;
    categoryId?: number;
    categoryName?: string;
    notes?: string;
    currency?: string;
    isPending?: boolean;
    isPaid?: boolean;
    isOverdue?: boolean;
}

export interface CreateTaxTransactionDTO {
    taxTypeId: number;
    taxRate: number;
    taxAmount: number;
    baseAmount?: number;
    competenceDate: string;
    dueDate: string;
    documentNumber?: string;
    costCenterId?: number;
    categoryId?: number;
    notes?: string;
    currency?: string;
}

class TaxTransactionService {
    private baseUrl = 'http://localhost:8081/api';

    private getTenantId(): string {
        const user = authService.getUser();
        return user?.tenantId?.toString() || '';
    }

    private getCompanyId(): string {
        return sessionStorage.getItem('selectedCompanyId') || '';
    }

    async getAll(status?: string, startDate?: string, endDate?: string): Promise<TaxTransaction[]> {
        try {
            const tenantId = this.getTenantId();
            const companyId = this.getCompanyId();

            let url = `${this.baseUrl}/taxes`;
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await authService.makeAuthenticatedRequest(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tenant-ID': tenantId,
                    'X-Company-ID': companyId,
                },
            });

            if (!response.ok) {
                throw new Error(`Erro ao buscar impostos: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar impostos:', error);
            throw error;
        }
    }

    async getPending(): Promise<TaxTransaction[]> {
        try {
            const tenantId = this.getTenantId();
            const companyId = this.getCompanyId();

            const response = await authService.makeAuthenticatedRequest(
                `${this.baseUrl}/taxes/pending`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Tenant-ID': tenantId,
                        'X-Company-ID': companyId,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Erro ao buscar impostos pendentes: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar impostos pendentes:', error);
            throw error;
        }
    }

    async getOverdue(): Promise<TaxTransaction[]> {
        try {
            const tenantId = this.getTenantId();
            const companyId = this.getCompanyId();

            const response = await authService.makeAuthenticatedRequest(
                `${this.baseUrl}/taxes/overdue`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Tenant-ID': tenantId,
                        'X-Company-ID': companyId,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Erro ao buscar impostos vencidos: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar impostos vencidos:', error);
            throw error;
        }
    }

    async getById(id: number): Promise<TaxTransaction> {
        try {
            const tenantId = this.getTenantId();
            const companyId = this.getCompanyId();

            const response = await authService.makeAuthenticatedRequest(
                `${this.baseUrl}/taxes/${id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Tenant-ID': tenantId,
                        'X-Company-ID': companyId,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Erro ao buscar imposto: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar imposto:', error);
            throw error;
        }
    }

    async create(data: CreateTaxTransactionDTO): Promise<TaxTransaction> {
        try {
            const tenantId = this.getTenantId();
            const companyId = this.getCompanyId();

            const response = await authService.makeAuthenticatedRequest(
                `${this.baseUrl}/taxes`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Tenant-ID': tenantId,
                        'X-Company-ID': companyId,
                    },
                    body: JSON.stringify(data),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erro ao criar imposto: ${response.status}`);
            }

            return await response.json();
        } catch (error: any) {
            console.error('Erro ao criar imposto:', error);
            throw error;
        }
    }

    async update(id: number, data: Partial<CreateTaxTransactionDTO>): Promise<TaxTransaction> {
        try {
            const tenantId = this.getTenantId();
            const companyId = this.getCompanyId();

            const response = await authService.makeAuthenticatedRequest(
                `${this.baseUrl}/taxes/${id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Tenant-ID': tenantId,
                        'X-Company-ID': companyId,
                    },
                    body: JSON.stringify(data),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erro ao atualizar imposto: ${response.status}`);
            }

            return await response.json();
        } catch (error: any) {
            console.error('Erro ao atualizar imposto:', error);
            throw error;
        }
    }

    async delete(id: number): Promise<void> {
        try {
            const tenantId = this.getTenantId();
            const companyId = this.getCompanyId();

            const response = await authService.makeAuthenticatedRequest(
                `${this.baseUrl}/taxes/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Tenant-ID': tenantId,
                        'X-Company-ID': companyId,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Erro ao excluir imposto: ${response.status}`);
            }
        } catch (error) {
            console.error('Erro ao excluir imposto:', error);
            throw error;
        }
    }

    async markAsPaid(id: number, paymentReference?: string): Promise<TaxTransaction> {
        try {
            const tenantId = this.getTenantId();
            const companyId = this.getCompanyId();

            let url = `${this.baseUrl}/taxes/${id}/pay`;
            if (paymentReference) {
                url += `?paymentReference=${encodeURIComponent(paymentReference)}`;
            }

            const response = await authService.makeAuthenticatedRequest(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tenant-ID': tenantId,
                    'X-Company-ID': companyId,
                },
            });

            if (!response.ok) {
                throw new Error(`Erro ao marcar imposto como pago: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao marcar imposto como pago:', error);
            throw error;
        }
    }

    async cancel(id: number): Promise<TaxTransaction> {
        try {
            const tenantId = this.getTenantId();
            const companyId = this.getCompanyId();

            const response = await authService.makeAuthenticatedRequest(
                `${this.baseUrl}/taxes/${id}/cancel`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Tenant-ID': tenantId,
                        'X-Company-ID': companyId,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Erro ao cancelar imposto: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao cancelar imposto:', error);
            throw error;
        }
    }
}

export const taxTransactionService = new TaxTransactionService();
