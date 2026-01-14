import api from "./api";

export interface ProductCost {
  id?: number;
  productId: number;
  averageCost?: number;
  grossValue?: number;
  netValue?: number;
  acquisitionValue?: number;
  meanValue?: number;
  freightValue?: number;
  ipiValue?: number;
  taxValue?: number;
  commissionValue?: number;
  icmsCreditValue?: number;
  sellerCommission?: number;
  brokerCommission?: number;
  commissionPercentage?: number;
}

export class ProductCostService {
  
  static async getByProductId(productId: number): Promise<ProductCost | null> {
    try {
      console.log(`💰 ProductCostService.getByProductId(${productId})`);
      
      const response = await api.get(`/product-costs?productId=${productId}`);
      console.log("✅ Custos do produto carregados:", response.data);
      
      // A API retorna uma lista, mas como é OneToOne, deve ter apenas um registro
      const costs = Array.isArray(response.data) ? response.data : [response.data];
      
      if (costs.length > 0) {
        return costs[0];
      }
      
      return null;
      
    } catch (error: any) {
      console.error("❌ Erro ao buscar custos do produto:", error);
      
      if (error.response?.status === 404) {
        console.log("ℹ️ Produto não possui custos cadastrados");
        return null;
      }
      
      throw error;
    }
  }

  static async getAll(): Promise<ProductCost[]> {
    try {
      console.log("💰 ProductCostService.getAll()");
      
      const response = await api.get("/product-costs");
      console.log("✅ Todos os custos carregados:", response.data);
      
      return Array.isArray(response.data) ? response.data : [];
      
    } catch (error) {
      console.error("❌ Erro ao buscar todos os custos:", error);
      throw error;
    }
  }

  static async create(cost: Omit<ProductCost, 'id'>): Promise<ProductCost> {
    try {
      console.log("➕ ProductCostService.create():", cost);
      
      const response = await api.post("/product-costs", cost);
      console.log("✅ Custo criado:", response.data);
      
      return response.data;
      
    } catch (error) {
      console.error("❌ Erro ao criar custo:", error);
      throw error;
    }
  }

  static async update(id: number, cost: Partial<ProductCost>): Promise<ProductCost> {
    try {
      console.log(`📝 ProductCostService.update(${id}):`, cost);
      
      const response = await api.put(`/product-costs/${id}`, cost);
      console.log("✅ Custo atualizado:", response.data);
      
      return response.data;
      
    } catch (error) {
      console.error("❌ Erro ao atualizar custo:", error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      console.log(`🗑️ ProductCostService.delete(${id})`);
      
      await api.delete(`/product-costs/${id}`);
      console.log("✅ Custo excluído com sucesso");
      
    } catch (error) {
      console.error("❌ Erro ao excluir custo:", error);
      throw error;
    }
  }
}