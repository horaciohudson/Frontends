export interface Size {
    id: number;
    sizeName: string;
    description?: string;
    displayOrder: number;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface SizeRequest {
    sizeName: string;
    description?: string;
    displayOrder?: number;
    active?: boolean;
}
