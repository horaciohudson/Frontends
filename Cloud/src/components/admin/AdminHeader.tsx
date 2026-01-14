import './AdminHeader.css';

interface AdminHeaderProps {
    currentView: string;
    onNavigate: (view: string) => void;
    onBackToSite: () => void;
    onLogout: () => void;
}

function AdminHeader({ currentView, onNavigate, onBackToSite, onLogout }: AdminHeaderProps) {
    const getViewTitle = () => {
        const titles: Record<string, string> = {
            dashboard: '🏠 Dashboard',
            products: '👕 Produtos',
            categories: '📂 Categorias',
            sizes: '📏 Tamanhos',
            colors: '🎨 Cores',
            users: '👥 Usuários',
            companies: '🏢 Empresas',
            wholesalers: '🏢 Revendedores',
            stock: '📦 Estoque',
            'price-tables': '💰 Tabelas de Preço',
            'payment-methods': '💳 Métodos de Pagamento',
            sales: '💰 Vendas',
            'wholesale-orders': '📦 Pedidos Atacado',
            reports: '📊 Relatórios',
            reviews: '⭐ Avaliações',
            settings: '⚙️ Configurações',
        };
        return titles[currentView] || '🏠 Dashboard';
    };

    return (
        <header className="admin-header">
            <div className="admin-header-content">
                <div className="admin-nav">
                    <button className="nav-button back-button" onClick={onBackToSite}>
                        ← Voltar ao Site
                    </button>

                    <div className="breadcrumb">
                        <button
                            className={`breadcrumb-item ${currentView === 'dashboard' ? 'active' : ''}`}
                            onClick={() => onNavigate('dashboard')}
                        >
                            🏠 Dashboard
                        </button>

                        {currentView !== 'dashboard' && (
                            <span className="breadcrumb-item active">
                                / {getViewTitle()}
                            </span>
                        )}
                    </div>
                </div>

                <div className="header-actions">
                    <button className="nav-button logout-button" onClick={onLogout}>
                        🚪 Sair
                    </button>
                </div>
            </div>
        </header>
    );
}

export default AdminHeader;
