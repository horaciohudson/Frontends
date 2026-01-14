import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

// Types
interface WholesaleCartItem {
    id: number;
    productId: number;
    productName: string;
    productSku: string;
    productImage?: string;
    quantity: number;
    wholesalePrice: number;
    retailPrice: number;
    subtotal: number;
    discountPercentage: number;
    availableStock: number;
    sizeId?: number;
    colorId?: number;
    size?: string;
    color?: string;
    variantDescription?: string;
    isPlaceholder?: boolean;
}

interface VariantQuantity {
    sizeId?: number;
    colorId?: number;
    quantity: number;
}

interface WholesaleCartContextType {
    items: WholesaleCartItem[];
    itemCount: number;
    total: number;
    minimumOrderValue: number;
    meetsMinimumOrder: boolean;
    loading: boolean;
    addItem: (productId: number, quantity: number, sizeId?: number, colorId?: number) => Promise<void>;
    removeItem: (itemId: number) => Promise<void>;
    updateQuantity: (itemId: number, quantity: number) => Promise<void>;
    updateItemPrice: (itemId: number, quantity: number, customPrice?: number) => Promise<void>;
    addMultipleVariants: (productId: number, variants: VariantQuantity[]) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
    getSelectedProductsCount: () => number;
    getTotalPieces: () => number;
}

const WholesaleCartContext = createContext<WholesaleCartContextType | undefined>(undefined);

export function WholesaleCartProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, hasRole } = useAuth();
    const [items, setItems] = useState<WholesaleCartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [minimumOrderValue, setMinimumOrderValue] = useState(500);
    const [meetsMinimumOrder, setMeetsMinimumOrder] = useState(false);

    // Load cart on mount and when auth status changes
    useEffect(() => {
        if (isAuthenticated && hasRole('REVENDA')) {
            refreshCart();
        } else {
            setItems([]);
            setTotal(0);
        }
    }, [isAuthenticated]);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const refreshCart = async () => {
        if (!isAuthenticated || !hasRole('REVENDA')) {
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/wholesale/cart/current`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const cartData = response.data.data;
            setItems(cartData.items || []);
            setTotal(cartData.total || 0);
            setMinimumOrderValue(cartData.minimumOrderValue || 500);
            setMeetsMinimumOrder(cartData.meetsMinimumOrder || false);
        } catch (error: any) {
            console.error('Error loading wholesale cart:', error);
            if (error.response?.status === 403 || error.response?.status === 401) {
                setItems([]);
                setTotal(0);
            }
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (productId: number, quantity: number, sizeId?: number, colorId?: number) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/api/wholesale/cart/items`,
                { productId, quantity, sizeId, colorId },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            await refreshCart();
        } catch (error: any) {
            console.error('Error adding item to wholesale cart:', error);
            throw new Error(error.response?.data?.message || 'Erro ao adicionar item ao carrinho');
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (itemId: number) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/wholesale/cart/items/${itemId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            await refreshCart();
        } catch (error: any) {
            console.error('Error removing item from wholesale cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId: number, quantity: number) => {
        if (quantity <= 0) {
            await removeItem(itemId);
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/api/wholesale/cart/items/${itemId}`,
                { quantity },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            await refreshCart();
        } catch (error: any) {
            console.error('Error updating quantity in wholesale cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateItemPrice = async (itemId: number, quantity: number, customPrice?: number) => {
        if (quantity <= 0) {
            await removeItem(itemId);
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const payload: any = { quantity };
            if (customPrice !== undefined && customPrice > 0) {
                payload.customPrice = customPrice;
            }

            await axios.put(
                `${API_URL}/api/wholesale/cart/items/${itemId}`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            await refreshCart();
        } catch (error: any) {
            console.error('Error updating item in wholesale cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/wholesale/cart/clear`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setItems([]);
            setTotal(0);
            setMeetsMinimumOrder(false);
        } catch (error: any) {
            console.error('Error clearing wholesale cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const addMultipleVariants = async (productId: number, variants: VariantQuantity[]) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/api/wholesale/cart/variants/bulk`,
                { productId, variants },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            await refreshCart();
        } catch (error: any) {
            console.error('Error adding multiple variants:', error);
            throw new Error(error.response?.data?.message || 'Erro ao adicionar variantes');
        } finally {
            setLoading(false);
        }
    };

    const getSelectedProductsCount = () => {
        // Count unique products in cart
        const uniqueProducts = new Set(items.map(item => item.productId));
        return uniqueProducts.size;
    };

    const getTotalPieces = () => {
        // Sum all quantities across all items/variants
        return items.reduce((sum, item) => sum + item.quantity, 0);
    };

    const value: WholesaleCartContextType = {
        items,
        itemCount,
        total,
        minimumOrderValue,
        meetsMinimumOrder,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        updateItemPrice,
        addMultipleVariants,
        clearCart,
        refreshCart,
        getSelectedProductsCount,
        getTotalPieces
    };

    return (
        <WholesaleCartContext.Provider value={value}>
            {children}
        </WholesaleCartContext.Provider>
    );
}

export function useWholesaleCart() {
    const context = useContext(WholesaleCartContext);
    if (context === undefined) {
        throw new Error('useWholesaleCart must be used within a WholesaleCartProvider');
    }
    return context;
}
