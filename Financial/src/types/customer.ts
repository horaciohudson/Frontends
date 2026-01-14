export interface CustomerDTO {
  id: string;
  tenantId: string;
  companyId: string;
  externalCustomerId?: string;
  customerCode: string;
  customerName: string;
  customerType?: string;
  cpfCnpj?: string;
  email?: string;
  phone?: string;
  creditLimit?: number;
  paymentTermDays?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CreateCustomerDTO {
  tenantId?: string; // Será preenchido automaticamente pelo header
  companyId: string;
  customerCode: string;
  customerName: string;
  customerType?: string;
  cpfCnpj?: string;
  email?: string;
  phone?: string;
  creditLimit?: number;
  paymentTermDays?: number;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateCustomerDTO {
  id: string;
  tenantId?: string; // Será preenchido automaticamente pelo header
  companyId: string;
  customerCode: string;
  customerName: string;
  customerType?: string;
  cpfCnpj?: string;
  email?: string;
  phone?: string;
  creditLimit?: number;
  paymentTermDays?: number;
  notes?: string;
  isActive?: boolean;
}

export interface CustomerFilters {
  companyId?: string;
  searchText?: string;
  isActive?: boolean;
}

// Tipos de cliente
export const CUSTOMER_TYPES = [
  { value: 'INDIVIDUAL', label: 'Pessoa Física' },
  { value: 'COMPANY', label: 'Pessoa Jurídica' }
] as const;

export const getCustomerTypeLabel = (type?: string): string => {
  const customerType = CUSTOMER_TYPES.find(t => t.value === type);
  return customerType ? customerType.label : type || '';
};



// Utilitários para formatação
export const formatCpfCnpj = (value?: string): string => {
  if (!value) return '';
  
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 11) {
    // CPF: 000.000.000-00
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (numbers.length === 14) {
    // CNPJ: 00.000.000/0000-00
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return value;
};



export const formatPhone = (value?: string): string => {
  if (!value) return '';
  
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 10) {
    // Telefone fixo: (00) 0000-0000
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (numbers.length === 11) {
    // Celular: (00) 00000-0000
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  return value;
};