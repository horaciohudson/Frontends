import { Product } from './Product';

export interface SaleItem {
    id?: string; // UUID
    product: Product;
    itemNumber: number;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    unit: string;
    size?: string;
    weight?: number;
    status?: string;
}
