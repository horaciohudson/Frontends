import { UnitType } from './UnitType';

export interface ServiceItem {
  id: number | null;
  serviceId: number | null;
  description: string;
  quantity: string;
  unitType: UnitType;
  unitPrice: string;
  discount: string;
  taxPercentage: string;
  taxValue: string;
}

export interface Service {
  id: number | null;
  name: string;
}

