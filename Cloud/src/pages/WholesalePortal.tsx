import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import './WholesalePortal.css';

function WholesalePortal() {
    const { hasRole, isAuthenticated } = useAuth();

    // Redirect if not a wholesaler
    if (!isAuthenticated || !hasRole('REVENDA')) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="wholesale-portal">
            <div className="container">
                <div className="wholesale-header">
                    <h1>🏢 Central do Atacadista</h1>
                    <p className="subtitle">Portal exclusivo para revendedores</p>
                </div>

                <div className="wholesale-dashboard">
                    <Link to="/wholesale/register" className="dashboard-card dashboard-card-link dashboard-card-highlight">
                        <div className="card-icon">📋</div>
                        <h3>Cadastro de Revendedor</h3>
                        <p>Complete seu cadastro para fazer pedidos atacado</p>
                    </Link>

                    <Link to="/wholesale/catalog" className="dashboard-card dashboard-card-link">
                        <div className="card-icon">📦</div>
                        <h3>Catálogo Atacado</h3>
                        <p>Visualize produtos com preços especiais para revenda</p>
                    </Link>

                    <Link to="/wholesale/orders" className="dashboard-card dashboard-card-link">
                        <div className="card-icon">🛒</div>
                        <h3>Meus Pedidos</h3>
                        <p>Acompanhe seus pedidos de atacado</p>
                    </Link>

                    <Link to="/wholesale/reports" className="dashboard-card dashboard-card-link">
                        <div className="card-icon">📊</div>
                        <h3>Relatórios</h3>
                        <p>Visualize relatórios de compras e faturamento</p>
                    </Link>

                    <Link to="/wholesale/invoices" className="dashboard-card dashboard-card-link">
                        <div className="card-icon">📄</div>
                        <h3>Notas Fiscais</h3>
                        <p>Acesse suas notas fiscais e boletos</p>
                    </Link>

                    <Link to="/wholesale/settings" className="dashboard-card dashboard-card-link">
                        <div className="card-icon">⚙️</div>
                        <h3>Configurações</h3>
                        <p>Gerencie dados cadastrais e endereços</p>
                    </Link>
                </div>

                <div className="wholesale-info">
                    <div className="info-box">
                        <h3>📋 Informações Importantes</h3>
                        <ul>
                            <li>Pedido mínimo: R$ 500,00</li>
                            <li>Prazo de pagamento: 30 dias</li>
                            <li>Desconto médio: 30% sobre preço de varejo</li>
                            <li>Frete: CIF (por nossa conta) ou FOB (por sua conta)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WholesalePortal;
