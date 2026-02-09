import api from './api';

export interface ProductPriceDTO {
    id: string;
    productId: string;
    sellingPrice: number;
    createdAt: string;
    createdBy: string;
}

export type ProductPrice = ProductPriceDTO;

export const ProductPriceService = {
    findByProductId: async (productId: string) => {
        try {
            const response = await api.get<ProductPriceDTO>(`/product-prices/products/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching product price:', error);
            return null;
        }
    },

    findHistoryByProductId: async (productId: string) => {
        try {
            const response = await api.get<ProductPriceDTO[]>(`/product-prices/products/${productId}/history`);
            return response.data;
        } catch (error) {
            console.error('Error fetching product price history:', error);
            return [];
        }
    },

    saveOrUpdate: async (productId: string, price: Partial<ProductPrice>) => {
        try {
            const response = await api.post<ProductPriceDTO>(`/product-prices/products/${productId}`, price);
            return response.data;
        } catch (error) {
            console.error('Error saving product price:', error);
            throw error;
        }
    }
};
