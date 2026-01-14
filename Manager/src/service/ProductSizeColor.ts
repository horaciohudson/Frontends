import api from "./api";
import { ProductSizeColor, ProductSizeColorStats } from "../models/ProductSizeColor";




export class ProductSizeColorService {
  
  static async getByProductAndSize(productId: number, sizeId: number): Promise<ProductSizeColor[]> {
    try {
      console.log("🎨 Carregando cores para produto:", productId, "tamanho:", sizeId);
      const response = await api.get(`/stock/product-size-colors?productId=${productId}&sizeId=${sizeId}`);
      
      const data = Array.isArray(response.data) ? response.data : response.data?.content ?? [];
      console.log("✅ Cores carregadas:", data);
      
      return data.map((item: any) => ({
        id: Number(item.id) || null,
        productId: Number(item.productId) || productId,
        sizeId: Number(item.sizeId) || sizeId,
        colorId: Number(item.colorId) || 0,
        stock: Number(item.stock) || 0,
        salePrice: Number(item.salePrice) || 0,
        costPrice: Number(item.costPrice) || 0,
        minimumStock: Number(item.minimumStock) || 0,
        active: item.active !== false,
        productName: item.productName || "",
        sizeName: item.sizeName || "",
        colorName: item.colorName || ""
      }));
    } catch (error) {
      console.error("❌ Erro ao carregar cores:", error);
      throw error;
    }
  }

  static async save(productSizeColor: Partial<ProductSizeColor>): Promise<ProductSizeColor> {
    try {
      console.log("💾 Salvando cor do produto:", productSizeColor);
      
      const payload = {
        productId: productSizeColor.productId,
        sizeId: productSizeColor.sizeId,
        colorId: productSizeColor.colorId,
        stock: productSizeColor.stock || 0,
        salePrice: productSizeColor.salePrice || 0,
        costPrice: productSizeColor.costPrice || 0,
        minimumStock: productSizeColor.minimumStock || 0,
        active: productSizeColor.active !== false
      };

      const url = productSizeColor.id 
        ? `/stock/product-size-colors/${productSizeColor.id}` 
        : "/stock/product-size-colors";
      
      const response = productSizeColor.id 
        ? await api.put(url, payload)
        : await api.post(url, payload);
      
      console.log("✅ Cor salva:", response.data);
      
      return {
        id: Number(response.data.id),
        productId: Number(response.data.productId),
        sizeId: Number(response.data.sizeId),
        colorId: Number(response.data.colorId),
        stock: Number(response.data.stock),
        salePrice: Number(response.data.salePrice),
        costPrice: Number(response.data.costPrice),
        minimumStock: Number(response.data.minimumStock),
        active: response.data.active !== false,
        productName: response.data.productName || "",
        sizeName: response.data.sizeName || "",
        colorName: response.data.colorName || ""
      };
    } catch (error) {
      console.error("❌ Erro ao salvar cor:", error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      console.log("🗑️ Deletando cor:", id);
      await api.delete(`/stock/product-size-colors/${id}`);
      console.log("✅ Cor deletada");
    } catch (error) {
      console.error("❌ Erro ao deletar cor:", error);
      throw error;
    }
  }

  static async getStats(productId?: number): Promise<ProductSizeColorStats> {
    try {
      console.log("📊 Carregando estatísticas de estoque");
      const url = productId 
        ? `/stock/product-size-colors/statistics?productId=${productId}`
        : "/stock/product-size-colors/statistics";
      
      const response = await api.get(url);
      console.log("✅ Estatísticas carregadas:", response.data);
      
      return {
        totalItems: Number(response.data.totalItems) || 0,
        totalStock: Number(response.data.totalStock) || 0,
        totalValue: Number(response.data.totalValue) || 0,
        lowStockCount: Number(response.data.lowStockCount) || 0
      };
    } catch (error) {
      console.error("❌ Erro ao carregar estatísticas:", error);
      throw error;
    }
  }

  static async validateStockConsistency(productId: number, sizeId: number, colors: ProductSizeColor[]): Promise<{ valid: boolean; message?: string }> {
    try {
      // Calcular total de estoque das cores
      const colorStockTotal = colors.reduce((sum, color) => sum + (color.stock || 0), 0);
      
      // Buscar estoque do tamanho
      const sizeResponse = await api.get(`/product-sizes/${sizeId}`);
      const sizeStock = Number(sizeResponse.data.stock) || 0;
      
      if (colorStockTotal > sizeStock) {
        return {
          valid: false,
          message: `Estoque das cores (${colorStockTotal}) não pode ser maior que o estoque do tamanho (${sizeStock})`
        };
      }
      
      return { valid: true };
    } catch (error) {
      console.error("❌ Erro ao validar consistência:", error);
      return { valid: true }; // Em caso de erro, permite continuar
    }
  }
}