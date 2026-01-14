import { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import ProductCard from './ProductCard';
import './RelatedProducts.css';

interface Product {
    id: number;
    name: string;
    sellingPrice: number;
    promotionalPrice?: number;
    stockQuantity: number;
    images?: any[];
    category?: any;
    brand?: string;
}

interface RelatedProductsProps {
    currentProductId: number;
    categoryId?: number;
    brand?: string;
    maxProducts?: number;
}

function RelatedProducts({ currentProductId, categoryId, brand, maxProducts = 4 }: RelatedProductsProps) {
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRelatedProducts();
    }, [currentProductId, categoryId, brand]);

    const loadRelatedProducts = async () => {
        try {
            setLoading(true);
            
            // Buscar produtos da mesma categoria ou marca
            const response = await productsAPI.getAll(0, 20);
            let allProducts = response.data.data?.content || [];
            
            // Filtrar produtos relacionados
            let related = allProducts.filter((product: Product) => {
                // Não incluir o produto atual
                if (product.id === currentProductId) return false;
                
                // Priorizar produtos da mesma categoria
                if (categoryId && product.category?.id === categoryId) return true;
                
                // Ou da mesma marca
                if (brand && product.brand === brand) return true;
                
                return false;
            });

            // Se não encontrou produtos relacionados, pegar produtos aleatórios
            if (related.length === 0) {
                related = allProducts.filter((product: Product) => product.id !== currentProductId);
            }

            // Embaralhar e limitar quantidade
            related = shuffleArray(related).slice(0, maxProducts);
            
            setRelatedProducts(related);
        } catch (err) {
            console.error('Error loading related products:', err);
        } finally {
            setLoading(false);
        }
    };

    const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    if (loading) {
        return (
            <div className="related-products">
                <h2>🔗 Produtos Relacionados</h2>
                <div className="related-loading">Carregando produtos relacionados...</div>
            </div>
        );
    }

    if (relatedProducts.length === 0) {
        return null;
    }

    return (
        <div className="related-products">
            <div className="related-header">
                <h2>🔗 Produtos Relacionados</h2>
                <p>Você também pode gostar destes produtos</p>
            </div>
            
            <div className="related-grid">
                {relatedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}

export default RelatedProducts;
