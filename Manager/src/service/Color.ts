import { Color } from "../models/Color";
import api from "./api";

export class ColorService {
  
  static async getAll(sizeId?: string): Promise<Color[]> {
    try {
      console.log("🎨 ColorService.getAll() - sizeId:", sizeId);
      
      const url = sizeId ? `/colors?sizeId=${sizeId}` : "/colors";
      const response = await api.get(url);
      
      console.log("✅ Cores carregadas da API:", response.data);
      
      // Verificar se é paginado (Spring Data)
      if (response.data.content && Array.isArray(response.data.content)) {
        return response.data.content;
      }
      
      return Array.isArray(response.data) ? response.data : [];
      
    } catch (error) {
      console.error("❌ Erro ao buscar cores:", error);
      console.error("❌ Detalhes do erro:", error.response?.data || error.message);
      throw error; // Propagar erro em vez de usar mock
    }
  }

  static async getBySize(sizeId: string): Promise<Color[]> {
    try {
      console.log(`🔍 ColorService.getBySize(${sizeId})`);
      
      const response = await api.get(`/colors/by-size/${sizeId}`);
      
      console.log("✅ Cores por tamanho encontradas:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("❌ Erro ao buscar cores por tamanho:", error);
      throw error;
    }
  }

  static async getGlobalColors(): Promise<Color[]> {
    try {
      console.log("🌍 ColorService.getGlobalColors()");
      
      // Tentar primeiro o endpoint simples para teste
      console.log("🧪 Testando endpoint simples...");
      const simpleResponse = await api.get("/colors/simple");
      console.log("✅ Endpoint simples funcionou:", simpleResponse.data);
      console.log("🔍 Primeira cor simples:", JSON.stringify(simpleResponse.data[0], null, 2));
      
      if (simpleResponse.data && simpleResponse.data.length > 0) {
        return simpleResponse.data;
      }
      
      // Fallback para endpoint normal
      const response = await api.get("/colors/global");
      console.log("✅ Cores globais encontradas:", response.data);
      console.log("🔍 Primeira cor detalhada:", JSON.stringify(response.data[0], null, 2));
      return response.data;
      
    } catch (error) {
      console.error("❌ Erro ao buscar cores globais:", error);
      console.error("❌ Detalhes do erro:", error.response?.data || error.message);
      throw error; // Propagar erro em vez de usar mock
    }
  }

  static async getColorsBySize(sizeId: string): Promise<Color[]> {
    try {
      console.log(`🎯 ColorService.getColorsBySize(${sizeId})`);
      
      const response = await api.get(`/colors/by-size/${sizeId}`);
      
      console.log("✅ Cores específicas do tamanho encontradas:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("❌ Erro ao buscar cores específicas do tamanho:", error);
      console.error("❌ Detalhes do erro:", error.response?.data || error.message);
      throw error; // Propagar erro em vez de usar mock
    }
  }

  static async getById(id: string): Promise<Color | null> {
    try {
      console.log(`🔍 ColorService.getById(${id})`);
      
      const response = await api.get(`/colors/${id}`);
      
      console.log("✅ Cor encontrada:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("❌ Erro ao buscar cor:", error);
      throw error;
    }
  }

  static async create(color: Omit<Color, 'id' | 'createdAt' | 'updatedAt'>): Promise<Color> {
    try {
      console.log("➕ ColorService.create():", color);
      
      const response = await api.post("/colors", color);
      
      console.log("✅ Cor criada:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("❌ Erro ao criar cor:", error);
      throw error;
    }
  }

  static async update(id: string, color: Partial<Color>): Promise<Color> {
    try {
      console.log(`📝 ColorService.update(${id}):`, color);
      
      const response = await api.put(`/colors/${id}`, color);
      
      console.log("✅ Cor atualizada:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("❌ Erro ao atualizar cor:", error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      console.log(`🗑️ ColorService.delete(${id})`);
      
      await api.delete(`/colors/${id}`);
      
      console.log("✅ Cor excluída com sucesso");
      
    } catch (error) {
      console.error("❌ Erro ao excluir cor:", error);
      throw error;
    }
  }
}