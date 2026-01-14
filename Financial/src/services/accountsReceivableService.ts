// Service para Contas a Receber

import api from './api';
import type { Page, PaginationParams } from '../types/common';
import type {
  AccountsReceivableDTO,
  CreateAccountsReceivableDTO,
  UpdateAccountsReceivableDTO,
  ProcessReceiptDTO,
  AccountsReceivableFilters
} from '../types/accountsReceivable';
import type { ReceivableStatus } from '../types/enums';

class AccountsReceivableService {
  private readonly basePath = '/accounts-receivable';

  async findAll(params: PaginationParams & AccountsReceivableFilters = {}): Promise<Page<AccountsReceivableDTO>> {
    const { page = 0, size = 20, sortBy = 'dueDate', sortDir = 'asc', ...filters } = params;

    const queryParams = new URLSearchParams({
      page: String(page),
      size: String(size),
      sortBy,
      sortDir,
    });

    if (filters.receiptStatus) queryParams.append('status', filters.receiptStatus);
    if (filters.priorityLevel) queryParams.append('priority', filters.priorityLevel);
    if (filters.searchText) queryParams.append('text', filters.searchText);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);

    const response = await api.get<Page<AccountsReceivableDTO>>(`${this.basePath}/page?${queryParams}`);
    return response.data;
  }

  async findById(id: string): Promise<AccountsReceivableDTO> {
    const response = await api.get<AccountsReceivableDTO>(`${this.basePath}/${id}`);
    return response.data;
  }

  async findByStatus(status: ReceivableStatus, page = 0, size = 20): Promise<Page<AccountsReceivableDTO>> {
    const response = await api.get<Page<AccountsReceivableDTO>>(
      `${this.basePath}/status/${status}?page=${page}&size=${size}`
    );
    return response.data;
  }

  async findOverdue(page = 0, size = 20): Promise<Page<AccountsReceivableDTO>> {
    const response = await api.get<Page<AccountsReceivableDTO>>(
      `${this.basePath}/overdue?page=${page}&size=${size}`
    );
    return response.data;
  }

  async findDueToday(page = 0, size = 20): Promise<Page<AccountsReceivableDTO>> {
    const response = await api.get<Page<AccountsReceivableDTO>>(
      `${this.basePath}/due-today?page=${page}&size=${size}`
    );
    return response.data;
  }

  async findDueInNextDays(days: number, page = 0, size = 20): Promise<Page<AccountsReceivableDTO>> {
    const response = await api.get<Page<AccountsReceivableDTO>>(
      `${this.basePath}/due-in-days/${days}?page=${page}&size=${size}`
    );
    return response.data;
  }

  async findPending(page = 0, size = 20): Promise<Page<AccountsReceivableDTO>> {
    const response = await api.get<Page<AccountsReceivableDTO>>(
      `${this.basePath}/pending?page=${page}&size=${size}`
    );
    return response.data;
  }

  async search(text: string, page = 0, size = 20): Promise<Page<AccountsReceivableDTO>> {
    const response = await api.get<Page<AccountsReceivableDTO>>(
      `${this.basePath}/search?text=${encodeURIComponent(text)}&page=${page}&size=${size}`
    );
    return response.data;
  }

  async create(data: CreateAccountsReceivableDTO): Promise<AccountsReceivableDTO> {
    console.log('🔍 AccountsReceivableService.create() - Dados recebidos:', data);

    // Obter companyId como UUID
    const companyId = this.getCompanyId();
    if (!companyId) {
      throw new Error('Company ID não encontrado. Faça login novamente.');
    }

    // Mapear dados do frontend para o formato esperado pelo backend
    const backendData = {
      // Campos básicos
      companyId: companyId, // UUID string
      receivableCode: data.receivableCode,
      receivableDescription: data.receivableDescription,
      documentNumber: data.documentNumber,
      invoiceNumber: data.invoiceNumber,
      contractNumber: data.contractNumber,

      // Cliente
      customerId: data.customerId,
      customerName: data.customerName,
      customerDocument: data.customerDocument,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,

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
      receiptStatus: data.receiptStatus || 'PENDING',
      receiptType: data.receiptType || 'SINGLE',
      priorityLevel: data.priorityLevel || 'MEDIUM',
      isRecurring: data.isRecurring || false,
      installmentNumber: data.installmentNumber,
      totalInstallments: data.totalInstallments,

      // Categorização
      categoryId: data.categoryId,
      categoryName: data.categoryName || data.category,
      category: data.categoryName || data.category, // Adicionando ambos para segurança
      costCenterId: data.costCenterId,
      costCenterName: data.costCenterName || data.costCenter,
      costCenter: data.costCenterName || data.costCenter, // Adicionando ambos para segurança
      project: data.project,

      // Observações
      notes: data.notes,
      tags: data.tags,

      // Controle
      isActive: true
    };

    console.log('🔍 Dados mapeados para o backend:', backendData);

    const response = await api.post<AccountsReceivableDTO>(this.basePath, backendData);
    return response.data;
  }

  private getCompanyId(): string {
    const selectedCompanyId = sessionStorage.getItem('selectedCompanyId');

    if (!selectedCompanyId) {
      throw new Error('❌ ERRO: selectedCompanyId não está configurado no sessionStorage. O usuário deve selecionar uma empresa antes de criar contas a receber.');
    }

    console.log('🔍 CompanyId final:', selectedCompanyId);
    return selectedCompanyId;
  }

  async update(id: string, data: UpdateAccountsReceivableDTO): Promise<AccountsReceivableDTO> {
    console.log('🔍 AccountsReceivableService.update() - Dados recebidos:', data);

    const companyId = this.getCompanyId();

    const backendData = {
      id: id,
      companyId: companyId,
      receivableCode: data.receivableCode,
      receivableDescription: data.receivableDescription,
      documentNumber: data.documentNumber,
      invoiceNumber: data.invoiceNumber,
      contractNumber: data.contractNumber,
      saleOrderNumber: data.saleOrderNumber,
      customerId: data.customerId,
      customerName: data.customerName,
      customerDocument: data.customerDocument,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      originalAmount: data.originalAmount,
      discountAmount: data.discountAmount || 0,
      interestAmount: data.interestAmount || 0,
      fineAmount: data.fineAmount || 0,
      taxAmount: data.taxAmount || 0,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      competenceDate: data.competenceDate,
      receiptStatus: data.receiptStatus,
      receiptType: data.receiptType,
      priorityLevel: data.priorityLevel,
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
      tags: data.tags,
      isActive: true
    };

    const response = await api.put<AccountsReceivableDTO>(`${this.basePath}/${id}`, backendData);
    return response.data;
  }

  async updateStatus(id: string, status: ReceivableStatus): Promise<AccountsReceivableDTO> {
    const response = await api.patch<AccountsReceivableDTO>(`${this.basePath}/${id}/status`, { status });
    return response.data;
  }

  async processReceipt(id: string, receipt: ProcessReceiptDTO): Promise<AccountsReceivableDTO> {
    const response = await api.post<AccountsReceivableDTO>(`${this.basePath}/${id}/receipt`, receipt);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  async existsByCode(code: string): Promise<boolean> {
    const response = await api.get<boolean>(`${this.basePath}/exists/code/${code}`);
    return response.data;
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

export const accountsReceivableService = new AccountsReceivableService();
