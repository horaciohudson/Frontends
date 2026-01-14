import { ProductColor } from "../models/ProductColor";

const API_BASE_URL = "/api/product-colors";

// Mock data para desenvolvimento offline
const mockProductColors: ProductColor[] = [
  { id: 1, name: "Branco", createdAt: "2024-01-01T00:00:00", updatedAt: "2024-01-01T00:00:00" },
  { id: 2, name: "Preto", createdAt: "2024-01-01T00:00:00", updatedAt: "2024-01-01T00:00:00" },
  { id: 3, name: "Azul", createdAt: "2024-01-01T00:00:00", updatedAt: "2024-01-01T00:00:00" },
  { id: 4, name: "Vermelho", createdAt: "2024-01-01T00:00:00", updatedAt: "2024-01-01T00:00:00" },
  { id: 5, name: "Verde", createdAt: "2024-01-01T00:00:00", updatedAt: "2024-01-01T00:00:00" },
  { id: 6, name: "Amarelo", createdAt: "2024-01-01T00:00:00", updatedAt: "2024-01-01T00:00:00" },
  { id: 7, name: "Rosa", createdAt: "2024-01-01T00:00:00", updatedAt: "2024-01-01T00:00:00" },
  { id: 8, name: "Roxo", createdAt: "2024-01-01T00:00:00", updatedAt: "2024-01-01T00:00:00" },
  { id: 9, name: "Laranja", createdAt: "2024-01-01T00:00:00", updatedAt: "2024-01-01T00:00:00" },
  { id: 10, name: "Cinza", createdAt: "2024-01-01T00:00:00", updatedAt: "2024-01-01T00:00:00" }
];

export class ProductColorService {
  
  static async getAll(): Promise<ProductColor[]> {
    try {
      console.log("🎨 ProductColorService.getAll() - Buscando cores...");
      
      const response = await fetch(API_BASE_URL);
      
      if (!response.ok) {
        console.warn("⚠️ API indisponível, usando dados mock");
        return mockProductColors;
      }
      
      const data = await response.json();
      console.log("✅ Cores carregadas da API:", data);
      
      // Verificar se é paginado (Spring Data)
      if (data.content && Array.isArray(data.content)) {
        return data.content;
      }
      
      return Array.isArray(data) ? data : mockProductColors;
      
    } catch (error) {
      console.error("❌ Erro ao buscar cores:", error);
      console.log("🔄 Usando dados mock como fallback");
      return mockProductColors;
    }
  }

  static async getById(id: number): Promise<ProductColor | null> {
    try {
      console.log(`🔍 ProductColorService.getById(${id})`);
      
      const response = await fetch(`${API_BASE_URL}/${id}`);
      
      if (!response.ok) {
        const mockColor = mockProductColors.find(c => c.id === id);
        console.warn("⚠️ API indisponível, usando mock:", mockColor);
        return mockColor || null;
      }
      
      const data = await response.json();
      console.log("✅ Cor encontrada:", data);
      return data;
      
    } catch (error) {
      console.error("❌ Erro ao buscar cor:", error);
      const mockColor = mockProductColors.find(c => c.id === id);
      return mockColor || null;
    }
  }

  static async create(productColor: Omit<ProductColor, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductColor> {
    try {
      console.log("➕ ProductColorService.create():", productColor);
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productColor),
      });
      
      if (!response.ok) {
        // Simular criação com mock
        const newId = Math.max(...mockProductColors.map(c => c.id || 0)) + 1;
        const newColor: ProductColor = {
          ...productColor,
          id: newId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        mockProductColors.push(newColor);
        console.warn("⚠️ API indisponível, simulando criação:", newColor);
        return newColor;
      }
      
      const data = await response.json();
      console.log("✅ Cor criada:", data);
      return data;
      
    } catch (error) {
      console.error("❌ Erro ao criar cor:", error);
      throw error;
    }
  }

  static async update(id: number, productColor: Partial<ProductColor>): Promise<ProductColor> {
    try {
      console.log(`📝 ProductColorService.update(${id}):`, productColor);
      
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productColor),
      });
      
      if (!response.ok) {
        // Simular atualização com mock
        const index = mockProductColors.findIndex(c => c.id === id);
        if (index !== -1) {
          mockProductColors[index] = { 
            ...mockProductColors[index], 
            ...productColor,
            updatedAt: new Date().toISOString()
          };
          console.warn("⚠️ API indisponível, simulando atualização:", mockProductColors[index]);
          return mockProductColors[index];
        }
        throw new Error("Cor não encontrada");
      }
      
      const data = await response.json();
      console.log("✅ Cor atualizada:", data);
      return data;
      
    } catch (error) {
      console.error("❌ Erro ao atualizar cor:", error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      console.log(`🗑️ ProductColorService.delete(${id})`);
      
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        // Simular exclusão com mock
        const index = mockProductColors.findIndex(c => c.id === id);
        if (index !== -1) {
          mockProductColors.splice(index, 1);
          console.warn("⚠️ API indisponível, simulando exclusão");
          return;
        }
        throw new Error("Cor não encontrada");
      }
      
      console.log("✅ Cor excluída com sucesso");
      
    } catch (error) {
      console.error("❌ Erro ao excluir cor:", error);
      throw error;
    }
  }
}