import { useState, useEffect } from "react";
import { SaleItemDTO } from "../../../models/Sale";
import { Product } from "../../../models/Product";
import { ProductVariant } from "../../../types/ProductVariant";
import { listProducts } from "../../../service/product";
import VariantSelectionDialog from "../VariantSelectionDialog"; // Adjusted import path
import styles from "../../../styles/sales/FormSaleItems.module.css"; // Adjusted import path

interface FormSaleItemsProps {
    items: SaleItemDTO[];
    onUpdateItems: (items: SaleItemDTO[]) => void;
}

export default function FormSaleItems({ items, onUpdateItems }: FormSaleItemsProps) {
    const setItems = onUpdateItems; // Alias for compatibility with existing code
    const [products, setProducts] = useState<Product[]>([]);
    const [showProductDialog, setShowProductDialog] = useState(false);
    const [showVariantDialog, setShowVariantDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productSearch, setProductSearch] = useState("");
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

    // Load products
    useEffect(() => {
        loadProducts();
    }, []);

    // Filter products based on search
    useEffect(() => {
        if (productSearch) {
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                (p.reference && p.reference.toLowerCase().includes(productSearch.toLowerCase()))
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
    }, [productSearch, products]);

    const loadProducts = async () => {
        try {
            const response = await listProducts({ size: 1000 });
            setProducts(response.content || []);
            setFilteredProducts(response.content || []);
        } catch (err) {
            console.error("Error loading products:", err);
        }
    };

    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
        setShowProductDialog(false);
        setShowVariantDialog(true);
    };

    const handleVariantSelect = (variant: ProductVariant) => {
        if (!selectedProduct) return;

        // Prioridade: 1. Preço da variante, 2. Preço de venda do produto, 3. Custo médio, 4. Zero
        const unitPrice = variant.salePrice
            || (selectedProduct as any).sellingPrice
            || selectedProduct.productCost?.averageCost
            || 0;
        const quantity = 1;

        const newItem: SaleItemDTO = {
            itemNumber: items.length + 1,
            productId: selectedProduct.id || "",
            variantId: variant.id,
            sizeId: variant.sizeId,
            colorId: variant.colorId,
            description: selectedProduct.name,
            quantity: quantity,
            unitPrice: unitPrice,
            totalPrice: unitPrice * quantity,
            unit: "UN",
            sizeName: variant.sizeName,
            colorName: variant.colorName,
            weight: undefined,
            status: "ACTIVE"
        };

        setItems([...items, newItem]);
        setShowVariantDialog(false);
        setSelectedProduct(null);
        setProductSearch("");
    };

    const handleCloseVariantDialog = () => {
        setShowVariantDialog(false);
        setSelectedProduct(null);
        setShowProductDialog(true);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        // Renumber items
        const renumberedItems = newItems.map((item, i) => ({
            ...item,
            itemNumber: i + 1
        }));
        setItems(renumberedItems);
    };

    const handleQuantityChange = (index: number, quantity: number) => {
        const newItems = [...items];
        newItems[index].quantity = quantity;
        newItems[index].totalPrice = quantity * newItems[index].unitPrice;
        setItems(newItems);
    };

    const handleUnitPriceChange = (index: number, unitPrice: number) => {
        const newItems = [...items];
        newItems[index].unitPrice = unitPrice;
        newItems[index].totalPrice = newItems[index].quantity * unitPrice;
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.totalPrice, 0);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(value);
    };

    return (
        <div className={styles.container}>
            {/* Add Product Button */}
            <button
                type="button"
                onClick={() => setShowProductDialog(true)}
                className={styles.addButton}
            >
                ➕ Adicionar Produto
            </button>

            {/* Items Table */}
            {items.length > 0 ? (
                <>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Produto</th>
                                    <th>Tamanho</th>
                                    <th>Cor</th>
                                    <th>Quantidade</th>
                                    <th>Preço Unitário</th>
                                    <th>Total</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.itemNumber}</td>
                                        <td>
                                            <strong>{item.description}</strong>
                                        </td>
                                        <td>{item.sizeName || "-"}</td>
                                        <td>{item.colorName || "-"}</td>
                                        <td>
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    handleQuantityChange(index, Number(e.target.value))
                                                }
                                                className={styles.quantityInput}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unitPrice}
                                                onChange={(e) =>
                                                    handleUnitPriceChange(index, Number(e.target.value))
                                                }
                                                className={styles.priceInput}
                                            />
                                        </td>
                                        <td className={styles.totalCell}>
                                            {formatCurrency(item.totalPrice)}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className={styles.removeButton}
                                                title="Remover item"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total */}
                    <div className={styles.totalSection}>
                        <div className={styles.totalLabel}>Total da Venda:</div>
                        <div className={styles.totalValue}>{formatCurrency(calculateTotal())}</div>
                    </div>
                </>
            ) : (
                <div className={styles.emptyState}>
                    <p>📭 Nenhum item adicionado</p>
                    <p className={styles.emptyStateHint}>
                        Clique em "Adicionar Produto" para começar
                    </p>
                </div>
            )}

            {/* Product Selection Dialog */}
            {showProductDialog && (
                <div className={styles.dialogOverlay} onClick={() => setShowProductDialog(false)}>
                    <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.dialogHeader}>
                            <h3>Selecionar Produto</h3>
                            <button
                                type="button"
                                onClick={() => setShowProductDialog(false)}
                                className={styles.closeButton}
                            >
                                ✕
                            </button>
                        </div>

                        <div className={styles.dialogBody}>
                            <input
                                type="text"
                                placeholder="🔍 Buscar produto..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className={styles.searchInput}
                                autoFocus
                            />

                            <div className={styles.productList}>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.slice(0, 20).map((product) => (
                                        <div
                                            key={product.id}
                                            className={styles.productItem}
                                            onClick={() => handleProductSelect(product)}
                                        >
                                            <div className={styles.productName}>
                                                {product.name}
                                            </div>
                                            <div className={styles.productDetails}>
                                                {product.reference && (
                                                    <span className={styles.productRef}>
                                                        Ref: {product.reference}
                                                    </span>
                                                )}
                                                {product.productCost?.averageCost && (
                                                    <span className={styles.productPrice}>
                                                        {formatCurrency(product.productCost.averageCost)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.noProducts}>
                                        Nenhum produto encontrado
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Variant Selection Dialog */}
            {showVariantDialog && selectedProduct && (
                <VariantSelectionDialog
                    productId={String(selectedProduct.id)}
                    productName={selectedProduct.name}
                    onSelect={handleVariantSelect}
                    onClose={handleCloseVariantDialog}
                />
            )}
        </div>
    );
}
