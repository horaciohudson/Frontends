import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import './Products.css';

interface Product {
    id: number;
    name: string;
    sellingPrice: number;
    promotionalPrice?: number;
    stockQuantity: number;
    images?: any[];
}

interface Category {
    id: number;
    name: string;
}

function Products() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        }
        loadProducts(categoryParam || '');
    }, [searchParams]);

    const loadCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            setCategories(response.data.data || []);
        } catch (err) {
            console.error('Erro ao carregar categorias:', err);
        }
    };

    const loadProducts = async (categoryId: string) => {
        try {
            setLoading(true);
            let response;

            if (categoryId) {
                response = await productsAPI.getByCategory(parseInt(categoryId), 0, 20);
            } else {
                response = await productsAPI.getAll(0, 20);
            }

            setProducts(response.data.data.content || response.data.data || []);
        } catch (err) {
            setError('Erro ao carregar produtos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedCategory(value);

        if (value) {
            setSearchParams({ category: value });
        } else {
            setSearchParams({});
        }
    };

    const getSelectedCategoryName = (): string => {
        if (!selectedCategory) return 'Todos os Produtos';
        const category = categories.find(c => c.id.toString() === selectedCategory);
        return category ? category.name : 'Todos os Produtos';
    };

    return (
        <div className="products-page">
            <div className="container">
                <div className="page-header">
                    <h1>{getSelectedCategoryName()}</h1>
                    <p>Encontre exatamente o que você precisa</p>
                </div>

                <div className="products-filters">
                    <select
                        className="filter-select"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                    >
                        <option value="">Todas as Categorias</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <select className="filter-select">
                        <option>Ordenar por</option>
                        <option>Menor Preço</option>
                        <option>Maior Preço</option>
                        <option>Mais Vendidos</option>
                        <option>Mais Recentes</option>
                    </select>
                </div>

                {loading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Carregando produtos...</p>
                    </div>
                )}

                {error && (
                    <div className="error-message">{error}</div>
                )}

                {!loading && !error && (
                    <div className="products-grid grid-4">
                        {products.length > 0 ? (
                            products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <p>Nenhum produto encontrado nesta categoria</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Products;
