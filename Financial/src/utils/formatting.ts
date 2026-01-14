// Funções de formatação para o Sistema Financeiro

/**
 * Formata um valor numérico como moeda brasileira (R$)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada no padrão "R$ X.XXX,XX"
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Formata um valor numérico como número com separadores brasileiros
 * @param value - Valor numérico a ser formatado
 * @param decimals - Número de casas decimais (padrão: 2)
 * @returns String formatada no padrão "X.XXX,XX"
 */
export function formatNumber(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Formata uma data no padrão brasileiro (DD/MM/YYYY)
 * @param date - Data como string ISO, Date ou timestamp
 * @returns String formatada no padrão "DD/MM/YYYY"
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) {
    return '';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
}

/**
 * Formata uma data e hora no padrão brasileiro (DD/MM/YYYY HH:mm)
 * @param date - Data como string ISO, Date ou timestamp
 * @returns String formatada no padrão "DD/MM/YYYY HH:mm"
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) {
    return '';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

/**
 * Converte uma data para o formato ISO (YYYY-MM-DD) para envio à API
 * @param date - Data como string ou Date
 * @returns String no formato "YYYY-MM-DD"
 */
export function toISODateString(date: string | Date | null | undefined): string {
  if (!date) {
    return '';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return dateObj.toISOString().split('T')[0];
}

/**
 * Converte uma string de moeda brasileira para número
 * @param value - String no formato "R$ X.XXX,XX" ou "X.XXX,XX"
 * @returns Valor numérico
 */
export function parseCurrency(value: string): number {
  if (!value) {
    return 0;
  }
  
  // Remove "R$", espaços e pontos de milhar, troca vírgula por ponto
  const cleaned = value
    .replace(/R\$\s?/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formata CPF (XXX.XXX.XXX-XX)
 * @param cpf - CPF como string de 11 dígitos
 * @returns CPF formatado
 */
export function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) {
    return '';
  }
  
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) {
    return cpf;
  }
  
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CNPJ (XX.XXX.XXX/XXXX-XX)
 * @param cnpj - CNPJ como string de 14 dígitos
 * @returns CNPJ formatado
 */
export function formatCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) {
    return '';
  }
  
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length !== 14) {
    return cnpj;
  }
  
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata CPF ou CNPJ automaticamente
 * @param document - Documento como string
 * @returns Documento formatado
 */
export function formatDocument(document: string | null | undefined): string {
  if (!document) {
    return '';
  }
  
  const cleaned = document.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return formatCPF(cleaned);
  }
  
  if (cleaned.length === 14) {
    return formatCNPJ(cleaned);
  }
  
  return document;
}

/**
 * Formata telefone brasileiro
 * @param phone - Telefone como string
 * @returns Telefone formatado
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) {
    return '';
  }
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

/**
 * Trunca texto com reticências
 * @param text - Texto a ser truncado
 * @param maxLength - Comprimento máximo
 * @returns Texto truncado
 */
export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) {
    return '';
  }
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Calcula a diferença em dias entre duas datas
 * @param date1 - Primeira data
 * @param date2 - Segunda data (padrão: hoje)
 * @returns Número de dias de diferença
 */
export function daysDifference(date1: string | Date, date2: string | Date = new Date()): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Verifica se uma data está vencida
 * @param dueDate - Data de vencimento
 * @returns true se a data está no passado
 */
export function isOverdue(dueDate: string | Date): boolean {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

/**
 * Retorna texto relativo para dias (ex: "Vence em 3 dias", "Vencido há 2 dias")
 * @param dueDate - Data de vencimento
 * @returns Texto descritivo
 */
export function getDueDateText(dueDate: string | Date): string {
  const days = daysDifference(dueDate);
  
  if (days === 0) {
    return 'Vence hoje';
  }
  
  if (days === 1) {
    return 'Vencido há 1 dia';
  }
  
  if (days > 1) {
    return `Vencido há ${days} dias`;
  }
  
  if (days === -1) {
    return 'Vence amanhã';
  }
  
  return `Vence em ${Math.abs(days)} dias`;
}
