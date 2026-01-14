import { Size } from "../models/Size";

const API_BASE_URL = "/api/sizes";

export class SizeService {

  // Helper para mapear dados da API para o modelo frontend
  private static mapFromApi(apiData: any): Size {
    return {
      id: apiData.id || apiData.sizeId,
      sizeName: apiData.sizeName || apiData.size_name || apiData.name,
      name: apiData.sizeName || apiData.size_name || apiData.name, // Alias para compatibilidade
      description: apiData.description,
      active: apiData.active,
      displayOrder: apiData.displayOrder || apiData.display_order,
      createdAt: apiData.createdAt || apiData.created_at,
      updatedAt: apiData.updatedAt || apiData.updated_at,
    };
  }

  // Helper para mapear dados do frontend para a API
  private static mapToApi(frontendData: Partial<Size>): any {
    return {
      sizeName: frontendData.sizeName || frontendData.name,
      description: frontendData.description,
      active: frontendData.active,
      displayOrder: frontendData.displayOrder,
    };
  }
  
  static async getAll(): Promise<Size[]> {
    try {
      console.log("📏 SizeService.getAll() - Buscando tamanhos...");
      
      const response = await fetch(API_BASE_URL);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("✅ Tamanhos carregados da API:", data);
      
      // Verificar se é paginado (Spring Data)
      let rawSizes = data.content && Array.isArray(data.content) ? data.content : 
                    Array.isArray(data) ? data : [];
      
      // Mapear campos da API para o modelo frontend
      const mappedSizes = rawSizes.map(SizeService.mapFromApi);
      console.log("🔄 Tamanhos mapeados:", mappedSizes);
      
      return mappedSizes;
      
    } catch (error) {
      console.error("❌ Erro ao buscar tamanhos:", error);
      throw error;
    }
  }

  static async getById(id: number): Promise<Size | null> {
    try {
      console.log(`🔍 SizeService.getById(${id})`);
      
      const response = await fetch(`${API_BASE_URL}/${id}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("✅ Tamanho encontrado:", data);
      return SizeService.mapFromApi(data);
      
    } catch (error) {
      console.error("❌ Erro ao buscar tamanho:", error);
      throw error;
    }
  }

  static async create(size: Omit<Size, 'id' | 'createdAt' | 'updatedAt'>): Promise<Size> {
    try {
      console.log("➕ SizeService.create():", size);
      
      const payload = SizeService.mapToApi(size);
      console.log("📤 Payload para API:", payload);
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("✅ Tamanho criado:", data);
      return SizeService.mapFromApi(data);
      
    } catch (error) {
      console.error("❌ Erro ao criar tamanho:", error);
      throw error;
    }
  }

  static async update(id: number, size: Partial<Size>): Promise<Size> {
    try {
      console.log(`📝 SizeService.update(${id}):`, size);
      
      const payload = SizeService.mapToApi(size);
      console.log("📤 Payload para API:", payload);
      
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("✅ Tamanho atualizado:", data);
      return SizeService.mapFromApi(data);
      
    } catch (error) {
      console.error("❌ Erro ao atualizar tamanho:", error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      console.log(`🗑️ SizeService.delete(${id})`);
      
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      console.log("✅ Tamanho excluído com sucesso");
      
    } catch (error) {
      console.error("❌ Erro ao excluir tamanho:", error);
      throw error;
    }
  }
}