export interface SalesPerson {
    id: number;
    name: string;
    codeName: string;
    taxId: string;
    profession: string;
    role: string;
    birthDate: string; // LocalDate → string ISO
    user: boolean;
    broker: boolean;
  }
