export interface ProductVariant {
    id: string;
    productId: string;
    productName?: string;
    sizeId: string;
    sizeName?: string;
    colorId: string;
    colorName?: string;
    colorHex?: string;
    sku?: string;
    stockQuantity: number;
    salePrice?: number;
    costPrice?: number;
    minimumStock?: number;
    active: boolean;
    hasLowStock?: boolean;
    totalValue?: number;
}

export interface ProductVariantRequest {
    sizeId: string;
    colorId: string;
    stockQuantity: number;
    salePrice?: number;
    costPrice?: number;
    minimumStock?: number;
    active?: boolean;
}

export interface ProductVariantResponse {
    data: ProductVariant[];
    total?: number;
    page?: number;
    size?: number;
}