import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authAPI = {
    login: (username: string, password: string) =>
        api.post('/auth/login', { username, password }),

    register: (data: any) =>
        api.post('/auth/register', data),

    refreshToken: (refreshToken: string) =>
        api.post('/auth/refresh', { refreshToken }),
};

// Products API
export const productsAPI = {
    getAll: (page = 0, size = 20) =>
        api.get('/products', { params: { page, size } }),

    getById: (id: number) =>
        api.get(`/products/${id}`),

    search: (query: string, page = 0, size = 20) =>
        api.get('/products/search', { params: { query, page, size } }),

    getByCategory: (categoryId: number, page = 0, size = 20) =>
        api.get('/products/category/' + categoryId, { params: { page, size } }),

    // Admin endpoints
    create: (data: any) =>
        api.post('/products', data),

    update: (id: number, data: any) =>
        api.put(`/products/${id}`, data),

    delete: (id: number) =>
        api.delete(`/products/${id}`),

    updateStatus: (id: number, status: string) =>
        api.patch(`/products/${id}/status`, { status }),

    toggleFeatured: (id: number) =>
        api.patch(`/products/${id}/toggle-featured`),

    syncStock: () =>
        api.post('/products/sync-stock'),

    createMissingStock: () =>
        api.post('/products/create-missing-stock'),
};

// Cart API
export const cartAPI = {
    getCart: () =>
        api.get('/carts/current'),

    addItem: (data: { productId: number; quantity: number }) =>
        api.post('/carts/items', data),

    updateItem: (itemId: number, quantity: number) =>
        api.put(`/carts/items/${itemId}`, { quantity }),

    removeItem: (itemId: number) =>
        api.delete(`/carts/items/${itemId}`),

    clear: () =>
        api.delete('/carts/clear'),
};

// Addresses API
export const addressesAPI = {
    create: (data: any) =>
        api.post('/addresses', data),

    getByCustomer: (customerId: number) =>
        api.get(`/addresses/customer/${customerId}`),

    getByUser: (userId: number) =>
        api.get(`/addresses/user/${userId}`),
};

// Sales API
export const salesAPI = {
    create: (data: any) =>
        api.post('/sales', data),

    getAll: (page = 0, size = 20) =>
        api.get('/sales', { params: { page, size } }),

    getMySales: (page = 0, size = 20) =>
        api.get('/sales/my-sales', { params: { page, size } }),

    getSaleById: (id: number) =>
        api.get(`/sales/${id}`),

    updateStatus: (id: number, status: string) =>
        api.put(`/sales/${id}/status`, { status }),

    // Wholesaler company orders
    getMyCompanyOrders: (page = 0, size = 20) =>
        api.get('/sales/company/my-orders', { params: { page, size } }),

    getMyCompanyOrderById: (id: number) =>
        api.get(`/sales/company/my-orders/${id}`),
};

// Categories API
export const categoriesAPI = {
    getAll: () =>
        api.get('/categories'),

    getById: (id: number) =>
        api.get(`/categories/${id}`),

    // Admin endpoints
    create: (data: any) =>
        api.post('/categories', data),

    update: (id: number, data: any) =>
        api.put(`/categories/${id}`, data),

    delete: (id: number) =>
        api.delete(`/categories/${id}`),

    getSubcategories: (categoryId: number) =>
        api.get(`/categories/${categoryId}/subcategories`),
};

// Payments API
export const paymentsAPI = {
    create: (data: any) =>
        api.post('/payments', data),

    getBySale: (saleId: number) =>
        api.get(`/payments/sale/${saleId}`),
};

// Users API (Admin)
export const usersAPI = {
    getAll: (page = 0, size = 20) =>
        api.get('/admin/users', { params: { page, size } }),

    getById: (id: number) =>
        api.get(`/admin/users/${id}`),

    create: (data: any) =>
        api.post('/admin/users', data),

    update: (id: number, data: any) =>
        api.put(`/admin/users/${id}`, data),

    delete: (id: number) =>
        api.delete(`/admin/users/${id}`),

    toggleActive: (id: number) =>
        api.post(`/admin/users/${id}/toggle-status`),
};

// Admin Stats API
export const adminAPI = {
    getStats: () =>
        api.get('/admin/stats'),

    getDashboard: () =>
        api.get('/admin/dashboard'),
};

// Coupons API
export const couponsAPI = {
    validate: (code: string) =>
        api.post('/coupons/validate', { code }),
};

// Upload API
export const uploadAPI = {
    upload: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/uploads', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

// Companies API
export const companiesAPI = {
    getAll: () =>
        api.get('/companies'),

    getById: (id: string) =>
        api.get(`/companies/${id}`),

    create: (data: any) =>
        api.post('/companies', data),

    update: (id: string, data: any) =>
        api.put(`/companies/${id}`, data),

    delete: (id: string) =>
        api.delete(`/companies/${id}`),

    getSuppliers: (page = 0, size = 20) =>
        api.get('/companies/suppliers', { params: { page, size } }),

    getCustomers: (page = 0, size = 20) =>
        api.get('/companies/customers', { params: { page, size } }),

    getTransporters: (page = 0, size = 20) =>
        api.get('/companies/transporters', { params: { page, size } }),
};

// Payment Methods API
export const paymentMethodsAPI = {
    // Get all payment methods for a company
    getByCompany: (companyId: string) =>
        api.get(`/payment-methods/company/${companyId}`),

    // Get active payment methods for a company
    getActiveByCompany: (companyId: string) =>
        api.get(`/payment-methods/company/${companyId}/active`),

    // Get active payment methods for retail (default company)
    getActiveForRetail: () =>
        api.get('/payment-methods/retail/active'),

    // Get payment method by ID
    getById: (id: number) =>
        api.get(`/payment-methods/${id}`),

    // Create new payment method
    create: (data: any) =>
        api.post('/payment-methods', data),

    // Update payment method
    update: (id: number, data: any) =>
        api.put(`/payment-methods/${id}`, data),

    // Toggle active status
    toggleActive: (id: number) =>
        api.patch(`/payment-methods/${id}/toggle-active`),

    // Delete payment method
    delete: (id: number) =>
        api.delete(`/payment-methods/${id}`),

    // Count active payment methods for company
    countActive: (companyId: string) =>
        api.get(`/payment-methods/company/${companyId}/count`),
};

// Currencies API
export const currenciesAPI = {
    getAll: (page = 0, size = 100) =>
        api.get('/currencies', { params: { page, size } }),

    getById: (id: number) =>
        api.get(`/currencies/${id}`),

    create: (data: any) =>
        api.post('/currencies', data),

    update: (id: number, data: any) =>
        api.put(`/currencies/${id}`, data),

    delete: (id: number) =>
        api.delete(`/currencies/${id}`),
};

// Stock API
export const stockAPI = {
    getAll: (page = 0, size = 20) =>
        api.get('/stock', { params: { page, size } }),

    getById: (id: number) =>
        api.get(`/stock/${id}`),

    getByProduct: (productId: number) =>
        api.get(`/stock/product/${productId}`),

    create: (data: any) =>
        api.post('/stock', data),

    update: (id: number, data: any) =>
        api.put(`/stock/${id}`, data),

    delete: (id: number) =>
        api.delete(`/stock/${id}`),

    getLowStock: (page = 0, size = 20) =>
        api.get('/stock/low-stock', { params: { page, size } }),

    getOutOfStock: (page = 0, size = 20) =>
        api.get('/stock/out-of-stock', { params: { page, size } }),

    addMovement: (stockId: number, data: any) =>
        api.post(`/stock/${stockId}/movements`, data),

    getMovements: (stockId: number, page = 0, size = 20) =>
        api.get(`/stock/${stockId}/movements`, { params: { page, size } }),
};

// Reviews API
export const reviewsAPI = {
    // Obter avaliações de um produto
    getByProduct: (productId: number, page = 0, size = 10) =>
        api.get(`/reviews/product/${productId}`, { params: { page, size } }),

    // Criar nova avaliação
    create: (data: { productId: number; rating: number; comment: string; title?: string }) =>
        api.post('/reviews', data),

    // Atualizar avaliação
    update: (id: number, data: { rating: number; comment: string; title?: string }) =>
        api.put(`/reviews/${id}`, data),

    // Excluir avaliação
    delete: (id: number) =>
        api.delete(`/reviews/${id}`),

    // Obter avaliações do usuário
    getMyReviews: (page = 0, size = 10) =>
        api.get('/reviews/my-reviews', { params: { page, size } }),

    // Admin: Obter todas as avaliações
    getAll: (page = 0, size = 20) =>
        api.get('/reviews', { params: { page, size } }),

    // Admin: Aprovar/Reprovar avaliação
    moderate: (id: number, approved: boolean) =>
        api.put(`/reviews/${id}/moderate`, { approved }),

    // Verificar se usuário pode avaliar produto (comprou?)
    canReview: (productId: number) =>
        api.get(`/reviews/can-review/${productId}`),
};

// Sizes API
export const sizesAPI = {
    getAll: () =>
        api.get('/sizes'),

    getById: (id: number) =>
        api.get(`/sizes/${id}`),

    create: (data: any) =>
        api.post('/sizes', data),

    update: (id: number, data: any) =>
        api.put(`/sizes/${id}`, data),

    delete: (id: number) =>
        api.delete(`/sizes/${id}`),

    toggleActive: (id: number) =>
        api.patch(`/sizes/${id}/toggle-active`),
};

// Colors API
export const colorsAPI = {
    getAll: () =>
        api.get('/colors'),

    getById: (id: number) =>
        api.get(`/colors/${id}`),

    getBySize: (sizeId: number) =>
        api.get(`/colors/by-size/${sizeId}`),

    create: (data: any) =>
        api.post('/colors', data),

    update: (id: number, data: any) =>
        api.put(`/colors/${id}`, data),

    delete: (id: number) =>
        api.delete(`/colors/${id}`),

    toggleActive: (id: number) =>
        api.patch(`/colors/${id}/toggle-active`),
};

// Product Variants API
export const productVariantsAPI = {
    getByProductId: (productId: number) =>
        api.get(`/products/${productId}/variants`),

    getById: (id: number) =>
        api.get(`/variants/${id}`),

    create: (productId: number, data: any) =>
        api.post(`/products/${productId}/variants`, data),

    bulkCreate: (productId: number, data: any[]) =>
        api.post(`/products/${productId}/variants/bulk`, data),

    update: (id: number, data: any) =>
        api.put(`/variants/${id}`, data),

    updateStock: (id: number, quantity: number) =>
        api.patch(`/variants/${id}/stock`, null, { params: { quantity } }),

    delete: (id: number) =>
        api.delete(`/variants/${id}`),

    getTotalStock: (productId: number) =>
        api.get(`/products/${productId}/variants/total-stock`),
};

// Product Movements API
export const productMovementsAPI = {
    getAll: () =>
        api.get('/movements'),

    getById: (id: number) =>
        api.get(`/movements/${id}`),

    getByProductId: (productId: number) =>
        api.get(`/movements/product/${productId}`),

    getByVariantId: (variantId: number) =>
        api.get(`/movements/variant/${variantId}`),

    recordEntry: (data: any) =>
        api.post('/movements/entry', data),

    recordBulkEntry: (data: any[]) =>
        api.post('/movements/entry/bulk', data),

    recordSale: (data: any) =>
        api.post('/movements/sale', data),

    recordAdjustment: (variantId: number, newQuantity: number, reason?: string) =>
        api.post('/movements/adjustment', null, {
            params: { variantId, newQuantity, reason }
        }),
};

// Price Tables API
export const priceTablesAPI = {
    // Tables CRUD
    getAll: () => api.get('/price-tables'),

    getById: (id: number) => api.get(`/price-tables/${id}`),

    getActive: () => api.get('/price-tables/active'),

    getCurrent: () => api.get('/price-tables/current'),

    create: (data: any) => api.post('/price-tables', data),

    update: (id: number, data: any) => api.put(`/price-tables/${id}`, data),

    delete: (id: number) => api.delete(`/price-tables/${id}`),

    // Import & Activation
    importProducts: (id: number) => api.post(`/price-tables/${id}/import-products`),

    importWithVariants: (id: number) => api.post(`/price-tables/${id}/import-with-variants`),

    activate: (id: number) => api.patch(`/price-tables/${id}/activate`),

    deactivate: (id: number) => api.patch(`/price-tables/${id}/deactivate`),

    // Items management
    getItems: (priceTableId: number) => api.get(`/price-tables/${priceTableId}/items`),

    addItem: (priceTableId: number, data: any) =>
        api.post(`/price-tables/${priceTableId}/items`, null, { params: data }),

    updateItem: (itemId: number, data: any) =>
        api.put(`/price-tables/items/${itemId}`, null, { params: data }),

    deleteItem: (priceTableId: number, productId: number) =>
        api.delete(`/price-tables/${priceTableId}/items/${productId}`),
};

// Wholesalers API
export const wholesalersAPI = {
    // Create wholesaler registration
    create: (data: any, userId: number) =>
        api.post('/wholesalers', data, { params: { userId } }),

    // Get wholesalers
    getAll: (page = 0, size = 20) =>
        api.get('/wholesalers', { params: { page, size } }),

    getById: (id: number) =>
        api.get(`/wholesalers/${id}`),

    getByUuid: (uuid: string) =>
        api.get(`/wholesalers/uuid/${uuid}`),

    getByUserId: (userId: number) =>
        api.get(`/wholesalers/user/${userId}`),

    getByStatus: (status: string, page = 0, size = 20) =>
        api.get(`/wholesalers/status/${status}`, { params: { page, size } }),

    search: (query: string, page = 0, size = 20) =>
        api.get('/wholesalers/search', { params: { query, page, size } }),

    // Update wholesaler
    update: (id: number, data: any) =>
        api.put(`/wholesalers/${id}`, data),

    // Admin actions
    approve: (id: number, approvedBy: number) =>
        api.post(`/wholesalers/${id}/approve`, null, { params: { approvedBy } }),

    reject: (id: number, reason: string) =>
        api.post(`/wholesalers/${id}/reject`, null, { params: { reason } }),

    suspend: (id: number, reason: string) =>
        api.post(`/wholesalers/${id}/suspend`, null, { params: { reason } }),

    reactivate: (id: number) =>
        api.post(`/wholesalers/${id}/reactivate`),

    updatePriceTable: (wholesalerId: number, priceTableId: number) =>
        api.put(`/wholesalers/${wholesalerId}/price-table/${priceTableId}`),

    // Stats
    countByStatus: (status: string) =>
        api.get(`/wholesalers/count/${status}`),

    // Delete
    delete: (id: number) =>
        api.delete(`/wholesalers/${id}`),
};

// Wholesale Orders API
export const wholesaleOrdersAPI = {
    // Create order from cart
    createFromCart: (wholesalerId: number, userId: number) =>
        api.post('/wholesale-orders', null, { params: { wholesalerId, userId } })
            .then(res => res.data),

    // Get orders
    getAll: (page = 0, size = 100) =>
        api.get('/wholesale-orders', { params: { page, size } })
            .then(res => res.data),

    getMyOrders: (page = 0, size = 20) =>
        api.get('/wholesale-orders/my-orders', { params: { page, size } })
            .then(res => res.data),

    getById: (id: number) =>
        api.get(`/wholesale-orders/${id}`)
            .then(res => res.data),

    getByUuid: (uuid: string) =>
        api.get(`/wholesale-orders/uuid/${uuid}`)
            .then(res => res.data),

    getByNumber: (orderNumber: string) =>
        api.get(`/wholesale-orders/number/${orderNumber}`)
            .then(res => res.data),

    getByWholesaler: (wholesalerId: number, page = 0, size = 20) =>
        api.get(`/wholesale-orders/wholesaler/${wholesalerId}`, { params: { page, size } })
            .then(res => res.data),

    getByWholesalerAndStatus: (wholesalerId: number, status: string, page = 0, size = 20) =>
        api.get(`/wholesale-orders/wholesaler/${wholesalerId}/status/${status}`, { params: { page, size } })
            .then(res => res.data),

    getByStatus: (status: string, page = 0, size = 20) =>
        api.get(`/wholesale-orders/status/${status}`, { params: { page, size } })
            .then(res => res.data),

    // Order items
    addItem: (orderId: number, productId: number, size: string | null, color: string | null, quantity: number) =>
        api.post(`/wholesale-orders/${orderId}/items`, null, {
            params: { productId, size, color, quantity }
        }).then(res => res.data),

    removeItem: (orderId: number, itemId: number) =>
        api.delete(`/wholesale-orders/${orderId}/items/${itemId}`)
            .then(res => res.data),

    // Order status changes
    submit: (orderId: number) =>
        api.post(`/wholesale-orders/${orderId}/submit`)
            .then(res => res.data),

    confirm: (orderId: number) =>
        api.post(`/wholesale-orders/${orderId}/confirm`)
            .then(res => res.data),

    cancel: (orderId: number, reason: string) =>
        api.post(`/wholesale-orders/${orderId}/cancel`, null, { params: { reason } })
            .then(res => res.data),

    startProduction: (orderId: number) =>
        api.post(`/wholesale-orders/${orderId}/start-production`)
            .then(res => res.data),

    markReady: (orderId: number) =>
        api.post(`/wholesale-orders/${orderId}/mark-ready`)
            .then(res => res.data),

    markInvoiced: (orderId: number) =>
        api.post(`/wholesale-orders/${orderId}/mark-invoiced`)
            .then(res => res.data),

    markShipped: (orderId: number, trackingCode: string, shippingCompany: string) =>
        api.post(`/wholesale-orders/${orderId}/mark-shipped`, null, {
            params: { trackingCode, shippingCompany }
        }).then(res => res.data),

    markDelivered: (orderId: number) =>
        api.post(`/wholesale-orders/${orderId}/mark-delivered`)
            .then(res => res.data),

    // Stats
    countByStatus: (status: string) =>
        api.get(`/wholesale-orders/count/${status}`)
            .then(res => res.data),
};

export default api;
