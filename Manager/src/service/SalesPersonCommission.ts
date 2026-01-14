// src/services/salesPersonCommissions.ts
import api from "./api";
import { SalesPersonCommission } from "../models/SalesPersonCommission";

export async function getCommissionsBySalesperson(salespersonId: number): Promise<SalesPersonCommission[]> {
  try {
    const { data } = await api.get(`/salesperson-commissions/salesperson/${salespersonId}`);
    return data as SalesPersonCommission[];
  } catch (error) {
    console.error("❌ Erro ao buscar comissões do vendedor:", error);
    throw error;
  }
}

export async function getCommissionBySalesperson(salespersonId: number): Promise<SalesPersonCommission | null> {
  try {
    const { data } = await api.get(`/salesperson-commissions/salesperson/${salespersonId}/current`);
    return data as SalesPersonCommission;
  } catch (error) {
    console.error("❌ Erro ao buscar comissão atual do vendedor:", error);
    throw error;
  }
}

export async function createCommission(dto: Omit<SalesPersonCommission, 'id'>): Promise<SalesPersonCommission> {
  try {
    const { data } = await api.post('/salesperson-commissions', dto);
    return data as SalesPersonCommission;
  } catch (error) {
    console.error("❌ Erro ao criar comissão:", error);
    throw error;
  }
}

export async function updateCommission(id: number, dto: Partial<SalesPersonCommission>): Promise<SalesPersonCommission> {
  try {
    const { data } = await api.put(`/salesperson-commissions/${id}`, dto);
    return data as SalesPersonCommission;
  } catch (error) {
    console.error("❌ Erro ao atualizar comissão:", error);
    throw error;
  }
}

export async function deleteCommission(id: number): Promise<void> {
  try {
    await api.delete(`/salesperson-commissions/${id}`);
  } catch (error) {
    console.error("❌ Erro ao deletar comissão:", error);
    throw error;
  }
}

export async function upsertCommission(salespersonId: number, dto: Omit<SalesPersonCommission, 'id' | 'salespersonId'>): Promise<SalesPersonCommission> {
  try {
    const { data } = await api.post(`/salesperson-commissions/salesperson/${salespersonId}/upsert`, dto);
    return data as SalesPersonCommission;
  } catch (error) {
    console.error("❌ Erro ao fazer upsert da comissão:", error);
    throw error;
  }
}

export async function getCommissionById(id: number): Promise<SalesPersonCommission> {
  try {
    const { data } = await api.get(`/salesperson-commissions/${id}`);
    return data as SalesPersonCommission;
  } catch (error) {
    console.error("❌ Erro ao buscar comissão por ID:", error);
    throw error;
  }
}

export async function createCommissionForSalesperson(salespersonId: number, dto: Omit<SalesPersonCommission, 'id' | 'salespersonId'>): Promise<SalesPersonCommission> {
  try {
    const { data } = await api.post(`/salesperson-commissions/salesperson/${salespersonId}`, dto);
    return data as SalesPersonCommission;
  } catch (error) {
    console.error("❌ Erro ao criar comissão para vendedor:", error);
    throw error;
  }
}

export async function updateCommissionForSalesperson(id: number, dto: Partial<SalesPersonCommission>): Promise<SalesPersonCommission> {
  try {
    const { data } = await api.put(`/salesperson-commissions/${id}`, dto);
    return data as SalesPersonCommission;
  } catch (error) {
    console.error("❌ Erro ao atualizar comissão do vendedor:", error);
    throw error;
  }
}