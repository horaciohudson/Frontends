// Tipos para BankAccount baseados na estrutura do backend

export enum BankAccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS', 
  INVESTMENT = 'INVESTMENT',
  CREDIT = 'CREDIT',
  LOAN = 'LOAN',
  CASH = 'CASH',
  PETTY_CASH = 'PETTY_CASH',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
  FOREIGN_CURRENCY = 'FOREIGN_CURRENCY',
  ESCROW = 'ESCROW',
  TRANSIT = 'TRANSIT',
  OTHER = 'OTHER'
}

export enum BankAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CLOSED = 'CLOSED',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING'
}

export interface BankAccount {
  id?: number;
  tenantId?: number;
  accountCode: string;
  accountName: string;
  description?: string;
  accountType: BankAccountType;
  bankCode: string;
  bankName: string;
  agencyCode?: string;
  agencyName?: string;
  accountNumber: string;
  accountDigit?: string;
  initialBalance: number;
  currentBalance: number;
  creditLimit?: number;
  accountStatus: BankAccountStatus;
  openingDate?: string;
  closingDate?: string;
  accountManager?: string;
  managerPhone?: string;
  managerEmail?: string;
  currencyCode?: string;
  isMainAccount?: boolean;
  allowsOverdraft?: boolean;
  overdraftRate?: number;
  autoReconciliation?: boolean;
  reconciliationCode?: string;
  lastReconciliationDate?: string;
  notes?: string;
  tags?: string;
  attachmentUrl?: string;
  isActive?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface BankAccountFormData {
  accountCode: string;
  accountName: string;
  description?: string;
  accountType: BankAccountType;
  bankCode: string;
  bankName: string;
  agencyCode?: string;
  agencyName?: string;
  accountNumber: string;
  accountDigit?: string;
  initialBalance: number;
  creditLimit?: number;
  accountStatus: BankAccountStatus;
  openingDate?: string;
  accountManager?: string;
  managerPhone?: string;
  managerEmail?: string;
  currencyCode?: string;
  isMainAccount?: boolean;
  allowsOverdraft?: boolean;
  overdraftRate?: number;
  autoReconciliation?: boolean;
  reconciliationCode?: string;
  notes?: string;
  tags?: string;
}

export interface BankAccountListItem {
  id: number;
  accountCode: string;
  accountName: string;
  accountType: BankAccountType;
  bankName: string;
  accountNumber: string;
  currentBalance: number;
  accountStatus: BankAccountStatus;
}

export interface BankAccountFilters {
  accountType?: BankAccountType;
  accountStatus?: BankAccountStatus;
  bankName?: string;
  search?: string;
}

export interface BankAccountPageResponse {
  content: BankAccount[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Constantes para labels dos enums
export const BankAccountTypeLabels: Record<BankAccountType, string> = {
  [BankAccountType.CHECKING]: 'Conta Corrente',
  [BankAccountType.SAVINGS]: 'Conta Poupança',
  [BankAccountType.INVESTMENT]: 'Conta Investimento',
  [BankAccountType.CREDIT]: 'Conta de Crédito',
  [BankAccountType.LOAN]: 'Conta de Empréstimo',
  [BankAccountType.CASH]: 'Caixa',
  [BankAccountType.PETTY_CASH]: 'Caixa Pequeno',
  [BankAccountType.DIGITAL_WALLET]: 'Carteira Digital',
  [BankAccountType.FOREIGN_CURRENCY]: 'Moeda Estrangeira',
  [BankAccountType.ESCROW]: 'Conta Caução',
  [BankAccountType.TRANSIT]: 'Conta Trânsito',
  [BankAccountType.OTHER]: 'Outros'
};

export const BankAccountStatusLabels: Record<BankAccountStatus, string> = {
  [BankAccountStatus.ACTIVE]: 'Ativa',
  [BankAccountStatus.INACTIVE]: 'Inativa',
  [BankAccountStatus.CLOSED]: 'Fechada',
  [BankAccountStatus.SUSPENDED]: 'Suspensa',
  [BankAccountStatus.PENDING]: 'Pendente'
};