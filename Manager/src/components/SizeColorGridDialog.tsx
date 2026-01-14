// src/components/SizeColorGridDialog.tsx
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../service/api';
import styles from '../styles/components/ProductSearchDialog.module.css';

interface ProductSizeColor {
    id: string;
    productId: string;
    productName: string;
    sizeId: string;
    sizeName: string;
    colorId: string;
    colorName: string;
    colorHexCode?: string;
    stock: number;
    salePrice: number;
    costPrice: number;
    active: boolean;
}

export interface GridItem {
    sizeId: string;
    sizeName: string;
    colorId: string;
    colorName: string;
    colorHexCode?: string;
    quantity: number;
    unitPrice: number;
    productSizeColorId: string;
}

interface SizeColorGridDialogProps {
    isOpen: boolean;
    productId: string;
    productName: string;
    onClose: () => void;
    onConfirm: (items: GridItem[]) => void;
}

interface GridCell {
    sizeId: string;
    sizeName: string;
    colorId: string;
    colorName: string;
    colorHexCode?: string;
    quantity: number;
    unitPrice: number;
    stock: number;
    productSizeColorId: string;
}

export default function SizeColorGridDialog({
    isOpen,
    productId,
    productName,
    onClose,
    onConfirm
}: SizeColorGridDialogProps) {
    const { t } = useTranslation(['commercial', 'common']);

    const [productSizeColors, setProductSizeColors] = useState<ProductSizeColor[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [gridData, setGridData] = useState<Map<string, GridCell>>(new Map());

    // Extrair tamanhos e cores únicos
    const [sizes, setSizes] = useState<{ id: string; name: string }[]>([]);
    const [colors, setColors] = useState<{ id: string; name: string; hexCode?: string }[]>([]);

    const loadProductSizeColors = useCallback(async () => {
        if (!productId) return;

        try {
            setLoading(true);
            setError(null);

            const res = await api.get(`/stock/product-size-colors/by-product/${productId}`);
            const data = Array.isArray(res.data) ? res.data : [];

            setProductSizeColors(data);

            // Extrair tamanhos únicos
            const uniqueSizes = new Map<string, { id: string; name: string }>();
            data.forEach((psc: ProductSizeColor) => {
                if (!uniqueSizes.has(psc.sizeId)) {
                    uniqueSizes.set(psc.sizeId, { id: psc.sizeId, name: psc.sizeName });
                }
            });
            setSizes(Array.from(uniqueSizes.values()));

            // Extrair cores únicas
            const uniqueColors = new Map<string, { id: string; name: string; hexCode?: string }>();
            data.forEach((psc: ProductSizeColor) => {
                if (!uniqueColors.has(psc.colorId)) {
                    uniqueColors.set(psc.colorId, {
                        id: psc.colorId,
                        name: psc.colorName,
                        hexCode: psc.colorHexCode
                    });
                }
            });
            setColors(Array.from(uniqueColors.values()));

            // Inicializar grid data
            const newGridData = new Map<string, GridCell>();
            data.forEach((psc: ProductSizeColor) => {
                const key = `${psc.colorId}-${psc.sizeId}`;
                newGridData.set(key, {
                    sizeId: psc.sizeId,
                    sizeName: psc.sizeName,
                    colorId: psc.colorId,
                    colorName: psc.colorName,
                    colorHexCode: psc.colorHexCode,
                    quantity: 0,
                    unitPrice: psc.salePrice,
                    stock: psc.stock,
                    productSizeColorId: psc.id
                });
            });
            setGridData(newGridData);

        } catch (err) {
            console.error('Erro ao carregar variações:', err);
            setError('Erro ao carregar variações do produto');
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        if (isOpen && productId) {
            loadProductSizeColors();
        }
    }, [isOpen, productId, loadProductSizeColors]);

    const handleQuantityChange = (colorId: string, sizeId: string, value: string) => {
        const key = `${colorId}-${sizeId}`;
        const cell = gridData.get(key);
        if (!cell) return;

        const qty = parseInt(value) || 0;
        const newGridData = new Map(gridData);
        newGridData.set(key, { ...cell, quantity: Math.max(0, qty) });
        setGridData(newGridData);
    };

    const handleConfirm = () => {
        const items: GridItem[] = [];

        gridData.forEach((cell) => {
            if (cell.quantity > 0) {
                items.push({
                    sizeId: cell.sizeId,
                    sizeName: cell.sizeName,
                    colorId: cell.colorId,
                    colorName: cell.colorName,
                    colorHexCode: cell.colorHexCode,
                    quantity: cell.quantity,
                    unitPrice: cell.unitPrice,
                    productSizeColorId: cell.productSizeColorId
                });
            }
        });

        if (items.length === 0) {
            setError('Por favor, informe a quantidade em pelo menos uma célula');
            return;
        }

        onConfirm(items);
    };

    const getTotalItems = () => {
        let total = 0;
        gridData.forEach((cell) => {
            if (cell.quantity > 0) total++;
        });
        return total;
    };

    const getTotalQuantity = () => {
        let total = 0;
        gridData.forEach((cell) => {
            total += cell.quantity;
        });
        return total;
    };

    const getTotalValue = () => {
        let total = 0;
        gridData.forEach((cell) => {
            total += cell.quantity * cell.unitPrice;
        });
        return total;
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.dialog} style={{ maxWidth: '900px', width: '90%' }}>
                <div className={styles.header}>
                    <h2>Grade de Tamanho × Cor</h2>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                        Produto: <strong>{productName}</strong>
                    </p>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                <div className={styles.content}>
                    {loading && <p className={styles.loading}>Carregando variações...</p>}

                    {error && <p className={styles.error}>{error}</p>}

                    {!loading && !error && sizes.length === 0 && (
                        <p className={styles.empty}>
                            Este produto não possui variações de tamanho/cor cadastradas.
                        </p>
                    )}

                    {!loading && !error && sizes.length > 0 && colors.length > 0 && (
                        <>
                            <div style={{ overflowX: 'auto' }}>
                                <table className={styles.table} style={{ minWidth: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left', minWidth: '120px' }}>
                                                Cor \ Tamanho
                                            </th>
                                            {sizes.map(size => (
                                                <th key={size.id} style={{ textAlign: 'center', minWidth: '80px' }}>
                                                    {size.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {colors.map(color => (
                                            <tr key={color.id}>
                                                <td style={{ fontWeight: '500' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        {color.hexCode && (
                                                            <span
                                                                style={{
                                                                    display: 'inline-block',
                                                                    width: '16px',
                                                                    height: '16px',
                                                                    borderRadius: '3px',
                                                                    backgroundColor: color.hexCode,
                                                                    border: '1px solid #ccc'
                                                                }}
                                                            />
                                                        )}
                                                        {color.name}
                                                    </div>
                                                </td>
                                                {sizes.map(size => {
                                                    const key = `${color.id}-${size.id}`;
                                                    const cell = gridData.get(key);

                                                    if (!cell) {
                                                        // Combinação não existe
                                                        return (
                                                            <td key={size.id} style={{
                                                                textAlign: 'center',
                                                                backgroundColor: '#f0f0f0',
                                                                color: '#999'
                                                            }}>
                                                                -
                                                            </td>
                                                        );
                                                    }

                                                    return (
                                                        <td key={size.id} style={{ padding: '4px' }}>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={cell.quantity || ''}
                                                                onChange={(e) => handleQuantityChange(color.id, size.id, e.target.value)}
                                                                placeholder="0"
                                                                style={{
                                                                    width: '70px',
                                                                    textAlign: 'center',
                                                                    padding: '6px',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px',
                                                                    fontSize: '14px'
                                                                }}
                                                                title={`Estoque: ${cell.stock} | Preço: R$ ${cell.unitPrice.toFixed(2)}`}
                                                            />
                                                            <div style={{
                                                                fontSize: '10px',
                                                                color: cell.stock < 5 ? '#c00' : '#666',
                                                                marginTop: '2px'
                                                            }}>
                                                                Est: {cell.stock}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Resumo */}
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <span style={{ marginRight: '2rem' }}>
                                        <strong>Itens:</strong> {getTotalItems()}
                                    </span>
                                    <span style={{ marginRight: '2rem' }}>
                                        <strong>Qtd Total:</strong> {getTotalQuantity()}
                                    </span>
                                    <span>
                                        <strong>Valor Total:</strong> R$ {getTotalValue().toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className={styles.footer}>
                    <button
                        className={styles.cancelBtn}
                        onClick={onClose}
                    >
                        {t('buttons.cancel')}
                    </button>
                    <button
                        className={styles.selectBtn}
                        onClick={handleConfirm}
                        disabled={loading || getTotalQuantity() === 0}
                    >
                        Adicionar {getTotalItems()} {getTotalItems() === 1 ? 'Item' : 'Itens'}
                    </button>
                </div>
            </div>
        </div>
    );
}
