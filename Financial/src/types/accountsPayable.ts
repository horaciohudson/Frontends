// Tipos para Contas a Pagar

import type { PaymentStatus, PaymentType } from './enums';
import type { AuditInfo, BaseFilters } from './common';

export interface AccountsPayableDTO extends AuditInfo {
  id: number;
  tenantId: string;

  // Identificação
  // Identificação
  payableCode: string;
  payableDescription: string;
  documentNumber?: string;
  invoiceNumber?: string;
  purchaseOrderNumber?: string;

  // Fornecedor
  supplierId: string; // UUID no backend
  supplierName: string;
  supplierDocument?: string;
  supplierEmail?: string;
  supplierPhone?: string;

  // Valores financeiros
  originalAmount: number;
  currentAmount: number;
  paidAmount: number;
  remainingAmount: number;
  discountAmount: number;
  interestAmount: number;
  fineAmount: number;
  taxAmount: number;

  // Datas
  issueDate: string;
  dueDate: string;
  paymentDate?: string;
  competenceDate: string;
  receiptDate?: string;
  approvalDate?: string;

  // Status e controle
  paymentStatus: PaymentStatus;
  paymentType: PaymentType;
  isRecurring: boolean;
  installmentNumber?: number;
  totalInstallments?: number;

  // Aprovação
  approvedBy?: string;
  approvalNotes?: string;

  // Pagamento
  bankAccountId?: number;
  bankAccountName?: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentNotes?: string;
  paymentConfirmation?: string;

  // Categorização
  category?: string;
  categoryId?: number; // Backend ID
  categoryName?: string;
  costCenter?: string;
  costCenterId?: number; // Backend ID
  costCenterName?: string;
  project?: string;

  // Observações
  notes?: string;
  attachments?: string[];
  tags?: string[];

  isActive: boolean;
}

export interface CreateAccountsPayableDTO {
  companyId?: string; // Adicionado para o backend
  code?: string;
  description: string;
  documentNumber?: string;
  invoiceNumber?: string;
  purchaseOrderNumber?: string;
  supplierId?: string; // UUID no frontend, será mapeado para Long no backend
  supplierName: string;
  supplierDocument?: string;
  supplierEmail?: string;
  supplierPhone?: string;
  originalAmount: number;
  discountAmount?: number;
  interestAmount?: number;
  fineAmount?: number;
  taxAmount?: number;
  issueDate: string;
  dueDate: string;
  competenceDate: string;
  paymentStatus?: PaymentStatus;
  paymentType?: PaymentType;
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
  tags?: string[];
}

export interface UpdateAccountsPayableDTO extends CreateAccountsPayableDTO {
  id: number;
}

export interface ProcessPaymentDTO {
  paymentAmount: number;
  paymentDate: string;
  bankAccountId: number;
  paymentMethod: string;
  paymentNotes?: string;
}

export interface AccountsPayableFilters extends BaseFilters {
  status?: PaymentStatus;
  type?: PaymentType;
  supplierId?: string; // UUID no backend
  costCenter?: string;
  project?: string;
}

export interface AccountsPayableListItem {
  id: number;
  payableCode: string;
  payableDescription: string;
  supplierName: string;
  originalAmount: number;
  remainingAmount: number;
  dueDate: string;
  paymentStatus: PaymentStatus;
}

// Estatísticas
export interface AccountsPayableStats {
  totalPending: number;
  totalOverdue: number;
  totalPaid: number;
  amountPending: number;
  amountOverdue: number;
  amountPaid: number;
}
