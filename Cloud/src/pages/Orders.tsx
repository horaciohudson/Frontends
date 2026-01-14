import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { salesAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import './Orders.css';

interface Order {
    id: number;
    saleId?: number; // Manter para compatibilidade
    saleNumber: string;
    saleDate: string;
    status: string;
    totalAmount: number;
    itemCount?: number;
}

function Orders() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        loadOrders();
    }, [isAuthenticated, navigate]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await salesAPI.getMySales();
            const ordersData = response.data.data.content || [];
            setOrders(ordersData);
        } catch (err: any) {
            console.error('Error loading orders:', err);
            setError(
                err.response?.data?.message ||
                'Erro ao carregar pedidos. Tente novamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            PENDING_PAYMENT: { label: 'Aguardando Pagamento', className: 'status-pending' },
            PAID: { label: 'Pago', className: 'status-paid' },
            PROCESSING: { label: 'Em Processamento', className: 'status-processing' },
            SHIPPED: { label: 'Enviado', className: 'status-shipped' },
            DELIVERED: { label: 'Entregue', className: 'status-delivered' },
            COMPLETED: { label: 'Concluído', className: 'status-completed' },
            CANCELLED: { label: 'Cancelado', className: 'status-cancelled' },
            REFUNDED: { label: 'Reembolsado', className: 'status-refunded' }
        };

        const statusInfo = statusMap[status] || { label: status, className: 'status-default' };
        return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (!isAuthenticated) {
        return null;
    }

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="orders-page">
            <div className="container">
                <h1>Meus Pedidos</h1>

                {error && <ErrorMessage message={error} onClose={() => setError('')} />}

                {orders.length === 0 ? (
                    <div className="orders-empty">
                        <div className="empty-icon">📦</div>
                        <h3>Você ainda não fez nenhum pedido</h3>
                        <p>Comece suas compras agora!</p>
                        <Link to="/products" className="btn btn-primary">Ver Produtos</Link>
                    </div>
                ) : (
                    <div className="orders-grid">
                        {orders.map((order) => {
                            const orderId = order.id || order.saleId;
                            return (
                            <div key={orderId} className="order-card">
                                <div className="order-card-header">
                                    <div className="order-number">
                                        <span className="order-icon">📦</span>
                                        <div>
                                            <h3>Pedido #{order.saleNumber}</h3>
                                            <p className="order-date">
                                                <span className="date-icon">📅</span>
                                                {formatDate(order.saleDate)}
                                            </p>
                                        </div>
                                    </div>
                                    {getStatusBadge(order.status)}
                                </div>

                                <div className="order-card-body">
                                    <div className="order-summary">
                                        {order.itemCount && (
                                            <div className="summary-item">
                                                <span className="summary-icon">🛍️</span>
                                                <div>
                                                    <span className="summary-label">Itens</span>
                                                    <span className="summary-value">{order.itemCount}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="summary-item">
                                            <span className="summary-icon">💰</span>
                                            <div>
                                                <span className="summary-label">Total</span>
                                                <span className="summary-value total">
                                                    R$ {order.totalAmount.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-card-footer">
                                    <Link
                                        to={`/orders/${orderId}`}
                                        className="btn btn-primary btn-block"
                                        onClick={(e) => {
                                            if (!orderId || isNaN(orderId)) {
                                                e.preventDefault();
                                                console.error('Invalid orderId:', orderId, order);
                                                alert('ID do pedido inválido');
                                            }
                                        }}
                                    >
                                        Ver Detalhes →
                                    </Link>
                                </div>
                            </div>
                        )})}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Orders;
