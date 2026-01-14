import api from "./api";

export interface FlagCompanyOption {
  id: number;
  name: string;
}

export async function listSupplierCompanies(): Promise<FlagCompanyOption[]> {
  const { data } = await api.get("/companies/suppliers"); // endpoint do back
  const arr = Array.isArray(data) ? data : data.content || [];
  return arr.map((c: any) => ({
    id: Number(c.id),
    name: c.tradeName || c.corporateName,
  }));
}
