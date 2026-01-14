import { useState, useEffect } from 'react';
import { stockAPI } from '../../services/api';
import type { Stock } from '../../types/stock';
import './StockList.css';

interface StockListProps {
    onEdit: (stockId: number) => void;
    onCreateNew: () => void;
}

function StockList({ onEdit, onCreateNew }: StockListProps) {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

    useEffect(() => {
        loadStocks();
    }, [filter]);

    const loadStocks = async () => {
        try {
            setLoading(true);
            let response;
            
            switch (filter) {
                case 'low':
                    response = await stockAPI.getLowStock(0, 100);
                    break;
                case 'out':
                    response = await stockAPI.getOutOfStock(0, 100);
                    break;
                default:
                    response = await stockAPI.getAll(0, 100);
            }
            
            setStocks(response.data.data?.content || response.data || []);
        } catch (err) {
            console.error('Error loading stocks:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-stock-list">
            <div className="list-header">
                <div>
                    <h2>📦 Gerenciar Estoque</h2>
                    <p>Total: {stocks.length} itens</p>
                </div>
                <button className="btn-primary" onClick={onCreateNew}>
                    + Novo Item de Estoque
                </button>
            </div>

            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Todos
                </button>
                <button
                    className={`filter-tab ${filter === 'low' ? 'active' : ''}`}
                    onClick={() => setFilter('low')}
                >
                    Estoque Baixo
                </button>
                <button
                    className={`filter-tab ${filter === 'out' ? 'active' : ''}`}
                    onClick={() => setFilter('out')}
                >
                    Sem Estoque
                </button>
            </div>

            {loading ? (
                <div className="loading">Carregando estoque...</div>
            ) : stocks.length === 0 ? (
                <div className="empty-state">
                    <p>Nenhum item de estoque encontrado</p>
                    <button className="btn-primary" onClick={onCreateNew}>
                        + Criar Primeiro Item
                    </button>
                </div>
            ) : (
                <div className="stocks-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Quantidade</th>
                                <th>Mín/Máx</th>
                                <th>Localização</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stocks.map((stock) => (
                                <tr key={stock.id}>
                                    <td>
                                        <strong>{stock.productName || `Produto #${stock.productId}`}</strong>
                                        {stock.productSku && <div className="sku-text">SKU: {stock.productSku}</div>}
                                    </td>
                                    <td>
                                        <span className="quantity">{stock.quantity}</span>
                                        {stock.reservedQuantity && stock.reservedQuantity > 0 && (
                                            <div className="reserved-text">Reservado: {stock.reservedQuantity}</div>
                                        )}
                                    </td>
                                    <td>
                                        {stock.lowStockThreshold} / {stock.maxQuantity || '-'}
                                    </td>
                                    <td>{stock.warehouseLocation || stock.location || '-'}</td>
                                    <td>
                                        {stock.isLowStock ? (
                                            <span className="status-badge status-low-stock">Estoque Baixo</span>
                                        ) : stock.quantity === 0 ? (
                                            <span className="status-badge status-out-stock">Sem Estoque</span>
                                        ) : (
                                            <span className="status-badge status-in-stock">Em Estoque</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-edit"
                                                onClick={() => onEdit(stock.id)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default StockList;
