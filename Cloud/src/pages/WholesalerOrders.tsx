import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { salesAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import './WholesalerOrders.css';

interface SaleItem {
    id: number;
    productId: number;
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: number;
    discountPercentage?: number;
    discountAmount?: number;
    subtotal: number;
}

interface CompanyOrder {
    id: number;
    saleUuid: string;
    saleNumber: string;
    customerId?: number;
    companyId: string;
    customerName: string;
    sellerId?: number;
    sellerName?: string;
    status: string;
    saleDate: string;
    confirmedAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    subtotal: number;
    discountAmount?: number;
    shippingAmount?: number;
    taxAmount?: number;
    totalAmount: number;
    deliveryType?: string;
    deliveryAddressId?: number;
    shippingTrackingCode?: string;
    estimatedDeliveryDate?: string;
    couponCode?: string;
    customerNotes?: string;
    paymentMethod?: string;
    items?: SaleItem[];
    itemsCount: number;
    createdAt: string;
    updatedAt: string;
}

function WholesalerOrders() {
    const navigate = useNavigate();
    const { hasRole, isAuthenticated } = useAuth();
    const [orders, setOrders] = useState<CompanyOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Redirect if not a wholesaler
    if (!isAuthenticated || !hasRole('REVENDA')) {
        navigate('/');
        return null;
    }

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('🔍 Loading company orders...');
            const response = await salesAPI.getMyCompanyOrders();
            console.log('📦 API Response:', response);
            console.log('📦 Response type:', typeof response);
            console.log('📦 Response keys:', Object.keys(response || {}));
            
            // Check if response is valid
            if (!response) {
                console.error('❌ Response is null or undefined');
                throw new Error('Resposta da API é nula ou indefinida');
            }
            
            // The API service returns res.data, so response.data is the Page object
            const ordersData = response.data?.data?.content || [];
            console.log('📋 Orders data:', ordersData);
            console.log('📋 Orders count:', ordersData.length);
            setOrders(ordersData);
        } catch (err: any) {
            console.error('❌ Error loading company orders:', err);
            console.error('❌ Error response:', err.response);
            console.error('❌ Error data:', err.response?.data);
            console.error('❌ Error status:', err.response?.status);
            console.error('❌ Error message:', err.message);
            
            let errorMessage = 'Erro ao carregar pedidos. Tente novamente.';
            
            if (err.response?.status === 401) {
                errorMessage = 'Usuário não autenticado. Faça login novamente.';
            } else if (err.response?.status === 403) {
                errorMessage = 'Acesso negado. Você precisa ser um atacadista aprovado.';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
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
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getItemCount = (order: CompanyOrder) => {
        return order.itemsCount || 0;
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="wholesaler-orders-page">
            <div className="container">
                <div className="page-header">
                    <div className="header-content">
                        <Link to="/wholesale" className="back-link">
                            ← Voltar para Central do Atacadista
                        </Link>
                        <h1>🛒 Meus Pedidos da Empresa</h1>
                        <p>Acompanhe todos os pedidos realizados pela sua empresa</p>
                    </div>
                </div>

                {error && <ErrorMessage message={error} onClose={() => setError('')} />}

                {orders.length === 0 ? (
                    <div className="orders-empty">
                        <div className="empty-icon">📦</div>
                        <h3>Sua empresa ainda não possui pedidos</h3>
                        <p>Os pedidos realizados pela sua empresa aparecerão aqui!</p>
                        <Link to="/wholesale/catalog" className="btn btn-primary">
                            Ver Catálogo Atacado
                        </Link>
                    </div>
                ) : (
                    <div className="orders-grid">
                        {orders.map((order) => (
                            <div key={order.id} className="order-card">
                                <div className="order-card-header">
                                    <div className="order-info">
                                        <div className="order-number">
                                            <span className="order-icon">📋</span>
                                            <div>
                                                <h3>Pedido #{order.saleNumber}</h3>
                                                <p className="order-date">
                                                    <span className="date-icon">📅</span>
                                                    {formatDate(order.saleDate)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="order-badges">
                                            {getStatusBadge(order.status)}
                                        </div>
                                    </div>
                                </div>

                                <div className="order-card-body">
                                    <div className="order-summary">
                                        <div className="summary-item">
                                            <span className="summary-icon">👤</span>
                                            <div>
                                                <span className="summary-label">Cliente</span>
                                                <span className="summary-value">{order.customerName}</span>
                                            </div>
                                        </div>
                                        {order.sellerName && (
                                            <div className="summary-item">
                                                <span className="summary-icon">🏪</span>
                                                <div>
                                                    <span className="summary-label">Vendedor</span>
                                                    <span className="summary-value">{order.sellerName}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="summary-item">
                                            <span className="summary-icon">🛍️</span>
                                            <div>
                                                <span className="summary-label">Itens</span>
                                                <span className="summary-value">{getItemCount(order)} itens</span>
                                            </div>
                                        </div>
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

                                    {order.confirmedAt && (
                                        <div className="order-timeline">
                                            <div className="timeline-item">
                                                <span className="timeline-icon">✅</span>
                                                <span className="timeline-text">
                                                    Confirmado em {formatDate(order.confirmedAt)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {order.shippedAt && (
                                        <div className="order-timeline">
                                            <div className="timeline-item">
                                                <span className="timeline-icon">🚚</span>
                                                <span className="timeline-text">
                                                    Enviado em {formatDate(order.shippedAt)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {order.deliveredAt && (
                                        <div className="order-timeline">
                                            <div className="timeline-item">
                                                <span className="timeline-icon">📦</span>
                                                <span className="timeline-text">
                                                    Entregue em {formatDate(order.deliveredAt)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="order-card-footer">
                                    <Link
                                        to={`/wholesale/orders/${order.id}`}
                                        className="btn btn-primary btn-block"
                                    >
                                        Ver Detalhes →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default WholesalerOrders;