// src/pages/stock/StockManagementGridPage.tsx
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import api from "../../service/api";
import styles from "../../styles/stock/StockManagementGrid.module.css";

interface StockGridItem {
    id: string;
    productId: string;
    productName: string;
    sizeId: string;
    sizeName: string;
    colorId: string;
    colorName: string;
    colorHexCode?: string;
    stock: number;
    minimumStock: number;
    salePrice: number;
    costPrice: number;
    active: boolean;
    status: string; // IN_STOCK, LOW_STOCK, OUT_OF_STOCK
}

interface StockStats {
    totalItems: number;
    totalStock: number;
    totalLowStock: number;
    totalOutOfStock: number;
    uniqueProducts: number;
}

interface Size {
    id: string;
    sizeName: string;
}

interface Color {
    id: string;
    colorName: string;
    hexCode?: string;
}

export default function StockManagementGridPage() {
    const { t } = useTranslation([TRANSLATION_NAMESPACES.COMMERCIAL]);

    // State
    const [items, setItems] = useState<StockGridItem[]>([]);
    const [stats, setStats] = useState<StockStats | null>(null);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const [filterSize, setFilterSize] = useState("");
    const [filterColor, setFilterColor] = useState("");
    const [filterLowStock, setFilterLowStock] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(50);

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
                sizeName: s.sizeName || s.name || ""
            })));

            setColors(colorsData.map((c: any) => ({
                id: String(c.id),
                colorName: c.colorName || c.name || "",
                hexCode: c.hexCode
            })));
        } catch (err) {
            console.error("Error loading reference data:", err);
        }
    }, []);

    // Load stock items
    const loadStockItems = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get("/product-size-colors/grid", {
                params: {
                    search: search || undefined,
                    sizeId: filterSize || undefined,
                    colorId: filterColor || undefined,
                    lowStock: filterLowStock || undefined,
                    page: currentPage,
                    size: pageSize
                }
            });

            const data = response.data;
            setItems(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error("Error loading stock items:", err);
        } finally {
            setLoading(false);
        }
    }, [search, filterSize, filterColor, filterLowStock, currentPage, pageSize]);

    // Load stats
    const loadStats = useCallback(async () => {
        try {
            const response = await api.get("/product-size-colors/grid/stats");
            setStats(response.data);
        } catch (err) {
            console.error("Error loading stats:", err);
        }
    }, []);

    useEffect(() => {
        loadReferenceData();
    }, [loadReferenceData]);

    useEffect(() => {
        loadStockItems();
    }, [loadStockItems]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    // Handle search
    const handleSearch = (value: string) => {
        setSearch(value);
        setCurrentPage(0);
    };

    // Handle filter change
    const handleFilterChange = () => {
        setCurrentPage(0);
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "IN_STOCK":
                return <span className={styles.badgeInStock}>Em Estoque</span>;
            case "LOW_STOCK":
                return <span className={styles.badgeLowStock}>Estoque Baixo</span>;
            case "OUT_OF_STOCK":
                return <span className={styles.badgeOutOfStock}>Sem Estoque</span>;
            default:
                return <span className={styles.badgeUnknown}>Desconhecido</span>;
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>📊 Gerenciar Estoque</h1>

            {/* Statistics Cards */}
            {stats && (
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>📦</div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{stats.uniqueProducts}</span>
                            <span className={styles.statLabel}>Produtos</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>📊</div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{stats.totalItems}</span>
                            <span className={styles.statLabel}>Variações</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🏷️</div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{stats.totalStock.toLocaleString()}</span>
                            <span className={styles.statLabel}>Estoque Total</span>
                        </div>
                    </div>
                    {stats.totalLowStock > 0 && (
                        <div className={`${styles.statCard} ${styles.statCardWarning}`}>
                            <div className={styles.statIcon}>⚠️</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>{stats.totalLowStock}</span>
                                <span className={styles.statLabel}>Estoque Baixo</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Filters */}
            <div className={styles.filtersContainer}>
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="🔍 Buscar por produto, tamanho ou cor..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <select
                    value={filterSize}
                    onChange={(e) => {
                        setFilterSize(e.target.value);
                        handleFilterChange();
                    }}
                    className={styles.filterSelect}
                >
                    <option value="">Todos os Tamanhos</option>
                    {sizes.map(size => (
                        <option key={size.id} value={size.id}>{size.sizeName}</option>
                    ))}
                </select>

                <select
                    value={filterColor}
                    onChange={(e) => {
                        setFilterColor(e.target.value);
                        handleFilterChange();
                    }}
                    className={styles.filterSelect}
                >
                    <option value="">Todas as Cores</option>
                    {colors.map(color => (
                        <option key={color.id} value={color.id}>{color.colorName}</option>
                    ))}
                </select>

                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={filterLowStock}
                        onChange={(e) => {
                            setFilterLowStock(e.target.checked);
                            handleFilterChange();
                        }}
                    />
                    ⚠️ Apenas Estoque Baixo
                </label>

                <button className={styles.refreshButton} onClick={loadStockItems}>
                    🔄 Atualizar
                </button>
            </div>

            {/* Stock Table */}
            {loading ? (
                <div className={styles.loading}>Carregando estoque...</div>
            ) : items.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>📭 Nenhum item encontrado</p>
                </div>
            ) : (
                <>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>Tamanho</th>
                                    <th>Cor</th>
                                    <th>Estoque</th>
                                    <th>Estoque Mín.</th>
                                    <th>Preço Venda</th>
                                    <th>Preço Custo</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className={item.status === "LOW_STOCK" ? styles.lowStockRow : ""}>
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
                                        <td className={styles.centerAlign}>
                                            <span className={item.status === "LOW_STOCK" ? styles.stockLow : styles.stockOk}>
                                                {item.stock}
                                            </span>
                                        </td>
                                        <td className={styles.centerAlign}>{item.minimumStock}</td>
                                        <td>R$ {item.salePrice.toFixed(2)}</td>
                                        <td>R$ {item.costPrice.toFixed(2)}</td>
                                        <td>{getStatusBadge(item.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                disabled={currentPage === 0}
                                className={styles.paginationButton}
                            >
                                ← Anterior
                            </button>
                            <span className={styles.paginationInfo}>
                                Página {currentPage + 1} de {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                disabled={currentPage >= totalPages - 1}
                                className={styles.paginationButton}
                            >
                                Próxima →
                            </button>
                        </div>
                    )}
                </>
            )}

            <div className={styles.footer}>
                <p className={styles.hint}>💡 Dica: Use os filtros para encontrar rapidamente produtos específicos</p>
            </div>
        </div>
    );
}
