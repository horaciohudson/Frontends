import api from "./api";
import { ProductVariant, ProductVariantRequest, ProductVariantResponse } from "../types/ProductVariant";

export class ProductVariantService {
    
    /**
     * Busca todas as variantes de um produto
     */
    static async getByProductId(productId: string): Promise<{ data: ProductVariant[] }> {
        try {
            console.log(`🎨 ProductVariantService.getByProductId(${productId})`);
            const response = await api.get(`/products/${productId}/variants`);
            console.log("✅ Variantes carregadas:", response.data);
            return { data: response.data };
        } catch (error) {
            console.error("❌ Erro ao buscar variantes:", error);
            throw error;
        }
    }

    /**
     * Busca variantes de um produto com paginação
     */
    static async getByProductIdWithPagination(productId: string, page: number = 0, size: number = 20): Promise<ProductVariantResponse> {
        try {
            const response = await api.get(`/products/${productId}/variants/page?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            console.error("❌ Erro ao buscar variantes com paginação:", error);
            throw error;
        }
    }

    /**
     * Busca uma variante por ID
     */
    static async getById(id: string): Promise<ProductVariant> {
        try {
            const response = await api.get(`/variants/${id}`);
            return response.data;
        } catch (error) {
            console.error("❌ Erro ao buscar variante:", error);
            throw error;
        }
    }

    /**
     * Cria uma nova variante
     */
    static async create(productId: string, data: ProductVariantRequest): Promise<ProductVariant> {
        try {
            console.log(`➕ ProductVariantService.create(${productId}):`, data);
            const response = await api.post(`/products/${productId}/variants`, data);
            console.log("✅ Variante criada:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Erro ao criar variante:", error);
            throw error;
        }
    }

    /**
     * Criação em lote de variantes
     */
    static async bulkCreate(productId: string, variants: ProductVariantRequest[]): Promise<ProductVariant[]> {
        try {
            console.log(`📦 ProductVariantService.bulkCreate(${productId}):`, variants);
            const response = await api.post(`/products/${productId}/variants/bulk`, variants);
            console.log("✅ Variantes criadas em lote:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Erro ao criar variantes em lote:", error);
            throw error;
        }
    }

    /**
     * Atualiza uma variante
     */
    static async update(id: string, data: ProductVariantRequest): Promise<ProductVariant> {
        try {
            console.log(`📝 ProductVariantService.update(${id}):`, data);
            const response = await api.put(`/variants/${id}`, data);
            console.log("✅ Variante atualizada:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Erro ao atualizar variante:", error);
            throw error;
        }
    }

    /**
     * Atualiza apenas o estoque de uma variante
     */
    static async updateStock(id: string, quantity: number): Promise<ProductVariant> {
        try {
            const response = await api.patch(`/variants/${id}/stock?quantity=${quantity}`);
            return response.data;
        } catch (error) {
            console.error("❌ Erro ao atualizar estoque:", error);
            throw error;
        }
    }

    /**
     * Desativa uma variante
     */
    static async delete(id: string): Promise<void> {
        try {
            console.log(`🗑️ ProductVariantService.delete(${id})`);
            await api.delete(`/variants/${id}`);
            console.log("✅ Variante excluída com sucesso");
        } catch (error) {
            console.error("❌ Erro ao excluir variante:", error);
            throw error;
        }
    }

    /**
     * Calcula o estoque total de um produto
     */
    static async getTotalStock(productId: string): Promise<number> {
        try {
            const response = await api.get(`/products/${productId}/variants/total-stock`);
            return response.data;
        } catch (error) {
            console.error("❌ Erro ao calcular estoque total:", error);
            throw error;
        }
    }

    /**
     * Busca variantes com estoque baixo
     */
    static async getLowStockVariants(productId: string): Promise<ProductVariant[]> {
        try {
            const response = await api.get(`/products/${productId}/variants/low-stock`);
            return response.data;
        } catch (error) {
            console.error("❌ Erro ao buscar variantes com estoque baixo:", error);
            throw error;
        }
    }

    /**
     * Conta o número de variantes ativas de um produto
     */
    static async countActiveVariants(productId: string): Promise<number> {
        try {
            const response = await api.get(`/products/${productId}/variants/count`);
            return response.data;
        } catch (error) {
            console.error("❌ Erro ao contar variantes ativas:", error);
            throw error;
        }
    }
}