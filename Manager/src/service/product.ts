import api from "./api";
import { Product, ProductStatus } from "../models/Product";

// Interface para parâmetros de listagem
export interface ProductListParams {
  q?: string;
  page?: number;
  size?: number;
  category?: string;
  status?: ProductStatus;
}

// Interface para resposta paginada
export interface ProductListResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// CRUD Operations
export async function listProducts(params?: ProductListParams): Promise<ProductListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.q) searchParams.append('q', params.q);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.size) searchParams.append('size', params.size.toString());
  if (params?.category) searchParams.append('category', params.category);
  if (params?.status) searchParams.append('status', params.status);

  const response = await api.get(`/products?${searchParams.toString()}`);
  return response.data;
}

export async function getProduct(id: string): Promise<Product> {
  const response = await api.get(`/products/${id}`);
  return response.data;
}

export async function createProduct(data: Product): Promise<Product> {
  const response = await api.post('/products', data);
  return response.data;
}

export async function updateProduct(id: string, data: Product): Promise<Product> {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

// Enum Fetchers
export async function fetchProductCategories(): Promise<string[]> {
  try {
    const response = await api.get('/enums/product-categories');
    return response.data;
  } catch (error) {
    // Fallback para categorias padrão se a API não estiver disponível
    return ['ELECTRONICS', 'CLOTHING', 'FOOD', 'BOOKS', 'HOME', 'SPORTS', 'OTHER'];
  }
}

export async function fetchProductStatuses(): Promise<ProductStatus[]> {
  try {
    const response = await api.get('/enums/product-statuses');
    return response.data;
  } catch (error) {
    // Fallback para status padrão se a API não estiver disponível
    return ['ACTIVE', 'INACTIVE', 'DISCONTINUED'];
  }
}

// Utility functions
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
}

export function formatWeight(weight: number): string {
  return `${weight}g`;
}
