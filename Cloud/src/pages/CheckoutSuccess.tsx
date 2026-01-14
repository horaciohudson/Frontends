import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './CheckoutSuccess.css';

function CheckoutSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div className="checkout-success-page">
            <div className="container">
                <div className="success-card">
                    <div className="success-icon">✅</div>
                    <h1>Pedido Realizado com Sucesso!</h1>
                    <p className="success-message">
                        Seu pedido foi confirmado e está sendo processado.
                    </p>

                    {orderId && (
                        <div className="order-info">
                            <p className="order-label">Número do Pedido:</p>
                            <p className="order-number">#{orderId}</p>
                        </div>
                    )}

                    <div className="success-details">
                        <div className="detail-item">
                            <span className="detail-icon">📧</span>
                            <p>Enviamos um email de confirmação com os detalhes do seu pedido</p>
                        </div>
                        <div className="detail-item">
                            <span className="detail-icon">📦</span>
                            <p>Você pode acompanhar o status do seu pedido na área "Meus Pedidos"</p>
                        </div>
                        <div className="detail-item">
                            <span className="detail-icon">🚚</span>
                            <p>Seu pedido será enviado em até 2 dias úteis</p>
                        </div>
                    </div>

                    <div className="success-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/orders')}
                        >
                            Ver Meus Pedidos
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => navigate('/')}
                        >
                            Voltar para Home
                        </button>
                    </div>

                    <p className="redirect-message">
                        Redirecionando para a home em {countdown} segundos...
                    </p>
                </div>
            </div>
        </div>
    );
}

export default CheckoutSuccess;
