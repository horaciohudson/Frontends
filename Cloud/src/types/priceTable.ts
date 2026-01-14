export interface PriceTable {
    id: number;
    name: string;
    description?: string;
    defaultDiscountPercentage?: number;
    validFrom?: string;
    validUntil?: string;
    active: boolean;
    isDefault: boolean;
    itemCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface PriceTableItem {
    id: number;
    priceTableId: number;
    productId: number;
    productName: string;
    productSku: string;
    sizeId?: number;
    sizeName?: string;
    colorId?: number;
    colorName?: string;
    price: number;
    discountPercentage?: number;
    retailPrice: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PriceTableFormData {
    name: string;
    description?: string;
    defaultDiscountPercentage?: number;
    validFrom?: string;
    validUntil?: string;
    active?: boolean;
    isDefault?: boolean;
}
