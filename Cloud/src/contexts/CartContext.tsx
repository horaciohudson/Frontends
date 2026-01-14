import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { cartAPI, couponsAPI } from '../services/api';
import { useAuth } from './AuthContext';

// Types
interface CartItem {
    id: number;
    productId: number;
    productName: string;
    productSku?: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    availableStock?: number;
}

interface Coupon {
    code: string;
    discount: number;
    type: 'PERCENTAGE' | 'FIXED';
}

interface CartContextType {
    items: CartItem[];
    itemCount: number;
    total: number;
    subtotal: number;
    discount: number;
    loading: boolean;
    cartId: number | null;
    customerId: number | null;
    appliedCoupon: Coupon | null;
    addItem: (productId: number, quantity: number) => Promise<void>;
    removeItem: (itemId: number) => Promise<void>;
    updateQuantity: (itemId: number, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
    applyCoupon: (code: string) => Promise<void>;
    removeCoupon: () => void;
}

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider Component
export function CartProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [cartId, setCartId] = useState<number | null>(null);
    const [customerId, setCustomerId] = useState<number | null>(null);
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

    // Load cart on mount and when auth status changes
    useEffect(() => {
        if (isAuthenticated) {
            refreshCart();
        } else {
            loadCartFromLocalStorage();
        }
    }, [isAuthenticated]);

    // Calculate total items
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    // Calculate subtotal (before discount)
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

    // Calculate discount
    const discount = appliedCoupon
        ? appliedCoupon.type === 'PERCENTAGE'
            ? (subtotal * appliedCoupon.discount) / 100
            : appliedCoupon.discount
        : 0;

    // Calculate total price (after discount)
    const total = Math.max(0, subtotal - discount);

    // Load cart from backend
    const refreshCart = async () => {
        console.log('refreshCart called, isAuthenticated:', isAuthenticated);
        
        if (!isAuthenticated) {
            console.log('User not authenticated, loading from localStorage');
            loadCartFromLocalStorage();
            return;
        }

        try {
            setLoading(true);
            console.log('Fetching cart from backend...');
            const response = await cartAPI.getCart();
            console.log('Cart API response:', response.data);
            console.log('Response structure:', {
                hasData: !!response.data.data,
                dataKeys: response.data.data ? Object.keys(response.data.data) : 'no data',
                fullResponse: response.data
            });
            const cartData = response.data.data;

            if (cartData && cartData.items) {
                console.log('Cart data received:', {
                    id: cartData.id,
                    customerId: cartData.customerId,
                    itemsCount: cartData.items.length
                });
                setItems(cartData.items);
                setCartId(cartData.id);
                setCustomerId(cartData.customerId);
                saveCartToLocalStorage(cartData.items);
            } else {
                console.warn('Cart data is empty or invalid:', cartData);
                console.warn('CartData details:', {
                    cartData: cartData,
                    hasItems: cartData ? !!cartData.items : 'no cartData',
                    itemsValue: cartData ? cartData.items : 'no cartData'
                });
            }
        } catch (error: any) {
            console.error('Error loading cart:', error);
            console.error('Error response:', error.response);
            
            // If 403 Forbidden, user session is invalid - logout
            if (error.response?.status === 403) {
                console.error('Session invalid (403), user needs to login again');
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return;
            }
            
            loadCartFromLocalStorage();
        } finally {
            setLoading(false);
        }
    };

    // Add item to cart
    const addItem = async (productId: number, quantity: number) => {
        try {
            setLoading(true);
            console.log('CartContext addItem called with:', { productId, quantity });

            if (isAuthenticated) {
                // Add to backend
                console.log('Sending to API:', { productId, quantity });
                await cartAPI.addItem({ productId, quantity });
                await refreshCart();
            } else {
                // Add to localStorage
                const existingItem = items.find(item => item.productId === productId);

                if (existingItem) {
                    // Update quantity
                    const updatedItems = items.map(item =>
                        item.productId === productId
                            ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * item.unitPrice }
                            : item
                    );
                    setItems(updatedItems);
                    saveCartToLocalStorage(updatedItems);
                } else {
                    // This would need product data - in real scenario, fetch product details first
                    console.warn('Adding to cart without auth requires product data');
                }
            }
        } catch (error) {
            console.error('Error adding item to cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Remove item from cart
    const removeItem = async (itemId: number) => {
        try {
            setLoading(true);

            if (isAuthenticated) {
                await cartAPI.removeItem(itemId);
                await refreshCart();
            } else {
                const updatedItems = items.filter(item => item.id !== itemId);
                setItems(updatedItems);
                saveCartToLocalStorage(updatedItems);
            }
        } catch (error) {
            console.error('Error removing item from cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Update item quantity
    const updateQuantity = async (itemId: number, quantity: number) => {
        if (quantity <= 0) {
            await removeItem(itemId);
            return;
        }

        try {
            setLoading(true);

            if (isAuthenticated) {
                await cartAPI.updateItem(itemId, quantity);
                await refreshCart();
            } else {
                const updatedItems = items.map(item =>
                    item.id === itemId
                        ? { ...item, quantity, subtotal: quantity * item.unitPrice }
                        : item
                );
                setItems(updatedItems);
                saveCartToLocalStorage(updatedItems);
            }
        } catch (error) {
            console.error('Error updating item quantity:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Clear cart
    const clearCart = async () => {
        try {
            setLoading(true);

            if (isAuthenticated) {
                await cartAPI.clear();
            }

            setItems([]);
            setAppliedCoupon(null);
            localStorage.removeItem('cart');
            localStorage.removeItem('appliedCoupon');
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Apply coupon
    const applyCoupon = async (code: string) => {
        try {
            setLoading(true);
            const response = await couponsAPI.validate(code);
            const couponData = response.data.data || response.data;

            if (couponData.valid) {
                const coupon: Coupon = {
                    code: code,
                    discount: couponData.discount,
                    type: couponData.type
                };
                setAppliedCoupon(coupon);
                localStorage.setItem('appliedCoupon', JSON.stringify(coupon));
            } else {
                throw new Error('Cupom inválido');
            }
        } catch (error: any) {
            console.error('Error applying coupon:', error);
            throw new Error(error.response?.data?.message || 'Erro ao aplicar cupom');
        } finally {
            setLoading(false);
        }
    };

    // Remove coupon
    const removeCoupon = () => {
        setAppliedCoupon(null);
        localStorage.removeItem('appliedCoupon');
    };

    // Save cart to localStorage
    const saveCartToLocalStorage = (cartItems: CartItem[]) => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    };

    // Load cart from localStorage
    const loadCartFromLocalStorage = () => {
        const cartStr = localStorage.getItem('cart');
        if (cartStr) {
            try {
                const cartData = JSON.parse(cartStr);
                setItems(cartData);
            } catch (error) {
                console.error('Error parsing cart from localStorage:', error);
                setItems([]);
            }
        } else {
            setItems([]);
        }
    };

    const value: CartContextType = {
        items,
        itemCount,
        total,
        subtotal,
        discount,
        loading,
        cartId,
        customerId,
        appliedCoupon,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        refreshCart,
        applyCoupon,
        removeCoupon
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

// Custom hook to use cart context
export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
