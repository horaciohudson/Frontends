import { useState, useEffect } from 'react';
import { productsAPI, productVariantsAPI, productMovementsAPI } from '../../services/api';
import type { StockEntryItem } from '../../types/productMovement';
import type { ProductVariant } from '../../types/productVariant';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../common/LoadingSpinner';
import './StockEntryGrid.css';

interface Product {
    id: number;
    name: string;
    sku?: string;
}

interface StockEntryGridProps {
    onSuccess?: () => void;
}

function StockEntryGrid({ onSuccess }: StockEntryGridProps) {
    const { showNotification } = useNotification();
    const [items, setItems] = useState<StockEntryItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [searching, setSearching] = useState(false);
    const [saving, setSaving] = useState(false);
    const [reason, setReason] = useState('Entrada de Estoque');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (searchTerm.length >= 2) {
            searchProducts();
        } else {
            setSearchResults([]);
        }
    }, [searchTerm]);

    const searchProducts = async () => {
        try {
            setSearching(true);
            const response = await productsAPI.search(searchTerm);
            setSearchResults(response.data.data?.content || []);
        } catch (err) {
            console.error('Error searching products:', err);
        } finally {
            setSearching(false);
        }
    };

    const handleAddProduct = async (product: Product) => {
        // Check if product already in list
        if (items.some(item => item.productId === product.id && !item.variantId)) {
            showNotification('warning', 'Produto já adicionado');
            return;
        }

        // Check if product has variants
        try {
            const variantsResponse = await productVariantsAPI.getByProductId(product.id);
            const variants: ProductVariant[] = variantsResponse.data.data || [];

            if (variants.length > 0) {
                // Add each variant as a separate row
                const newItems = variants.map(variant => ({
                    productId: product.id,
                    productName: product.name,
                    variantId: variant.id,
                    sizeName: variant.sizeName,
                    colorName: variant.colorName,
                    quantity: 0,
                    unitCost: 0,
                    totalCost: 0
                }));
                setItems([...items, ...newItems]);
                showNotification('success', `${variants.length} variantes adicionadas`);
            } else {
                // Add product without variant
                const newItem: StockEntryItem = {
                    productId: product.id,
                    productName: product.name,
                    quantity: 0,
                    unitCost: 0,
                    totalCost: 0
                };
                setItems([...items, newItem]);
                showNotification('success', 'Produto adicionado');
            }

            setSearchTerm('');
            setSearchResults([]);
        } catch (err) {
            console.error('Error loading variants:', err);
            showNotification('error', 'Erro ao carregar variantes do produto');
        }
    };

    const handleQuantityChange = (index: number, value: string) => {
        const quantity = parseInt(value) || 0;
        const newItems = [...items];
        newItems[index].quantity = quantity;
        newItems[index].totalCost = quantity * newItems[index].unitCost;
        setItems(newItems);
    };

    const handleCostChange = (index: number, value: string) => {
        const cost = parseFloat(value) || 0;
        const newItems = [...items];
        newItems[index].unitCost = cost;
        newItems[index].totalCost = newItems[index].quantity * cost;
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        // Validate
        const validItems = items.filter(item => item.quantity > 0);
        if (validItems.length === 0) {
            showNotification('warning', 'Adicione pelo menos um item com quantidade');
            return;
        }

        try {
            setSaving(true);

            // Convert to movement requests
            const movements = validItems.map(item => ({
                movementType: 'ENTRY',
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                unitPrice: item.unitCost,
                reason: reason,
                notes: notes
            }));

            // Send bulk entry
            await productMovementsAPI.recordBulkEntry(movements);

            showNotification('success', `${validItems.length} entrada(s) de estoque registrada(s)!`);

            // Clear form
            setItems([]);
            setReason('Entrada de Estoque');
            setNotes('');

            onSuccess?.();
        } catch (err: any) {
            console.error('Error recording stock entry:', err);
            const errorMsg = err.response?.data?.message || 'Erro ao registrar entrada de estoque';
            showNotification('error', errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const getTotalItems = () => items.reduce((sum, item) => sum + item.quantity, 0);
    const getTotalCost = () => items.reduce((sum, item) => sum + (item.totalCost || 0), 0);

    return (
        <div className="stock-entry-grid-container">
            <div className="stock-entry-header">
                <h2>📦 Entrada de Estoque</h2>
            </div>

            <div className="stock-entry-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>Motivo</label>
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Ex: Compra de fornecedor"
                        />
                    </div>
                    <div className="form-group">
                        <label>Observações</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Observações adicionais..."
                            rows={2}
                        />
                    </div>
                </div>

                <div className="product-search">
                    <label>Buscar Produto</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Digite o nome ou SKU do produto..."
                        className="search-input"
                    />
                    {searching && <LoadingSpinner />}
                    {searchResults.length > 0 && (
                        <div className="search-results">
                            {searchResults.map(product => (
                                <div
                                    key={product.id}
                                    className="search-result-item"
                                    onClick={() => handleAddProduct(product)}
                                >
                                    <strong>{product.name}</strong>
                                    {product.sku && <span className="sku">SKU: {product.sku}</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="stock-entry-table-wrapper">
                <table className="stock-entry-table">
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Tamanho</th>
                            <th>Cor</th>
                            <th>Quantidade</th>
                            <th>Custo Unit. (R$)</th>
                            <th>Total (R$)</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="empty-message">
                                    Nenhum item adicionado. Use a busca acima para adicionar produtos.
                                </td>
                            </tr>
                        ) : (
                            items.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.productName}</td>
                                    <td>{item.sizeName || '-'}</td>
                                    <td>{item.colorName || '-'}</td>
                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.quantity || ''}
                                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                                            className="quantity-input"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={item.unitCost || ''}
                                            onChange={(e) => handleCostChange(index, e.target.value)}
                                            className="cost-input"
                                        />
                                    </td>
                                    <td className="total-cell">
                                        {(item.totalCost || 0).toFixed(2)}
                                    </td>
                                    <td>
                                        <button
                                            className="btn-remove"
                                            onClick={() => handleRemoveItem(index)}
                                            title="Remover"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    {items.length > 0 && (
                        <tfoot>
                            <tr className="totals-row">
                                <td colSpan={3}><strong>TOTAIS:</strong></td>
                                <td><strong>{getTotalItems()}</strong></td>
                                <td></td>
                                <td><strong>R$ {getTotalCost().toFixed(2)}</strong></td>
                                <td></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            <div className="stock-entry-actions">
                <button
                    className="btn-primary"
                    onClick={handleSubmit}
                    disabled={saving || items.length === 0}
                >
                    {saving ? '💾 Salvando...' : '💾 Registrar Entrada'}
                </button>
            </div>
        </div>
    );
}

export default StockEntryGrid;
