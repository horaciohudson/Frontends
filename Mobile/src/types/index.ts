// Tipos TypeScript para o app mobile
// Baseado na API do backend SigeveClaud

// ===== USER =====
export interface User {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    roles: string[];
    groups?: string[];
    privileges?: string[];
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

// ===== PRODUCT =====
export interface Product {
    id: number;
    name: string;
    description?: string;
    sku?: string;
    brand?: string;
    model?: string;
    color?: string;
    size?: string;
    material?: string;

    // Preços - nomes compatíveis com o backend
    sellingPrice?: number;
    promotionalPrice?: number;
    currentPrice?: number;
    costPrice?: number;
    isOnSale?: boolean;

    // Aliases para compatibilidade (usados nas telas)
    price?: number;           // Alias para sellingPrice
    discountPrice?: number;   // Alias para promotionalPrice

    // Estoque
    stockQuantity?: number;
    minStockQuantity?: number;
    inStock?: boolean;
    lowStock?: boolean;
    allowBackorder?: boolean;

    // Categoria
    categoryId?: number;
    categoryName?: string;
    subcategoryId?: number;
    subcategoryName?: string;

    // Enums
    productCondition?: 'NEW' | 'USED' | 'REFURBISHED';
    status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

    // Imagens
    primaryImageUrl?: string;
    images?: ProductImage[];

    // Destaque e SEO
    featured?: boolean;
    slug?: string;

    // Estatísticas
    averageRating?: number;
    totalRatings?: number;
    viewCount?: number;
    salesCount?: number;

    // Datas
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductImage {
    id: number;
    imageUrl: string;
    isPrimary: boolean;
    sortOrder: number;
}

// ===== CATEGORY =====
export interface Category {
    id: number;
    name: string;
    description?: string;
    imageUrl?: string;
    subcategories?: Subcategory[];
}

export interface Subcategory {
    id: number;
    name: string;
    description?: string;
    categoryId: number;
}

// ===== CART =====
export interface Cart {
    id: number;
    cartUuid?: string;
    customerId?: number;
    sessionId?: string;
    items: CartItem[];
    subtotal?: number;
    discountAmount?: number;
    totalAmount?: number;
    total: number;  // Alias para totalAmount
    itemCount: number;  // Alias para itemsCount
    itemsCount?: number;
    couponCode?: string;
    expiresAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CartItem {
    id: number;
    product: Product;
    quantity: number;
    price: number;
    subtotal: number;
}

export interface AddToCartRequest {
    productId: number;
    quantity: number;
}

// ===== ADDRESS =====
export interface Address {
    id?: number;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    addressType: 'SHIPPING' | 'BILLING' | 'BOTH';
}

// ===== SALE/ORDER =====
export interface Sale {
    id: number;
    orderNumber: string;
    status: SaleStatus;
    items: SaleItem[];
    address: Address;
    deliveryAddress?: Address; // Endereço de entrega completo
    paymentMethod: PaymentMethod;
    subtotal: number;
    discount: number;
    shippingCost: number;
    total: number;
    createdAt: string;
    updatedAt: string;
}

export interface SaleItem {
    id: number;
    product: Product;
    quantity: number;
    price: number;
    subtotal: number;
}

export type SaleStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED';

export type PaymentMethod =
    | 'PIX'
    | 'BOLETO'
    | 'CREDIT_CARD'
    | 'DEBIT_CARD';

export interface CreateSaleRequest {
    cartId: number;
    deliveryAddressId: number;
    customerNotes?: string;
}


// ===== PAYMENT =====
export interface Payment {
    id: number;
    saleId: number;
    method: PaymentMethod;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
    amount: number;
    createdAt: string;
}

export interface CreatePaymentRequest {
    saleId: number;
    method: PaymentMethod;
    cardNumber?: string;
    cardHolderName?: string;
    cardExpiry?: string;
    cardCvv?: string;
    installments?: number;
}

// ===== REVIEWS =====
export interface Review {
    id: number;
    saleId?: number;
    productId?: number;
    reviewerId: number;
    reviewerName?: string;
    reviewedId?: number;
    reviewType: ReviewType;
    rating: number;
    title?: string;
    comment?: string;

    // Detailed ratings
    qualityRating?: number;
    deliveryRating?: number;
    valueRating?: number;

    // Moderation
    isPublic: boolean;
    isVerified: boolean;
    isApproved: boolean;

    // Response
    response?: string;
    responseBy?: number;
    responseDate?: string;

    photos?: any;
    createdAt: string;
    updatedAt: string;
}

export type ReviewType = 'PRODUCT' | 'SELLER' | 'BUYER';

export interface ReviewRequest {
    saleId?: number;
    productId?: number;
    reviewType: ReviewType;
    rating: number;
    title?: string;
    comment?: string;
    qualityRating?: number;
    deliveryRating?: number;
    valueRating?: number;
}

export interface CreateReviewData {
    productId: number;
    rating: number;
    title: string;
    comment: string;
    qualityRating?: number;
    deliveryRating?: number;
    valueRating?: number;
}

// ===== COUPONS =====
export interface Coupon {
    id: number;
    code: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    minimumOrderValue?: number;
    maximumDiscountAmount?: number;
    usageLimit?: number;
    usagePerCustomer: number;
    usedCount: number;
    validFrom: string;
    validUntil: string;
    applicableCategories?: string;
    applicableProducts?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface ValidateCouponRequest {
    code: string;
    orderValue: number;
}

export interface CouponValidationResult {
    isValid: boolean;
    message: string;
    discountAmount: number;
    finalAmount: number;
    couponCode?: string;
}


// ===== API RESPONSE =====
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

// ===== NAVIGATION =====
export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
};

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    Products: undefined;
    Cart: undefined;
    Profile: undefined;
};

export type HomeStackParamList = {
    HomeScreen: undefined;
    ProductDetail: { productId: number };
};

export type ProductsStackParamList = {
    ProductsScreen: { categoryId?: number; search?: string };
    ProductDetail: { productId: number };
    CreateReview: { productId: number; productName: string };
    Reviews: { productId: number; productName: string };
};

export type CartStackParamList = {
    CartScreen: undefined;
    Checkout: undefined;
    CheckoutSuccess: { orderId: number };
};

export type ProfileStackParamList = {
    ProfileScreen: undefined;
    Orders: undefined;
    OrderDetail: { orderId: number };
    EditProfile: undefined;
};
