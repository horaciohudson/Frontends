import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './TopBar.css';

function TopBar() {
    const { hasRole, isAuthenticated } = useAuth();
    const isWholesaler = isAuthenticated && hasRole('REVENDA');

    return (
        <div className="top-bar">
            <div className="container">
                <div className="top-bar-content">
                    <div className="top-bar-benefits">
                        <div className="benefit-item">
                            <span className="benefit-icon">🚚</span>
                            <span className="benefit-text">Frete Grátis acima de R$ 99</span>
                        </div>
                        <div className="benefit-item">
                            <span className="benefit-icon">✅</span>
                            <span className="benefit-text">Garantia de Entrega</span>
                        </div>
                        <div className="benefit-item">
                            <span className="benefit-icon">📱</span>
                            <span className="benefit-text">Baixe nosso App</span>
                        </div>
                    </div>
                    <div className="top-bar-links">
                        {isWholesaler ? (
                            <Link to="/wholesale" className="top-bar-link top-bar-link--wholesale">
                                🏢 Central Atacadista
                            </Link>
                        ) : (
                            <span className="top-bar-link top-bar-link--disabled" title="Disponível apenas para revendedores cadastrados">
                                🏢 Central Atacadista
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TopBar;
