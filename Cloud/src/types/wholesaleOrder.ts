export enum WholesaleOrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    RETURNED = 'RETURNED'
}

export enum WholesaleOrderType {
    NORMAL = 'NORMAL',
    CONSIGNMENT = 'CONSIGNMENT',
    SAMPLE = 'SAMPLE'
}

export interface WholesaleOrder {
    id: number;
    orderNumber: string;
    wholesalerId: number;
    wholesalerName: string;
    orderDate: string;
    status: WholesaleOrderStatus;
    orderType: WholesaleOrderType;
    totalItems: number;
    totalQuantity: number;
    subtotal: number;
    discount: number;
    shippingCost: number;
    totalAmount: number;
    paymentMethod?: string;
    paymentStatus?: string;
    deliveryAddress?: string;
    estimatedDelivery?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface WholesaleOrderItem {
    id: number;
    productId: number;
    productName: string;
    productSku: string;
    variantId?: number;
    size?: string;
    color?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    discount: number;
    total: number;
}

export interface WholesaleOrderDetail extends WholesaleOrder {
    items: WholesaleOrderItem[];
    wholesalerEmail?: string;
    wholesalerPhone?: string;
    shippingAddress?: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
    };
}
