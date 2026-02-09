import { Customer } from './Customer';
import { SalesPerson } from './SalesPerson';
import { SaleItem } from './SaleItem';

export type SaleStatus = 'OPEN' | 'CONFIRMED' | 'BILLED' | 'CLOSED' | 'CANCELED';

export type SaleType = 'RETAIL' | 'WHOLESALE';

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
    type?: SaleType;
    finalized: boolean;
    moved: boolean;
    totalItems: number;
    createdDate: string;
    updatedDate?: string;
    movementDate?: string;
    financial?: SaleFinancial;
    address?: SaleAddress;
    transport?: SaleTransport;
    context?: SalesContext;
    // NFe Information
    nfeNumber?: number;
    nfeStatus?: string; // 'PENDING' | 'AUTHORIZED' | 'REJECTED' | 'FAILED'
    nfeErrorMessage?: string;
    nfeEmissionDate?: string;
}

// DTO for creating/updating sales
export interface SaleCreateDTO {
    customerId: string;
    salespersonId: string;  // UUID
    type?: SaleType;
    items: SaleItemDTO[];
    financial?: SaleFinancial;
    address?: SaleAddress;
    transport?: SaleTransport;
    context?: SalesContext;
}

export interface SaleItemDTO {
    itemNumber: number;
    productId: string;  // UUID
    variantId?: string;
    sizeId?: string;
    colorId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    unit: string;
    size?: string;
    sizeName?: string;
    colorName?: string;
    weight?: number;
    status?: string;
}

export interface SaleFinancial {
    paymentMethod: string;
    amountPaid: number;
    changeAmount?: number;
    discountAmount?: number;
    discountPercentage?: number;
    surchargeAmount?: number;
    surchargePercentage?: number;
    financialCharges?: number;
    bankCode?: string;
    bankName?: string;
    agencyCode?: string;
    agencyName?: string;
    account?: string;
    currentAccount?: string;
    checkNumber?: string;
    creditAmount?: number;
    additionalDiscount?: number;
    additionalDiscountAmount?: number;
    funruralPercentage?: number;
    funruralAmount?: number;
}

export interface SaleAddress {
    type: string; // 'DELIVERY' | 'BILLING'
    freightValue?: number;
    freightIcms?: number;
    departureDate?: string;
    departureTime?: string;
    freightAccount?: string;
    // Address Details
    street?: string;
    number?: string;
    district?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}

export interface SaleTransport {
    carrierId?: string;
}

export interface SalesContext {
    agreementCode?: string;
    clientRegion?: string;
    clientName?: string;
    promotionTable?: number;
    printedOrder?: string;
    manifestoFrom?: string;
    billingMonth?: number;
    billingYear?: number;
    cashControl?: number;
    counter?: string;
    inTransit?: string;
    consigned?: string;
    wholesale?: string;
    priceTable?: string;
}

