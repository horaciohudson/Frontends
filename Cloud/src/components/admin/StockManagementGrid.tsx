import { useState, useEffect } from 'react';
import { productsAPI, stockAPI } from '../../services/api';
import ProductStockRow from './ProductStockRow';
import './StockManagementGrid.css';

interface ProductWithStock {
    id: number;
    name: string;
    sku: string;
    stockId: number | null;
    quantity: number;
    minQuantity: number;
    location: string | null;
    status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

function StockManagementGrid() {
    const [products, setProducts] = useState<ProductWithStock[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<ProductWithStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'out' | 'normal'>('all');
    const [editingCell, setEditingCell] = useState<{ productId: number; field: string } | null>(null);
    const [savingCells, setSavingCells] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [products, searchQuery, statusFilter]);

    const loadData = async () => {
        try {
            setLoading(true);
            
            // Load products and stocks in parallel
            const [productsResponse, stocksResponse] = await Promise.all([
                productsAPI.getAll(0, 1000),
                stockAPI.getAll(0, 1000)
            ]);

            console.log('📦 Products Response:', productsResponse.data);
            console.log('📊 Stocks Response:', stocksResponse.data);

            const productsList = productsResponse.data.data?.content || [];
            const stocksList = stocksResponse.data.data?.content || stocksResponse.data.data || [];

            console.log('📦 Products List:', productsList);
            console.log('📊 Stocks List:', stocksList);

            // Create a map of stocks by productId
            const stocksMap = new Map();
            stocksList.forEach((stock: any) => {
                stocksMap.set(stock.productId, stock);
            });

            // Merge products with stock data
            const mergedData: ProductWithStock[] = productsList.map((product: any) => {
                const stock = stocksMap.get(product.id);
                const quantity = stock?.quantity ?? 0;
                const minQuantity = stock?.lowStockThreshold ?? 0;

                // Determine status
                let status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
                if (quantity === 0) {
                    status = 'OUT_OF_STOCK';
                } else if (quantity < minQuantity) {
                    status = 'LOW_STOCK';
                }

                return {
                    id: product.id,
                    name: product.name,
                    sku: product.sku || `SKU-${product.id}`,
                    stockId: stock?.id ?? null,
                    quantity,
                    minQuantity,
                    location: stock?.warehouseLocation ?? null,
                    status
                };
            });

            console.log('✅ Merged Data:', mergedData);
            setProducts(mergedData);
        } catch (err) {
            console.error('❌ Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...products];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(query) ||
                p.sku.toLowerCase().includes(query)
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            if (statusFilter === 'low') {
                filtered = filtered.filter(p => p.status === 'LOW_STOCK');
            } else if (statusFilter === 'out') {
                filtered = filtered.filter(p => p.status === 'OUT_OF_STOCK');
            } else if (statusFilter === 'normal') {
                filtered = filtered.filter(p => p.status === 'IN_STOCK');
            }
        }

        setFilteredProducts(filtered);
    };

    const handleCellEdit = (productId: number, field: string) => {
        setEditingCell({ productId, field });
    };

    const handleCellSave = async (productId: number, field: string, value: any) => {
        const cellKey = `${productId}-${field}`;
        setSavingCells(prev => new Set(prev).add(cellKey));
        setEditingCell(null);

        try {
            const product = products.find(p => p.id === productId);
            if (!product) return;

            if (!product.stockId) {
                // Create stock first with default values
                const createResponse = await stockAPI.create({
                    productId: productId,
                    quantity: field === 'quantity' ? value : 0,
                    minQuantity: field === 'minQuantity' ? value : 0,
                    location: field === 'location' ? value : null
                });
                
                // Get the created stock ID
                const newStockId = createResponse.data.data.id;
                
                // If we just created with the value, reload and return
                await loadData();
            } else {
                // Update existing stock using PUT endpoint
                await stockAPI.update(product.stockId, { [field]: value });
                
                // Reload data to get updated values
                await loadData();
            }
        } catch (err: any) {
            console.error('Error saving stock:', err);
            alert(err.response?.data?.message || err.message || 'Erro ao salvar estoque');
        } finally {
            setSavingCells(prev => {
                const newSet = new Set(prev);
                newSet.delete(cellKey);
                return newSet;
            });
        }
    };

    const handleCellCancel = () => {
        setEditingCell(null);
    };

    return (
        <div className="stock-management-grid">
            <div className="grid-header">
                <div>
                    <h2>📦 Gerenciamento de Estoque</h2>
                    <p>Total: {filteredProducts.length} produtos</p>
                </div>
            </div>

            <div className="grid-controls">
                <input
                    type="text"
                    className="search-input"
                    placeholder="🔍 Buscar por nome ou SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <select 
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                    <option value="all">Todos os produtos</option>
                    <option value="normal">Em Estoque</option>
                    <option value="low">Estoque Baixo</option>
                    <option value="out">Sem Estoque</option>
                </select>
            </div>

            {loading ? (
                <div className="loading-state">Carregando produtos...</div>
            ) : filteredProducts.length === 0 ? (
                <div className="empty-state">
                    <p>Nenhum produto encontrado</p>
                    {searchQuery && <p className="hint">Tente ajustar sua busca</p>}
                </div>
            ) : (
                <div className="table-container">
                    <table className="stock-table">
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Estoque Atual</th>
                                <th>Estoque Mínimo</th>
                                <th>Localização</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <ProductStockRow
                                    key={product.id}
                                    product={product}
                                    editingCell={editingCell}
                                    savingCells={savingCells}
                                    onCellEdit={handleCellEdit}
                                    onCellSave={handleCellSave}
                                    onCellCancel={handleCellCancel}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="grid-footer">
                <p className="hint">💡 Dica: Duplo clique em qualquer célula para editar</p>
            </div>
        </div>
    );
}

export default StockManagementGrid;
