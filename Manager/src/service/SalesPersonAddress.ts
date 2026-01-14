// src/services/salesPersonAddresses.ts
import api from "./api";
import { SalesPersonAddress, AddressType } from "../models/SalesPersonAddress";

// Dados mock temporários para desenvolvimento
const mockAddresses: SalesPersonAddress[] = [
  {
    id: 1,
    salespersonId: 1,
    companyAddressId: 1,
    addressType: "RESIDENTIAL",
    phone: "(11) 99999-9999",
    fax: "(11) 99999-9998",
  },
  {
    id: 2,
    salespersonId: 1,
    companyAddressId: 2,
    addressType: "BUSINESS",
    phone: "(11) 88888-8888",
    fax: "(11) 88888-8887",
  },
  {
    id: 3,
    salespersonId: 2,
    companyAddressId: 3,
    addressType: "RESIDENTIAL",
    phone: "(21) 77777-7777",
    fax: "(21) 77777-7776",
  },
];

export async function getSalesPersonAddresses(salespersonId: number): Promise<SalesPersonAddress[]> {
  try {
    const { data } = await api.get(`/salespersons/${salespersonId}/addresses`);
    return data as SalesPersonAddress[];
  } catch (error) {
    console.warn("Backend endpoint not available, using mock data:", error);
    // Retorna dados mock quando o endpoint não estiver disponível
    return mockAddresses.filter(addr => addr.salespersonId === salespersonId);
  }
}

export async function getSalesPersonAddress(salespersonId: number): Promise<SalesPersonAddress | null> {
  try {
    const { data } = await api.get(`/salespersons/${salespersonId}/address`);
    return data as SalesPersonAddress;
  } catch (error) {
    console.warn("Backend endpoint not available, using mock data:", error);
    // Retorna o primeiro endereço do vendedor quando o endpoint não estiver disponível
    const address = mockAddresses.find(addr => addr.salespersonId === salespersonId);
    return address || null;
  }
}

export async function createSalesPersonAddress(dto: SalesPersonAddress): Promise<SalesPersonAddress> {
  try {
    const { data } = await api.post(`/salespersons/${dto.salespersonId}/addresses`, dto);
    return data as SalesPersonAddress;
  } catch (error) {
    console.warn("Backend endpoint not available, simulating creation:", error);
    // Simula criação com dados mock
    const newAddress: SalesPersonAddress = {
      ...dto,
      id: Math.max(...mockAddresses.map(addr => addr.id)) + 1,
    };
    mockAddresses.push(newAddress);
    return newAddress;
  }
}

export async function updateSalesPersonAddress(id: number, dto: SalesPersonAddress): Promise<SalesPersonAddress> {
  try {
    const { data } = await api.put(`/salespersons/${dto.salespersonId}/addresses/${id}`, dto);
    return data as SalesPersonAddress;
  } catch (error) {
    console.warn("Backend endpoint not available, simulating update:", error);
    // Simula atualização com dados mock
    const index = mockAddresses.findIndex(addr => addr.id === id);
    if (index === -1) {
      throw new Error(`SalesPersonAddress with id ${id} not found`);
    }
    const updatedAddress = { ...dto, id };
    mockAddresses[index] = updatedAddress;
    return updatedAddress;
  }
}

export async function deleteSalesPersonAddress(id: number): Promise<void> {
  try {
    await api.delete(`/salespersons/addresses/${id}`);
  } catch (error) {
    console.warn("Backend endpoint not available, simulating deletion:", error);
    // Simula exclusão com dados mock
    const index = mockAddresses.findIndex(addr => addr.id === id);
    if (index === -1) {
      throw new Error(`SalesPersonAddress with id ${id} not found`);
    }
    mockAddresses.splice(index, 1);
  }
}

export async function upsertSalesPersonAddress(salespersonId: number, dto: SalesPersonAddress): Promise<SalesPersonAddress> {
  try {
    const { data } = await api.put(`/salespersons/${salespersonId}/address`, dto);
    return data as SalesPersonAddress;
  } catch (error) {
    console.warn("Backend endpoint not available, simulating upsert:", error);
    // Simula upsert com dados mock
    const existingIndex = mockAddresses.findIndex(addr => addr.salespersonId === salespersonId);
    if (existingIndex !== -1) {
      // Update
      const updatedAddress = { ...dto, id: mockAddresses[existingIndex].id };
      mockAddresses[existingIndex] = updatedAddress;
      return updatedAddress;
    } else {
      // Create
      const newAddress: SalesPersonAddress = {
        ...dto,
        id: Math.max(...mockAddresses.map(addr => addr.id)) + 1,
      };
      mockAddresses.push(newAddress);
      return newAddress;
    }
  }
}
