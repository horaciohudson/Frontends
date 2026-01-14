import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';
import { productsAPI } from '../services/api';
import CategoryMegaMenu from './CategoryMegaMenu';
import './Header.css';

interface Product {
    id: number;
    name: string;
    sellingPrice: number;
    promotionalPrice?: number;
    images?: any[];
}

function Header() {
    const { user, isAuthenticated, logout, isAdmin, hasRole } = useAuth();
    const { itemCount } = useCart();
    const { settings } = useSettings();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMegaMenu, setShowMegaMenu] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<number>();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/');
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Debounce search
        if (query.trim().length >= 2) {
            debounceTimer.current = window.setTimeout(() => {
                searchProducts(query);
            }, 300);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const searchProducts = async (query: string) => {
        try {
            setLoading(true);
            const response = await productsAPI.search(query, 0, 5);
            const products = response.data.data?.content || response.data.content || [];
            setSuggestions(products);
            setShowSuggestions(products.length > 0);
        } catch (error) {
            console.error('Error searching products:', error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setShowSuggestions(false);
            setSearchQuery('');
        }
    };

    const handleSuggestionClick = (productId: number) => {
        navigate(`/products/${productId}`);
        setShowSuggestions(false);
        setSearchQuery('');
    };

    return (
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
            <div className="container">
                <div className="header-content">
                    <Link to="/" className="logo">
                        <h1>{settings.siteName}</h1>
                        <span>Moda e estilo na nuvem</span>
                    </Link>

                    <div className="search-bar" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit}>
                            <input
                                type="text"
                                placeholder="Buscar roupas, calçados, acessórios..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            />
                            <button type="submit" className="search-btn">🔍</button>
                        </form>

                        {/* Autocomplete Suggestions */}
                        {showSuggestions && (
                            <div className="search-suggestions">
                                {loading ? (
                                    <div className="suggestion-loading">Buscando...</div>
                                ) : (
                                    suggestions.map((product) => (
                                        <div
                                            key={product.id}
                                            className="suggestion-item"
                                            onClick={() => handleSuggestionClick(product.id)}
                                        >
                                            <div className="suggestion-image">
                                                {product.images && product.images.length > 0 ? (
                                                    <img src={product.images[0].url} alt={product.name} />
                                                ) : (
                                                    <div className="no-image">📦</div>
                                                )}
                                            </div>
                                            <div className="suggestion-info">
                                                <div className="suggestion-name">{product.name}</div>
                                                <div className="suggestion-price">
                                                    {product.promotionalPrice ? (
                                                        <>
                                                            <span className="promo-price">
                                                                R$ {product.promotionalPrice.toFixed(2)}
                                                            </span>
                                                            <span className="original-price">
                                                                R$ {product.sellingPrice.toFixed(2)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="price">
                                                            R$ {product.sellingPrice.toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <nav className="header-nav">
                        <button
                            className="nav-link nav-btn"
                            onClick={() => setShowMegaMenu(!showMegaMenu)}
                        >
                            📂 Categorias
                        </button>
                        <Link to="/products?filter=bestsellers" className="nav-link">Mais Vendidos</Link>
                        <Link to="/products?filter=new" className="nav-link">Novidades</Link>

                        <Link to="/cart" className="nav-link cart-link">
                            🛒 Carrinho
                            {itemCount > 0 && (
                                <span className="cart-badge">{itemCount}</span>
                            )}
                        </Link>

                        {isAuthenticated ? (
                            <div className="user-menu">
                                <button
                                    className="user-menu-button"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                >
                                    <span className="user-icon">👤</span>
                                    <span className="user-name">
                                        {user?.firstName || user?.username}
                                    </span>
                                    <span className="dropdown-arrow">▼</span>
                                </button>

                                {showUserMenu && (
                                    <div className="user-dropdown">
                                        <Link
                                            to="/profile"
                                            className="dropdown-item"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            👤 Meu Perfil
                                        </Link>
                                        {!hasRole('REVENDA') && (
                                            <Link
                                                to="/orders"
                                                className="dropdown-item"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                📦 Meus Pedidos
                                            </Link>
                                        )}
                                        {isAdmin && (
                                            <Link
                                                to="/admin"
                                                className="dropdown-item dropdown-item--admin"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                ⚙️ Painel Admin
                                            </Link>
                                        )}
                                        <hr className="dropdown-divider" />
                                        <button
                                            className="dropdown-item dropdown-item--logout"
                                            onClick={handleLogout}
                                        >
                                            🚪 Sair
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-primary">Entrar</Link>
                        )}
                    </nav>
                </div>
            </div>
            <CategoryMegaMenu isOpen={showMegaMenu} onClose={() => setShowMegaMenu(false)} />
        </header>
    );
}

export default Header;
