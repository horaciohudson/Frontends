// Tipos para Contas a Receber

import type { ReceivableStatus, ReceivableType, Priority } from './enums';
import type { AuditInfo, BaseFilters } from './common';

export interface AccountsReceivableDTO extends AuditInfo {
  id: string;
  tenantId: string;

  // Identificação
  receivableCode: string;
  receivableDescription: string;
  documentNumber?: string;
  invoiceNumber?: string;
  contractNumber?: string;
  saleOrderNumber?: string;

  // Cliente
  customerId: string;
  customerName: string;
  customerDocument?: string;
  customerEmail?: string;
  customerPhone?: string;

  // Valores financeiros
  originalAmount: number;
  currentAmount: number;
  receivedAmount: number;
  remainingAmount: number;
  discountAmount: number;
  interestAmount: number;
  fineAmount: number;
  taxAmount: number;

  // Datas
  issueDate: string;
  dueDate: string;
  receiptDate?: string;
  competenceDate: string;
  saleDate?: string;
  approvalDate?: string;

  // Status e controle
  receiptStatus: ReceivableStatus;
  receiptType: ReceivableType;
  priorityLevel: Priority;
  isRecurring: boolean;
  installmentNumber?: number;
  totalInstallments?: number;

  // Aprovação
  approvedBy?: string;
  approvalNotes?: string;

  // Recebimento
  bankAccount?: string;
  receiptMethod?: string;
  receiptReference?: string;
  receiptNotes?: string;
  receiptConfirmation?: string;

  // Categorização
  category?: string;
  categoryId?: number;
  categoryName?: string;
  costCenter?: string;
  costCenterId?: number;
  costCenterName?: string;
  project?: string;

  // Observações
  notes?: string;
  attachments?: string;
  tags?: string;

  isActive: boolean;
  companyId?: string;
}

export interface CreateAccountsReceivableDTO {
  receivableCode?: string;
  receivableDescription: string;
  documentNumber?: string;
  invoiceNumber?: string;
  contractNumber?: string;
  saleOrderNumber?: string;
  customerId: string;
  customerName: string;
  customerDocument?: string;
  customerEmail?: string;
  customerPhone?: string;
  originalAmount: number;
  discountAmount?: number;
  interestAmount?: number;
  fineAmount?: number;
  taxAmount?: number;
  issueDate: string;
  dueDate: string;
  competenceDate: string;
  receiptStatus?: ReceivableStatus;
  receiptType?: ReceivableType;
  priorityLevel?: Priority;
  isRecurring?: boolean;
  installmentNumber?: number;
  totalInstallments?: number;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  costCenter?: string;
  costCenterId?: string;
  costCenterName?: string;
  project?: string;
  notes?: string;
  tags?: string;
  companyId?: string;
}

export interface UpdateAccountsReceivableDTO extends CreateAccountsReceivableDTO {
  id: string;
}

export interface ProcessReceiptDTO {
  receiptAmount: number;
  receiptDate: string;
  bankAccountId: number;
  receiptMethod: string;
  receiptNotes?: string;
}

export interface AccountsReceivableFilters extends BaseFilters {
  receiptStatus?: ReceivableStatus;
  receiptType?: ReceivableType;
  priorityLevel?: Priority;
  customerId?: string;
  costCenter?: string;
  project?: string;
}

export interface AccountsReceivableListItem {
  id: string;
  receivableCode: string;
  receivableDescription: string;
  customerName: string;
  originalAmount: number;
  remainingAmount: number;
  dueDate: string;
  receiptStatus: ReceivableStatus;
  priorityLevel: Priority;
}

// Estatísticas
export interface AccountsReceivableStats {
  totalPending: number;
  totalOverdue: number;
  totalReceived: number;
  amountPending: number;
  amountOverdue: number;
  amountReceived: number;
}
