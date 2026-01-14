import api from "./api";
import { apiNoPrefix } from "./api";
import { CustomerPhoto } from "../models/CustomerPhoto";

export async function getCustomerPhoto(customerId: string): Promise<CustomerPhoto | null> {
  try {
    console.log("🔍 Service: Getting photo for customer:", customerId);
    const { data } = await apiNoPrefix.get(`/api/customer-photos/customer/${customerId}`);
    console.log("✅ Service: Photo data received:", data);
    return data as CustomerPhoto;
  } catch (error: any) {
    console.error("❌ Service: Error getting photo:", error);
    
    // Tratar especificamente o erro "Photo not found" do backend
    if (error.response?.status === 404 || 
        error.response?.data?.message?.includes?.("Photo not found") ||
        error.response?.data?.includes?.("Photo not found") ||
        error.message?.includes?.("Photo not found")) {
      console.log("ℹ️ Service: No photo found for customer - this is normal for new customers");
      return null; // No photo found for this customer
    }
    
    // Para outros erros, re-throw para tratamento no componente
    throw error;
  }
}

export async function createCustomerPhoto(customerId: string, file: File): Promise<CustomerPhoto> {
  try {
    console.log("🔍 Service: Creating photo for customer:", customerId, "File:", file.name);
    const formData = new FormData();
    formData.append("customerId", customerId);
    formData.append("photo", file);

    const { data } = await apiNoPrefix.post(`/api/customer-photos`, formData);
    console.log("✅ Service: Photo created successfully:", data);
    return data as CustomerPhoto;
  } catch (error: any) {
    console.error("❌ Service: Error creating photo:", error);
    throw error;
  }
}

export async function updateCustomerPhoto(customerId: string, file: File): Promise<CustomerPhoto> {
  try {
    console.log("🔍 Service: Updating photo for customer:", customerId, "File:", file.name);
    const formData = new FormData();
    formData.append("customerId", customerId);
    formData.append("photo", file);

    const { data } = await apiNoPrefix.put(`/api/customer-photos`, formData);
    console.log("✅ Service: Photo updated successfully:", data);
    return data as CustomerPhoto;
  } catch (error: any) {
    console.error("❌ Service: Error updating photo:", error);
    throw error;
  }
}

export async function deleteCustomerPhoto(photoId: number): Promise<void> {
  try {
    console.log("🔍 Service: Deleting photo with ID:", photoId);
    await apiNoPrefix.delete(`/api/customer-photos/${photoId}`);
    console.log("✅ Service: Photo deleted successfully");
  } catch (error: any) {
    console.error("❌ Service: Error deleting photo:", error);
    throw error;
  }
}

