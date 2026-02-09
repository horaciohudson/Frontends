// src/components/sales/VariantSelectionDialog.tsx
import { useState, useEffect } from "react";
import { ProductVariant } from "../../types/ProductVariant";
import { ProductVariantService } from "../../service/ProductVariant";
import styles from "./VariantSelectionDialog.module.css";

interface VariantSelectionDialogProps {
    productId: string;
    productName: string;
    onSelect: (variant: ProductVariant) => void;
    onClose: () => void;
}

export default function VariantSelectionDialog({
    productId,
    productName,
    onSelect,
    onClose
}: VariantSelectionDialogProps) {
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadVariants();
    }, [productId]);

    const loadVariants = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await ProductVariantService.getByProductId(productId);
            setVariants(response.data || []);
        } catch (err) {
            console.error("Error loading variants:", err);
            setError("Erro ao carregar variantes do produto");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value?: number) => {
        if (!value) return "R$ 0,00";
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(value);
    };

    const getStockStatus = (variant: ProductVariant) => {
        if (variant.stockQuantity === 0) return "out-of-stock";
        if (variant.hasLowStock) return "low-stock";
        return "in-stock";
    };

    const getStockLabel = (variant: ProductVariant) => {
        if (variant.stockQuantity === 0) return "Sem estoque";
        if (variant.hasLowStock) return `Estoque baixo (${variant.stockQuantity})`;
        return `${variant.stockQuantity} un.`;
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>Selecionar Variante</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.closeButton}
                        aria-label="Fechar"
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.productInfo}>
                    <strong>{productName}</strong>
                </div>

                <div className={styles.body}>
                    {loading && (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Carregando variantes...</p>
                        </div>
                    )}

                    {error && (
                        <div className={styles.error}>
                            <p>❌ {error}</p>
                            <button onClick={loadVariants} className={styles.retryButton}>
                                Tentar novamente
                            </button>
                        </div>
                    )}

                    {!loading && !error && variants.length === 0 && (
                        <div className={styles.empty}>
                            <p>📭 Nenhuma variante disponível para este produto</p>
                            <p className={styles.hint}>
                                Cadastre variantes no gerenciamento de produtos
                            </p>
                        </div>
                    )}

                    {!loading && !error && variants.length > 0 && (
                        <div className={styles.variantGrid}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Tamanho</th>
                                        <th>Cor</th>
                                        <th>Estoque</th>
                                        <th>Preço</th>
                                        <th>Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {variants.map((variant) => (
                                        <tr
                                            key={variant.id}
                                            className={`${styles.variantRow} ${styles[getStockStatus(variant)]}`}
                                        >
                                            <td>
                                                <span className={styles.sizeBadge}>
                                                    {variant.sizeName || "-"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.colorCell}>
                                                    {variant.colorHex && (
                                                        <span
                                                            className={styles.colorSwatch}
                                                            style={{ backgroundColor: variant.colorHex }}
                                                        ></span>
                                                    )}
                                                    <span>{variant.colorName || "-"}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.stockBadge} ${styles[getStockStatus(variant)]}`}>
                                                    {getStockLabel(variant)}
                                                </span>
                                            </td>
                                            <td className={styles.price}>
                                                {formatCurrency(variant.salePrice)}
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => onSelect(variant)}
                                                    disabled={variant.stockQuantity === 0}
                                                    className={styles.selectButton}
                                                >
                                                    {variant.stockQuantity === 0 ? "Indisponível" : "Selecionar"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
