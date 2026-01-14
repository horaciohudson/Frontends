import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import RelatedProducts from '../components/RelatedProducts';
import ProductReviews from '../components/ProductReviews';
import './ProductDetail.css';

interface ProductImage {
    productImageId: number;
    imageUrl: string;
    imageName: string;
    isPrimary: boolean;
    altText: string;
}

interface Product {
    id: number;
    name: string;
    description: string;
    brand: string;
    color: string;
    size: string;
    sellingPrice: number;
    promotionalPrice?: number;
    stockQuantity: number;
    status: string;
    condition: string;
    images?: ProductImage[];
    category?: { id: number; name: string };
    subcategory?: { name: string };
}

function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addItem } = useCart();
    const { showNotification } = useNotification();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await productsAPI.getById(Number(id));
            setProduct(response.data.data);
        } catch (err: any) {
            console.error('Error loading product:', err);
            setError(err.response?.data?.message || 'Erro ao carregar produto');
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (delta: number) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && newQuantity <= (product?.stockQuantity || 0)) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;

        try {
            setAddingToCart(true);
            console.log('Adding to cart - Product ID:', product.id, 'Quantity:', quantity);
            await addItem(product.id, quantity);
            showNotification('success', 'Produto adicionado ao carrinho!');
            setQuantity(1);
        } catch (err: any) {
            console.error('Error adding to cart:', err);
            showNotification(
                'error',
                err.response?.data?.message || 'Erro ao adicionar ao carrinho'
            );
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        await handleAddToCart();
        navigate('/cart');
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (error) {
        return (
            <div className="product-detail-page">
                <div className="container">
                    <ErrorMessage message={error} />
                    <button className="btn btn-primary" onClick={() => navigate('/products')}>
                        Voltar para Produtos
                    </button>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-page">
                <div className="container">
                    <ErrorMessage message="Produto não encontrado" />
                    <button className="btn btn-primary" onClick={() => navigate('/products')}>
                        Voltar para Produtos
                    </button>
                </div>
            </div>
        );
    }

    const currentPrice = product.promotionalPrice || product.sellingPrice;
    const hasDiscount = product.promotionalPrice && product.promotionalPrice < product.sellingPrice;
    const discountPercentage = hasDiscount
        ? Math.round(((product.sellingPrice - product.promotionalPrice!) / product.sellingPrice) * 100)
        : 0;

    const images = product.images && product.images.length > 0
        ? product.images.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
        : [{ imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"%3E%3Crect fill="%23ddd" width="800" height="1000"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="48" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ESem Imagem%3C/text%3E%3C/svg%3E', altText: product.name }];

    return (
        <div className="product-detail-page">
            <div className="container">
                <div className="breadcrumb">
                    <a href="/">Home</a>
                    <span>/</span>
                    <a href="/products">Produtos</a>
                    <span>/</span>
                    {product.category && (
                        <>
                            <span>{product.category.name}</span>
                            <span>/</span>
                        </>
                    )}
                    <span className="current">{product.name}</span>
                </div>

                <div className="product-detail-grid">
                    {/* Gallery */}
                    <div className="product-gallery">
                        <div className="main-image">
                            <img
                                src={images[selectedImage]?.imageUrl || images[0].imageUrl}
                                alt={images[selectedImage]?.altText || product.name}
                            />
                            {hasDiscount && (
                                <span className="discount-badge">-{discountPercentage}%</span>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="image-thumbnails">
                                {images.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img.imageUrl}
                                        alt={img.altText || `${product.name} ${index + 1}`}
                                        className={selectedImage === index ? 'active' : ''}
                                        onClick={() => setSelectedImage(index)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="product-info-section">
                        <h1 className="product-title">{product.name}</h1>

                        {product.brand && (
                            <p className="product-brand">Marca: <strong>{product.brand}</strong></p>
                        )}

                        <div className="product-price-section">
                            {hasDiscount && (
                                <span className="old-price">R$ {product.sellingPrice.toFixed(2)}</span>
                            )}
                            <span className="current-price">R$ {currentPrice.toFixed(2)}</span>
                        </div>

                        <div className="product-stock">
                            {product.stockQuantity > 0 ? (
                                <span className="in-stock">
                                    ✓ {product.stockQuantity} unidades em estoque
                                </span>
                            ) : (
                                <span className="out-of-stock">✗ Produto esgotado</span>
                            )}
                        </div>

                        {product.description && (
                            <div className="product-description">
                                <h3>Descrição</h3>
                                <p>{product.description}</p>
                            </div>
                        )}

                        <div className="product-attributes">
                            {product.color && (
                                <div className="attribute">
                                    <span className="label">Cor:</span>
                                    <span className="value">{product.color}</span>
                                </div>
                            )}
                            {product.size && (
                                <div className="attribute">
                                    <span className="label">Tamanho:</span>
                                    <span className="value">{product.size}</span>
                                </div>
                            )}
                            {product.condition && (
                                <div className="attribute">
                                    <span className="label">Condição:</span>
                                    <span className="value">
                                        {product.condition === 'NEW' ? 'Novo' : product.condition}
                                    </span>
                                </div>
                            )}
                        </div>

                        {product.stockQuantity > 0 && (
                            <div className="product-actions">
                                <div className="quantity-selector">
                                    <label>Quantidade:</label>
                                    <div className="quantity-controls">
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="quantity-value">{quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={quantity >= product.stockQuantity}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="action-buttons">
                                    <button
                                        className="btn btn-outline"
                                        onClick={handleAddToCart}
                                        disabled={addingToCart}
                                    >
                                        {addingToCart ? 'Adicionando...' : '🛒 Adicionar ao Carrinho'}
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleBuyNow}
                                        disabled={addingToCart}
                                    >
                                        Comprar Agora
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Produtos Relacionados */}
                {product && (
                    <div className="container">
                        <RelatedProducts
                            currentProductId={product.id}
                            categoryId={product.category?.id}
                            brand={product.brand}
                            maxProducts={4}
                        />
                    </div>
                )}

                {/* Avaliações do Produto */}
                {product && (
                    <div className="container">
                        <ProductReviews productId={product.id} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductDetail;
