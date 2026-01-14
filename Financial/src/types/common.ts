// Tipos comuns compartilhados

// Paginação
export interface PaginationState {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// Resposta paginada da API
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Filtros base
export interface BaseFilters {
  searchText?: string;
  startDate?: string;
  endDate?: string;
}

// Resposta de API genérica
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Erro de API
export interface ApiError {
  status: number;
  message: string;
  details?: Record<string, string[]>;
  timestamp?: string;
}

// Opção para selects
export interface SelectOption {
  value: string | number;
  label: string;
}

// Definição de coluna para tabelas
export interface ColumnDefinition<T> {
  key: keyof T | string;
  header: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// Definição de ação para tabelas
export interface ActionDefinition<T> {
  label: string;
  icon?: string;
  onClick: (row: T) => void;
  show?: (row: T) => boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
}

// Definição de filtro
export interface FilterDefinition {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'multiSelect';
  options?: SelectOption[];
  placeholder?: string;
}

// Resultado de validação
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Estado de notificação
export interface NotificationState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  visible: boolean;
}

// Dados de auditoria
export interface AuditInfo {
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}
