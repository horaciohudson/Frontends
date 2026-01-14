/**
 * Types para Transferências Bancárias
 */

export interface Transfer {
  id: number;
  tenantId: string;
  companyId: string;
  sourceAccountId: number;
  sourceAccountName?: string;
  destinationAccountId: number;
  destinationAccountName?: string;
  amount: number;
  transferDate: string;
  description?: string;
  referenceNumber?: string;
  outflowId?: number;
  inflowId?: number;
  createdAt: string;
  createdBy?: string;
}

export interface CreateTransferDTO {
  sourceAccountId: number;
  destinationAccountId: number;
  amount: number;
  transferDate: string;
  description?: string;
  referenceNumber?: string;
}

export interface TransferFilters {
  sourceAccountId?: number;
  destinationAccountId?: number;
  startDate?: string;
  endDate?: string;
}
