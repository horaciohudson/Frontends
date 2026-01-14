// Service para Contas a Pagar

import api from './api';
import type { Page, PaginationParams } from '../types/common';
import type {
  AccountsPayableDTO,
  CreateAccountsPayableDTO,
  UpdateAccountsPayableDTO,
  ProcessPaymentDTO,
  AccountsPayableFilters
} from '../types/accountsPayable';
import type { PaymentStatus } from '../types/enums';

class AccountsPayableService {
  private readonly basePath = '/accounts-payable';

  async findAll(params: PaginationParams & AccountsPayableFilters = {}): Promise<Page<AccountsPayableDTO>> {
    const { page = 0, size = 20, sortBy, sortDir, ...filters } = params;

    const queryParams = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    // Só adiciona ordenação se especificada
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (sortDir) queryParams.append('sortDir', sortDir);

    // Adiciona filtros
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.searchText) queryParams.append('text', filters.searchText);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);

    // Adiciona companyId
    const companyId = this.getCompanyId();
    if (companyId) {
      queryParams.append('companyId', companyId);
    }

    const response = await api.get<Page<AccountsPayableDTO>>(`${this.basePath}/page?${queryParams}`);
    return response.data;
  }

  async findById(id: number): Promise<AccountsPayableDTO> {
    const response = await api.get<AccountsPayableDTO>(`${this.basePath}/${id}`);
    return response.data;
  }

  async findByCode(code: string): Promise<AccountsPayableDTO> {
    const response = await api.get<AccountsPayableDTO>(`${this.basePath}/code/${code}`);
    return response.data;
  }

  async findByStatus(status: PaymentStatus, page = 0, size = 20): Promise<Page<AccountsPayableDTO>> {
    const response = await api.get<Page<AccountsPayableDTO>>(
      `${this.basePath}/status/${status}?page=${page}&size=${size}`
    );
    return response.data;
  }

  async findOverdue(page = 0, size = 20): Promise<AccountsPayableDTO[]> {
    const companyId = this.getCompanyId();
    const response = await api.get<AccountsPayableDTO[]>(
      `${this.basePath}/overdue?companyId=${companyId}&page=${page}&size=${size}`
    );
    return response.data;
  }

  async findDueToday(page = 0, size = 20): Promise<Page<AccountsPayableDTO>> {
    const response = await api.get<Page<AccountsPayableDTO>>(
      `${this.basePath}/due-today?page=${page}&size=${size}`
    );
    return response.data;
  }

  async findDueInNextDays(days: number, page = 0, size = 20): Promise<Page<AccountsPayableDTO>> {
    const response = await api.get<Page<AccountsPayableDTO>>(
      `${this.basePath}/due-next-days/${days}?page=${page}&size=${size}`
    );
    return response.data;
  }

  async findPending(page = 0, size = 20): Promise<Page<AccountsPayableDTO>> {
    const response = await api.get<Page<AccountsPayableDTO>>(
      `${this.basePath}/pending?page=${page}&size=${size}`
    );
    return response.data;
  }

  async search(text: string, page = 0, size = 20): Promise<Page<AccountsPayableDTO>> {
    const response = await api.get<Page<AccountsPayableDTO>>(
      `${this.basePath}/search?text=${encodeURIComponent(text)}&page=${page}&size=${size}`
    );
    return response.data;
  }

  async create(data: CreateAccountsPayableDTO): Promise<AccountsPayableDTO> {
    console.log('🔍 AccountsPayableService.create() - Dados recebidos:', data);

    // Obter companyId como UUID
    const companyId = this.getCompanyId();
    if (!companyId) {
      throw new Error('Company ID não encontrado. Faça login novamente.');
    }

    // Mapear dados do frontend para o formato esperado pelo backend
    const backendData = {
      // Campos básicos
      companyId: companyId, // UUID string
      payableCode: data.code,
      payableDescription: data.description,
      documentNumber: data.documentNumber,
      invoiceNumber: data.invoiceNumber,
      purchaseOrder: data.purchaseOrderNumber,

      // Fornecedor
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      supplierDocument: data.supplierDocument,
      supplierEmail: data.supplierEmail,
      supplierPhone: data.supplierPhone,

      // Valores financeiros
      originalAmount: data.originalAmount,
      discountAmount: data.discountAmount || 0,
      interestAmount: data.interestAmount || 0,
      fineAmount: data.fineAmount || 0,
      taxAmount: data.taxAmount || 0,

      // Datas
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      competenceDate: data.competenceDate,

      // Status
      paymentStatus: data.paymentStatus || 'PENDING',
      paymentType: data.paymentType || 'SINGLE',
      isRecurring: data.isRecurring || false,
      installmentNumber: data.installmentNumber,
      totalInstallments: data.totalInstallments,

      // Categorização
      categoryId: data.categoryId,
      categoryName: data.categoryName || data.category,
      costCenterId: data.costCenterId,
      costCenterName: data.costCenterName || data.costCenter,
      projectId: null,
      projectName: data.project,

      // Observações
      notes: data.notes,
      tags: data.tags?.join(','),

      // Controle
      isActive: true
    };

    console.log('🔍 Dados mapeados para o backend:', backendData);

    const response = await api.post<AccountsPayableDTO>(this.basePath, backendData);
    return response.data;
  }

  private getCompanyId(): string {
    const selectedCompanyId = sessionStorage.getItem('selectedCompanyId');

    if (!selectedCompanyId) {
      throw new Error('❌ ERRO: selectedCompanyId não está configurado no sessionStorage. O usuário deve selecionar uma empresa antes de criar contas a pagar.');
    }

    console.log('🔍 CompanyId final:', selectedCompanyId);
    return selectedCompanyId;
  }

  async update(id: number, data: UpdateAccountsPayableDTO): Promise<AccountsPayableDTO> {
    console.log('🔍 AccountsPayableService.update() - Dados recebidos:', data);

    // Obter companyId (caso precise, embora update geralmente use o do banco)
    const companyId = this.getCompanyId();

    const backendData = {
      id: id,
      companyId: companyId,
      payableCode: data.code,
      payableDescription: data.description,
      documentNumber: data.documentNumber,
      invoiceNumber: data.invoiceNumber,
      purchaseOrder: data.purchaseOrderNumber,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      supplierDocument: data.supplierDocument,
      supplierEmail: data.supplierEmail,
      supplierPhone: data.supplierPhone,
      originalAmount: data.originalAmount,
      discountAmount: data.discountAmount || 0,
      interestAmount: data.interestAmount || 0,
      fineAmount: data.fineAmount || 0,
      taxAmount: data.taxAmount || 0,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      competenceDate: data.competenceDate,
      paymentStatus: data.paymentStatus,
      paymentType: data.paymentType,
      isRecurring: data.isRecurring,
      installmentNumber: data.installmentNumber,
      totalInstallments: data.totalInstallments,
      categoryId: data.categoryId,
      categoryName: data.categoryName || data.category,
      costCenterId: data.costCenterId,
      costCenterName: data.costCenterName || data.costCenter,
      projectId: null,
      projectName: data.project,
      notes: data.notes,
      tags: data.tags?.join(','),
      isActive: true
    };

    const response = await api.put<AccountsPayableDTO>(`${this.basePath}/${id}`, backendData);
    return response.data;
  }

  async updateStatus(id: number, status: PaymentStatus): Promise<AccountsPayableDTO> {
    const response = await api.patch<AccountsPayableDTO>(`${this.basePath}/${id}/status`, { status });
    return response.data;
  }

  async processPayment(id: number, payment: ProcessPaymentDTO): Promise<AccountsPayableDTO> {
    const response = await api.post<AccountsPayableDTO>(`${this.basePath}/${id}/payment`, payment);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  async existsByCode(code: string): Promise<boolean> {
    const response = await api.get<{ exists: boolean }>(`${this.basePath}/exists/code/${code}`);
    return response.data.exists;
  }

  async getStatsByStatus(): Promise<Array<{ status: string; count: number }>> {
    const response = await api.get<Array<[string, number]>>(`${this.basePath}/stats/count-by-status`);
    return response.data.map(([status, count]) => ({ status, count }));
  }

  async getSumByStatus(): Promise<Array<{ status: string; count: number; total: number }>> {
    const response = await api.get<Array<[string, number, number]>>(`${this.basePath}/stats/sum-by-status`);
    return response.data.map(([status, count, total]) => ({ status, count, total }));
  }
}

export const accountsPayableService = new AccountsPayableService();
