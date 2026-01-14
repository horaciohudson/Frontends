import api from "./api";
import { SalesPerson } from "../models/SalesPerson";

export async function getSalesPersons(): Promise<SalesPerson[]> {
  try {
    const { data } = await api.get(`/sellers`);
    // Tratar paginação do Spring Data
    if (data && typeof data === 'object' && !Array.isArray(data) && data.content) {
      return data.content as SalesPerson[];
    }
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    console.error("❌ Backend endpoint not available:", error);
    return []; // Retorna lista vazia em vez de dados mock
  }
}

export async function getSalesPerson(id: number): Promise<SalesPerson> {
  try {
    const { data } = await api.get(`/sellers/${id}`);
    return data as SalesPerson;
  } catch (error: unknown) {
    console.error("❌ Backend endpoint not available:", error);
    throw new Error(`SalesPerson with id ${id} not found - backend unavailable`);
  }
}

export async function createSalesPerson(dto: SalesPerson): Promise<SalesPerson> {
  try {
    const { data } = await api.post(`/sellers`, dto);
    return data as SalesPerson;
  } catch (error: unknown) {
    console.error("❌ Backend endpoint not available:", error);
    throw new Error("Failed to create sales person - backend unavailable");
  }
}

export async function updateSalesPerson(id: number, dto: SalesPerson): Promise<SalesPerson> {
  try {
    const { data } = await api.put(`/sellers/${id}`, dto);
    return data as SalesPerson;
  } catch (error: unknown) {
    console.error("❌ Backend endpoint not available:", error);
    throw new Error(`Failed to update sales person ${id} - backend unavailable`);
  }
}

export async function deleteSalesPerson(id: number): Promise<void> {
  try {
    await api.delete(`/sellers/${id}`);
  } catch (error: unknown) {
    console.error("❌ Backend endpoint not available:", error);
    throw new Error(`Failed to delete sales person ${id} - backend unavailable`);
  }
}


