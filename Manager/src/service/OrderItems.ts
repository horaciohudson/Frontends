// src/services/orderItems.ts
import api from "./api";
import {
  OrderItemDTO, OrderItemCommissionDTO, OrderItemContextDTO, OrderItemDiscountDTO,
  UUID
} from "../models";

export async function listOrderItems(orderId: UUID) {
  const { data } = await api.get(`/orders/${orderId}/items`);
  return data as OrderItemDTO[];
}
export async function getOrderItem(id: UUID) {
  const { data } = await api.get(`/order-items/${id}`);
  return data as OrderItemDTO;
}
export async function createOrderItem(dto: OrderItemDTO) {
  const { data } = await api.post(`/orders/${dto.orderId}/items`, dto);
  return data as OrderItemDTO;
}
export async function updateOrderItem(id: UUID, dto: OrderItemDTO) {
  const { data } = await api.put(`/order-items/${id}`, dto);
  return data as OrderItemDTO;
}
export async function deleteOrderItem(id: UUID) {
  await api.delete(`/order-items/${id}`);
}

// Sub-recursos 1:1 do item (MapsId)
export async function getItemCommission(orderItemId: UUID) {
  const { data } = await api.get(`/order-items/${orderItemId}/commission`);
  return data as OrderItemCommissionDTO;
}
export async function upsertItemCommission(orderItemId: UUID, dto: OrderItemCommissionDTO) {
  const { data } = await api.put(`/order-items/${orderItemId}/commission`, dto);
  return data as OrderItemCommissionDTO;
}
export async function getItemContext(orderItemId: UUID) {
  const { data } = await api.get(`/order-items/${orderItemId}/context`);
  return data as OrderItemContextDTO;
}
export async function upsertItemContext(orderItemId: UUID, dto: OrderItemContextDTO) {
  const { data } = await api.put(`/order-items/${orderItemId}/context`, dto);
  return data as OrderItemContextDTO;
}
export async function getItemDiscount(orderItemId: UUID) {
  const { data } = await api.get(`/order-items/${orderItemId}/discount`);
  return data as OrderItemDiscountDTO;
}
export async function upsertItemDiscount(orderItemId: UUID, dto: OrderItemDiscountDTO) {
  const { data } = await api.put(`/order-items/${orderItemId}/discount`, dto);
  return data as OrderItemDiscountDTO;
}
