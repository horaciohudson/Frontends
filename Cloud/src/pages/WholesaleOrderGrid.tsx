import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWholesaleCart } from '../contexts/WholesaleCartContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { productVariantsAPI, sizesAPI, colorsAPI } from '../services/api';
import './WholesaleOrderGrid.css';

interface Size {
    id: number;
    sizeName: string;
    displayOrder: number;
}

interface Color {
    id: number;
    colorName: string;
    hexCode?: string;
    displayOrder: number;
}

interface ProductVariant {
    id: number;
    sizeId?: number;
    sizeName?: string;
    colorId?: number;
    colorName?: string;
    stockQuantity: number;
    priceOverride?: number;
}

interface ProductGroup {
    productId: number;
    productName: string;
    productSku: string;
    productImage?: string;
    wholesalePrice: number;
    retailPrice: number;
    variants: ProductVariant[];
}

function WholesaleOrderGrid() {
    const { hasRole, isAuthenticated } = useAuth();
    const { items, removeItem, updateQuantity, updateItemPrice, addItem, total, minimumOrderValue, meetsMinimumOrder, getTotalPieces } = useWholesaleCart();
    const navigate = useNavigate();

    const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [loading, setLoading] = useState(true);

    // Grid data: { productId: { "sizeId|colorId": quantity } }
    const [gridData, setGridData] = useState<Record<number, Record<string, number>>>({});

    // Custom prices: { productId: { "sizeId|colorId": price } }
    const [customPrices, setCustomPrices] = useState<Record<number, Record<string, number>>>({});

    useEffect(() => {
        if (isAuthenticated && hasRole('REVENDA')) {
            loadData();
        }
    }, [isAuthenticated]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load sizes and colors
            const [sizesRes, colorsRes] = await Promise.all([
                sizesAPI.getAll(),
                colorsAPI.getAll()
            ]);

            const allSizes = sizesRes.data.data || [];
            const allColors = colorsRes.data.data || [];

            setSizes(allSizes.filter((s: Size) => s).sort((a: Size, b: Size) => a.displayOrder - b.displayOrder));
            setColors(allColors.filter((c: Color) => c).sort((a: Color, b: Color) => a.displayOrder - b.displayOrder));

            // Group cart items by product
            const groups = await groupItemsByProduct();
            setProductGroups(groups);

            // Initialize grid data from cart
            initializeGridData(groups);

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const groupItemsByProduct = async (): Promise<ProductGroup[]> => {
        const productMap = new Map<number, ProductGroup>();

        for (const item of items) {
            if (!productMap.has(item.productId)) {
                // Load variants for this product
                try {
                    const variantsRes = await productVariantsAPI.getByProductId(item.productId);
                    const variants = variantsRes.data.data || [];

                    productMap.set(item.productId, {
                        productId: item.productId,
                        productName: item.productName,
                        productSku: item.productSku,
                        productImage: item.productImage,
                        wholesalePrice: item.wholesalePrice,
                        retailPrice: item.retailPrice,
                        variants: variants
                    });
                } catch (error) {
                    console.error(`Error loading variants for product ${item.productId}:`, error);
                }
            }
        }

        return Array.from(productMap.values());
    };

    const initializeGridData = (groups: ProductGroup[]) => {
        const initialData: Record<number, Record<string, number>> = {};
        const initialPrices: Record<number, Record<string, number>> = {};

        groups.forEach(group => {
            initialData[group.productId] = {};
            initialPrices[group.productId] = {};

            // Find quantities and prices from cart items
            items.filter(item => item.productId === group.productId).forEach(item => {
                // Use IDs to create the variant key
                const variantKey = `${item.sizeId || 'none'}|${item.colorId || 'none'}`;
                initialData[group.productId][variantKey] = item.quantity;
                initialPrices[group.productId][variantKey] = Number(item.wholesalePrice);
            });
        });

        setGridData(initialData);
        setCustomPrices(initialPrices);
    };

    const handleQuantityChange = async (productId: number, sizeId: number | undefined, colorId: number | undefined, value: string) => {
        const quantity = parseInt(value) || 0;
        const variantKey = `${sizeId || 'none'}|${colorId || 'none'}`;

        // Update local grid data
        setGridData(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [variantKey]: quantity
            }
        }));

        // Find variant ID
        const group = productGroups.find(g => g.productId === productId);
        const variant = group?.variants.find(v =>
            (v.sizeId === sizeId || (!v.sizeId && !sizeId)) &&
            (v.colorId === colorId || (!v.colorId && !colorId))
        );

        if (!variant) return;

        // Find existing cart item by matching sizeId and colorId
        const existingItem = items.find(item =>
            item.productId === productId &&
            item.sizeId === sizeId &&
            item.colorId === colorId
        );

        try {
            if (quantity === 0 && existingItem) {
                // Remove from cart
                await removeItem(existingItem.id);
            } else if (quantity > 0) {
                // Remove placeholder item (without variants) if exists
                const placeholderItem = items.find(item =>
                    item.productId === productId &&
                    item.sizeId === undefined &&
                    item.colorId === undefined
                );

                if (placeholderItem) {
                    console.log(`Removing placeholder item for product ${productId}`);
                    await removeItem(placeholderItem.id);
                }

                if (existingItem) {
                    // Update quantity
                    await updateQuantity(existingItem.id, quantity);
                } else {
                    // Add to cart with sizeId and colorId
                    await addItem(productId, quantity, sizeId, colorId);
                }
            }
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    };

    const handlePriceChange = async (productId: number, sizeId: number | undefined, colorId: number | undefined, value: string) => {
        const price = parseFloat(value) || 0;
        const variantKey = `${sizeId || 'none'}|${colorId || 'none'}`;

        // Update local price state
        setCustomPrices(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [variantKey]: price
            }
        }));

        // Find variant and existing cart item
        const group = productGroups.find(g => g.productId === productId);
        const variant = group?.variants.find(v =>
            (v.sizeId === sizeId || (!v.sizeId && !sizeId)) &&
            (v.colorId === colorId || (!v.colorId && !colorId))
        );

        if (!variant) return;

        // Find existing cart item by matching sizeId and colorId
        const existingItem = items.find(item =>
            item.productId === productId &&
            item.sizeId === sizeId &&
            item.colorId === colorId
        );

        if (existingItem && price > 0) {
            const quantity = getQuantity(productId, sizeId, colorId);
            if (quantity > 0) {
                try {
                    await updateItemPrice(existingItem.id, quantity, price);
                } catch (error) {
                    console.error('Error updating price:', error);
                }
            }
        }
    };

    const handleRemoveProduct = async (productId: number) => {
        if (confirm('Remover todos os itens deste produto?')) {
            const productItems = items.filter(item => item.productId === productId);
            for (const item of productItems) {
                await removeItem(item.id);
            }
            // Remove from product groups
            setProductGroups(prev => prev.filter(g => g.productId !== productId));
        }
    };

    const getQuantity = (productId: number, sizeId?: number, colorId?: number): number => {
        const variantKey = `${sizeId || 'none'}|${colorId || 'none'}`;
        return gridData[productId]?.[variantKey] || 0;
    };

    const getPrice = (productId: number, sizeId?: number, colorId?: number): number => {
        const variantKey = `${sizeId || 'none'}|${colorId || 'none'}`;
        const customPrice = customPrices[productId]?.[variantKey];

        if (customPrice !== undefined && customPrice > 0) {
            return customPrice;
        }

        // Return default wholesale price
        const group = productGroups.find(g => g.productId === productId);
        return group?.wholesalePrice || 0;
    };

    const getProductTotal = (productId: number): number => {
        const group = productGroups.find(g => g.productId === productId);
        if (!group) return 0;

        let total = 0;
        Object.entries(gridData[productId] || {}).forEach(([variantKey, qty]) => {
            const [sizeId, colorId] = variantKey.split('|').map(v => v === 'none' ? undefined : parseInt(v));
            const price = getPrice(productId, sizeId, colorId);
            total += qty * price;
        });
        return total;
    };

    const handleContinueShopping = () => {
        navigate('/wholesale/catalog');
    };

    const handleReviewOrder = async () => {
        // Debug: log all items
        console.log('=== CLEANUP DEBUG ===');
        console.log('Total items in cart:', items.length);
        console.log('All cart items:', items);

        // Clean up placeholder items using the isPlaceholder flag from backend
        const placeholders = items.filter(item => item.isPlaceholder === true);

        console.log(`Found ${placeholders.length} placeholder items`);

        if (placeholders.length > 0) {
            console.log(`Cleaning up ${placeholders.length} placeholder items before review`);
            for (const placeholder of placeholders) {
                try {
                    console.log(`Removing placeholder item ${placeholder.id}`);
                    await removeItem(placeholder.id);
                } catch (error) {
                    console.error('Error removing placeholder:', error);
                }
            }
            
            // Refresh cart after removing placeholders
            console.log('Refreshing cart after placeholder cleanup...');
            await refreshCart();
        } else {
            console.log('No placeholders found to clean up');
        }

        navigate('/wholesale/summary');
    };

    if (!isAuthenticated || !hasRole('REVENDA')) {
        return <Navigate to="/" replace />;
    }

    if (loading) {
        return (
            <div className="wholesale-grid">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Carregando grade...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (productGroups.length === 0) {
        return (
            <div className="wholesale-grid">
                <div className="container">
                    <div className="empty-grid">
                        <h2>📋 Nenhum produto selecionado</h2>
                        <p>Selecione produtos no catálogo para montar seu pedido</p>
                        <button className="btn btn-primary" onClick={handleContinueShopping}>
                            Ir para Catálogo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="wholesale-grid">
            <div className="container">
                {/* Header */}
                <div className="grid-header">
                    <h1>📋 Grade de Pedido Atacado</h1>
                    <p className="subtitle">Preencha as quantidades por tamanho e cor</p>
                </div>

                {/* Summary Panel */}
                <div className="summary-panel">
                    <div className="summary-item">
                        <span className="summary-label">Produtos:</span>
                        <span className="summary-value">{productGroups.length}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Total de Peças:</span>
                        <span className="summary-value">{getTotalPieces()}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Valor Total:</span>
                        <span className="summary-value">R$ {total.toFixed(2)}</span>
                    </div>
                    <div className={`summary-item ${meetsMinimumOrder ? 'success' : 'warning'}`}>
                        <span className="summary-label">Pedido Mínimo:</span>
                        <span className="summary-value">
                            R$ {minimumOrderValue.toFixed(2)}
                            {meetsMinimumOrder ? ' ✓' : ' ⚠️'}
                        </span>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="products-matrix-container">
                    {productGroups.map(group => (
                        <div key={group.productId} className="product-matrix-section">
                            {/* Product Header */}
                            <div className="product-matrix-header">
                                <div className="product-matrix-info">
                                    {group.productImage && (
                                        <img src={group.productImage} alt={group.productName} className="product-matrix-image" />
                                    )}
                                    <div>
                                        <h3>{group.productName}</h3>
                                        <p className="product-sku">SKU: {group.productSku}</p>
                                        <p className="product-price">
                                            Atacado: <strong>R$ {group.wholesalePrice.toFixed(2)}</strong>
                                            <span className="retail-price-small"> (Varejo: R$ {group.retailPrice.toFixed(2)})</span>
                                        </p>
                                        <p className="product-total">
                                            Subtotal: <strong>R$ {getProductTotal(group.productId).toFixed(2)}</strong>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleRemoveProduct(group.productId)}
                                >
                                    🗑️ Remover
                                </button>
                            </div>

                            {/* Size × Color Matrix */}
                            <div className="variant-matrix-wrapper">
                                <table className="variant-matrix">
                                    <thead>
                                        <tr>
                                            <th className="matrix-corner">Tamanho / Cor</th>
                                            {colors.map(color => (
                                                <th key={color.id} className="matrix-color-header">
                                                    {color.hexCode && (
                                                        <div
                                                            className="color-preview"
                                                            style={{ backgroundColor: color.hexCode }}
                                                            title={color.colorName}
                                                        />
                                                    )}
                                                    <span>{color.colorName}</span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sizes.map(size => (
                                            <tr key={size.id}>
                                                <th className="matrix-size-header">{size.sizeName}</th>
                                                {colors.map(color => {
                                                    const variant = group.variants.find(v =>
                                                        v.sizeId === size.id && v.colorId === color.id
                                                    );
                                                    const quantity = getQuantity(group.productId, size.id, color.id);
                                                    const available = variant ? variant.stockQuantity : 0;

                                                    const currentPrice = getPrice(group.productId, size.id, color.id);
                                                    const isPriceModified = customPrices[group.productId]?.[`${size.id}|${color.id}`] !== undefined;

                                                    return (
                                                        <td key={`${size.id}-${color.id}`} className="matrix-cell">
                                                            {variant ? (
                                                                <div className="matrix-cell-content">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max={available}
                                                                        value={quantity || ''}
                                                                        onChange={(e) => handleQuantityChange(
                                                                            group.productId,
                                                                            size.id,
                                                                            color.id,
                                                                            e.target.value
                                                                        )}
                                                                        className="matrix-input matrix-input-quantity"
                                                                        placeholder="0"
                                                                        title={`Estoque disponível: ${available}`}
                                                                    />
                                                                    <div className="matrix-price-display" title="Preço unitário atacado">
                                                                        R$ {currentPrice.toFixed(2)}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="matrix-unavailable">-</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="grid-actions">
                    <button className="btn btn-secondary" onClick={handleContinueShopping}>
                        ← Continuar Comprando
                    </button>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleReviewOrder}
                        disabled={!meetsMinimumOrder}
                    >
                        Revisar Pedido →
                    </button>
                </div>

                {!meetsMinimumOrder && (
                    <div className="warning-message">
                        ⚠️ Pedido mínimo de R$ {minimumOrderValue.toFixed(2)} não atingido.
                        Faltam R$ {(minimumOrderValue - total).toFixed(2)}
                    </div>
                )}
            </div>
        </div>
    );
}

export default WholesaleOrderGrid;
