import { useState, useEffect } from "react";
// import { useTranslation } from "react-i18next"; // Uncomment if localization is needed
import { ProductPriceService, ProductPrice } from "../../service/ProductPrice";
import { Product as ProductModel } from "../../models/Product";
// Reuse ProductCost styles for consistency
import styles from "../../styles/products/ProductCost.module.css";

interface ProductPriceTabProps {
    product: ProductModel;
    onDoubleClickProduct?: (product: ProductModel) => void;
}

export default function ProductPriceTab({ product }: ProductPriceTabProps) {
    const [priceHistory, setPriceHistory] = useState<ProductPrice[]>([]);
    const [sellingPrice, setSellingPrice] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (product?.id) {
            loadData(product.id);
        }
    }, [product]);

    const loadData = (productId: string) => {
        setLoading(true);
        Promise.all([
            ProductPriceService.findByProductId(productId).catch(() => null),
            ProductPriceService.findHistoryByProductId(productId).catch(() => [])
        ])
            .then(([current, history]) => {
                if (current) {
                    setSellingPrice(current.sellingPrice ? String(current.sellingPrice) : "");
                } else {
                    setSellingPrice("");
                }
                setPriceHistory(history || []);
            })
            .finally(() => setLoading(false));
    };

    const handleSave = async () => {
        if (!product.id) return;
        setSaving(true);
        setMessage(null);
        try {
            const val = parseFloat(sellingPrice);
            const payload: Partial<ProductPrice> = {
                productId: product.id,
                sellingPrice: isNaN(val) ? undefined : val
            };
            await ProductPriceService.saveOrUpdate(product.id, payload);

            // Refresh data
            loadData(product.id);

            setMessage({ text: "Preço salvo com sucesso!", type: 'success' });

            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);

        } catch (error) {
            console.error("Error saving price:", error);
            setMessage({ text: "Erro ao salvar preço.", type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        try {
            return new Date(dateStr).toLocaleString();
        } catch (e) {
            return dateStr;
        }
    };

    const formatCurrency = (val?: number | null) => {
        if (val === null || val === undefined) return "-";
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    if (loading && !priceHistory.length && !sellingPrice) return <div>Carregando...</div>;

    return (
        <div className={styles.container}>
            {/* Form Section */}
            <div className={styles["form-section"]}>
                {/* <h3 className={styles["form-label"]}>Definir Preço de Venda</h3> */}

                <div className={styles["form-row"]}>
                    <div className={styles.column}>
                        <label className={styles["form-label"]}>
                            Preço de Venda Base
                        </label>
                        <div className={styles["field-suffix"]}>
                            <input
                                type="number"
                                step="0.01"
                                value={sellingPrice}
                                onChange={e => setSellingPrice(e.target.value)}
                                className={styles["form-input"]}
                            />
                            <span className={styles.suffix}>R$</span>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={message.type === 'success' ? styles.warning : styles.error}>
                        {message.text}
                    </div>
                )}

                <div className={styles["form-actions"]}>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={styles.button}
                    >
                        {saving ? 'Salvando...' : 'Salvar Novo Preço'}
                    </button>
                </div>
            </div>

            {/* History Table Section */}
            <div>
                {/* <h3 className={styles["form-label"]}>Histórico de Preços</h3> */}
                <div style={{ overflowX: 'auto' }}>
                    <table className={styles["cost-table"]}>
                        <thead>
                            <tr>
                                <th>Data/Hora</th>
                                <th>Preço</th>
                                <th>Responsável</th>
                            </tr>
                        </thead>
                        <tbody>
                            {priceHistory.length > 0 ? (
                                priceHistory.map((item, index) => (
                                    <tr key={index}>
                                        <td>{formatDate(item.createdAt)}</td>
                                        <td style={{ fontWeight: index === 0 ? 'bold' : 'normal' }}>
                                            R$ {formatCurrency(item.sellingPrice).replace('R$', '').trim()}
                                            {index === 0 && <span style={{
                                                marginLeft: '8px',
                                                fontSize: '0.8em',
                                                backgroundColor: '#43a047',
                                                color: 'white',
                                                padding: '2px 6px',
                                                borderRadius: '4px'
                                            }}>Atual</span>}
                                        </td>
                                        <td>{item.createdBy || "-"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className={styles["no-data"]}>
                                        Nenhum histórico de preço encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
