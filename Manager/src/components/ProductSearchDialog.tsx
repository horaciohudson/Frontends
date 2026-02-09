// src/components/ProductSearchDialog.tsx
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { TRANSLATION_NAMESPACES } from "../locales";
import { Product } from "../models/Product";
import { listProducts } from "../service/product";
import styles from "../styles/components/ProductSearchDialog.module.css";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (product: Product) => void;
};

export default function ProductSearchDialog({ isOpen, onClose, onSelect }: Props) {
    const { t } = useTranslation([TRANSLATION_NAMESPACES.COMMERCIAL]);
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const loadProducts = useCallback(async (query: string, pageNum: number = 0) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await listProducts({
                q: query || undefined,
                page: pageNum,
                size: 10
            });
            setProducts(response.content);
            setTotalPages(response.totalPages);
            setPage(pageNum);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(t("productSearch.error"));
            console.error("Error loading products:", errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    // Load products only when dialog opens
    useEffect(() => {
        if (isOpen) {
            loadProducts("", 0);
            setSearchQuery("");
        }
    }, [isOpen, loadProducts]);

    // Debounce search to avoid excessive API calls
    useEffect(() => {
        if (!isOpen) return;

        const timeoutId = setTimeout(() => {
            loadProducts(searchQuery, 0);
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery, isOpen, loadProducts]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSelectProduct = (product: Product) => {
        onSelect(product);
        onClose();
        setSearchQuery("");
    };

    const handleClose = () => {
        onClose();
        setSearchQuery("");
        setError(null);
    };

    const handleNextPage = () => {
        if (page < totalPages - 1) {
            loadProducts(searchQuery, page + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 0) {
            loadProducts(searchQuery, page - 1);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>{t("productSearch.title")}</h2>
                    <button className={styles.closeButton} onClick={handleClose}>
                        ✕
                    </button>
                </div>

                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder={t("productSearch.searchPlaceholder")}
                        value={searchQuery}
                        onChange={handleSearch}
                        autoFocus
                    />
                </div>

                <div className={styles.content}>
                    {isLoading ? (
                        <p className={styles.message}>{t("productSearch.loading")}</p>
                    ) : error ? (
                        <p className={styles.error}>{error}</p>
                    ) : products.length === 0 ? (
                        <p className={styles.message}>{t("productSearch.noResults")}</p>
                    ) : (
                        <>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>{t("productSearch.columns.id")}</th>
                                        <th>{t("productSearch.columns.name")}</th>
                                        <th>{t("productSearch.columns.reference")}</th>
                                        <th>{t("productSearch.columns.category")}</th>
                                        <th>{t("buttons.actions")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr
                                            key={product.id}
                                            className={styles.row}
                                            onDoubleClick={() => handleSelectProduct(product)}
                                        >
                                            <td>{product.id}</td>
                                            <td>{product.name}</td>
                                            <td>{product.reference || "-"}</td>
                                            <td>{product.categoryName || product.productCategory?.name || "-"}</td>
                                            <td>
                                                <button
                                                    className={styles.selectButton}
                                                    onClick={() => handleSelectProduct(product)}
                                                >
                                                    {t("productSearch.selectProduct")}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {totalPages > 1 && (
                                <div className={styles.pagination}>
                                    <button
                                        className={styles.pageButton}
                                        onClick={handlePrevPage}
                                        disabled={page === 0}
                                    >
                                        ← {t("buttons.previous")}
                                    </button>
                                    <span className={styles.pageInfo}>
                                        {t("tables.showing")} {page + 1} {t("tables.of")} {totalPages}
                                    </span>
                                    <button
                                        className={styles.pageButton}
                                        onClick={handleNextPage}
                                        disabled={page >= totalPages - 1}
                                    >
                                        {t("buttons.next")} →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
