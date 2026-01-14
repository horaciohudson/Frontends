import api from "./api";
import {
  OrderDTO, OrderAddressDTO, OrderContextDTO, OrderFinancialDTO, OrderItemDTO, UUID
} from "../models";

export async function listOrders(params?: { q?: string; page?: number; size?: number; }) {
  const { data } = await api.get("/orders", { params });
  return data as { content: OrderDTO[]; totalElements: number; totalPages: number; number: number; size: number };
}
export async function getOrder(id: UUID) {
  const { data } = await api.get(`/orders/${id}`);
  return data as OrderDTO;
}
export async function createOrder(dto: OrderDTO) {
  const { data } = await api.post("/orders", dto);
  return data as OrderDTO;
}
export async function updateOrder(id: UUID, dto: OrderDTO) {
  const { data } = await api.put(`/orders/${id}`, dto);
  return data as OrderDTO;
}
export async function deleteOrder(id: UUID) {
  await api.delete(`/orders/${id}`);
}

// Sub-recursos (1:1 MapsId)
export async function getOrderAddress(orderId: UUID) {
  const { data } = await api.get(`/orders/${orderId}/address`);
  return data as OrderAddressDTO;
}
export async function upsertOrderAddress(orderId: UUID, dto: OrderAddressDTO) {
  const { data } = await api.put(`/orders/${orderId}/address`, dto);
  return data as OrderAddressDTO;
}

// Funções para listar e deletar addresses
export async function listOrderAddresses(orderId: UUID) {
  const { data } = await api.get(`/orders/${orderId}/address`);
  return data as OrderAddressDTO;
}

export async function deleteOrderAddress(id: UUID) {
  await api.delete(`/orders/${id}/address`);
}

export async function getOrderContext(orderId: UUID) {
  const { data } = await api.get(`/orders/${orderId}/context`);
  return data as OrderContextDTO;
}
export async function upsertOrderContext(orderId: UUID, dto: OrderContextDTO) {
  try {
    console.log("🔍 Service: Upserting context for order:", orderId);
    console.log("🔍 Service: Context data:", dto);
    
    const { data } = await api.put(`/orders/${orderId}/context`, dto);
    console.log("🔍 Service: Upsert response:", data);
    
    return data as OrderContextDTO;
  } catch (error) {
    console.error("🔍 Service: Error in upsertOrderContext:", error);
    throw error;
  }
}

// Funções para listar e deletar contexts
export async function listOrderContexts(orderId: UUID): Promise<OrderContextDTO[]> {
  try {
    console.log("🔍 Service: Calling GET /orders/" + orderId + "/context");
    const { data } = await api.get(`/orders/${orderId}/context`);
    console.log("🔍 Service: Raw response:", data);
    console.log("🔍 Service: Raw response keys:", Object.keys(data || {}));
    console.log("🔍 Service: Raw response stringified:", JSON.stringify(data, null, 2));
    
    // Se for um array, retornar como está
    if (Array.isArray(data)) {
      console.log("🔍 Service: Response is array with", data.length, "items");
      return data as OrderContextDTO[];
    }
    
    // Se for um objeto com content (paginação)
    if (data && data.content && Array.isArray(data.content)) {
      console.log("🔍 Service: Response is paginated with", data.content.length, "items");
      return data.content as OrderContextDTO[];
    }
    
    // Se for um único objeto
    if (data && data.orderId) {
      console.log("🔍 Service: Response is single object");
      return [data] as OrderContextDTO[];
    }
    
    // Se não houver dados
    console.log("🔍 Service: No data found");
    return [] as OrderContextDTO[];
  } catch (error) {
    console.error("🔍 Service: Error in listOrderContexts:", error);
    throw error;
  }
}

export async function deleteOrderContext(orderId: UUID) {
  try {
    console.log("🔍 Service: Deleting context for order:", orderId);
    await api.delete(`/orders/${orderId}/context`);
    console.log("🔍 Service: Context deleted successfully");
  } catch (error) {
    console.error("🔍 Service: Error deleting context:", error);
    throw error;
  }
}
export async function getOrderFinancial(orderId: UUID) {
  const { data } = await api.get(`/orders/${orderId}/financial`);
  return data as OrderFinancialDTO;
}
export async function upsertOrderFinancial(orderId: UUID, dto: OrderFinancialDTO) {
  try {
    console.log("🔍 Service: Upserting financial for order:", orderId);
    console.log("🔍 Service: Financial data being sent:", dto);
    console.log("🔍 Service: Financial data keys:", Object.keys(dto));
    
    const { data } = await api.put(`/orders/${orderId}/financial`, dto);
    console.log("🔍 Service: Upsert response:", data);
    console.log("🔍 Service: Response keys:", Object.keys(data || {}));
    console.log("🔍 Service: Response stringified:", JSON.stringify(data, null, 2));
    
    return data as OrderFinancialDTO;
  } catch (error) {
    console.error("🔍 Service: Error in upsertOrderFinancial:", error);
    throw error;
  }
}

// Funções para listar e deletar financials
export async function listOrderFinancials(orderId: UUID): Promise<OrderFinancialDTO[]> {
  try {
    console.log("🔍 Service: Calling GET /orders/" + orderId + "/financial");
    const { data } = await api.get(`/orders/${orderId}/financial`);
    console.log("🔍 Service: Raw response:", data);
    console.log("🔍 Service: Raw response keys:", Object.keys(data || {}));
    console.log("🔍 Service: Raw response stringified:", JSON.stringify(data, null, 2));
    
    // Se for um array, retornar como está
    if (Array.isArray(data)) {
      console.log("🔍 Service: Response is array with", data.length, "items");
      return data as OrderFinancialDTO[];
    }
    
    // Se for um objeto com content (paginação)
    if (data && data.content && Array.isArray(data.content)) {
      console.log("🔍 Service: Response is paginated with", data.content.length, "items");
      return data.content as OrderFinancialDTO[];
    }
    
    // Se for um único objeto
    if (data && data.orderId) {
      console.log("🔍 Service: Response is single object");
      return [data] as OrderFinancialDTO[];
    }
    
    // Se não houver dados
    console.log("🔍 Service: No data found");
    return [] as OrderFinancialDTO[];
  } catch (error) {
    console.error("🔍 Service: Error in listOrderFinancials:", error);
    throw error;
  }
}

export async function deleteOrderFinancial(orderId: UUID) {
  try {
    console.log("🔍 Service: Deleting financial for order:", orderId);
    await api.delete(`/orders/${orderId}/financial`);
    console.log("🔍 Service: Financial deleted successfully");
  } catch (error) {
    console.error("🔍 Service: Error deleting financial:", error);
    throw error;
  }
}

// Funções para OrderItems
export async function getOrderItems(orderId: UUID) {
  const { data } = await api.get(`/orders/${orderId}/items`);
  return data as OrderItemDTO[];
}

export async function upsertOrderItem(orderId: UUID, dto: OrderItemDTO) {
  // Use POST for new items (no id), PUT for updates (has id)
  console.log('🔍 upsertOrderItem - dto:', dto);
  console.log('🔍 upsertOrderItem - dto.id:', dto.id);
  console.log('🔍 upsertOrderItem - totalValue:', dto.totalValue);
  console.log('🔍 upsertOrderItem - usando:', dto.id ? 'PUT' : 'POST');

  try {
    let data;
    if (dto.id) {
      console.log('📤 Sending PUT request to:', `/orders/${orderId}/items/${dto.id}`);
      const response = await api.put(`/orders/${orderId}/items/${dto.id}`, dto);
      data = response.data;
    } else {
      console.log('📤 Sending POST request to:', `/orders/${orderId}/items`);
      const response = await api.post(`/orders/${orderId}/items`, dto);
      data = response.data;
    }
    
    console.log('📥 Backend response:', data);
    console.log('💰 Backend returned totalValue:', data?.totalValue);
    
    return data as OrderItemDTO;
  } catch (error) {
    console.error('❌ Error in upsertOrderItem:', error);
    throw error;
  }
}

export async function listOrderItems(orderId: UUID) {
  try {
    console.log('🔍 listOrderItems - orderId:', orderId);
    const { data } = await api.get(`/orders/${orderId}/items`);
    console.log('🔍 listOrderItems - response:', data);
    
    // Se for um array, retornar como está
    if (Array.isArray(data)) {
      return data as OrderItemDTO[];
    }
    
    // Se for um objeto com content (paginação)
    if (data && data.content && Array.isArray(data.content)) {
      return data.content as OrderItemDTO[];
    }
    
    // Se não houver dados
    return [] as OrderItemDTO[];
  } catch (error) {
    console.error('❌ Error in listOrderItems:', error);
    throw error;
  }
}

export async function deleteOrderItem(orderId: UUID, itemId: UUID) {
  console.log('🗑️ deleteOrderItem - orderId:', orderId, 'itemId:', itemId);
  await api.delete(`/orders/${orderId}/items/${itemId}`);
}
