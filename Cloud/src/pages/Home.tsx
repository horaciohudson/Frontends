import { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import HeroBanner from '../components/HeroBanner';
import './Home.css';

interface Product {
    id: number;
    name: string;
    sellingPrice: number;
    promotionalPrice?: number;
    stockQuantity: number;
    images?: any[];
}

// Configurações padrão (podem ser sobrescritas pelas configurações do admin)
const DEFAULT_CONFIG = {
    FEATURED_PRODUCTS_COUNT: 4,
    HOME_PRODUCTS_PER_PAGE: 20
};

function Home() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loadingFeatured, setLoadingFeatured] = useState(true);
    const [loadingAll, setLoadingAll] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadFeaturedProducts();
        loadAllProducts(0);
    }, []);

    const loadFeaturedProducts = async () => {
        try {
            setLoadingFeatured(true);
            // Carregar produtos em destaque
            const response = await productsAPI.getAll(0, DEFAULT_CONFIG.FEATURED_PRODUCTS_COUNT);
            setFeaturedProducts(response.data.data.content || []);
        } catch (err) {
            console.error('Erro ao carregar produtos em destaque:', err);
            setError('Não foi possível carregar os produtos em destaque.');
        } finally {
            setLoadingFeatured(false);
        }
    };

    const loadAllProducts = async (page: number = 0) => {
        try {
            setLoadingAll(true);
            const response = await productsAPI.getAll(page, DEFAULT_CONFIG.HOME_PRODUCTS_PER_PAGE);
            const newProducts = response.data.data.content || [];
            
            if (page === 0) {
                setAllProducts(newProducts);
            } else {
                setAllProducts(prev => [...prev, ...newProducts]);
            }
            
            // Verificar se há mais produtos
            const totalPages = response.data.data.totalPages || 0;
            setHasMore(page + 1 < totalPages);
            setCurrentPage(page);
        } catch (err) {
            console.error('Erro ao carregar produtos:', err);
            if (page === 0) {
                setError('Não foi possível carregar os produtos.');
            }
        } finally {
            setLoadingAll(false);
        }
    };

    const handleLoadMore = () => {
        loadAllProducts(currentPage + 1);
    };



    return (
        <div className="home">
            <HeroBanner />

            <div className="container">
                {/* Seção de Produtos em Destaque */}
                <section className="featured-section">
                    <h3>Produtos em Destaque</h3>
                    <p className="section-subtitle">Confira nossas melhores ofertas em moda</p>

                    {loadingFeatured ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : (
                        <div className="products-grid grid-4">
                            {featuredProducts.length > 0 ? (
                                featuredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            ) : (
                                <p>Nenhum produto em destaque no momento.</p>
                            )}
                        </div>
                    )}
                </section>

                {/* Seção de Todos os Produtos */}
                <section className="all-products-section">
                    <h3>Todos os Produtos</h3>
                    <p className="section-subtitle">Explore nossa coleção completa</p>

                    {allProducts.length > 0 ? (
                        <>
                            <div className="products-grid grid-4">
                                {allProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {hasMore && (
                                <div className="load-more-container">
                                    <button 
                                        className="btn btn-secondary btn-large"
                                        onClick={handleLoadMore}
                                        disabled={loadingAll}
                                    >
                                        {loadingAll ? 'Carregando...' : 'Ver mais produtos'}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        !loadingAll && <p>Nenhum produto disponível no momento.</p>
                    )}

                    {loadingAll && currentPage === 0 && (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default Home;
