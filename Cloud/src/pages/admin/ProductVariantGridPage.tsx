import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, productVariantsAPI } from '../../services/api';
import VariantGrid from '../../components/admin/VariantGrid';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './ProductVariantGridPage.css';

interface Product {
    id: number;
    name: string;
    sku: string;
    brand: string;
}

function ProductVariantGridPage() {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [totalStock, setTotalStock] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProduct();
        loadTotalStock();
    }, [productId]);

    const loadProduct = async () => {
        try {
            const response = await productsAPI.getById(Number(productId));
            setProduct(response.data.data);
        } catch (error) {
            console.error('Error loading product:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTotalStock = async () => {
        try {
            const response = await productVariantsAPI.getTotalStock(Number(productId));
            setTotalStock(response.data.data || 0);
        } catch (error) {
            console.error('Error loading total stock:', error);
            setTotalStock(0);
        }
    };

    const handleBack = () => {
        navigate('/admin?tab=products');
    };

    const handleVariantsChange = () => {
        // Refresh total stock when variants change
        loadTotalStock();
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!product) {
        return (
            <div className="variant-grid-page">
                <div className="error-container">
                    <h2>Produto não encontrado</h2>
                    <button onClick={handleBack} className="btn-secondary">Voltar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="variant-grid-page">
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <button onClick={handleBack} className="breadcrumb-link">
                    ← Produtos
                </button>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">Grade de Variantes</span>
            </div>

            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>📊 Grade de Variantes</h1>
                    <p className="product-info">
                        <strong>{product.name}</strong>
                        {product.sku && <span className="sku">SKU: {product.sku}</span>}
                        {product.brand && <span className="brand">{product.brand}</span>}
                        <span className={`total-stock ${totalStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                            📦 Estoque Total: {totalStock} un.
                        </span>
                    </p>
                </div>
                <button onClick={handleBack} className="btn-secondary">
                    ← Voltar para Produtos
                </button>
            </div>

            {/* Variant Grid Component */}
            <div className="grid-container">
                <VariantGrid
                    productId={Number(productId)}
                    onVariantsChange={handleVariantsChange}
                />
            </div>
        </div>
    );
}

export default ProductVariantGridPage;
