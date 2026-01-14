import { useState, useEffect } from 'react';
import { productsAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Pagination from '../common/Pagination';
import './ProductList.css';

interface Product {
    id: number;
    name: string;
    brand: string;
    sellingPrice: number;
    promotionalPrice?: number;
    stockQuantity: number;
    status: string;
    featured: boolean;
    categoryName?: string;
}

interface ProductListProps {
    onEdit?: (productId: number) => void;
    onEditVariants?: (productId: number) => void;
    onCreateNew?: () => void;
}

function ProductList({ onEdit, onEditVariants, onCreateNew }: ProductListProps) {
    const { showNotification } = useNotification();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [syncingStock, setSyncingStock] = useState(false);

    useEffect(() => {
        loadProducts();
    }, [currentPage]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await productsAPI.getAll(currentPage, 10);

            const data = response.data.data;
            setProducts(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (err: any) {
            console.error('Error loading products:', err);
            setError('Erro ao carregar produtos');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFeatured = async (productId: number) => {
        try {
            await productsAPI.toggleFeatured(productId);
            showNotification('success', 'Produto atualizado com sucesso!');
            loadProducts();
        } catch (err: any) {
            console.error('Error toggling featured:', err);
            showNotification('error', 'Erro ao atualizar produto');
        }
    };

    const handleDelete = async (productId: number, productName: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir o produto "${productName}"?`)) {
            return;
        }

        try {
            await productsAPI.delete(productId);
            showNotification('success', 'Produto excluído com sucesso!');
            loadProducts();
        } catch (err: any) {
            console.error('Error deleting product:', err);
            showNotification('error', 'Erro ao excluir produto');
        }
    };

    const handleSyncStock = async () => {
        if (!window.confirm('Deseja atualizar o estoque de todos os produtos com base nas variantes?')) {
            return;
        }

        try {
            setSyncingStock(true);
            const response = await productsAPI.syncStock();
            const updatedCount = response.data.data;
            
            if (updatedCount === 0) {
                showNotification('info', 'Todos os estoques já estão sincronizados com as variantes!');
            } else {
                showNotification('success', `Estoque de ${updatedCount} produto(s) atualizado com sucesso!`);
            }
            
            loadProducts();
        } catch (err: any) {
            console.error('Error syncing stock:', err);
            showNotification('error', 'Erro ao atualizar estoque');
        } finally {
            setSyncingStock(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            AVAILABLE: { label: 'Disponível', className: 'status-available' },
            OUT_OF_STOCK: { label: 'Sem Estoque', className: 'status-out-of-stock' },
            PENDING_APPROVAL: { label: 'Pendente', className: 'status-pending' },
            INACTIVE: { label: 'Inativo', className: 'status-inactive' },
        };

        const statusInfo = statusMap[status] || { label: status, className: '' };
        return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
    };

    if (loading && products.length === 0) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="admin-product-list">
            <div className="list-header">
                <div>
                    <h2>📦 Gerenciar Produtos</h2>
                    <p className="list-subtitle">
                        {totalElements} produto{totalElements !== 1 ? 's' : ''} cadastrado{totalElements !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="header-actions">
                    <button 
                        className="btn-primary" 
                        onClick={handleSyncStock}
                        disabled={syncingStock}
                    >
                        {syncingStock ? '⏳ Atualizando...' : '🔄 Atualizar Estoque'}
                    </button>
                    <button className="btn-primary" onClick={onCreateNew}>
                        ➕ Novo Produto
                    </button>
                </div>
            </div>

            {error && <ErrorMessage message={error} onClose={() => setError('')} />}

            {loading ? (
                <LoadingSpinner />
            ) : products.length === 0 ? (
                <div className="empty-state">
                    <p>📭 Nenhum produto encontrado</p>
                </div>
            ) : (
                <>
                    <div className="products-table-container">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Produto</th>
                                    <th>Marca</th>
                                    <th>Preço</th>
                                    <th>Estoque</th>
                                    <th>Status</th>
                                    <th>Destaque</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td>#{product.id}</td>
                                        <td className="product-name-cell">
                                            <strong>{product.name}</strong>
                                            {product.categoryName && (
                                                <span className="category-tag">{product.categoryName}</span>
                                            )}
                                        </td>
                                        <td>{product.brand || '-'}</td>
                                        <td>
                                            {product.promotionalPrice ? (
                                                <>
                                                    <span className="price-promotional">
                                                        R$ {product.promotionalPrice.toFixed(2)}
                                                    </span>
                                                    <span className="price-original">
                                                        R$ {product.sellingPrice.toFixed(2)}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="price">
                                                    R$ {product.sellingPrice.toFixed(2)}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={product.stockQuantity <= 5 ? 'stock-low' : 'stock-ok'}>
                                                {product.stockQuantity} un.
                                            </span>
                                        </td>
                                        <td>{getStatusBadge(product.status)}</td>
                                        <td>
                                            <button
                                                className={`btn-icon ${product.featured ? 'featured-active' : ''}`}
                                                onClick={() => handleToggleFeatured(product.id)}
                                                title={product.featured ? 'Remover destaque' : 'Adicionar destaque'}
                                            >
                                                ⭐
                                            </button>
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                className="btn-icon btn-variants"
                                                onClick={() => onEditVariants?.(product.id)}
                                                title="Editar Grade de Variantes"
                                            >
                                                📊
                                            </button>
                                            <button
                                                className="btn-icon btn-edit"
                                                onClick={() => {
                                                    console.log('Edit button clicked, productId:', product.id);
                                                    onEdit?.(product.id);
                                                }}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-icon btn-delete"
                                                onClick={() => handleDelete(product.id, product.name)}
                                                title="Excluir"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default ProductList;
