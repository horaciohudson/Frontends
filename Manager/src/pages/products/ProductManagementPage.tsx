// src/pages/products/ProductManagementPage.tsx
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../../locales";
import api from "../../service/api";
import styles from "../../styles/products/ProductManagement.module.css";

interface ProductGridItem {
    id: string;
    productName: string;
    reference: string;
    categoryName: string;
    subCategoryName: string;
    supplierName: string;
    totalStock: number;
    minimumStock: number;
    averageSalePrice: number;
    averageCostPrice: number;
    variantCount: number;
    hasLowStock: boolean;
    isActive: boolean;
    packaging: string;
}

interface ProductStats {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalVariants: number;
    totalStockQuantity: number;
}

export default function ProductManagementPage() {
    const { t } = useTranslation([TRANSLATION_NAMESPACES.COMMERCIAL]);

    // State
    const [products, setProducts] = useState<ProductGridItem[]>([]);
    const [stats, setStats] = useState<ProductStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(10);

    // Load products
    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get("/products/grid", {
                params: {
                    search: search || undefined,
                    page: currentPage,
                    size: pageSize
                }
            });

            const data = response.data;
            setProducts(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error("Error loading products:", err);
        } finally {
            setLoading(false);
        }
    }, [search, currentPage, pageSize]);

    // Load stats
    const loadStats = useCallback(async () => {
        try {
            const response = await api.get("/products/stats");
            setStats(response.data);
        } catch (err) {
            console.error("Error loading stats:", err);
        }
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    // Handle search
    const handleSearch = (value: string) => {
        setSearch(value);
        setCurrentPage(0);
    };

    // Get stock status badge
    const getStockBadge = (item: ProductGridItem) => {
        if (item.totalStock === 0) {
            return <span className={styles.badgeOutOfStock}>Sem Estoque</span>;
        } else if (item.hasLowStock) {
            return <span className={styles.badgeLowStock}>Estoque Baixo</span>;
        } else {
            return <span className={styles.badgeInStock}>Em Estoque</span>;
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>📦 Gerenciar Produtos</h1>

            {/* Statistics Cards */}
            {stats && (
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>📦</div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{stats.totalProducts}</span>
                            <span className={styles.statLabel}>Total de Produtos</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>📊</div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{stats.totalVariants}</span>
                            <span className={styles.statLabel}>Variantes</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🏷️</div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{stats.totalStockQuantity.toLocaleString()}</span>
                            <span className={styles.statLabel}>Estoque Total</span>
                        </div>
                    </div>
                    {stats.lowStockProducts > 0 && (
                        <div className={`${styles.statCard} ${styles.statCardWarning}`}>
                            <div className={styles.statIcon}>⚠️</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>{stats.lowStockProducts}</span>
                                <span className={styles.statLabel}>Estoque Baixo</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Search and Filters */}
            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="🔍 Buscar produtos..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <button className={styles.refreshButton} onClick={loadProducts}>
                    🔄 Atualizar
                </button>
            </div>

            {/* Products Table */}
            {loading ? (
                <div className={styles.loading}>Carregando produtos...</div>
            ) : products.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>📭 Nenhum produto encontrado</p>
                </div>
            ) : (
                <>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>Referência</th>
                                    <th>Categoria</th>
                                    <th>Fornecedor</th>
                                    <th>Variantes</th>
                                    <th>Estoque</th>
                                    <th>Preço Médio</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            <strong>{product.productName}</strong>
                                        </td>
                                        <td>{product.reference || "-"}</td>
                                        <td>
                                            <div className={styles.categoryCell}>
                                                <span className={styles.categoryName}>{product.categoryName}</span>
                                                {product.subCategoryName && (
                                                    <span className={styles.subCategoryName}>
                                                        {product.subCategoryName}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>{product.supplierName || "-"}</td>
                                        <td className={styles.centerAlign}>{product.variantCount}</td>
                                        <td className={styles.centerAlign}>
                                            <span className={product.hasLowStock ? styles.stockLow : styles.stockOk}>
                                                {product.totalStock}
                                            </span>
                                        </td>
                                        <td>R$ {product.averageSalePrice.toFixed(2)}</td>
                                        <td>{getStockBadge(product)}</td>
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
        </div>
    );
}
