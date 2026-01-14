import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { salesAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import './WholesalerOrderDetail.css';

interface OrderItem {
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

interface DeliveryAddress {
    id: number;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
}

interface OrderData {
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
    deliveryAddress?: DeliveryAddress;
    shippingTrackingCode?: string;
    estimatedDeliveryDate?: string;
    couponCode?: string;
    customerNotes?: string;
    paymentMethod?: string;
    items: OrderItem[];
    itemsCount: number;
    createdAt: string;
    updatedAt: string;
}

function WholesalerOrderDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { hasRole, isAuthenticated } = useAuth();
    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Redirect if not a wholesaler
    if (!isAuthenticated || !hasRole('REVENDA')) {
        navigate('/');
        return null;
    }

    useEffect(() => {
        loadOrder();
    }, [id]);

    const loadOrder = async () => {
        if (!id || isNaN(Number(id))) {
            setError('ID do pedido inválido');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');
            console.log('🔍 Loading wholesaler order details for ID:', id);
            const response = await salesAPI.getMyCompanyOrderById(Number(id));
            console.log('📦 Order details response:', response);
            
            if (response.data && response.data.data) {
                setOrder(response.data.data);
            } else {
                throw new Error('Dados do pedido não encontrados na resposta');
            }
        } catch (err: any) {
            console.error('❌ Error loading order details:', err);
            console.error('❌ Error response:', err.response);
            console.error('❌ Error data:', err.response?.data);
            
            let errorMessage = 'Erro ao carregar detalhes do pedido. Tente novamente.';
            
            if (err.response?.status === 401) {
                errorMessage = 'Usuário não autenticado. Faça login novamente.';
            } else if (err.response?.status === 403) {
                errorMessage = 'Acesso negado. Você precisa ser um atacadista aprovado.';
            } else if (err.response?.status === 404) {
                errorMessage = 'Pedido não encontrado ou não pertence à sua empresa.';
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

    const getStatusInfo = (status: string) => {
        const statusMap: Record<string, { label: string; className: string; description: string }> = {
            PENDING_PAYMENT: {
                label: 'Aguardando Pagamento',
                className: 'status-pending',
                description: 'Pedido aguardando confirmação do pagamento'
            },
            PAID: {
                label: 'Pago',
                className: 'status-paid',
                description: 'Pagamento confirmado! Pedido será processado em breve'
            },
            PROCESSING: {
                label: 'Em Processamento',
                className: 'status-processing',
                description: 'Pedido está sendo preparado para envio'
            },
            SHIPPED: {
                label: 'Enviado',
                className: 'status-shipped',
                description: 'Pedido está a caminho!'
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
            BOLETO: 'Boleto Bancário',
            CASH: 'Dinheiro',
            BANK_TRANSFER: 'Transferência Bancária'
        };
        return methods[method] || method;
    };

    const formatDeliveryType = (type: string) => {
        const types: Record<string, string> = {
            DELIVERY: 'Entrega',
            PICKUP: 'Retirada',
            SHIPPING: 'Envio'
        };
        return types[type] || type;
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (error || !order) {
        return (
            <div className="wholesaler-order-detail-page">
                <div className="container">
                    <div className="page-header">
                        <Link to="/wholesale/orders" className="back-link">
                            ← Voltar para Meus Pedidos
                        </Link>
                        <h1>Detalhes do Pedido</h1>
                    </div>
                    <ErrorMessage message={error || 'Pedido não encontrado'} />
                </div>
            </div>
        );
    }

    const statusInfo = getStatusInfo(order.status);

    return (
        <div className="wholesaler-order-detail-page">
            <div className="container">
                <div className="page-header">
                    <Link to="/wholesale/orders" className="back-link">
                        ← Voltar para Meus Pedidos
                    </Link>
                    <div className="header-content">
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
                    {/* Customer/Seller Information */}
                    <div className="order-section">
                        <h2>📋 Informações do Pedido</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Cliente/Empresa:</span>
                                <span className="info-value">{order.customerName}</span>
                            </div>
                            {order.sellerName && (
                                <div className="info-item">
                                    <span className="info-label">Vendedor:</span>
                                    <span className="info-value">{order.sellerName}</span>
                                </div>
                            )}
                            <div className="info-item">
                                <span className="info-label">Data do Pedido:</span>
                                <span className="info-value">{formatDate(order.saleDate)}</span>
                            </div>
                            {order.confirmedAt && (
                                <div className="info-item">
                                    <span className="info-label">Confirmado em:</span>
                                    <span className="info-value">{formatDate(order.confirmedAt)}</span>
                                </div>
                            )}
                            {order.shippedAt && (
                                <div className="info-item">
                                    <span className="info-label">Enviado em:</span>
                                    <span className="info-value">{formatDate(order.shippedAt)}</span>
                                </div>
                            )}
                            {order.deliveredAt && (
                                <div className="info-item">
                                    <span className="info-label">Entregue em:</span>
                                    <span className="info-value">{formatDate(order.deliveredAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items */}
                    <div className="order-section">
                        <h2>🛍️ Itens do Pedido ({order.itemsCount} itens)</h2>
                        <div className="order-items">
                            {order.items.map((item) => (
                                <div key={item.id} className="order-item">
                                    <div className="item-info">
                                        <h3>{item.productName}</h3>
                                        <p className="item-sku">SKU: {item.productSku}</p>
                                        <div className="item-details">
                                            <span className="item-quantity">Qtd: {item.quantity}</span>
                                            <span className="item-price">R$ {item.unitPrice.toFixed(2)} cada</span>
                                            {item.discountAmount && item.discountAmount > 0 && (
                                                <span className="item-discount">
                                                    Desconto: R$ {item.discountAmount.toFixed(2)}
                                                    {item.discountPercentage && ` (${item.discountPercentage}%)`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="item-total">
                                        <p className="subtotal">R$ {item.subtotal.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Address */}
                    {order.deliveryAddress && (
                        <div className="order-section">
                            <h2>📍 Endereço de Entrega</h2>
                            <div className="address-card">
                                <div className="address-info">
                                    <p className="address-street">
                                        {order.deliveryAddress.street}, {order.deliveryAddress.number}
                                    </p>
                                    {order.deliveryAddress.complement && (
                                        <p className="address-complement">{order.deliveryAddress.complement}</p>
                                    )}
                                    <p className="address-neighborhood">{order.deliveryAddress.neighborhood}</p>
                                    <p className="address-city">
                                        {order.deliveryAddress.city} - {order.deliveryAddress.state}
                                    </p>
                                    <p className="address-postal">CEP: {order.deliveryAddress.postalCode}</p>
                                </div>
                                {order.deliveryType && (
                                    <div className="delivery-type">
                                        <span className="delivery-label">Tipo:</span>
                                        <span className="delivery-value">{formatDeliveryType(order.deliveryType)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Shipping Information */}
                    {order.shippingTrackingCode && (
                        <div className="order-section">
                            <h2>🚚 Informações de Envio</h2>
                            <div className="shipping-card">
                                <div className="shipping-info">
                                    <span className="shipping-label">Código de Rastreamento:</span>
                                    <span className="shipping-value">{order.shippingTrackingCode}</span>
                                </div>
                                {order.estimatedDeliveryDate && (
                                    <div className="shipping-info">
                                        <span className="shipping-label">Previsão de Entrega:</span>
                                        <span className="shipping-value">
                                            {new Date(order.estimatedDeliveryDate).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Payment Information */}
                    {order.paymentMethod && (
                        <div className="order-section">
                            <h2>💳 Método de Pagamento</h2>
                            <div className="payment-card">
                                <p>{formatPaymentMethod(order.paymentMethod)}</p>
                            </div>
                        </div>
                    )}

                    {/* Customer Notes */}
                    {order.customerNotes && (
                        <div className="order-section">
                            <h2>📝 Observações do Cliente</h2>
                            <div className="notes-card">
                                <p>{order.customerNotes}</p>
                            </div>
                        </div>
                    )}

                    {/* Coupon */}
                    {order.couponCode && (
                        <div className="order-section">
                            <h2>🎫 Cupom Aplicado</h2>
                            <div className="coupon-card">
                                <p>{order.couponCode}</p>
                            </div>
                        </div>
                    )}

                    {/* Order Summary */}
                    <div className="order-section">
                        <h2>💰 Resumo Financeiro</h2>
                        <div className="order-summary">
                            <div className="summary-line">
                                <span>Subtotal</span>
                                <span>R$ {order.subtotal.toFixed(2)}</span>
                            </div>
                            {order.discountAmount && order.discountAmount > 0 && (
                                <div className="summary-line discount">
                                    <span>Desconto</span>
                                    <span>- R$ {order.discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            {order.shippingAmount && order.shippingAmount > 0 && (
                                <div className="summary-line">
                                    <span>Frete</span>
                                    <span>R$ {order.shippingAmount.toFixed(2)}</span>
                                </div>
                            )}
                            {order.taxAmount && order.taxAmount > 0 && (
                                <div className="summary-line">
                                    <span>Impostos</span>
                                    <span>R$ {order.taxAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="summary-divider"></div>
                            <div className="summary-total">
                                <span>Total</span>
                                <span>R$ {order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="order-actions">
                    <Link to="/wholesale/orders" className="btn btn-outline">
                        ← Voltar para Meus Pedidos
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default WholesalerOrderDetail;