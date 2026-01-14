import api from "./api";
import { Group } from "../models/Group";

export async function getGroups(): Promise<Group[]> {
  console.log("🔍 Carregando grupos da API...");
  
  const response = await api.get(`/groups`);
  console.log("📦 Resposta da API grupos:", response.data);
  
  // Verificar se os dados estão em uma propriedade específica (paginação)
  let groupsData = response.data;
  
  // Se os dados estiverem em uma propriedade como 'content' (Spring Data Page)
  if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    if (response.data.content && Array.isArray(response.data.content)) {
      groupsData = response.data.content;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      groupsData = response.data.data;
    } else if (response.data.items && Array.isArray(response.data.items)) {
      groupsData = response.data.items;
    }
  }
  
  console.log("✅ Grupos carregados:", groupsData);
  return groupsData as Group[];
}

export async function getGroup(id: number): Promise<Group> {
  console.log(`🔍 Buscando grupo ID ${id}...`);
  
  const { data } = await api.get(`/groups/${id}`);
  console.log("📦 Grupo encontrado:", data);
  
  return data as Group;
}

export async function createGroup(group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>): Promise<Group> {
  console.log("🔍 Criando novo grupo:", group);
  
  const { data } = await api.post(`/groups`, group);
  console.log("✅ Grupo criado:", data);
  
  return data as Group;
}

export async function updateGroup(id: number, group: Partial<Group>): Promise<Group> {
  console.log(`🔍 Atualizando grupo ID ${id}:`, group);
  
  const { data } = await api.put(`/groups/${id}`, group);
  console.log("✅ Grupo atualizado:", data);
  
  return data as Group;
}

export async function deleteGroup(id: number): Promise<void> {
  console.log(`🔍 Deletando grupo ID ${id}...`);
  
  await api.delete(`/groups/${id}`);
  console.log("✅ Grupo deletado com sucesso");
}

export async function searchGroups(name: string): Promise<Group[]> {
  console.log(`🔍 Buscando grupos com nome: ${name}`);
  
  const response = await api.get(`/groups?name=${encodeURIComponent(name)}`);
  
  let groupsData = response.data;
  if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    if (response.data.content && Array.isArray(response.data.content)) {
      groupsData = response.data.content;
    }
  }
  
  console.log("📦 Grupos encontrados:", groupsData);
  return groupsData as Group[];
}