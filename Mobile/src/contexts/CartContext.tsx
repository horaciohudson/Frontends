// Contexto do Carrinho de Compras
// Adaptado do frontend web

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useRef, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { useAuth } from './AuthContext';
import type { Cart, CartItem } from '../types';

interface CartContextType {
    cart: Cart | null;
    items: CartItem[];
    itemCount: number;
    total: number;
    subtotal: number;
    discount: number;
    couponCode: string | null;
    loading: boolean;
    addItem: (productId: number, quantity: number) => Promise<void>;
    removeItem: (itemId: number) => Promise<void>;
    updateQuantity: (itemId: number, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
    applyCoupon: (code: string) => Promise<void>;
    removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
    children: ReactNode;
}

const EMPTY_CART: Cart = { id: 0, items: [], total: 0, itemCount: 0 };

export function CartProvider({ children }: CartProviderProps) {
    const [cart, setCart] = useState<Cart | null>(EMPTY_CART);
    const [loading, setLoading] = useState(false);
    const [couponCode, setCouponCode] = useState<string | null>(null);
    const [discount, setDiscount] = useState(0);
    const { isAuthenticated } = useAuth();
    const initializedRef = useRef(false);

    // Normalizar resposta da API para o formato esperado
    const normalizeCartFromAPI = useCallback((apiCart: any): Cart => {
        console.log('🔄 normalizeCartFromAPI - Input:', apiCart);

        // Transformar items do backend para o formato esperado pelo frontend
        const normalizedItems = apiCart.items?.map((item: any) => {
            console.log('📦 Transformando item:', item);

            const normalizedItem = {
                id: item.id,
                // Construir objeto Product a partir dos campos individuais
                product: {
                    id: item.productId,
                    name: item.productName,
                    sku: item.productSku,
                    primaryImageUrl: item.primaryImageUrl,
                    promotionalPrice: item.promotionalPrice,
                    sellingPrice: item.unitPrice,
                    currentPrice: item.unitPrice,
                },
                quantity: item.quantity,
                price: item.unitPrice,
                subtotal: item.subtotal,
            };

            console.log('✅ Item transformado:', normalizedItem);
            return normalizedItem;
        }) || [];

        const result = {
            ...apiCart,
            items: normalizedItems,
            total: apiCart.totalAmount || apiCart.total || 0,
            itemCount: apiCart.itemsCount || apiCart.itemCount || apiCart.items?.length || 0,
        };

        console.log('🎯 normalizeCartFromAPI - Output:', result);
        return result;
    }, []);

    // Buscar carrinho do servidor
    const refreshCartFromServer = useCallback(async () => {
        try {
            setLoading(true);
            const response = await cartAPI.getCart();
            const normalizedCart = response.data.data ? normalizeCartFromAPI(response.data.data) : EMPTY_CART;
            setCart(normalizedCart);
        } catch (error) {
            console.error('Erro ao carregar carrinho:', error);
            setCart(EMPTY_CART);
        } finally {
            setLoading(false);
        }
    }, [normalizeCartFromAPI]);

    // Carregar carrinho local (usuário não autenticado)
    const loadLocalCart = useCallback(async () => {
        try {
            const localCart = await storage.getObject<Cart>(STORAGE_KEYS.CART);
            setCart(localCart || EMPTY_CART);
        } catch (error) {
            console.error('Erro ao carregar carrinho local:', error);
            setCart(EMPTY_CART);
        }
    }, []);

    // Salvar carrinho localmente
    const saveLocalCart = useCallback(async (newCart: Cart) => {
        await storage.setObject(STORAGE_KEYS.CART, newCart);
    }, []);

    // Recalcular totais do carrinho
    const recalculateCart = useCallback((cartData: Cart): Cart => {
        let total = 0;
        let itemCount = 0;

        cartData.items.forEach(item => {
            if (!item.product) return; // Pular itens sem produto
            const price = item.product.discountPrice || item.product.price || 0;
            item.subtotal = price * item.quantity;
            total += item.subtotal;
            itemCount += item.quantity;
        });

        return { ...cartData, total, itemCount };
    }, []);

    // Carregar carrinho ao iniciar ou mudar autenticação
    useEffect(() => {
        const initializeCart = async () => {
            if (isAuthenticated) {
                console.log('CartContext: usuário autenticado, carregando carrinho do servidor');
                await refreshCartFromServer();
            } else {
                console.log('CartContext: usuário não autenticado, carregando carrinho local');
                await loadLocalCart();
            }
        };

        initializeCart();
    }, [isAuthenticated, refreshCartFromServer, loadLocalCart]);




    // Adicionar item ao carrinho
    const addItem = useCallback(async (productId: number, quantity: number) => {
        console.log('🛒 CartContext: addItem chamado', { productId, quantity, isAuthenticated });
        try {
            setLoading(true);

            if (isAuthenticated) {
                console.log('🔐 Usuário autenticado - chamando API');
                const response = await cartAPI.addItem({ productId, quantity });
                console.log('📦 Resposta da API (addItem):', JSON.stringify(response.data, null, 2));
                console.log('📦 Cart data:', response.data.data);
                console.log('📦 Cart items:', response.data.data?.items);
                const normalizedCart = normalizeCartFromAPI(response.data.data);
                console.log('🔄 Cart normalizado:', normalizedCart);
                setCart(normalizedCart);
            } else {
                console.log('👤 Usuário não autenticado - carrinho local');
                // Carrinho local (usuário não autenticado)
                const currentCart = cart || EMPTY_CART;
                console.log('📦 Carrinho atual:', currentCart);

                const existingItemIndex = currentCart.items.findIndex(
                    item => item.product?.id === productId
                );
                console.log('🔍 Item existente?', existingItemIndex);

                let updatedCart: Cart;

                if (existingItemIndex >= 0) {
                    // Item já existe, apenas atualizar quantidade
                    console.log('✏️ Atualizando quantidade do item existente');
                    // CRIAR NOVO ARRAY ao invés de mutar
                    const updatedItems = currentCart.items.map((item, index) =>
                        index === existingItemIndex
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                    updatedCart = recalculateCart({ ...currentCart, items: updatedItems });
                    console.log('✅ Item atualizado com sucesso');
                } else {
                    // Novo item - buscar dados do produto
                    console.log('🆕 Novo item - buscando dados do produto', productId);
                    const { productsAPI } = await import('../services/api');
                    console.log('📡 Chamando API para buscar produto...');
                    const productResponse = await productsAPI.getById(productId);
                    console.log('📦 Resposta da API:', productResponse.data);
                    const product = productResponse.data.data;

                    if (!product) {
                        console.error('❌ Produto não encontrado na resposta');
                        throw new Error('Produto não encontrado');
                    }

                    // Criar novo item
                    const price = product.promotionalPrice || product.sellingPrice || product.currentPrice || 0;
                    console.log('💰 Preço calculado:', price);
                    const newItem: CartItem = {
                        id: Date.now(), // ID temporário para carrinho local
                        product: product,
                        quantity: quantity,
                        price: price,
                        subtotal: price * quantity,
                    };
                    console.log('🎁 Novo item criado:', newItem);

                    // CRIAR NOVO ARRAY ao invés de mutar
                    const updatedItems = [...currentCart.items, newItem];
                    updatedCart = recalculateCart({ ...currentCart, items: updatedItems });
                    console.log('✅ Novo item adicionado com sucesso');
                }

                console.log('🔄 Carrinho recalculado:', updatedCart);
                setCart(updatedCart);
                await saveLocalCart(updatedCart);
            }
        } catch (error) {
            console.error('❌ Erro ao adicionar item:', error);
            throw error;
        } finally {
            setLoading(false);
            console.log('🏁 addItem finalizado');
        }
    }, [isAuthenticated, cart, recalculateCart, saveLocalCart, normalizeCartFromAPI]);

    // Remover item do carrinho
    const removeItem = useCallback(async (itemId: number) => {
        try {
            setLoading(true);

            if (isAuthenticated) {
                const response = await cartAPI.removeItem(itemId);
                const normalizedCart = normalizeCartFromAPI(response.data.data);
                setCart(normalizedCart);
            } else {
                const currentCart = cart || EMPTY_CART;
                // CRIAR NOVO ARRAY ao invés de mutar
                const updatedItems = currentCart.items.filter(item => item.id !== itemId);
                const updatedCart = recalculateCart({ ...currentCart, items: updatedItems });
                setCart(updatedCart);
                await saveLocalCart(updatedCart);
            }
        } catch (error) {
            console.error('Erro ao remover item:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, cart, recalculateCart, saveLocalCart, normalizeCartFromAPI]);

    // Atualizar quantidade
    const updateQuantity = useCallback(async (itemId: number, quantity: number) => {
        if (quantity < 1) {
            await removeItem(itemId);
            return;
        }

        try {
            setLoading(true);

            if (isAuthenticated) {
                const response = await cartAPI.updateItem(itemId, quantity);
                const normalizedCart = normalizeCartFromAPI(response.data.data);
                setCart(normalizedCart);
            } else {
                const currentCart = cart || EMPTY_CART;
                const itemIndex = currentCart.items.findIndex(item => item.id === itemId);

                if (itemIndex >= 0) {
                    // CRIAR NOVO ARRAY ao invés de mutar
                    const updatedItems = currentCart.items.map((item, index) =>
                        index === itemIndex
                            ? { ...item, quantity }
                            : item
                    );
                    const updatedCart = recalculateCart({ ...currentCart, items: updatedItems });
                    setCart(updatedCart);
                    await saveLocalCart(updatedCart);
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar quantidade:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, cart, recalculateCart, saveLocalCart, removeItem, normalizeCartFromAPI]);

    // Limpar carrinho
    const clearCart = useCallback(async () => {
        try {
            setLoading(true);

            if (isAuthenticated) {
                await cartAPI.clear();
            }

            setCart(EMPTY_CART);
            await saveLocalCart(EMPTY_CART);
        } catch (error) {
            console.error('Erro ao limpar carrinho:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, saveLocalCart]);

    // Refresh cart
    const refreshCart = useCallback(async () => {
        if (isAuthenticated) {
            await refreshCartFromServer();
        } else {
            await loadLocalCart();
        }
    }, [isAuthenticated, refreshCartFromServer, loadLocalCart]);

    // Aplicar cupom
    const applyCoupon = useCallback(async (code: string) => {
        try {
            setLoading(true);
            const { couponsAPI } = await import('../services/api');
            const subtotal = cart?.total || 0;
            const response = await couponsAPI.validateCoupon({ code, orderValue: subtotal });
            const result = response.data.data;

            if (result.isValid) {
                setCouponCode(code);
                setDiscount(result.discountAmount);
            } else {
                throw new Error(result.message || 'Cupom inválido');
            }
        } catch (error: any) {
            console.error('Erro ao aplicar cupom:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [cart]);

    // Remover cupom
    const removeCoupon = useCallback(() => {
        setCouponCode(null);
        setDiscount(0);
    }, []);

    // Calcular valores
    const subtotal = cart?.total || 0;
    const finalTotal = Math.max(0, subtotal - discount);

    // Memoizar value para evitar re-renders
    const value = useMemo<CartContextType>(() => ({
        cart,
        items: cart?.items || [],
        itemCount: cart?.itemCount || 0,
        total: finalTotal,
        subtotal,
        discount,
        couponCode,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        refreshCart,
        applyCoupon,
        removeCoupon,
    }), [cart, loading, subtotal, discount, couponCode, finalTotal, addItem, removeItem, updateQuantity, clearCart, refreshCart, applyCoupon, removeCoupon]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

// Hook customizado
export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart deve ser usado dentro de um CartProvider');
    }
    return context;
}
