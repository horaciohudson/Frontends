import { Customer } from './Customer';
import { SalesPerson } from './SalesPerson';
import { SaleItem } from './SaleItem';

export type SaleStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';

export interface Sale {
    id: string; // UUID
    customer: Customer;
    salesperson: SalesPerson;
    items: SaleItem[];
    status: SaleStatus;
    totalProducts: number;
    totalSale: number;
    salespersonCommission?: number;
    brokerCommission?: number;
    type?: string;
    finalized: boolean;
    moved: boolean;
    totalItems: number;
    createdDate: string;
    updatedDate?: string;
    movementDate?: string;
}

// DTO for creating/updating sales
export interface SaleCreateDTO {
    customerId: string;
    salespersonId: number;
    type?: string;
    items: SaleItemDTO[];
}

export interface SaleItemDTO {
    itemNumber: number;
    productId: number;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    unit: string;
    size?: string;
    weight?: number;
    status?: string;
}
