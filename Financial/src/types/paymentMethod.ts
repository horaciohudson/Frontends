// Tipos para Payment Methods (Métodos de Pagamento)

import type { AuditInfo } from './common';

export interface PaymentMethodDTO extends AuditInfo {
  id: string;
  tenantId: string;
  companyId: string;

  // Dados principais
  methodCode: string;
  methodName: string;
  methodType?: string;
  description?: string;

  // Configurações de parcelas
  defaultInstallments: number;
  maxInstallments: number;

  // Configurações de taxa
  hasFee: boolean;
  feePercentage: number;

  // Controle
  isActive: boolean;
}

export interface CreatePaymentMethodDTO {
  companyId: string;
  methodCode: string;
  methodName: string;
  methodType?: string;
  description?: string;
  defaultInstallments?: number;
  maxInstallments?: number;
  hasFee?: boolean;
  feePercentage?: number;
  isActive?: boolean;
}

export interface UpdatePaymentMethodDTO extends CreatePaymentMethodDTO {
  id: string;
}

export interface PaymentMethodFilters {
  searchText?: string;
  isActive?: boolean;
  companyId?: string;
  methodType?: string;
}

export interface PaymentMethodSelectOption {
  value: string;
  label: string;
  methodType?: string;
  disabled?: boolean;
}

// Tipos de métodos de pagamento
export const PAYMENT_METHOD_TYPES = [
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
  { value: 'DEBIT_CARD', label: 'Cartão de Débito' },
  { value: 'BANK_TRANSFER', label: 'Transferência Bancária' },
  { value: 'PIX', label: 'PIX' },
  { value: 'BOLETO', label: 'Boleto Bancário' },
  { value: 'CHECK', label: 'Cheque' },
  { value: 'PROMISSORY_NOTE', label: 'Nota Promissória' },
  { value: 'OTHER', label: 'Outros' }
];

// Função para obter o label do tipo
export const getPaymentMethodTypeLabel = (type?: string): string => {
  if (!type) return '';
  const found = PAYMENT_METHOD_TYPES.find(t => t.value === type);
  return found ? found.label : type;
};