// Serviço de API para o app mobile
// Adaptado do frontend web

import axios from 'axios';
import { storage, STORAGE_KEYS } from '../utils/storage';
import type {
    ApiResponse,
    PaginatedResponse,
    Product,
    Cart,
    Sale,
    Category,
    Address,
    RegisterData,
    AddToCartRequest,
    CreateSaleRequest,
    CreatePaymentRequest,
} from '../types';

// Configuração da URL base
// Para emulador Android: 10.0.2.2
// Para dispositivo físico: use o IP da sua máquina
// Para iOS Simulator: localhost
// O IP abaixo foi obtido do Expo (mesma rede)
const API_BASE_URL = 'http://192.168.15.7:8080/api';

// Criar instância do Axios
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 segundos
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
    async (config) => {
        const token = await storage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expirado ou inválido - limpar dados e redirecionar para login
            await storage.removeItem(STORAGE_KEYS.TOKEN);
            await storage.removeItem(STORAGE_KEYS.USER);
        }
        return Promise.reject(error);
    }
);

// ===== AUTH API =====
export const authAPI = {
    login: (username: string, password: string) =>
        api.post<ApiResponse<{ token: string; userId: number; username: string; email: string; roles: string[] }>>('/auth/login', { username, password }),

    register: (data: RegisterData) =>
        api.post<ApiResponse<any>>('/auth/register', data),

    refreshToken: (refreshToken: string) =>
        api.post<ApiResponse<{ token: string }>>('/auth/refresh', { refreshToken }),

    getMe: () =>
        api.get<ApiResponse<any>>('/auth/me'),

    updateProfile: (data: any) =>
        api.put<ApiResponse<any>>('/auth/me', data),
};

// ===== PRODUCTS API =====
export const productsAPI = {
    getAll: (page = 0, size = 20) =>
        api.get<ApiResponse<PaginatedResponse<Product>>>('/products', { params: { page, size } }),

    getById: (id: number) =>
        api.get<ApiResponse<Product>>(`/products/${id}`),

    search: (query: string, page = 0, size = 20) =>
        api.get<ApiResponse<PaginatedResponse<Product>>>('/products/search', { params: { query, page, size } }),

    getByCategory: (categoryId: number, page = 0, size = 20) =>
        api.get<ApiResponse<PaginatedResponse<Product>>>(`/products/category/${categoryId}`, { params: { page, size } }),

    getFeatured: () =>
        api.get<ApiResponse<Product[]>>('/products/featured'),
};

// ===== CATEGORIES API =====
export const categoriesAPI = {
    getAll: () =>
        api.get<ApiResponse<Category[]>>('/categories'),

    getById: (id: number) =>
        api.get<ApiResponse<Category>>(`/categories/${id}`),

    getSubcategories: (categoryId: number) =>
        api.get<ApiResponse<any[]>>(`/categories/${categoryId}/subcategories`),
};

// ===== CART API =====
export const cartAPI = {
    getCart: () =>
        api.get<ApiResponse<Cart>>('/carts/current'),

    addItem: (data: AddToCartRequest) =>
        api.post<ApiResponse<Cart>>('/carts/items', data),

    updateItem: (itemId: number, quantity: number) =>
        api.put<ApiResponse<Cart>>(`/carts/items/${itemId}`, { quantity }),

    removeItem: (itemId: number) =>
        api.delete<ApiResponse<Cart>>(`/carts/items/${itemId}`),

    clear: () =>
        api.delete<ApiResponse<void>>('/carts/clear'),
};

// ===== ADDRESSES API =====
const normalizeAddress = (addr: any): Address => ({
    id: addr.id,
    street: addr.streetAddress || addr.street || '',
    number: addr.number || '',
    complement: addr.complement || '',
    neighborhood: addr.neighborhood || '',
    city: addr.city || '',
    state: addr.state || '',
    zipCode: addr.postalCode || addr.zipCode || '',
    country: addr.country || 'Brasil',
    addressType: addr.addressType || 'SHIPPING',
});

export const addressesAPI = {
    getMyAddresses: async () => {
        const response = await api.get<ApiResponse<Address[]>>('/addresses/my-addresses');
        if (response.data.data) {
            response.data.data = response.data.data.map(normalizeAddress);
        }
        return response;
    },

    getById: async (id: number) => {
        const response = await api.get<ApiResponse<Address>>(`/addresses/${id}`);
        if (response.data.data) {
            response.data.data = normalizeAddress(response.data.data);
        }
        return response;
    },

    create: (data: Address) => {
        // Mapear campos do frontend para o formato do backend
        const backendData = {
            addressType: data.addressType,
            streetAddress: data.street,  // street → streetAddress
            number: data.number,
            complement: data.complement,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            postalCode: data.zipCode,  // zipCode → postalCode
            country: data.country,
        };
        return api.post<ApiResponse<Address>>('/addresses', backendData);
    },

    update: (id: number, data: Address) => {
        const backendData = {
            addressType: data.addressType,
            streetAddress: data.street,
            number: data.number,
            complement: data.complement,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            postalCode: data.zipCode,
            country: data.country,
        };
        return api.put<ApiResponse<Address>>(`/addresses/${id}`, backendData);
    },

    delete: (id: number) =>
        api.delete<ApiResponse<void>>(`/addresses/${id}`),

    getByCustomer: async (customerId: number) => {
        const response = await api.get<ApiResponse<Address[]>>(`/addresses/customer/${customerId}`);
        if (response.data.data) {
            response.data.data = response.data.data.map(normalizeAddress);
        }
        return response;
    },
};

// ===== NOTIFICATIONS API =====
export const notificationsAPI = {
    getPreferences: () =>
        api.get<ApiResponse<any>>('/notifications/preferences'),

    updatePreferences: (data: any) =>
        api.put<ApiResponse<any>>('/notifications/preferences', data),
};

// ===== PAYMENT METHODS API =====
export const paymentMethodsAPI = {
    getAll: () =>
        api.get<ApiResponse<any[]>>('/payment-methods'),

    create: (data: any) =>
        api.post<ApiResponse<any>>('/payment-methods', data),

    update: (id: number, data: any) =>
        api.put<ApiResponse<any>>(`/payment-methods/${id}`, data),

    setDefault: (id: number) =>
        api.patch<ApiResponse<any>>(`/payment-methods/${id}/set-default`),

    delete: (id: number) =>
        api.delete<ApiResponse<void>>(`/payment-methods/${id}`),
};

// ===== SALES API =====
export const salesAPI = {
    create: (data: CreateSaleRequest) =>
        api.post<ApiResponse<Sale>>('/sales', data),

    getMySales: (page = 0, size = 20) =>
        api.get<ApiResponse<PaginatedResponse<Sale>>>('/sales/my-sales', { params: { page, size } }),

    getSaleById: (id: number) =>
        api.get<ApiResponse<Sale>>(`/sales/${id}`),
};

// ===== WISHLIST API =====
export const wishlistAPI = {
    get: () =>
        api.get<ApiResponse<Product[]>>('/wishlist'),

    toggle: (productId: number) =>
        api.post<ApiResponse<boolean>>(`/wishlist/toggle/${productId}`),

    check: (productId: number) =>
        api.get<ApiResponse<boolean>>(`/wishlist/check/${productId}`),
};

// ===== PAYMENTS API =====
export const paymentsAPI = {
    create: (data: CreatePaymentRequest) =>
        api.post<ApiResponse<any>>('/payments', data),

    getBySale: (saleId: number) =>
        api.get<ApiResponse<any>>(`/payments/sale/${saleId}`),
};

// ===== REVIEWS API =====
export const reviewsAPI = {
    getProductReviews: (productId: number, page = 0, size = 20) =>
        api.get<ApiResponse<PaginatedResponse<any>>>(`/reviews/product/${productId}`, {
            params: { page, size }
        }),

    createReview: (data: any) =>
        api.post<ApiResponse<any>>('/reviews', data),

    deleteReview: (reviewId: number) =>
        api.delete<ApiResponse<void>>(`/reviews/${reviewId}`),

    getById: (reviewId: number) =>
        api.get<ApiResponse<any>>(`/reviews/${reviewId}`),
};

// ===== COUPONS API =====
export const couponsAPI = {
    validateCoupon: (data: any) =>
        api.post<ApiResponse<any>>('/coupons/validate', data),

    getValidCoupons: (page = 0, size = 20) =>
        api.get<ApiResponse<PaginatedResponse<any>>>('/coupons/valid', {
            params: { page, size }
        }),

    getById: (couponId: number) =>
        api.get<ApiResponse<any>>(`/coupons/${couponId}`),
};


export default api;
