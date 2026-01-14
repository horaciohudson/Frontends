// Funções de formatação para o Sistema de Produção

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
 * Formata quantidade com unidade de medida
 * @param quantity - Quantidade numérica
 * @param unit - Unidade de medida
 * @returns String formatada "X.XXX,XX unidade"
 */
export function formatQuantity(quantity: number | null | undefined, unit: string = ''): string {
  if (quantity === null || quantity === undefined || isNaN(quantity)) {
    return `0 ${unit}`.trim();
  }
  
  const formattedNumber = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
  }).format(quantity);
  
  return `${formattedNumber} ${unit}`.trim();
}

/**
 * Formata status de produção com cores
 * @param status - Status da produção
 * @returns Objeto com texto e classe CSS
 */
export function formatProductionStatus(status: string): { text: string; className: string } {
  const statusMap: Record<string, { text: string; className: string }> = {
    'PENDING': { text: 'Pendente', className: 'status-pending' },
    'IN_PROGRESS': { text: 'Em Andamento', className: 'status-in-progress' },
    'COMPLETED': { text: 'Concluída', className: 'status-completed' },
    'CANCELLED': { text: 'Cancelada', className: 'status-cancelled' },
    'PAUSED': { text: 'Pausada', className: 'status-paused' }
  };
  
  return statusMap[status] || { text: status, className: 'status-unknown' };
}

/**
 * Formata prioridade de produção
 * @param priority - Prioridade (LOW, MEDIUM, HIGH, URGENT)
 * @returns Objeto com texto e classe CSS
 */
export function formatPriority(priority: string): { text: string; className: string } {
  const priorityMap: Record<string, { text: string; className: string }> = {
    'LOW': { text: 'Baixa', className: 'priority-low' },
    'MEDIUM': { text: 'Média', className: 'priority-medium' },
    'HIGH': { text: 'Alta', className: 'priority-high' },
    'URGENT': { text: 'Urgente', className: 'priority-urgent' }
  };
  
  return priorityMap[priority] || { text: priority, className: 'priority-unknown' };
}

/**
 * Calcula percentual de progresso
 * @param current - Valor atual
 * @param total - Valor total
 * @returns Percentual formatado
 */
export function formatProgress(current: number, total: number): string {
  if (total === 0) {
    return '0%';
  }
  
  const percentage = (current / total) * 100;
  return `${Math.round(percentage)}%`;
}

/**
 * Formata eficiência de produção
 * @param produced - Quantidade produzida
 * @param planned - Quantidade planejada
 * @returns Percentual de eficiência
 */
export function formatEfficiency(produced: number, planned: number): string {
  if (planned === 0) {
    return '0%';
  }
  
  const efficiency = (produced / planned) * 100;
  return `${Math.round(efficiency)}%`;
}

/**
 * Formata tempo de produção em horas e minutos
 * @param minutes - Tempo em minutos
 * @returns String formatada "Xh Ymin"
 */
export function formatProductionTime(minutes: number | null | undefined): string {
  if (!minutes || minutes === 0) {
    return '0min';
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}min`;
  }
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Formata custo por unidade
 * @param totalCost - Custo total
 * @param quantity - Quantidade produzida
 * @returns Custo unitário formatado
 */
export function formatUnitCost(totalCost: number, quantity: number): string {
  if (quantity === 0) {
    return 'R$ 0,00/un';
  }
  
  const unitCost = totalCost / quantity;
  return `${formatCurrency(unitCost)}/un`;
}

/**
 * Formata nível de estoque com alerta
 * @param current - Quantidade atual
 * @param minimum - Quantidade mínima
 * @param unit - Unidade de medida
 * @returns Objeto com texto formatado e status de alerta
 */
export function formatStockLevel(current: number, minimum: number, unit: string = ''): {
  text: string;
  isLow: boolean;
  isCritical: boolean;
} {
  const formattedCurrent = formatQuantity(current, unit);
  const isLow = current <= minimum;
  const isCritical = current <= minimum * 0.5;
  
  return {
    text: formattedCurrent,
    isLow,
    isCritical
  };
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
 * Formata prazo de entrega
 * @param dueDate - Data de entrega
 * @returns Texto descritivo do prazo
 */
export function formatDeliveryTime(dueDate: string | Date): string {
  const days = daysDifference(dueDate);
  
  if (days === 0) {
    return 'Entrega hoje';
  }
  
  if (days === 1) {
    return 'Atrasado há 1 dia';
  }
  
  if (days > 1) {
    return `Atrasado há ${days} dias`;
  }
  
  if (days === -1) {
    return 'Entrega amanhã';
  }
  
  return `Entrega em ${Math.abs(days)} dias`;
}

/**
 * Formata código de ordem de produção
 * @param orderNumber - Número da ordem
 * @param prefix - Prefixo (padrão: OP)
 * @returns Código formatado
 */
export function formatOrderCode(orderNumber: string | number, prefix: string = 'OP'): string {
  const paddedNumber = String(orderNumber).padStart(6, '0');
  return `${prefix}-${paddedNumber}`;
}