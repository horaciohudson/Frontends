import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWholesaleCart } from '../contexts/WholesaleCartContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import './WholesaleCatalog.css';

interface Product {
    id: number;
    name: string;
    description: string;
    sku: string;
    sellingPrice: number;
    promotionalPrice?: number;
    images?: { url: string }[];
    brand?: string;
    category?: { name: string };
}

function WholesaleCatalog() {
    const { hasRole, isAuthenticated } = useAuth();
    const { addItem, items, getSelectedProductsCount } = useWholesaleCart();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [addingToCart, setAddingToCart] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        // Only load if user is authenticated and has role
        if (isAuthenticated && hasRole('REVENDA')) {
            loadProducts();
        }
    }, [currentPage, searchQuery, isAuthenticated]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError('');

            const response = searchQuery
                ? await productsAPI.search(searchQuery, currentPage, 12)
                : await productsAPI.getAll(currentPage, 12);

            const data = response.data.data || response.data;
            const content = data.content || [];

            setProducts(content);
            setTotalPages(data.totalPages || 1);
        } catch (err: any) {
            console.error('Error loading products:', err);
            setError('Erro ao carregar produtos');
        } finally {
            setLoading(false);
        }
    };

    const calculateWholesalePrice = (retailPrice: number): number => {
        // Default 30% discount for wholesale
        return retailPrice * 0.7;
    };

    const calculateDiscount = (retailPrice: number, wholesalePrice: number): number => {
        return ((retailPrice - wholesalePrice) / retailPrice) * 100;
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(0);
        loadProducts();
    };

    const handleAddToCart = async (product: Product) => {
        try {
            setAddingToCart(product.id);
            setSuccessMessage('');
            await addItem(product.id, 1);
            setSuccessMessage(`${product.name} adicionado à seleção!`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error: any) {
            alert(error.message || 'Erro ao adicionar produto');
        } finally {
            setAddingToCart(null);
        }
    };

    const isProductSelected = (productId: number): boolean => {
        return items.some(item => item.productId === productId);
    };

    const handleGoToGrid = () => {
        navigate('/wholesale/grid');
    };

    // Redirect if not a wholesaler
    if (!isAuthenticated || !hasRole('REVENDA')) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="wholesale-catalog">
            <div className="container">
                <div className="catalog-header">
                    <h1>📦 Catálogo Atacado</h1>
                    <p className="subtitle">Produtos com preços especiais para revenda</p>
                </div>

                {/* Floating Grid Button */}
                {getSelectedProductsCount() > 0 && (
                    <button className="floating-grid-button" onClick={handleGoToGrid}>
                        <span className="grid-icon">📋</span>
                        <span className="grid-text">
                            Pedido na Grade ({getSelectedProductsCount()} {getSelectedProductsCount() === 1 ? 'produto' : 'produtos'})
                        </span>
                    </button>
                )}

                {/* Search Bar */}
                <div className="catalog-search">
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Buscar produtos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="btn btn-primary">
                            🔍 Buscar
                        </button>
                    </form>
                </div>

                {/* Info Banner */}
                <div className="info-banner">
                    <div className="info-item">
                        <span className="info-icon">💰</span>
                        <span>Desconto médio: 30%</span>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">📦</span>
                        <span>Pedido mínimo: R$ 500,00</span>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">📅</span>
                        <span>Prazo: 30 dias</span>
                    </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="success-message">
                        ✓ {successMessage}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Carregando produtos...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="error-state">
                        <p>{error}</p>
                        <button onClick={loadProducts} className="btn btn-primary">
                            Tentar novamente
                        </button>
                    </div>
                )}

                {/* Products Grid */}
                {!loading && !error && (
                    <>
                        <div className="products-grid">
                            {products.map((product) => {
                                const retailPrice = product.promotionalPrice || product.sellingPrice;
                                const wholesalePrice = calculateWholesalePrice(retailPrice);
                                const discount = calculateDiscount(retailPrice, wholesalePrice);
                                const selected = isProductSelected(product.id);

                                return (
                                    <div
                                        key={product.id}
                                        className={`product-card-wholesale ${selected ? 'selected' : ''}`}
                                    >
                                        {selected && <div className="selected-badge">✓ Selecionado</div>}
                                        {/* Product Image */}
                                        <div className="product-image">
                                            {product.images && product.images.length > 0 ? (
                                                <img src={product.images[0].url} alt={product.name} />
                                            ) : (
                                                <div className="no-image">📦</div>
                                            )}
                                            <div className="discount-badge">
                                                -{discount.toFixed(0)}%
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="product-info">
                                            <div className="product-category">
                                                {product.category?.name || 'Sem categoria'}
                                            </div>
                                            <h3 className="product-name">{product.name}</h3>
                                            <p className="product-sku">SKU: {product.sku}</p>

                                            {/* Pricing */}
                                            <div className="product-pricing">
                                                <div className="price-comparison">
                                                    <span className="retail-price">
                                                        Varejo: R$ {retailPrice.toFixed(2)}
                                                    </span>
                                                    <span className="wholesale-price">
                                                        Atacado: R$ {wholesalePrice.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="savings">
                                                    Economia: R$ {(retailPrice - wholesalePrice).toFixed(2)}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <button
                                                className={`btn btn-primary btn-add-cart ${selected ? 'selected' : ''}`}
                                                onClick={() => handleAddToCart(product)}
                                                disabled={addingToCart === product.id || selected}
                                            >
                                                {selected ? '✓ Selecionado' : addingToCart === product.id ? '⏳ Adicionando...' : '➕ Selecionar Produto'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                    disabled={currentPage === 0}
                                >
                                    ← Anterior
                                </button>
                                <span className="page-info">
                                    Página {currentPage + 1} de {totalPages}
                                </span>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                    disabled={currentPage >= totalPages - 1}
                                >
                                    Próxima →
                                </button>
                            </div>
                        )}

                        {/* Empty State */}
                        {products.length === 0 && (
                            <div className="empty-state">
                                <p>Nenhum produto encontrado</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default WholesaleCatalog;
