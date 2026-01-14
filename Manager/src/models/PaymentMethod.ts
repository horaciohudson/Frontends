// ✅ models/PaymentMethod.ts

// Enums alinhados com o backend
export enum PaymentMethodKind {
  CASH = 'CASH',              // Dinheiro
  DEBIT_CARD = 'DEBIT_CARD',  // Cartão de Débito
  CREDIT_CARD = 'CREDIT_CARD', // Cartão de Crédito
  PIX = 'PIX',                // PIX (Brasil)
  BOLETO = 'BOLETO',          // Boleto Bancário
  STORE_FINANCING = 'STORE_FINANCING', // Crediário da Loja
  VOUCHER = 'VOUCHER',        // Vale/Voucher
  BANK_TRANSFER = 'BANK_TRANSFER', // Transferência Bancária
  CHECK = 'CHECK',            // Cheque
  OTHER = 'OTHER'             // Outros
}

export enum InterestPayer {
  MERCHANT = 'MERCHANT',      // Lojista paga os juros
  CUSTOMER = 'CUSTOMER'       // Cliente paga os juros
}

export enum PricingMode {
  SIMPLE = 'SIMPLE',          // Juros simples
  COMPOUND = 'COMPOUND'       // Juros compostos (Price)
}

export enum PeriodUnit {
  DAILY = 'DAILY',            // Diário
  MONTHLY = 'MONTHLY'         // Mensal
}

export enum RoundingStrategy {
  BANKERS = 'BANKERS',        // Arredondamento bancário
  UP = 'UP',                  // Sempre para cima
  DOWN = 'DOWN',              // Sempre para baixo
  NEAREST = 'NEAREST'         // Mais próximo
}

export interface PaymentMethod {
  // ===== CAMPOS PRINCIPAIS =====
  id?: number;
  code: string;
  name: string;
  kind: PaymentMethodKind;
  
  // ===== CONFIGURAÇÃO DE PARCELAS =====
  maxInstallmentsNoInterest: number;
  maxInstallmentsWithInterest: number;
  minValuePerInstallment: number;
  
  // ===== CONFIGURAÇÃO DE JUROS =====
  interestPayer: InterestPayer;
  pricingMode: PricingMode;
  period: PeriodUnit;
  roundingStrategy: RoundingStrategy;
  
  // ===== CONFIGURAÇÕES PDV =====
  posEnabled: boolean;
  requiresAuthorization: boolean;
  maxInstallments: number;
  posDisplayOrder: number;
  
  // ===== CAMPOS LEGADOS (COMPATIBILIDADE) =====
  rounding?: string;
  roundingEnabled: boolean;
  rateR: number;
  rateM: number;
  periodic: boolean;
  firstInstallment: boolean;
  withTef: boolean;
  
  // ===== CONTROLE =====
  active: boolean;
  createdAt?: string;
  updatedAt?: string | null;
  
  // ===== CAMPOS CALCULADOS (READONLY) =====
  supportsInstallments?: boolean;
  supportsInterest?: boolean;
  maxTotalInstallments?: number;
  isCashPayment?: boolean;
  isCardPayment?: boolean;
  isPixPayment?: boolean;
  isEnabledForPos?: boolean;
}

// Tipo para criação (sem id e campos calculados)
export type PaymentMethodCreate = Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt' | 'supportsInstallments' | 'supportsInterest' | 'maxTotalInstallments' | 'isCashPayment' | 'isCardPayment' | 'isPixPayment' | 'isEnabledForPos'>;

// Tipo para atualização (todos os campos opcionais exceto id)
export type PaymentMethodUpdate = Partial<Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt' | 'supportsInstallments' | 'supportsInterest' | 'maxTotalInstallments' | 'isCashPayment' | 'isCardPayment' | 'isPixPayment' | 'isEnabledForPos'>> & { id: number };
