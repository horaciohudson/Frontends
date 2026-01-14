export interface ProductVariant {
    id: number;
    productId: number;
    sizeId?: number;
    sizeName?: string;
    colorId?: number;
    colorName?: string;
    colorHex?: string;
    sku: string;
    stockQuantity: number;
    priceOverride?: number;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductVariantRequest {
    sizeId?: number;
    colorId?: number;
    sku?: string;
    stockQuantity: number;
    priceOverride?: number;
    active?: boolean;
}
