import { apiNoPrefix } from "./api";
import { Customer } from "../models/Customer";

export async function getCustomers(): Promise<Customer[]> {
  try {
    console.log("🔄 Fetching customers from /api/customers...");
    console.log("🌐 Base URL:", apiNoPrefix.defaults.baseURL);
    const response = await apiNoPrefix.get(`/api/customers`);
    console.log("📡 Raw API response:", response.data);
    console.log("📡 Response status:", response.status);
    console.log("📡 Response type:", typeof response.data);
    console.log("📡 Is array?", Array.isArray(response.data));

    // Verificar se os dados estão em uma propriedade específica (paginação)
    let customersData = response.data;

    // Se os dados estiverem em uma propriedade como 'content' (Spring Data Page)
    if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
      console.log("📊 Response is object, checking for nested arrays...");
      if (response.data.content && Array.isArray(response.data.content)) {
        console.log("✅ Found content array with", response.data.content.length, "items");
        customersData = response.data.content;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        console.log("✅ Found data array with", response.data.data.length, "items");
        customersData = response.data.data;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        console.log("✅ Found items array with", response.data.items.length, "items");
        customersData = response.data.items;
      } else {
        console.log("❌ No nested array found, using response.data directly");
      }
    }

    console.log("📊 Final customers data:", customersData);
    console.log("📊 Data length:", Array.isArray(customersData) ? customersData.length : "Not an array");

    // Transformar dados para o formato esperado pelo frontend
    const transformedCustomers = Array.isArray(customersData) ? customersData.map((c: any, index: number) => {
      console.log(`🔄 Transforming customer ${index}:`, c);
      return {
        customerId: c.customerId,
        name: c.name,
        email: c.email,
        telephone: c.telephone,
        mobile: c.mobile || "",
        phone: c.telephone // Alias para compatibilidade
      };
    }) : [];

    console.log("🎯 Final transformed customers:", transformedCustomers.length, "items");
    return transformedCustomers as Customer[];
  } catch (error: unknown) {
    console.error("❌ Backend endpoint error:", error);
    return []; // Retorna lista vazia em vez de dados mock
  }
}

export async function getCustomer(id: string): Promise<Customer> {
  try {
    const { data } = await apiNoPrefix.get(`/api/customers/${id}`);
    return {
      customerId: data.customerId,
      name: data.name,
      email: data.email,
      telephone: data.telephone,
      mobile: data.mobile || "",
      phone: data.telephone
    } as Customer;
  } catch (error: unknown) {
    console.error("❌ Backend endpoint not available:", error);
    throw new Error(`Customer with id ${id} not found - backend unavailable`);
  }
}

export async function createCustomer(customer: Omit<Customer, 'customerId' | 'phone'>): Promise<Customer> {
  try {
    console.log("💾 Creating customer:", customer);
    const { data } = await apiNoPrefix.post(`/api/customers`, customer);
    console.log("✅ Customer created:", data);

    return {
      customerId: data.customerId,
      name: data.name,
      email: data.email,
      telephone: data.telephone,
      mobile: data.mobile || "",
      phone: data.telephone
    } as Customer;
  } catch (error: unknown) {
    console.error("❌ Backend endpoint not available:", error);
    throw new Error("Failed to create customer - backend unavailable");
  }
}

export async function updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
  try {
    console.log("🔄 Updating customer:", id, customer);
    const { data } = await apiNoPrefix.put(`/api/customers/${id}`, {
      customerId: id,
      name: customer.name,
      email: customer.email,
      telephone: customer.telephone,
      mobile: customer.mobile
    });
    console.log("✅ Customer updated:", data);

    return {
      customerId: data.customerId,
      name: data.name,
      email: data.email,
      telephone: data.telephone,
      mobile: data.mobile || "",
      phone: data.telephone
    } as Customer;
  } catch (error: unknown) {
    console.error("❌ Backend endpoint not available:", error);
    throw new Error(`Failed to update customer ${id} - backend unavailable`);
  }
}

export async function deleteCustomer(id: string): Promise<void> {
  try {
    console.log("🗑️ Deleting customer:", id);
    await apiNoPrefix.delete(`/api/customers/${id}`);
    console.log("✅ Customer deleted");
  } catch (error: unknown) {
    console.error("❌ Backend endpoint not available:", error);
    throw new Error(`Failed to delete customer ${id} - backend unavailable`);
  }
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  try {
    const response = await apiNoPrefix.get(`/api/customers?search=${encodeURIComponent(query)}`);

    let customersData = response.data;
    if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
      if (response.data.content && Array.isArray(response.data.content)) {
        customersData = response.data.content;
      }
    }

    return Array.isArray(customersData) ? customersData.map((c: any) => ({
      customerId: c.customerId,
      name: c.name,
      email: c.email,
      telephone: c.telephone,
      mobile: c.mobile || "",
      phone: c.telephone
    })) : [];
  } catch (error: unknown) {
    console.error("❌ Backend endpoint not available:", error);
    return []; // Retorna lista vazia em vez de dados mock
  }
}

export async function getCustomerAddresses(customerId: string): Promise<any[]> {
  try {
    const response = await apiNoPrefix.get(`/api/customers/${customerId}/addresses`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer addresses:", error);
    return [];
  }
}