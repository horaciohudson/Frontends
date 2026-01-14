import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { salesAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import './OrderDetail.css';

interface OrderItem {
    productId: number;
    productName: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

interface OrderData {
    id: number;
    saleId?: number; // Manter para compatibilidade
    saleNumber: string;
    saleDate: string;
    status: string;
    totalAmount: number;
    items: OrderItem[];
    deliveryAddress?: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        postalCode: string;
    };
    paymentMethod?: string;
}

function OrderDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        loadOrder();
    }, [id, isAuthenticated, navigate]);

    const loadOrder = async () => {
        if (!id || isNaN(Number(id))) {
            setError('ID do pedido inválido');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');
            const response = await salesAPI.getSaleById(Number(id));
            setOrder(response.data.data);
        } catch (err: any) {
            console.error('Error loading order:', err);
            setError(
                err.response?.data?.message ||
                'Erro ao carregar pedido. Tente novamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status: string) => {
        const statusMap: Record<string, { label: string; className: string; description: string }> = {
            PENDING_PAYMENT: {
                label: 'Aguardando Pagamento',
                className: 'status-pending',
                description: 'Seu pedido está aguardando confirmação do pagamento'
            },
            PAID: {
                label: 'Pago',
                className: 'status-paid',
                description: 'Pagamento confirmado! Seu pedido será processado em breve'
            },
            PROCESSING: {
                label: 'Em Processamento',
                className: 'status-processing',
                description: 'Estamos preparando seu pedido para envio'
            },
            SHIPPED: {
                label: 'Enviado',
                className: 'status-shipped',
                description: 'Seu pedido está a caminho!'
            },
            DELIVERED: {
                label: 'Entregue',
                className: 'status-delivered',
                description: 'Pedido entregue com sucesso'
            },
            COMPLETED: {
                label: 'Concluído',
                className: 'status-completed',
                description: 'Pedido finalizado'
            },
            CANCELLED: {
                label: 'Cancelado',
                className: 'status-cancelled',
                description: 'Este pedido foi cancelado'
            },
            REFUNDED: {
                label: 'Reembolsado',
                className: 'status-refunded',
                description: 'Reembolso processado'
            }
        };

        return statusMap[status] || { label: status, className: 'status-default', description: '' };
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPaymentMethod = (method: string) => {
        const methods: Record<string, string> = {
            CREDIT_CARD: 'Cartão de Crédito',
            DEBIT_CARD: 'Cartão de Débito',
            PIX: 'PIX',
            BOLETO: 'Boleto Bancário'
        };
        return methods[method] || method;
    };

    if (!isAuthenticated) {
        return null;
    }

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (error || !order) {
        return (
            <div className="order-detail-page">
                <div className="container">
                    <ErrorMessage message={error || 'Pedido não encontrado'} />
                    <Link to="/orders" className="btn btn-outline">
                        Voltar para Meus Pedidos
                    </Link>
                </div>
            </div>
        );
    }

    const statusInfo = getStatusInfo(order.status);

    return (
        <div className="order-detail-page">
            <div className="container">
                <div className="breadcrumb">
                    <Link to="/">Home</Link>
                    <span>/</span>
                    <Link to="/orders">Meus Pedidos</Link>
                    <span>/</span>
                    <span>Pedido #{order.saleNumber}</span>
                </div>

                <div className="order-header">
                    <div>
                        <h1>Pedido #{order.saleNumber}</h1>
                        <p className="order-date">Realizado em {formatDate(order.saleDate)}</p>
                    </div>
                    <span className={`status-badge ${statusInfo.className}`}>
                        {statusInfo.label}
                    </span>
                </div>

                <div className="status-description">
                    <span className="status-icon">ℹ️</span>
                    <p>{statusInfo.description}</p>
                </div>

                <div className="order-content">
                    {/* Items */}
                    <div className="order-section">
                        <h2>Itens do Pedido</h2>
                        <div className="order-items">
                            {order.items.map((item, index) => (
                                <div key={index} className="order-item">
                                    <img
                                        src={item.productImage || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23ddd" width="80" height="80"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="12" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EProduto%3C/text%3E%3C/svg%3E'}
                                        alt={item.productName}
                                    />
                                    <div className="item-info">
                                        <h3>{item.productName}</h3>
                                        <p className="item-quantity">Quantidade: {item.quantity}</p>
                                        <p className="item-price">R$ {item.unitPrice.toFixed(2)} cada</p>
                                    </div>
                                    <div className="item-total">
                                        <p>R$ {item.subtotal.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Address */}
                    {order.deliveryAddress && (
                        <div className="order-section">
                            <h2>Endereço de Entrega</h2>
                            <div className="address-card">
                                <p>{order.deliveryAddress.street}, {order.deliveryAddress.number}</p>
                                {order.deliveryAddress.complement && (
                                    <p>{order.deliveryAddress.complement}</p>
                                )}
                                <p>{order.deliveryAddress.neighborhood}</p>
                                <p>{order.deliveryAddress.city} - {order.deliveryAddress.state}</p>
                                <p>CEP: {order.deliveryAddress.postalCode}</p>
                            </div>
                        </div>
                    )}

                    {/* Payment */}
                    {order.paymentMethod && (
                        <div className="order-section">
                            <h2>Método de Pagamento</h2>
                            <div className="payment-card">
                                <p>{formatPaymentMethod(order.paymentMethod)}</p>
                            </div>
                        </div>
                    )}

                    {/* Summary */}
                    <div className="order-section">
                        <h2>Resumo do Pedido</h2>
                        <div className="order-summary">
                            <div className="summary-line">
                                <span>Subtotal</span>
                                <span>R$ {order.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="summary-line">
                                <span>Frete</span>
                                <span className="free-shipping">Grátis</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-total">
                                <span>Total</span>
                                <span>R$ {order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="order-actions">
                    <Link to="/orders" className="btn btn-outline">
                        Voltar para Meus Pedidos
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default OrderDetail;
