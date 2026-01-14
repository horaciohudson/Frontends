import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import './ProductCard.css';

interface ProductCardProps {
    product: {
        id: number;
        name: string;
        sellingPrice: number;
        promotionalPrice?: number;
        stockQuantity: number;
        images?: any[];
        // New optional fields for enhanced features
        salesCount?: number;
        rating?: number;
        reviewCount?: number;
        isBestSeller?: boolean;
        isLocal?: boolean;
    };
}

function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCart();
    const { showNotification } = useNotification();

    const currentPrice = product.promotionalPrice || product.sellingPrice;
    const hasDiscount = product.promotionalPrice && product.promotionalPrice < product.sellingPrice;
    const discountPercentage = hasDiscount
        ? Math.round(((product.sellingPrice - product.promotionalPrice!) / product.sellingPrice) * 100)
        : 0;

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            await addItem(product.id, 1);
            showNotification('success', `${product.name} adicionado ao carrinho!`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            showNotification('error', 'Erro ao adicionar ao carrinho');
        }
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={i <= rating ? 'star filled' : 'star'}>
                    ★
                </span>
            );
        }
        return stars;
    };

    return (
        <Link to={`/products/${product.id}`} className="product-card-link">
            <div className="product-card card">
                <div className="product-image">
                    <img
                        src={product.images?.[0]?.url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23ddd" width="300" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EProduto%3C/text%3E%3C/svg%3E'}
                        alt={product.name}
                    />

                    {/* Top badges */}
                    <div className="product-badges">
                        {product.isBestSeller && (
                            <div className="badge badge-hot">
                                🔥 #1 MAIS VENDIDO
                            </div>
                        )}
                        {product.isLocal && (
                            <div className="badge badge-local">
                                Local
                            </div>
                        )}
                        {hasDiscount && discountPercentage > 0 && (
                            <div className="badge badge-promo">
                                -{discountPercentage}%
                            </div>
                        )}
                    </div>

                    {/* Stock badge */}
                    <div className={`stock-badge ${product.stockQuantity > 0 ? 'in-stock' : 'out-stock'}`}>
                        {product.stockQuantity > 0 ? 'Em Estoque' : 'Esgotado'}
                    </div>

                    {/* Floating add to cart button */}
                    <button
                        className="floating-add-btn"
                        disabled={product.stockQuantity === 0}
                        onClick={handleAddToCart}
                        title="Adicionar ao carrinho"
                    >
                        +
                    </button>
                </div>

                <div className="product-info">
                    <h4 className="product-name">{product.name}</h4>

                    <div className="product-details">
                        <div className="price-info">
                            <span className="current-price">
                                R$ {currentPrice.toFixed(2)}
                            </span>
                            {hasDiscount && (
                                <span className="old-price">
                                    R$ {product.sellingPrice.toFixed(2)}
                                </span>
                            )}
                        </div>

                        {/* Social proof - sales count */}
                        {product.salesCount && product.salesCount > 0 && (
                            <div className="social-proof">
                                <span className="fire-icon">🔥</span>
                                <span className="sales-count">
                                    {product.salesCount >= 1000
                                        ? `${(product.salesCount / 1000).toFixed(1)}mil vendidos`
                                        : `${product.salesCount} vendidos`
                                    }
                                </span>
                            </div>
                        )}

                        {/* Rating and reviews */}
                        {product.rating && product.rating > 0 && (
                            <div className="rating-info">
                                <div className="stars">
                                    {renderStars(product.rating)}
                                </div>
                                {product.reviewCount && product.reviewCount > 0 && (
                                    <span className="review-count">
                                        ({product.reviewCount})
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default ProductCard;
