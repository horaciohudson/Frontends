import { useState, useEffect } from 'react';
import { productVariantsAPI, sizesAPI, colorsAPI } from '../../services/api';
import type { ProductVariant, ProductVariantRequest } from '../../types/productVariant';
import type { Size } from '../../types/size';
import type { Color } from '../../types/color';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../common/LoadingSpinner';
import './VariantGrid.css';

interface VariantGridProps {
    productId: number;
    onVariantsChange?: () => void;
}

interface VariantCell {
    sizeId: number;
    colorId: number;
    variant?: ProductVariant;
    stockQuantity: number;
}

function VariantGrid({ productId, onVariantsChange }: VariantGridProps) {
    const { showNotification } = useNotification();
    const [sizes, setSizes] = useState<Size[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [variantCells, setVariantCells] = useState<Map<string, VariantCell>>(new Map());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, [productId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [sizesRes, colorsRes, variantsRes] = await Promise.all([
                sizesAPI.getAll(),
                colorsAPI.getAll(),
                productVariantsAPI.getByProductId(productId)
            ]);

            const loadedSizes = sizesRes.data.data || [];
            const loadedColors = colorsRes.data.data || [];
            const loadedVariants = variantsRes.data.data || [];

            const activeSizes = loadedSizes.filter((s: Size) => s.active);
            const activeColors = loadedColors.filter((c: Color) => c.active);

            setSizes(activeSizes);
            setColors(activeColors);
            setVariants(loadedVariants);

            // Build variant cells map - only for active sizes and colors
            const cellsMap = new Map<string, VariantCell>();
            activeSizes.forEach((size: Size) => {
                activeColors.forEach((color: Color) => {
                    const key = `${size.id}-${color.id}`;
                    const existingVariant = loadedVariants.find(
                        (v: ProductVariant) => v.sizeId === size.id && v.colorId === color.id
                    );

                    cellsMap.set(key, {
                        sizeId: size.id,
                        colorId: color.id,
                        variant: existingVariant,
                        stockQuantity: existingVariant?.stockQuantity || 0
                    });
                });
            });

            setVariantCells(cellsMap);
        } catch (err) {
            console.error('Error loading variant data:', err);
            showNotification('error', 'Erro ao carregar dados de variantes');
        } finally {
            setLoading(false);
        }
    };

    const getCellKey = (sizeId: number, colorId: number) => `${sizeId}-${colorId}`;

    const handleStockChange = (sizeId: number, colorId: number, value: string) => {
        const key = getCellKey(sizeId, colorId);
        const cell = variantCells.get(key);
        if (!cell) return;

        const stockQuantity = parseInt(value) || 0;
        const updatedCell = { ...cell, stockQuantity };

        const newMap = new Map(variantCells);
        newMap.set(key, updatedCell);
        setVariantCells(newMap);
    };



    const handleSaveAll = async () => {
        try {
            setSaving(true);

            // Collect all cells with stock >= 0
            const variantsToCreate: ProductVariantRequest[] = [];
            const variantsToUpdate: Array<{ id: number; data: ProductVariantRequest }> = [];

            variantCells.forEach((cell) => {
                if (cell.stockQuantity >= 0) {
                    const variantData: ProductVariantRequest = {
                        sizeId: cell.sizeId,
                        colorId: cell.colorId,
                        stockQuantity: cell.stockQuantity,
                        active: true
                    };

                    if (cell.variant) {
                        // Update existing
                        variantsToUpdate.push({ id: cell.variant.id, data: variantData });
                    } else if (cell.stockQuantity > 0) {
                        // Create new only if stock > 0
                        variantsToCreate.push(variantData);
                    }
                }
            });

            // Execute bulk create
            if (variantsToCreate.length > 0) {
                await productVariantsAPI.bulkCreate(productId, variantsToCreate);
            }

            // Execute updates
            for (const { id, data } of variantsToUpdate) {
                await productVariantsAPI.update(id, data);
            }

            showNotification('success', 'Variantes salvas com sucesso!');
            await loadData();
            onVariantsChange?.();
        } catch (err: any) {
            console.error('Error saving variants:', err);
            const errorMsg = err.response?.data?.message || 'Erro ao salvar variantes';
            showNotification('error', errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateAll = () => {
        const newMap = new Map(variantCells);
        newMap.forEach((cell, key) => {
            if (cell.stockQuantity === 0) {
                newMap.set(key, { ...cell, stockQuantity: 10 });
            }
        });
        setVariantCells(newMap);
        showNotification('info', 'Estoque padrão (10) aplicado a todas as combinações');
    };

    const handleClearAll = () => {
        if (!window.confirm('Tem certeza que deseja limpar todas as variantes?')) {
            return;
        }

        const newMap = new Map(variantCells);
        newMap.forEach((cell, key) => {
            newMap.set(key, { ...cell, stockQuantity: 0 });
        });
        setVariantCells(newMap);
        showNotification('info', 'Todas as variantes foram limpas');
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (sizes.length === 0 || colors.length === 0) {
        return (
            <div className="variant-grid-empty">
                <p>⚠️ É necessário cadastrar tamanhos e cores antes de criar variantes</p>
            </div>
        );
    }

    return (
        <div className="variant-grid-container">
            <div className="variant-grid-header">
                <h3>🎨 Variantes do Produto (Tamanho × Cor)</h3>
                <div className="variant-grid-actions">
                    <button
                        className="btn-secondary"
                        onClick={handleGenerateAll}
                        disabled={saving}
                    >
                        ⚡ Gerar Todas
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={handleClearAll}
                        disabled={saving}
                    >
                        🗑️ Limpar Todas
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleSaveAll}
                        disabled={saving}
                    >
                        {saving ? '💾 Salvando...' : '💾 Salvar Variantes'}
                    </button>
                </div>
            </div>

            <div className="variant-grid-table-wrapper">
                <table className="variant-grid-table">
                    <thead>
                        <tr>
                            <th className="size-header">Tamanho / Cor</th>
                            {colors.map((color) => (
                                <th key={color.id} className="color-header">
                                    <div className="color-header-content">
                                        <span
                                            className="color-preview"
                                            style={{ backgroundColor: color.hexCode || '#ccc' }}
                                        />
                                        <span>{color.colorName}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sizes.map((size) => (
                            <tr key={size.id}>
                                <td className="size-cell">
                                    <strong>{size.sizeName}</strong>
                                </td>
                                {colors.map((color) => {
                                    const key = getCellKey(size.id, color.id);
                                    const cell = variantCells.get(key);
                                    if (!cell) return <td key={key}>-</td>;

                                    return (
                                        <td key={key} className="variant-cell">
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Estoque"
                                                value={cell.stockQuantity || ''}
                                                onChange={(e) => handleStockChange(size.id, color.id, e.target.value)}
                                                className={`stock-input ${cell.stockQuantity > 0 ? 'has-stock' : ''}`}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="variant-grid-legend">
                <p>💡 <strong>Dica:</strong> Preencha o estoque para as combinações disponíveis.</p>
            </div>
        </div>
    );
}

export default VariantGrid;
