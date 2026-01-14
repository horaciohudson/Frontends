import api from "./api";
import { FiscalCode } from "../models/FiscalCode";

// Dados mock temporários para desenvolvimento
const mockFiscalCodes: FiscalCode[] = [
  {
    id: 1,
    cfop: "5101",
    name: "Venda de produção do estabelecimento",
    control: "Controle 1",
    icmsCalc: "18",
    outOfEstablishment: "N",
    funruralCalc: "0",
    ipiCalc: "0",
    sicmCalc: "0",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: 2,
    cfop: "5102",
    name: "Venda de mercadoria adquirida ou recebida de terceiros",
    control: "Controle 2",
    icmsCalc: "18",
    outOfEstablishment: "N",
    funruralCalc: "0",
    ipiCalc: "0",
    sicmCalc: "0",
    createdAt: "2024-01-01T11:00:00Z",
    updatedAt: "2024-01-01T11:00:00Z",
  },
];

export async function getFiscalCodes(): Promise<FiscalCode[]> {
  try {
    const response = await api.get(`/fiscal-codes`);
    
    // Verificar se os dados estão em uma propriedade específica (paginação)
    let fiscalCodesData = response.data;
    
    // Se os dados estiverem em uma propriedade como 'content' (Spring Data Page)
    if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
      if (response.data.content && Array.isArray(response.data.content)) {
        fiscalCodesData = response.data.content;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        fiscalCodesData = response.data.data;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        fiscalCodesData = response.data.items;
      }
    }
    
    return fiscalCodesData as FiscalCode[];
  } catch (error: unknown) {
    console.warn("Backend endpoint not available, using mock data:", error);
    return mockFiscalCodes;
  }
}

export async function getFiscalCode(id: number): Promise<FiscalCode> {
  try {
    const { data } = await api.get(`/fiscal-codes/${id}`);
    return data as FiscalCode;
  } catch (error: unknown) {
    console.warn("Backend endpoint not available, using mock data:", error);
    // Retorna dados mock quando o endpoint não estiver disponível
    const fiscalCode = mockFiscalCodes.find(fc => fc.id === id);
    if (!fiscalCode) {
      throw new Error(`FiscalCode with id ${id} not found`);
    }
    return fiscalCode;
  }
}

export async function createFiscalCode(fiscalCode: Omit<FiscalCode, 'id' | 'createdAt' | 'updatedAt'>): Promise<FiscalCode> {
  try {
    const { data } = await api.post(`/fiscal-codes`, fiscalCode);
    return data as FiscalCode;
  } catch (error: unknown) {
    console.warn("Backend endpoint not available, simulating creation:", error);
    // Simula criação com dados mock
    const newFiscalCode: FiscalCode = {
      ...fiscalCode,
      id: Math.max(...mockFiscalCodes.map(fc => fc.id || 0)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockFiscalCodes.push(newFiscalCode);
    return newFiscalCode;
  }
}

export async function updateFiscalCode(id: number, fiscalCode: Partial<FiscalCode>): Promise<FiscalCode> {
  try {
    const { data } = await api.put(`/fiscal-codes/${id}`, fiscalCode);
    return data as FiscalCode;
  } catch (error: unknown) {
    console.warn("Backend endpoint not available, simulating update:", error);
    // Simula atualização com dados mock
    const index = mockFiscalCodes.findIndex(fc => fc.id === id);
    if (index === -1) {
      throw new Error(`FiscalCode with id ${id} not found`);
    }
    const updatedFiscalCode = { 
      ...mockFiscalCodes[index], 
      ...fiscalCode, 
      id,
      updatedAt: new Date().toISOString()
    };
    mockFiscalCodes[index] = updatedFiscalCode;
    return updatedFiscalCode;
  }
}

export async function deleteFiscalCode(id: number): Promise<void> {
  try {
    await api.delete(`/fiscal-codes/${id}`);
  } catch (error: unknown) {
    console.warn("Backend endpoint not available, simulating deletion:", error);
    // Simula exclusão com dados mock
    const index = mockFiscalCodes.findIndex(fc => fc.id === id);
    if (index === -1) {
      throw new Error(`FiscalCode with id ${id} not found`);
    }
    mockFiscalCodes.splice(index, 1);
  }
}

export async function searchFiscalCodes(name: string): Promise<FiscalCode[]> {
  try {
    const response = await api.get(`/fiscal-codes?name=${encodeURIComponent(name)}`);
    
    let fiscalCodesData = response.data;
    if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
      if (response.data.content && Array.isArray(response.data.content)) {
        fiscalCodesData = response.data.content;
      }
    }
    
    return fiscalCodesData as FiscalCode[];
  } catch (error: unknown) {
    console.warn("Backend endpoint not available, using mock data:", error);
    return mockFiscalCodes.filter(fiscalCode => 
      fiscalCode.name.toLowerCase().includes(name.toLowerCase()) ||
      fiscalCode.cfop.toLowerCase().includes(name.toLowerCase())
    );
  }
}