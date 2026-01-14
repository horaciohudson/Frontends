import { Link } from 'react-router-dom';
import './HeroBanner.css';

function HeroBanner() {
    return (
        <div className="hero-banner">
            <div className="hero-content">
                <div className="hero-text">
                    <h1 className="hero-title">
                        ATÉ <span className="highlight">80% OFF</span>
                    </h1>
                    <p className="hero-subtitle">
                        Moda e estilo com os melhores preços do Brasil
                    </p>
                    <div className="hero-actions">
                        <Link to="/products" className="btn btn-hero-primary">
                            Comprar Agora
                        </Link>
                        <Link to="/products?filter=bestsellers" className="btn btn-hero-secondary">
                            Ver Mais Vendidos
                        </Link>
                    </div>
                </div>
                
                <div className="hero-decoration">
                    <div className="decoration-icon">👗</div>
                    <div className="decoration-icon">👔</div>
                    <div className="decoration-icon">👟</div>
                </div>
                
                <div className="hero-features">
                    <div className="feature-badge">
                        <span className="feature-icon">🚚</span>
                        <span className="feature-text">Frete Grátis</span>
                    </div>
                    <div className="feature-badge">
                        <span className="feature-icon">💳</span>
                        <span className="feature-text">Parcele até 12x</span>
                    </div>
                    <div className="feature-badge">
                        <span className="feature-icon">🔄</span>
                        <span className="feature-text">Troca Garantida</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HeroBanner;
