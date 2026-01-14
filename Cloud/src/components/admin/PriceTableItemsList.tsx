import React, { useState, useEffect } from 'react';
import { priceTablesAPI } from '../../services/api';
import type { PriceTable } from '../../types/priceTable';
import './PriceTableItemsList.css';

interface PriceTableItem {
    id: number;
    productId: number;
    productName: string;
    productSku?: string;
    price: number;
    discountPercentage?: number;
    active: boolean;
    sizeName?: string;
    colorName?: string;
}

interface PriceTableItemsListProps {
    table: PriceTable;
    onBack: () => void;
}

const PriceTableItemsList: React.FC<PriceTableItemsListProps> = ({ table, onBack }) => {
    const [items, setItems] = useState<PriceTableItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        loadItems();
    }, [table.id]);

    const loadItems = async () => {
        try {
            setLoading(true);
            const response = await priceTablesAPI.getItems(table.id);
            setItems(response.data);
            setError(null);
        } catch (err: any) {
            console.error('Error loading price table items:', err);
            setError('Erro ao carregar itens da tabela');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    // Pagination calculations
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    if (loading) {
        return (
            <div className="price-table-items-list">
                <div className="items-header">
                    <button className="btn-back" onClick={onBack}>
                        ← Voltar
                    </button>
                    <h2>📦 Itens da Tabela: {table.name}</h2>
                </div>
                <div className="items-loading">Carregando itens...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="price-table-items-list">
                <div className="items-header">
                    <button className="btn-back" onClick={onBack}>
                        ← Voltar
                    </button>
                    <h2>📦 Itens da Tabela: {table.name}</h2>
                </div>
                <div className="items-error">{error}</div>
            </div>
        );
    }

    return (
        <div className="price-table-items-list">
            <div className="items-header">
                <button className="btn-back" onClick={onBack}>
                    ← Voltar
                </button>
                <div className="header-info">
                    <h2>📦 Itens da Tabela: {table.name}</h2>
                    <p className="table-description">{table.description}</p>
                    <div className="table-stats">
                        <span className="stat">
                            <strong>Desconto Padrão:</strong> {table.defaultDiscountPercentage || 0}%
                        </span>
                        <span className="stat">
                            <strong>Total de Itens:</strong> {items.length}
                        </span>
                        {table.active && <span className="badge-active">ATIVA</span>}
                    </div>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="items-empty">
                    <p>Nenhum item cadastrado nesta tabela.</p>
                    <p className="hint">Use o botão "Importar" na lista de tabelas para adicionar produtos automaticamente.</p>
                </div>
            ) : (
                <>
                    <div className="items-table-container">
                        <table className="items-table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Produto</th>
                                    <th>Tamanho</th>
                                    <th>Cor</th>
                                    <th>Preço</th>
                                    <th>Desconto</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((item) => (
                                    <tr key={item.id} className={!item.active ? 'inactive' : ''}>
                                        <td className="sku">{item.productSku || '-'}</td>
                                        <td className="product-name">{item.productName}</td>
                                        <td className="size">{item.sizeName || '-'}</td>
                                        <td className="color">{item.colorName || '-'}</td>
                                        <td className="price">{formatPrice(item.price)}</td>
                                        <td className="discount">
                                            {item.discountPercentage ? `${item.discountPercentage}%` : '-'}
                                        </td>
                                        <td className="status">
                                            {item.active ? (
                                                <span className="status-badge active">Ativo</span>
                                            ) : (
                                                <span className="status-badge inactive">Inativo</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                onClick={() => goToPage(1)}
                                disabled={currentPage === 1}
                            >
                                ««
                            </button>
                            <button
                                className="pagination-btn"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                ‹
                            </button>

                            <span className="pagination-info">
                                Página {currentPage} de {totalPages}
                                <span className="items-range">
                                    ({startIndex + 1}-{Math.min(endIndex, items.length)} de {items.length} itens)
                                </span>
                            </span>

                            <button
                                className="pagination-btn"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                ›
                            </button>
                            <button
                                className="pagination-btn"
                                onClick={() => goToPage(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                »»
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PriceTableItemsList;
