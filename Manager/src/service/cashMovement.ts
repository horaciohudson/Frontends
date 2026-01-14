import api from "./api";
import { CashMovement, CashBalance, CashMovementType, CashCategory } from "../models/CashMovement";

// Interface para parâmetros de listagem
export interface CashMovementListParams {
  q?: string;
  page?: number;
  size?: number;
  movementType?: CashMovementType;
  category?: CashCategory;
  startDate?: string;
  endDate?: string;
}

// Interface para resposta paginada
export interface CashMovementListResponse {
  content: CashMovement[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// CRUD Operations para CashMovement
export async function listCashMovements(params?: CashMovementListParams): Promise<CashMovementListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.q) searchParams.append('q', params.q);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.size) searchParams.append('size', params.size.toString());
  if (params?.movementType) searchParams.append('movementType', params.movementType);
  if (params?.category) searchParams.append('category', params.category);
  if (params?.startDate) searchParams.append('startDate', params.startDate);
  if (params?.endDate) searchParams.append('endDate', params.endDate);
  
  const response = await api.get(`/cash-movements?${searchParams.toString()}`);
  return response.data;
}

export async function getCashMovement(id: number): Promise<CashMovement> {
  const response = await api.get(`/cash-movements/${id}`);
  return response.data;
}

export async function createCashMovement(data: CashMovement): Promise<CashMovement> {
  const response = await api.post('/cash-movements', data);
  return response.data;
}

export async function updateCashMovement(id: number, data: CashMovement): Promise<CashMovement> {
  const response = await api.put(`/cash-movements/${id}`, data);
  return response.data;
}

export async function deleteCashMovement(id: number): Promise<void> {
  await api.delete(`/cash-movements/${id}`);
}

// CRUD Operations para CashBalance
export async function getCashBalance(): Promise<CashBalance> {
  try {
    const response = await api.get('/cash-balance');
    return response.data;
  } catch (error) {
    // Fallback para balance padrão se a API não estiver disponível
    return {
      id: 1,
      currentBalance: 0,
      totalIncome: 0,
      totalExpense: 0,
      lastUpdated: new Date().toISOString()
    };
  }
}

export async function updateCashBalance(data: CashBalance): Promise<CashBalance> {
  const response = await api.put('/cash-balance', data);
  return response.data;
}

// Enum Fetchers
export async function fetchCashMovementTypes(): Promise<CashMovementType[]> {
  try {
    const response = await api.get('/enums/cash-movement-types');
    return response.data;
  } catch (error) {
    // Fallback para tipos padrão se a API não estiver disponível
    return ['INCOME', 'EXPENSE', 'TRANSFER'];
  }
}

export async function fetchCashCategories(): Promise<CashCategory[]> {
  try {
    const response = await api.get('/enums/cash-categories');
    return response.data;
  } catch (error) {
    // Fallback para categorias padrão se a API não estiver disponível
    return ['SALES', 'PURCHASES', 'SALARY', 'RENT', 'UTILITIES', 'MAINTENANCE', 'OTHER'];
  }
}

// Utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

export function validateCashMovement(data: CashMovement): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.description?.trim()) errors.push('Description is required');
  if (data.amount <= 0) errors.push('Amount must be greater than zero');
  if (!data.movementType) errors.push('Movement type is required');
  if (!data.category) errors.push('Category is required');
  if (!data.movementDate) errors.push('Movement date is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateCashBalance(data: CashBalance): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (data.currentBalance < 0) errors.push('Current balance cannot be negative');
  if (data.totalIncome < 0) errors.push('Total income cannot be negative');
  if (data.totalExpense < 0) errors.push('Total expense cannot be negative');
  
  return {
    isValid: errors.length === 0,
    errors
  };
}






















































