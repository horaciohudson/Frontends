import api from "./api";
import { Company } from "../models/Company";

// Temporary mock data for development
const mockCompanies: Company[] = [
  {
    id: 1,
    corporateName: "Company ABC Ltd",
    tradeName: "ABC",
    cnpj: "12.345.678/0001-90",
    stateRegistration: "123456789",
    municipalRegistration: "987654321",
    phone: "(11) 3333-3333",
    mobile: "(11) 99999-9999",
    email: "contact@abc.com.br",
    whatsapp: "(11) 99999-9999",
    issRate: 5.0,
    funruralRate: 2.0,
    manager: "John Manager",
    factory: true,
    currencyId: 1,
    activityId: 1,
    supplierFlag: false,
    customerFlag: false,
    transporterFlag: false,
    version: 1,
  },
  {
    id: 2,
    corporateName: "Commerce XYZ Ltd",
    tradeName: "XYZ",
    cnpj: "98.765.432/0001-10",
    stateRegistration: "987654321",
    municipalRegistration: "123456789",
    phone: "(21) 4444-4444",
    mobile: "(21) 88888-8888",
    email: "contact@xyz.com.br",
    whatsapp: "(21) 88888-8888",
    issRate: 3.0,
    funruralRate: 1.5,
    manager: "Mary Manager",
    factory: false,
    currencyId: 1,
    activityId: 2,
    supplierFlag: false,
    customerFlag: false,
    transporterFlag: false,
    version: 1,
  },
  {
    id: 3,
    corporateName: "Industry DEF Ltd",
    tradeName: "DEF",
    cnpj: "55.666.777/0001-20",
    stateRegistration: "555666777",
    municipalRegistration: "777666555",
    phone: "(31) 5555-5555",
    mobile: "(31) 77777-7777",
    email: "contact@def.com.br",
    whatsapp: "(31) 77777-7777",
    issRate: 4.0,
    funruralRate: 2.5,
    manager: "Peter Manager",
    factory: true,
    currencyId: 1,
    activityId: 3,
    supplierFlag: false,
    customerFlag: false,
    transporterFlag: false,
    version: 1,
  },
];

export async function getCompanies(): Promise<Company[]> {
  try {
    const { data } = await api.get(`/companies`);
    return (data.content || data) as Company[];
  } catch (error) {
    console.warn("Backend endpoint not available, using mock data:", error);
    // Return mock data when endpoint is not available
    return mockCompanies;
  }
}

export async function getCompany(id: number): Promise<Company> {
  try {
    const { data } = await api.get(`/companies/${id}`);
    return data as Company;
  } catch (error) {
    console.warn("Backend endpoint not available, using mock data:", error);
    // Return mock data when endpoint is not available
    const company = mockCompanies.find(c => c.id === id);
    if (!company) {
      throw new Error(`Company with id ${id} not found`);
    }
    return company;
  }
}

export async function createCompany(dto: Company): Promise<Company> {
  try {
    const { data } = await api.post(`/companies`, dto);
    return data as Company;
  } catch (error) {
    console.warn("Backend endpoint not available, simulating creation:", error);
    // Simulate creation with mock data
    const newCompany: Company = {
      ...dto,
      id: Math.max(...mockCompanies.map(c => c.id || 0)) + 1,
      version: 1, // Initial version for new companies
    };
    mockCompanies.push(newCompany);
    return newCompany;
  }
}

export async function updateCompany(id: number, dto: Company): Promise<Company> {
  try {
    const { data } = await api.put(`/companies/${id}`, dto);
    return data as Company;
  } catch (error: any) {
    // Handle specific concurrency error
    if (error.response?.status === 409 || 
        error.response?.data?.message?.includes("updated or deleted by another transaction") ||
        error.response?.data?.message?.includes("version conflict")) {
      console.warn("Concurrency conflict detected:", error.response?.data?.message);
      throw new Error("CONCURRENCY_CONFLICT");
    }
    
    console.warn("Backend endpoint not available, simulating update:", error);
    // Simulate update with mock data
    const index = mockCompanies.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Company with id ${id} not found`);
    }
    
    // Increment version to simulate concurrency control
    const updatedCompany: Company = { 
      ...dto, 
      id: id,
      version: (mockCompanies[index].version || 1) + 1
    };
    mockCompanies[index] = updatedCompany;
    return updatedCompany;
  }
}

export async function deleteCompany(id: number): Promise<void> {
  try {
    await api.delete(`/companies/${id}`);
  } catch (error) {
    console.warn("Backend endpoint not available, simulating deletion:", error);
    // Simulate deletion with mock data
    const index = mockCompanies.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Company with id ${id} not found`);
    }
    mockCompanies.splice(index, 1);
  }
}
