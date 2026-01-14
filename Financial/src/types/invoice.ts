// Tipos para Notas Fiscais (Invoices)

import type { AuditInfo } from './common';

export type InvoiceType = 'INPUT' | 'OUTPUT';
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'CANCELLED';

export const INVOICE_TYPE_LABELS: Record<InvoiceType, string> = {
  INPUT: 'Entrada',
  OUTPUT: 'Saída',
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: 'Rascunho',
  ISSUED: 'Emitida',
  CANCELLED: 'Cancelada',
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  DRAFT: '#f59e0b',
  ISSUED: '#22c55e',
  CANCELLED: '#ef4444',
};

export interface InvoiceItemDTO {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxId?: string;
  taxName?: string;
  taxRate?: number;
  taxAmount?: number;
}

export interface InvoiceDTO extends AuditInfo {
  id: string;
  tenantId: string;

  // Dados principais
  invoiceNumber: string;
  series: string;
  invoiceType: InvoiceType;
  issueDate: string;
  dueDate?: string;

  // Partes
  customerId?: string;
  customerName?: string;
  supplierId?: string;
  supplierName?: string;

  // Valores
  subtotal: number;
  taxAmount: number;
  totalAmount: number;

  // Status
  status: InvoiceStatus;

  // Itens
  items?: InvoiceItemDTO[];

  // Detalhes
  notes?: string;
  accessKey?: string;
}

export interface CreateInvoiceDTO {
  invoiceNumber: string;
  series: string;
  invoiceType: InvoiceType;
  issueDate: string;
  dueDate?: string;
  customerId?: string;
  supplierId?: string;
  items: InvoiceItemDTO[];
  notes?: string;
}

export interface UpdateInvoiceDTO extends CreateInvoiceDTO {
  id: string;
}

export interface InvoiceFilters {
  searchText?: string;
  startDate?: string;
  endDate?: string;
  invoiceType?: InvoiceType;
  status?: InvoiceStatus;
  customerId?: string;
  supplierId?: string;
}
