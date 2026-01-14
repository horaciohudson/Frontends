// Funções de validação para formulários do Sistema Financeiro

import type { ValidationResult } from '../types/common';
import type { CreateAccountsPayableDTO } from '../types/accountsPayable';
import type { CreateAccountsReceivableDTO } from '../types/accountsReceivable';
import type { CreateCashFlowDTO } from '../types/cashFlow';
import type { CreateFinancialCategoryDTO } from '../types/financialCategory';

/**
 * Valida se um campo obrigatório está preenchido
 */
export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (typeof value === 'number') {
    return !isNaN(value);
  }

  return true;
}

/**
 * Valida se um valor é maior que zero
 */
export function isPositive(value: number | null | undefined): boolean {
  return value !== null && value !== undefined && value > 0;
}

/**
 * Valida se um valor é maior ou igual a zero
 */
export function isNonNegative(value: number | null | undefined): boolean {
  return value !== null && value !== undefined && value >= 0;
}

/**
 * Valida formato de email
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) {
    return true; // Email é opcional
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida formato de CPF
 */
export function isValidCPF(cpf: string | null | undefined): boolean {
  if (!cpf) {
    return true; // CPF é opcional
  }

  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleaned)) {
    return false;
  }

  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;

  return true;
}

/**
 * Valida formato de CNPJ
 */
export function isValidCNPJ(cnpj: string | null | undefined): boolean {
  if (!cnpj) {
    return true; // CNPJ é opcional
  }

  const cleaned = cnpj.replace(/\D/g, '');

  if (cleaned.length !== 14) {
    return false;
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleaned)) {
    return false;
  }

  // Validação dos dígitos verificadores
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleaned.charAt(12))) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(cleaned.charAt(13))) return false;

  return true;
}

/**
 * Valida se a data de vencimento é posterior à data de emissão
 */
export function isDueDateAfterIssueDate(issueDate: string, dueDate: string): boolean {
  if (!issueDate || !dueDate) {
    return true;
  }

  return new Date(dueDate) >= new Date(issueDate);
}

/**
 * Valida dados de Conta a Pagar
 */
export function validateAccountsPayable(data: Partial<CreateAccountsPayableDTO>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isRequired(data.description)) {
    errors.description = 'Descrição é obrigatória';
  }

  if (!isRequired(data.supplierId)) {
    errors.supplierId = 'Fornecedor é obrigatório';
  }

  if (!isRequired(data.supplierName)) {
    errors.supplierName = 'Nome do fornecedor é obrigatório';
  }

  if (!isPositive(data.originalAmount)) {
    errors.originalAmount = 'Valor deve ser maior que zero';
  }

  if (!isRequired(data.issueDate)) {
    errors.issueDate = 'Data de emissão é obrigatória';
  }

  if (!isRequired(data.dueDate)) {
    errors.dueDate = 'Data de vencimento é obrigatória';
  }

  if (!isRequired(data.competenceDate)) {
    errors.competenceDate = 'Data de competência é obrigatória';
  }

  if (data.issueDate && data.dueDate && !isDueDateAfterIssueDate(data.issueDate, data.dueDate)) {
    errors.dueDate = 'Data de vencimento não pode ser anterior à emissão';
  }

  if (data.supplierEmail && !isValidEmail(data.supplierEmail)) {
    errors.supplierEmail = 'Email inválido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Valida dados de Conta a Receber
 */
export function validateAccountsReceivable(data: Partial<CreateAccountsReceivableDTO>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isRequired(data.receivableDescription)) {
    errors.receivableDescription = 'Descrição é obrigatória';
  }

  if (!isRequired(data.customerId)) {
    errors.customerId = 'Cliente é obrigatório';
  }

  if (!isRequired(data.customerName)) {
    errors.customerName = 'Nome do cliente é obrigatório';
  }

  if (!isPositive(data.originalAmount)) {
    errors.originalAmount = 'Valor deve ser maior que zero';
  }

  if (!isRequired(data.issueDate)) {
    errors.issueDate = 'Data de emissão é obrigatória';
  }

  if (!isRequired(data.dueDate)) {
    errors.dueDate = 'Data de vencimento é obrigatória';
  }

  if (!isRequired(data.competenceDate)) {
    errors.competenceDate = 'Data de competência é obrigatória';
  }

  if (data.issueDate && data.dueDate && !isDueDateAfterIssueDate(data.issueDate, data.dueDate)) {
    errors.dueDate = 'Data de vencimento não pode ser anterior à emissão';
  }

  if (data.customerEmail && !isValidEmail(data.customerEmail)) {
    errors.customerEmail = 'Email inválido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Valida dados de Fluxo de Caixa
 */
export function validateCashFlow(data: Partial<CreateCashFlowDTO>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isRequired(data.flowDate)) {
    errors.flowDate = 'Data do fluxo é obrigatória';
  }

  if (!isRequired(data.flowType)) {
    errors.flowType = 'Tipo de fluxo é obrigatório';
  }

  if (!isPositive(data.amount)) {
    errors.amount = 'Valor deve ser maior que zero';
  }

  if (!isRequired(data.description)) {
    errors.description = 'Descrição é obrigatória';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Valida dados de Categoria Financeira
 */
export function validateFinancialCategory(data: Partial<CreateFinancialCategoryDTO>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isRequired(data.categoryCode)) {
    errors.categoryCode = 'Código é obrigatório';
  } else if (data.categoryCode && !/^[A-Z0-9._-]+$/.test(data.categoryCode)) {
    errors.categoryCode = 'Código deve conter apenas letras maiúsculas, números, pontos, underscores e hífens';
  }

  if (!isRequired(data.categoryName)) {
    errors.categoryName = 'Nome é obrigatório';
  }

  if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
    errors.color = 'Cor deve estar no formato hexadecimal (#FFFFFF)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Valida dados de pagamento
 */
export function validatePayment(data: { paymentAmount?: number; paymentDate?: string; bankAccountId?: number; paymentMethod?: string }): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isPositive(data.paymentAmount)) {
    errors.paymentAmount = 'Valor do pagamento deve ser maior que zero';
  }

  if (!isRequired(data.paymentDate)) {
    errors.paymentDate = 'Data do pagamento é obrigatória';
  }

  if (!isRequired(data.bankAccountId)) {
    errors.bankAccountId = 'Conta bancária é obrigatória';
  }

  if (!isRequired(data.paymentMethod)) {
    errors.paymentMethod = 'Forma de pagamento é obrigatória';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
