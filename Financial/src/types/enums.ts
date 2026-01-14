// Enums compartilhados do Sistema Financeiro

// Status de Pagamento (Contas a Pagar)
export enum PaymentStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  IN_PROCESS = 'IN_PROCESS',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  FAILED = 'FAILED',
  DISPUTED = 'DISPUTED',
  ON_HOLD = 'ON_HOLD'
}

export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Pendente',
  [PaymentStatus.SCHEDULED]: 'Agendado',
  [PaymentStatus.IN_PROCESS]: 'Em Processamento',
  [PaymentStatus.PARTIAL]: 'Parcial',
  [PaymentStatus.PAID]: 'Pago',
  [PaymentStatus.OVERDUE]: 'Vencido',
  [PaymentStatus.CANCELLED]: 'Cancelado',
  [PaymentStatus.REJECTED]: 'Rejeitado',
  [PaymentStatus.FAILED]: 'Falhou',
  [PaymentStatus.DISPUTED]: 'Em Disputa',
  [PaymentStatus.ON_HOLD]: 'Em Espera'
};

export const PaymentStatusColors: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: '#f59e0b',
  [PaymentStatus.SCHEDULED]: '#3b82f6',
  [PaymentStatus.IN_PROCESS]: '#eab308',
  [PaymentStatus.PARTIAL]: '#84cc16',
  [PaymentStatus.PAID]: '#22c55e',
  [PaymentStatus.OVERDUE]: '#ef4444',
  [PaymentStatus.CANCELLED]: '#6b7280',
  [PaymentStatus.REJECTED]: '#dc2626',
  [PaymentStatus.FAILED]: '#b91c1c',
  [PaymentStatus.DISPUTED]: '#f97316',
  [PaymentStatus.ON_HOLD]: '#a855f7'
};

// Tipo de Pagamento
export enum PaymentType {
  SINGLE = 'SINGLE',
  INSTALLMENT = 'INSTALLMENT',
  RECURRING = 'RECURRING'
}

export const PaymentTypeLabels: Record<PaymentType, string> = {
  [PaymentType.SINGLE]: 'Único',
  [PaymentType.INSTALLMENT]: 'Parcelado',
  [PaymentType.RECURRING]: 'Recorrente'
};

// Status de Recebimento (Contas a Receber)
export enum ReceivableStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  IN_PROCESS = 'IN_PROCESS',
  RECEIVED = 'RECEIVED',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED',
  ON_HOLD = 'ON_HOLD',
  DISPUTED = 'DISPUTED',
  FAILED = 'FAILED'
}

export const ReceivableStatusLabels: Record<ReceivableStatus, string> = {
  [ReceivableStatus.PENDING]: 'Pendente',
  [ReceivableStatus.SCHEDULED]: 'Agendado',
  [ReceivableStatus.IN_PROCESS]: 'Em Processamento',
  [ReceivableStatus.RECEIVED]: 'Recebido',
  [ReceivableStatus.PARTIAL]: 'Parcial',
  [ReceivableStatus.OVERDUE]: 'Vencido',
  [ReceivableStatus.CANCELLED]: 'Cancelado',
  [ReceivableStatus.REJECTED]: 'Rejeitado',
  [ReceivableStatus.REFUNDED]: 'Reembolsado',
  [ReceivableStatus.ON_HOLD]: 'Em Espera',
  [ReceivableStatus.DISPUTED]: 'Em Disputa',
  [ReceivableStatus.FAILED]: 'Falhou'
};

export const ReceivableStatusColors: Record<ReceivableStatus, string> = {
  [ReceivableStatus.PENDING]: '#f59e0b',
  [ReceivableStatus.SCHEDULED]: '#3b82f6',
  [ReceivableStatus.IN_PROCESS]: '#eab308',
  [ReceivableStatus.RECEIVED]: '#22c55e',
  [ReceivableStatus.PARTIAL]: '#84cc16',
  [ReceivableStatus.OVERDUE]: '#ef4444',
  [ReceivableStatus.CANCELLED]: '#6b7280',
  [ReceivableStatus.REJECTED]: '#dc2626',
  [ReceivableStatus.REFUNDED]: '#8b5cf6',
  [ReceivableStatus.ON_HOLD]: '#a855f7',
  [ReceivableStatus.DISPUTED]: '#f97316',
  [ReceivableStatus.FAILED]: '#b91c1c'
};

// Tipo de Recebimento
export enum ReceivableType {
  SINGLE = 'SINGLE',
  INSTALLMENT = 'INSTALLMENT',
  RECURRING = 'RECURRING'
}

export const ReceivableTypeLabels: Record<ReceivableType, string> = {
  [ReceivableType.SINGLE]: 'Único',
  [ReceivableType.INSTALLMENT]: 'Parcelado',
  [ReceivableType.RECURRING]: 'Recorrente'
};

// Tipo de Fluxo de Caixa
export enum CashFlowType {
  INFLOW = 'INFLOW',
  OUTFLOW = 'OUTFLOW'
}

export const CashFlowTypeLabels: Record<CashFlowType, string> = {
  [CashFlowType.INFLOW]: 'Entrada',
  [CashFlowType.OUTFLOW]: 'Saída'
};

export const CashFlowTypeColors: Record<CashFlowType, string> = {
  [CashFlowType.INFLOW]: '#22c55e',
  [CashFlowType.OUTFLOW]: '#ef4444'
};

// Status de Fluxo de Caixa
export enum CashFlowStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export const CashFlowStatusLabels: Record<CashFlowStatus, string> = {
  [CashFlowStatus.PENDING]: 'Pendente',
  [CashFlowStatus.PARTIAL]: 'Parcial',
  [CashFlowStatus.PAID]: 'Pago',
  [CashFlowStatus.CANCELLED]: 'Cancelado'
};

export const CashFlowStatusColors: Record<CashFlowStatus, string> = {
  [CashFlowStatus.PENDING]: '#f59e0b',
  [CashFlowStatus.PARTIAL]: '#84cc16',
  [CashFlowStatus.PAID]: '#22c55e',
  [CashFlowStatus.CANCELLED]: '#6b7280'
};

// Prioridade
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export const PriorityLabels: Record<Priority, string> = {
  [Priority.LOW]: 'Baixa',
  [Priority.MEDIUM]: 'Média',
  [Priority.HIGH]: 'Alta',
  [Priority.URGENT]: 'Urgente'
};

export const PriorityColors: Record<Priority, string> = {
  [Priority.LOW]: '#6b7280',
  [Priority.MEDIUM]: '#3b82f6',
  [Priority.HIGH]: '#f59e0b',
  [Priority.URGENT]: '#ef4444'
};

// Método de Pagamento
export enum PaymentMethod {
  CASH = 'CASH',
  PIX = 'PIX',
  TRANSFER = 'TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BOLETO = 'BOLETO',
  CHECK = 'CHECK',
  DEPOSIT = 'DEPOSIT',
  OTHER = 'OTHER'
}

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Dinheiro',
  [PaymentMethod.PIX]: 'PIX',
  [PaymentMethod.TRANSFER]: 'Transferência',
  [PaymentMethod.CREDIT_CARD]: 'Cartão de Crédito',
  [PaymentMethod.DEBIT_CARD]: 'Cartão de Débito',
  [PaymentMethod.BOLETO]: 'Boleto',
  [PaymentMethod.CHECK]: 'Cheque',
  [PaymentMethod.DEPOSIT]: 'Depósito',
  [PaymentMethod.OTHER]: 'Outro'
};

// Tipo de Movimento de Caixa
export enum CashMovementType {
  INFLOW = 'INFLOW',
  OUTFLOW = 'OUTFLOW'
}

export const CashMovementTypeLabels: Record<CashMovementType, string> = {
  [CashMovementType.INFLOW]: 'Entrada',
  [CashMovementType.OUTFLOW]: 'Saída'
};

export const CashMovementTypeColors: Record<CashMovementType, string> = {
  [CashMovementType.INFLOW]: '#22c55e',
  [CashMovementType.OUTFLOW]: '#ef4444'
};

// Status de Movimento de Caixa
export enum CashMovementStatus {
  PENDING = 'PENDING',
  CLEARED = 'CLEARED',
  RECONCILED = 'RECONCILED',
  CANCELLED = 'CANCELLED'
}

export const CashMovementStatusLabels: Record<CashMovementStatus, string> = {
  [CashMovementStatus.PENDING]: 'Pendente',
  [CashMovementStatus.CLEARED]: 'Compensado',
  [CashMovementStatus.RECONCILED]: 'Conciliado',
  [CashMovementStatus.CANCELLED]: 'Cancelado'
};

export const CashMovementStatusColors: Record<CashMovementStatus, string> = {
  [CashMovementStatus.PENDING]: '#f59e0b',
  [CashMovementStatus.CLEARED]: '#3b82f6',
  [CashMovementStatus.RECONCILED]: '#22c55e',
  [CashMovementStatus.CANCELLED]: '#6b7280'
};
