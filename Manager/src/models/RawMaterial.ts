export interface RawMaterial {
  idRawMaterial: number | null;
  name: string;
  reference: string | null;
  location: string | null;
  warrantyMonths: number;
  packaging: string | null;
  
  groupId: number;
  groupName: string;
  
  supplierCompanyId: string; // UUID como string
  supplierCompanyName: string;
}

