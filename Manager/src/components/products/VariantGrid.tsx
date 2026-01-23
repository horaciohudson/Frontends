import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TRANSLATION_NAMESPACES } from '../../locales';
import { ProductVariantService } from '../../service/ProductVariant';
import { SizeService } from '../../service/Size';
import { ColorService } from '../../service/Color';
import type { ProductVariant, ProductVariantRequest } from '../../types/ProductVariant';
import type { Size } from '../../types/Size';
import type { Color } from '../../types/Color';
import styles from '../../styles/products/VariantGrid.module.css';

interface VariantGridProps {
    productId: string | null | undefined;
    onVariantsChange?: () => void;
}

interface VariantCell {
    sizeId: string;
    colorId: string;
    variant?: ProductVariant;
    stockQuantity: number;
    salePrice?: number;
    costPrice?: number;
}

function VariantGrid({ productId, onVariantsChange }: VariantGridProps) {
    console.log("🎨 VariantGrid renderizado com productId:", productId);
    
    const { t } = useTranslation(TRANSLATION_NAMESPACES.PRINCIPAL);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [variantCells, setVariantCells] = useState<Map<string, VariantCell>>(new Map());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        console.log("🔄 useEffect disparado - productId:", productId, "tipo:", typeof productId);
        if (productId && productId !== null && productId !== undefined) {
            console.log("✅ ProductId válido, carregando dados...");
            loadData();
        } else {
            console.log("❌ ProductId inválido:", productId);
        }
    }, [productId]);

    const loadData = async () => {
        try {
            console.log("📊 Iniciando loadData para productId:", productId, "tipo:", typeof productId);
            setLoading(true);
            
            // ProductId is already a string (UUID)
            if (!productId) {
                throw new Error("ProductId inválido");
            }
            
            console.log("🔄 Chamando APIs com productId:", productId);
            const [sizesRes, colorsRes, variantsRes] = await Promise.all([
                SizeService.getAll(),
                ColorService.getAll(),
                ProductVariantService.getByProductId(productId)
            ]);

            console.log("📏 Sizes response:", sizesRes);
            console.log("🎨 Colors response:", colorsRes);
            console.log("🎯 Variants response:", variantsRes);

            const loadedSizes = sizesRes || [];
            const loadedColors = colorsRes || [];
            const loadedVariants = variantsRes.data || [];

            console.log("📊 Dados processados:");
            console.log("- Sizes:", loadedSizes.length);
            console.log("- Colors:", loadedColors.length);
            console.log("- Variants:", loadedVariants.length);

            // Filter active sizes and colors
            const activeSizes = loadedSizes.filter((s: Size) => s.active !== false);
            const activeColors = loadedColors.filter((c: Color) => c.active !== false);

            console.log("✅ Dados ativos:");
            console.log("- Active Sizes:", activeSizes.length);
            console.log("- Active Colors:", activeColors.length);

            setSizes(activeSizes);
            setColors(activeColors);
            setVariants(loadedVariants);

            // Build variant cells map
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
                        stockQuantity: existingVariant?.stockQuantity || 0,
                        salePrice: existingVariant?.salePrice || undefined,
                        costPrice: existingVariant?.costPrice || undefined
                    });
                });
            });

            console.log("🗺️ Cells map criado com", cellsMap.size, "células");
            setVariantCells(cellsMap);
        } catch (err) {
            console.error('❌ Erro ao carregar dados de variantes:', err);
            alert('Erro ao carregar dados de variantes: ' + (err as Error).message);
        } finally {
            setLoading(false);
            console.log("✅ LoadData finalizado");
        }
    };

    const getCellKey = (sizeId: string, colorId: string) => `${sizeId}-${colorId}`;

    const handleStockChange = (sizeId: string, colorId: string, value: string) => {
        const key = getCellKey(sizeId, colorId);
        const cell = variantCells.get(key);
        if (!cell) return;

        const stockQuantity = parseInt(value) || 0;
        const updatedCell = { ...cell, stockQuantity };

        const newMap = new Map(variantCells);
        newMap.set(key, updatedCell);
        setVariantCells(newMap);
    };

    const handlePriceChange = (sizeId: string, colorId: string, field: 'salePrice' | 'costPrice', value: string) => {
        const key = getCellKey(sizeId, colorId);
        const cell = variantCells.get(key);
        if (!cell) return;

        const price = parseFloat(value) || undefined;
        const updatedCell = { ...cell, [field]: price };

        const newMap = new Map(variantCells);
        newMap.set(key, updatedCell);
        setVariantCells(newMap);
    };

    const handleSaveAll = async () => {
        try {
            setSaving(true);

            // Collect all cells with stock > 0 or existing variants
            const variantsToCreate: ProductVariantRequest[] = [];
            const variantsToUpdate: Array<{ id: string; data: ProductVariantRequest }> = [];

            variantCells.forEach((cell) => {
                if (cell.stockQuantity > 0 || cell.variant) {
                    const variantData: ProductVariantRequest = {
                        sizeId: cell.sizeId,
                        colorId: cell.colorId,
                        stockQuantity: cell.stockQuantity,
                        salePrice: cell.salePrice,
                        costPrice: cell.costPrice,
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
                await ProductVariantService.bulkCreate(productId, variantsToCreate);
            }

            // Execute updates
            for (const { id, data } of variantsToUpdate) {
                await ProductVariantService.update(id, data);
            }

            alert('Variantes salvas com sucesso!');
            await loadData();
            onVariantsChange?.();
        } catch (err: any) {
            console.error('Error saving variants:', err);
            const errorMsg = err.response?.data?.message || 'Erro ao salvar variantes';
            alert(errorMsg);
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
        alert('Estoque padrão (10) aplicado a todas as combinações');
    };

    const handleClearAll = () => {
        if (!window.confirm('Tem certeza que deseja limpar todas as variantes?')) {
            return;
        }

        const newMap = new Map(variantCells);
        newMap.forEach((cell, key) => {
            newMap.set(key, { ...cell, stockQuantity: 0, salePrice: undefined, costPrice: undefined });
        });
        setVariantCells(newMap);
        alert('Todas as variantes foram limpas');
    };

    if (loading) {
        return <div className={styles.loading}>Carregando variantes...</div>;
    }

    if (sizes.length === 0 || colors.length === 0) {
        return (
            <div className={styles.empty}>
                <p>⚠️ É necessário cadastrar tamanhos e cores antes de criar variantes</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>🎨 Variantes do Produto (Tamanho × Cor)</h3>
                <div className={styles.actions}>
                    <button
                        className={styles.btnSecondary}
                        onClick={handleGenerateAll}
                        disabled={saving}
                    >
                        ⚡ Gerar Todas
                    </button>
                    <button
                        className={styles.btnSecondary}
                        onClick={handleClearAll}
                        disabled={saving}
                    >
                        🗑️ Limpar Todas
                    </button>
                    <button
                        className={styles.btnPrimary}
                        onClick={handleSaveAll}
                        disabled={saving}
                    >
                        {saving ? '💾 Salvando...' : '💾 Salvar Variantes'}
                    </button>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.sizeHeader}>Tamanho / Cor</th>
                            {colors.map((color) => (
                                <th key={color.id} className={styles.colorHeader}>
                                    <div className={styles.colorHeaderContent}>
                                        <span
                                            className={styles.colorPreview}
                                            style={{ backgroundColor: color.hexCode || '#ccc' }}
                                        />
                                        <span>{color.colorName || color.name}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sizes.map((size) => (
                            <tr key={size.id}>
                                <td className={styles.sizeCell}>
                                    <strong>{size.sizeName || size.name}</strong>
                                </td>
                                {colors.map((color) => {
                                    const key = getCellKey(size.id, color.id);
                                    const cell = variantCells.get(key);
                                    if (!cell) return <td key={key}>-</td>;

                                    return (
                                        <td key={key} className={styles.variantCell}>
                                            <div className={styles.variantInputs}>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="Estoque"
                                                    value={cell.stockQuantity || ''}
                                                    onChange={(e) => handleStockChange(size.id, color.id, e.target.value)}
                                                    className={`${styles.stockInput} ${cell.stockQuantity > 0 ? styles.hasStock : ''}`}
                                                />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="Preço Venda"
                                                    value={cell.salePrice || ''}
                                                    onChange={(e) => handlePriceChange(size.id, color.id, 'salePrice', e.target.value)}
                                                    className={styles.priceInput}
                                                />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="Preço Custo"
                                                    value={cell.costPrice || ''}
                                                    onChange={(e) => handlePriceChange(size.id, color.id, 'costPrice', e.target.value)}
                                                    className={styles.priceInput}
                                                />
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.legend}>
                <p>💡 <strong>Dica:</strong> Preencha o estoque e preços para as combinações disponíveis.</p>
            </div>
        </div>
    );
}

export default VariantGrid;