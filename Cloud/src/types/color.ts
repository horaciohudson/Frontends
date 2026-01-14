export interface Color {
    id: number;
    colorName: string;
    hexCode?: string;
    sizeId?: number;
    sizeName?: string;
    displayOrder: number;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ColorRequest {
    colorName: string;
    hexCode?: string;
    sizeId?: number;
    displayOrder?: number;
    active?: boolean;
}
