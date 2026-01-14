// src/pages/stock/StockEntryPage.tsx
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import { Product } from "../../models/Product";
import ProductSearchDialog from "../../components/ProductSearchDialog";
import api from "../../service/api";
import styles from "../../styles/stock/StockEntryPage.module.css";

interface ProductSizeColor {
    id: string | null;
    productId: string;
    productName: string;
    sizeId: string | null;
    sizeName: string;
    colorId: string | null;
    colorName: string;
    colorHexCode?: string;
    stock: number;
    salePrice: number;
    costPrice: number;
    minimumStock: number;
    active: boolean;
    isNew?: boolean;
    hasChanges?: boolean;
}

interface Size {
    id: string;
    name: string;
    sizeName?: string;
}

interface Color {
    id: string;
    name: string;
    hexCode?: string;
}

export default function StockEntryPage() {
    const { t } = useTranslation([TRANSLATION_NAMESPACES.COMMERCIAL]);

    // Tabs
    const [activeTab, setActiveTab] = useState<"entry" | "query" | "movements">("entry");

    // Product Selection
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

    // Reference Data
    const [sizes, setSizes] = useState<Size[]>([]);
    const [colors, setColors] = useState<Color[]>([]);

    // Grid Data
    const [items, setItems] = useState<ProductSizeColor[]>([]);
    const [queryItems, setQueryItems] = useState<ProductSizeColor[]>([]);
    const [filteredQueryItems, setFilteredQueryItems] = useState<ProductSizeColor[]>([]);

    // Query Filters
    const [querySearch, setQuerySearch] = useState("");
    const [queryFilterSize, setQueryFilterSize] = useState<string>("");
    const [queryFilterColor, setQueryFilterColor] = useState<string>("");
    const [queryFilterLowStock, setQueryFilterLowStock] = useState(false);
    const [queryLoading, setQueryLoading] = useState(false);

    // State
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Load reference data
    const loadReferenceData = useCallback(async () => {
        try {
            const [sizesRes, colorsRes] = await Promise.all([
                api.get("/sizes"),
                api.get("/colors")
            ]);

            const sizesData = Array.isArray(sizesRes.data)
                ? sizesRes.data
                : sizesRes.data?.content || [];

            const colorsData = Array.isArray(colorsRes.data)
                ? colorsRes.data
                : colorsRes.data?.content || [];

            setSizes(sizesData.map((s: any) => ({
                id: String(s.id),
                name: s.sizeName || s.name || ""
            })));

            setColors(colorsData.map((c: any) => ({
                id: String(c.id),
                name: c.name || c.colorName || "",
                hexCode: c.hexCode
            })));
        } catch (err) {
            console.error("Error loading reference data:", err);
        }
    }, []);

    useEffect(() => {
        loadReferenceData();
    }, [loadReferenceData]);

    // Load items for selected product
    const loadProductItems = useCallback(async () => {
        if (!selectedProduct) {
            setItems([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/stock/product-size-colors/by-product/${selectedProduct.id}`);
            const data = Array.isArray(response.data) ? response.data : [];

            setItems(data.map((item: any) => ({
                id: String(item.id),
                productId: String(item.productId),
                productName: item.productName || selectedProduct.name,
                sizeId: item.sizeId ? String(item.sizeId) : null,
                sizeName: item.sizeName || "",
                colorId: item.colorId ? String(item.colorId) : null,
                colorName: item.colorName || "",
                colorHexCode: item.colorHexCode,
                stock: Number(item.stock) || 0,
                salePrice: Number(item.salePrice) || 0,
                costPrice: Number(item.costPrice) || 0,
                minimumStock: Number(item.minimumStock) || 0,
                active: item.active !== false,
                isNew: false,
                hasChanges: false
            })));
        } catch (err) {
            console.error("Error loading product items:", err);
            setError(t("stockEntry.loadError"));
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [selectedProduct, t]);

    useEffect(() => {
        loadProductItems();
    }, [loadProductItems]);

    // Load all items for query tab
    const loadQueryItems = useCallback(async () => {
        try {
            setQueryLoading(true);
            const response = await api.get("/stock/product-size-colors", {
                params: { size: 200 }
            });
            const data = response.data?.content || [];
            const mappedData = data.map((item: any) => ({
                id: String(item.id),
                productId: String(item.productId),
                productName: item.productName || "",
                sizeId: item.sizeId ? String(item.sizeId) : null,
                sizeName: item.sizeName || "",
                colorId: item.colorId ? String(item.colorId) : null,
                colorName: item.colorName || "",
                colorHexCode: item.colorHexCode,
                stock: Number(item.stock) || 0,
                salePrice: Number(item.salePrice) || 0,
                costPrice: Number(item.costPrice) || 0,
                minimumStock: Number(item.minimumStock) || 0,
                active: item.active !== false
            }));
            setQueryItems(mappedData);
            setFilteredQueryItems(mappedData);
        } catch (err) {
            console.error("Error loading query items:", err);
        } finally {
            setQueryLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === "query") {
            loadQueryItems();
        }
    }, [activeTab, loadQueryItems]);

    // Filter query items
    useEffect(() => {
        let filtered = [...queryItems];

        // Filter by search term (product name)
        if (querySearch.trim()) {
            const searchLower = querySearch.toLowerCase();
            filtered = filtered.filter(item =>
                item.productName.toLowerCase().includes(searchLower) ||
                item.sizeName.toLowerCase().includes(searchLower) ||
                item.colorName.toLowerCase().includes(searchLower)
            );
        }

        // Filter by size
        if (queryFilterSize) {
            filtered = filtered.filter(item => item.sizeId === queryFilterSize);
        }

        // Filter by color
        if (queryFilterColor) {
            filtered = filtered.filter(item => item.colorId === queryFilterColor);
        }

        // Filter by low stock
        if (queryFilterLowStock) {
            filtered = filtered.filter(item => item.stock < item.minimumStock);
        }

        setFilteredQueryItems(filtered);
    }, [queryItems, querySearch, queryFilterSize, queryFilterColor, queryFilterLowStock]);

    // Query statistics
    const getQueryStats = () => {
        const totalItems = filteredQueryItems.length;
        const totalStock = filteredQueryItems.reduce((sum, item) => sum + item.stock, 0);
        const totalValue = filteredQueryItems.reduce((sum, item) => sum + (item.stock * item.salePrice), 0);
        const lowStockCount = filteredQueryItems.filter(item => item.stock < item.minimumStock).length;
        const uniqueProducts = new Set(filteredQueryItems.map(item => item.productId)).size;
        return { totalItems, totalStock, totalValue, lowStockCount, uniqueProducts };
    };

    // Handle product selection
    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
        setIsProductDialogOpen(false);
        setHasChanges(false);
    };

    // Add new row
    const handleAddRow = () => {
        if (!selectedProduct) {
            setError(t("stockEntry.selectProductFirst"));
            return;
        }

        const newItem: ProductSizeColor = {
            id: null,
            productId: String(selectedProduct.id),
            productName: selectedProduct.name || "",
            sizeId: null,
            sizeName: "",
            colorId: null,
            colorName: "",
            stock: 0,
            salePrice: 0,
            costPrice: 0,
            minimumStock: 0,
            active: true,
            isNew: true,
            hasChanges: true
        };

        setItems(prev => [...prev, newItem]);
        setHasChanges(true);
    };

    // Update item field
    const handleFieldChange = (index: number, field: keyof ProductSizeColor, value: any) => {
        setItems(prev => prev.map((item, i) => {
            if (i === index) {
                const updated = { ...item, [field]: value, hasChanges: true };

                // Update names when IDs change
                if (field === "sizeId") {
                    const size = sizes.find(s => s.id === value);
                    updated.sizeName = size?.name || size?.sizeName || "";
                }
                if (field === "colorId") {
                    const color = colors.find(c => c.id === value);
                    updated.colorName = color?.name || "";
                    updated.colorHexCode = color?.hexCode;
                }

                return updated;
            }
            return item;
        }));
        setHasChanges(true);
    };

    // Delete row
    const handleDeleteRow = async (index: number) => {
        const item = items[index];

        if (item.id && !item.isNew) {
            if (!window.confirm(t("stockEntry.confirmDelete"))) return;

            try {
                await api.delete(`/stock/product-size-colors/${item.id}`);
                setSuccessMessage(t("stockEntry.deleteSuccess"));
                setTimeout(() => setSuccessMessage(null), 3000);
            } catch (err) {
                console.error("Error deleting item:", err);
                setError(t("stockEntry.deleteError"));
                return;
            }
        }

        setItems(prev => prev.filter((_, i) => i !== index));
    };

    // Save all changes
    const handleSaveAll = async () => {
        if (!selectedProduct) return;

        const changedItems = items.filter(item => item.hasChanges || item.isNew);
        if (changedItems.length === 0) return;

        // Validate items
        for (const item of changedItems) {
            if (!item.sizeId || !item.colorId) {
                setError(t("stockEntry.sizeColorRequired"));
                return;
            }
        }

        try {
            setSaving(true);
            setError(null);

            for (const item of changedItems) {
                const payload = {
                    productId: selectedProduct.id,
                    sizeId: item.sizeId,
                    colorId: item.colorId,
                    stock: item.stock,
                    salePrice: item.salePrice,
                    costPrice: item.costPrice,
                    minimumStock: item.minimumStock,
                    active: item.active
                };

                if (item.isNew) {
                    await api.post("/stock/product-size-colors", payload);
                } else if (item.id) {
                    await api.put(`/stock/product-size-colors/${item.id}`, payload);
                }
            }

            setSuccessMessage(t("stockEntry.saveSuccess"));
            setTimeout(() => setSuccessMessage(null), 3000);
            setHasChanges(false);

            // Reload data
            await loadProductItems();
        } catch (err: any) {
            console.error("Error saving items:", err);
            const errorMessage = err.response?.data?.message || t("stockEntry.saveError");
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    // Refresh data
    const handleRefresh = () => {
        loadProductItems();
        loadReferenceData();
    };

    // Calculate totals
    const getTotalItems = () => items.length;
    const getTotalStock = () => items.reduce((sum, item) => sum + item.stock, 0);
    const getTotalValue = () => items.reduce((sum, item) => sum + (item.stock * item.salePrice), 0);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t("stockEntry.title")}</h1>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === "entry" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("entry")}
                >
                    📦 {t("stockEntry.tabs.entry")}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "query" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("query")}
                >
                    🔍 {t("stockEntry.tabs.query")}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "movements" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("movements")}
                >
                    📊 {t("stockEntry.tabs.movements")}
                </button>
            </div>

            {/* Messages */}
            {error && <div className={styles.error}>{error}</div>}
            {successMessage && <div className={styles.success}>{successMessage}</div>}

            {/* Entry Tab */}
            {activeTab === "entry" && (
                <div className={styles.tabContent}>
                    {/* Product Selection */}
                    <div className={styles.productSelector}>
                        <div className={styles.productField}>
                            <label>{t("stockEntry.product")}:</label>
                            <input
                                type="text"
                                value={selectedProduct?.name || ""}
                                readOnly
                                placeholder={t("stockEntry.selectProduct")}
                                className={styles.productInput}
                            />
                            <button
                                type="button"
                                className={styles.searchButton}
                                onClick={() => setIsProductDialogOpen(true)}
                            >
                                🔍
                            </button>
                        </div>

                        <div className={styles.actionButtons}>
                            <button
                                type="button"
                                className={styles.addButton}
                                onClick={handleAddRow}
                                disabled={!selectedProduct}
                            >
                                ➕ {t("stockEntry.addRow")}
                            </button>
                            <button
                                type="button"
                                className={styles.saveButton}
                                onClick={handleSaveAll}
                                disabled={!hasChanges || saving}
                            >
                                {saving ? "⏳" : "💾"} {t("stockEntry.saveAll")}
                            </button>
                            <button
                                type="button"
                                className={styles.refreshButton}
                                onClick={handleRefresh}
                                disabled={loading}
                            >
                                🔄 {t("stockEntry.refresh")}
                            </button>
                        </div>
                    </div>

                    {/* Pending changes indicator */}
                    {hasChanges && (
                        <div className={styles.pendingChanges}>
                            ⚠️ {t("stockEntry.pendingChanges")}
                        </div>
                    )}

                    {/* Loading */}
                    {loading && <div className={styles.loading}>{t("buttons.loading")}</div>}

                    {/* Grid Table */}
                    {!loading && selectedProduct && (
                        <>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>{t("stockEntry.size")}</th>
                                        <th>{t("stockEntry.color")}</th>
                                        <th>{t("stockEntry.stock")}</th>
                                        <th>{t("stockEntry.salePrice")}</th>
                                        <th>{t("stockEntry.costPrice")}</th>
                                        <th>{t("stockEntry.minimumStock")}</th>
                                        <th>{t("stockEntry.actions")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={item.id || `new-${index}`} className={item.isNew ? styles.newRow : ""}>
                                            <td>
                                                <select
                                                    value={item.sizeId || ""}
                                                    onChange={(e) => handleFieldChange(index, "sizeId", e.target.value || null)}
                                                    className={styles.select}
                                                >
                                                    <option value="">-- {t("stockEntry.selectSize")} --</option>
                                                    {sizes.map(size => (
                                                        <option key={size.id} value={size.id}>
                                                            {size.name || size.sizeName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <div className={styles.colorCell}>
                                                    {item.colorHexCode && (
                                                        <span
                                                            className={styles.colorSwatch}
                                                            style={{ backgroundColor: item.colorHexCode }}
                                                        />
                                                    )}
                                                    <select
                                                        value={item.colorId || ""}
                                                        onChange={(e) => handleFieldChange(index, "colorId", e.target.value || null)}
                                                        className={styles.select}
                                                    >
                                                        <option value="">-- {t("stockEntry.selectColor")} --</option>
                                                        {colors.map(color => (
                                                            <option key={color.id} value={color.id}>
                                                                {color.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={item.stock}
                                                    onChange={(e) => handleFieldChange(index, "stock", parseInt(e.target.value) || 0)}
                                                    className={styles.numberInput}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.salePrice}
                                                    onChange={(e) => handleFieldChange(index, "salePrice", parseFloat(e.target.value) || 0)}
                                                    className={styles.numberInput}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.costPrice}
                                                    onChange={(e) => handleFieldChange(index, "costPrice", parseFloat(e.target.value) || 0)}
                                                    className={styles.numberInput}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={item.minimumStock}
                                                    onChange={(e) => handleFieldChange(index, "minimumStock", parseInt(e.target.value) || 0)}
                                                    className={styles.numberInput}
                                                />
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className={styles.deleteButton}
                                                    onClick={() => handleDeleteRow(index)}
                                                    title={t("stockEntry.delete")}
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className={styles.noData}>
                                                {t("stockEntry.noData")}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Totals */}
                            {items.length > 0 && (
                                <div className={styles.totals}>
                                    <span>
                                        <strong>{t("stockEntry.totals.items")}:</strong> {getTotalItems()}
                                    </span>
                                    <span>
                                        <strong>{t("stockEntry.totals.totalQty")}:</strong> {getTotalStock()}
                                    </span>
                                    <span>
                                        <strong>{t("stockEntry.totals.totalValue")}:</strong> R$ {getTotalValue().toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </>
                    )}

                    {!selectedProduct && !loading && (
                        <div className={styles.placeholder}>
                            📦 {t("stockEntry.selectProductToStart")}
                        </div>
                    )}
                </div>
            )}

            {/* Query Tab */}
            {activeTab === "query" && (
                <div className={styles.tabContent}>
                    {/* Statistics Cards */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>📦</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>{getQueryStats().uniqueProducts}</span>
                                <span className={styles.statLabel}>{t("stockEntry.query.products")}</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>📊</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>{getQueryStats().totalItems}</span>
                                <span className={styles.statLabel}>{t("stockEntry.query.variations")}</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>🏷️</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>{getQueryStats().totalStock.toLocaleString()}</span>
                                <span className={styles.statLabel}>{t("stockEntry.query.totalStock")}</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>💰</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>R$ {getQueryStats().totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                <span className={styles.statLabel}>{t("stockEntry.query.totalValue")}</span>
                            </div>
                        </div>
                        {getQueryStats().lowStockCount > 0 && (
                            <div className={`${styles.statCard} ${styles.statCardWarning}`}>
                                <div className={styles.statIcon}>⚠️</div>
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>{getQueryStats().lowStockCount}</span>
                                    <span className={styles.statLabel}>{t("stockEntry.query.lowStock")}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Filters */}
                    <div className={styles.queryFilters}>
                        <div className={styles.filterField}>
                            <label>🔍 {t("stockEntry.query.search")}:</label>
                            <input
                                type="text"
                                value={querySearch}
                                onChange={(e) => setQuerySearch(e.target.value)}
                                placeholder={t("stockEntry.query.searchPlaceholder")}
                                className={styles.filterInput}
                            />
                        </div>
                        <div className={styles.filterField}>
                            <label>{t("stockEntry.size")}:</label>
                            <select
                                value={queryFilterSize}
                                onChange={(e) => setQueryFilterSize(e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="">{t("stockEntry.query.allSizes")}</option>
                                {sizes.map(size => (
                                    <option key={size.id} value={size.id}>{size.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.filterField}>
                            <label>{t("stockEntry.color")}:</label>
                            <select
                                value={queryFilterColor}
                                onChange={(e) => setQueryFilterColor(e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="">{t("stockEntry.query.allColors")}</option>
                                {colors.map(color => (
                                    <option key={color.id} value={color.id}>{color.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.filterCheck}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={queryFilterLowStock}
                                    onChange={(e) => setQueryFilterLowStock(e.target.checked)}
                                />
                                ⚠️ {t("stockEntry.query.onlyLowStock")}
                            </label>
                        </div>
                        <button
                            type="button"
                            className={styles.refreshButton}
                            onClick={loadQueryItems}
                            disabled={queryLoading}
                        >
                            🔄 {t("stockEntry.refresh")}
                        </button>
                    </div>

                    {/* Loading */}
                    {queryLoading && <div className={styles.loading}>{t("buttons.loading")}</div>}

                    {/* Table */}
                    {!queryLoading && (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>{t("stockEntry.product")}</th>
                                    <th>{t("stockEntry.size")}</th>
                                    <th>{t("stockEntry.color")}</th>
                                    <th>{t("stockEntry.stock")}</th>
                                    <th>{t("stockEntry.minimumStock")}</th>
                                    <th>{t("stockEntry.salePrice")}</th>
                                    <th>{t("stockEntry.costPrice")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredQueryItems.map(item => (
                                    <tr key={item.id} className={item.stock < item.minimumStock ? styles.lowStockRow : ""}>
                                        <td><strong>{item.productName}</strong></td>
                                        <td>{item.sizeName}</td>
                                        <td>
                                            <div className={styles.colorCell}>
                                                {item.colorHexCode && (
                                                    <span
                                                        className={styles.colorSwatch}
                                                        style={{ backgroundColor: item.colorHexCode }}
                                                    />
                                                )}
                                                {item.colorName}
                                            </div>
                                        </td>
                                        <td className={item.stock < item.minimumStock ? styles.lowStock : ""}>
                                            {item.stock}
                                            {item.stock < item.minimumStock && " ⚠️"}
                                        </td>
                                        <td>{item.minimumStock}</td>
                                        <td>R$ {item.salePrice.toFixed(2)}</td>
                                        <td>R$ {item.costPrice.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {filteredQueryItems.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className={styles.noData}>
                                            {t("stockEntry.noData")}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {/* Results count */}
                    {!queryLoading && filteredQueryItems.length > 0 && (
                        <div className={styles.resultCount}>
                            {t("stockEntry.query.showing")} {filteredQueryItems.length} {t("stockEntry.query.items")}
                            {querySearch || queryFilterSize || queryFilterColor || queryFilterLowStock ?
                                ` (${t("stockEntry.query.filtered")})` : ""}
                        </div>
                    )}
                </div>
            )}

            {/* Movements Tab (Placeholder) */}
            {activeTab === "movements" && (
                <div className={styles.tabContent}>
                    <h2>{t("stockEntry.tabs.movements")}</h2>
                    <div className={styles.placeholder}>
                        🚧 {t("stockEntry.comingSoon")}
                    </div>
                </div>
            )}

            {/* Product Search Dialog */}
            <ProductSearchDialog
                isOpen={isProductDialogOpen}
                onClose={() => setIsProductDialogOpen(false)}
                onSelect={handleProductSelect}
            />
        </div>
    );
}
