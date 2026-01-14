import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { wholesaleOrdersAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import './WholesaleOrderDetail.css';

interface WholesaleOrderItem {
    id: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    size?: string;
    color?: string;
    product: {
        id: number;
        name: string;
        sku: string;
    };
}

interface WholesaleOrder {
    id: number;
    orderUuid: string;
    orderNumber: string;
    status: string;
    orderType: string;
    totalAmount: number;
    subtotal: number;
    discountAmount: number;
    shippingAmount: number;
    paymentTermDays: number;
    paymentDueDate?: string;
    freightType: string;
    shippingCompany?: string;
    trackingCode?: string;
    customerNotes?: string;
    internalNotes?: string;
    submittedAt?: string;
    confirmedAt?: string;
    productionStartAt?: string;
    readyAt?: string;
    invoicedAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    createdAt: string;
    wholesaler: {
        id: number;
        companyName: string;
        cnpj: string;
    };
    items: WholesaleOrderItem[];
}

function WholesaleOrderDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { hasRole, isAuthenticated } = useAuth();
    const [order, setOrder] = useState<WholesaleOrder | null>(null);
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
            console.log('🔍 Loading wholesale order details for ID:', id);
            const response = await wholesaleOrdersAPI.getById(Number(id));
            console.log('📦 Order details response:', response);
            setOrder(response);
        } catch (err: any) {
            console.error('❌ Error loading order details:', err);
            console.error('❌ Error response:', err.response);
            console.error('❌ Error data:', err.response?.data);
            console.error('❌ Error status:', err.response?.status);
            
            let errorMessage = 'Erro ao carregar detalhes do pedido. Tente novamente.';
            
            if (err.response?.status === 401) {
                errorMessage = 'Usuário não autenticado. Faça login novamente.';
            } else if (err.response?.status === 403) {
                errorMessage = 'Acesso negado. Você não tem permissão para ver este pedido.';
            } else if (err.response?.status === 404) {
                errorMessage = 'Pedido não encontrado.';
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
            DRAFT: { label: 'Rascunho', className: 'status-draft' },
            SUBMITTED: { label: 'Enviado', className: 'status-submitted' },
            CONFIRMED: { label: 'Confirmado', className: 'status-confirmed' },
            IN_PRODUCTION: { label: 'Em Produção', className: 'status-production' },
            READY: { label: 'Pronto', className: 'status-ready' },
            INVOICED: { label: 'Faturado', className: 'status-invoiced' },
            SHIPPED: { label: 'Enviado', className: 'status-shipped' },
            DELIVERED: { label: 'Entregue', className: 'status-delivered' },
            CANCELLED: { label: 'Cancelado', className: 'status-cancelled' }
        };

        const statusInfo = statusMap[status] || { label: status, className: 'status-default' };
        return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
    };

    const getOrderTypeBadge = (orderType: string) => {
        const typeMap: Record<string, { label: string; className: string }> = {
            STOCK: { label: 'Estoque', className: 'type-stock' },
            PRODUCTION: { label: 'Produção', className: 'type-production' },
            MIXED: { label: 'Misto', className: 'type-mixed' }
        };

        const typeInfo = typeMap[orderType] || { label: orderType, className: 'type-default' };
        return <span className={`order-type-badge ${typeInfo.className}`}>{typeInfo.label}</span>;
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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const getTotalItems = () => {
        if (!order?.items) return 0;
        return order.items.reduce((total, item) => total + item.quantity, 0);
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (error || !order) {
        return (
            <div className="wholesale-order-detail-page">
                <div className="container">
                    <ErrorMessage message={error || 'Pedido não encontrado'} />
                    <Link to="/wholesale/orders" className="btn btn-outline">
                        Voltar para Meus Pedidos
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="wholesale-order-detail-page">
            <div className="container">
                <div className="breadcrumb">
                    <Link to="/wholesale">Central do Atacadista</Link>
                    <span>/</span>
                    <Link to="/wholesale/orders">Meus Pedidos</Link>
                    <span>/</span>
                    <span>Pedido #{order.orderNumber}</span>
                </div>

                <div className="order-header">
                    <div className="header-info">
                        <h1>🛒 Pedido #{order.orderNumber}</h1>
                        <p className="order-date">
                            <span className="date-icon">📅</span>
                            Realizado em {formatDate(order.submittedAt || order.createdAt)}
                        </p>
                        <p className="order-uuid">
                            <span className="uuid-icon">🔗</span>
                            UUID: {order.orderUuid}
                        </p>
                    </div>
                    <div className="header-badges">
                        {getStatusBadge(order.status)}
                        {getOrderTypeBadge(order.orderType)}
                    </div>
                </div>

                <div className="order-content">
                    {/* Status Timeline */}
                    <div className="order-section">
                        <h2>📊 Status do Pedido</h2>
                        <div className="status-timeline">
                            {order.submittedAt && (
                                <div className="timeline-item completed">
                                    <div className="timeline-icon">📤</div>
                                    <div className="timeline-content">
                                        <h4>Pedido Enviado</h4>
                                        <p>{formatDate(order.submittedAt)}</p>
                                    </div>
                                </div>
                            )}
                            {order.confirmedAt && (
                                <div className="timeline-item completed">
                                    <div className="timeline-icon">✅</div>
                                    <div className="timeline-content">
                                        <h4>Pedido Confirmado</h4>
                                        <p>{formatDate(order.confirmedAt)}</p>
                                    </div>
                                </div>
                            )}
                            {order.productionStartAt && (
                                <div className="timeline-item completed">
                                    <div className="timeline-icon">🏭</div>
                                    <div className="timeline-content">
                                        <h4>Produção Iniciada</h4>
                                        <p>{formatDate(order.productionStartAt)}</p>
                                    </div>
                                </div>
                            )}
                            {order.readyAt && (
                                <div className="timeline-item completed">
                                    <div className="timeline-icon">✨</div>
                                    <div className="timeline-content">
                                        <h4>Pedido Pronto</h4>
                                        <p>{formatDate(order.readyAt)}</p>
                                    </div>
                                </div>
                            )}
                            {order.invoicedAt && (
                                <div className="timeline-item completed">
                                    <div className="timeline-icon">🧾</div>
                                    <div className="timeline-content">
                                        <h4>Pedido Faturado</h4>
                                        <p>{formatDate(order.invoicedAt)}</p>
                                    </div>
                                </div>
                            )}
                            {order.shippedAt && (
                                <div className="timeline-item completed">
                                    <div className="timeline-icon">🚚</div>
                                    <div className="timeline-content">
                                        <h4>Pedido Enviado</h4>
                                        <p>{formatDate(order.shippedAt)}</p>
                                        {order.shippingCompany && (
                                            <p className="shipping-info">
                                                Transportadora: {order.shippingCompany}
                                            </p>
                                        )}
                                        {order.trackingCode && (
                                            <p className="tracking-info">
                                                Rastreio: {order.trackingCode}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {order.deliveredAt && (
                                <div className="timeline-item completed">
                                    <div className="timeline-icon">🎉</div>
                                    <div className="timeline-content">
                                        <h4>Pedido Entregue</h4>
                                        <p>{formatDate(order.deliveredAt)}</p>
                                    </div>
                                </div>
                            )}
                            {order.cancelledAt && (
                                <div className="timeline-item cancelled">
                                    <div className="timeline-icon">❌</div>
                                    <div className="timeline-content">
                                        <h4>Pedido Cancelado</h4>
                                        <p>{formatDate(order.cancelledAt)}</p>
                                        {order.cancellationReason && (
                                            <p className="cancellation-reason">
                                                Motivo: {order.cancellationReason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="order-section">
                        <h2>🛍️ Itens do Pedido ({getTotalItems()} peças)</h2>
                        {!order.items || order.items.length === 0 ? (
                            <div className="empty-items">
                                <p>⚠️ Nenhum item encontrado neste pedido</p>
                            </div>
                        ) : (
                            <div className="order-items">
                                {order.items.map((item) => (
                                    <div key={item.id} className="order-item">
                                        <div className="item-image">
                                            <div className="product-placeholder">
                                                📦
                                            </div>
                                        </div>
                                        <div className="item-info">
                                            <h3>{item.product.name}</h3>
                                            <p className="item-sku">SKU: {item.product.sku}</p>
                                            {item.size && (
                                                <p className="item-variant">Tamanho: {item.size}</p>
                                            )}
                                            {item.color && (
                                                <p className="item-variant">Cor: {item.color}</p>
                                            )}
                                            <div className="item-pricing">
                                                <span className="item-quantity">{item.quantity} unidades</span>
                                                <span className="item-unit-price">
                                                    {formatCurrency(item.unitPrice)} cada
                                                </span>
                                            </div>
                                        </div>
                                        <div className="item-total">
                                            <p className="subtotal">{formatCurrency(item.subtotal)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Order Information */}
                    <div className="order-section">
                        <h2>📋 Informações do Pedido</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Empresa:</span>
                                <span className="info-value">{order.wholesaler.companyName}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">CNPJ:</span>
                                <span className="info-value">{order.wholesaler.cnpj}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Prazo de Pagamento:</span>
                                <span className="info-value">{order.paymentTermDays} dias</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Tipo de Frete:</span>
                                <span className="info-value">{order.freightType}</span>
                            </div>
                            {order.paymentDueDate && (
                                <div className="info-item">
                                    <span className="info-label">Vencimento:</span>
                                    <span className="info-value">{formatDate(order.paymentDueDate)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    {(order.customerNotes || order.internalNotes) && (
                        <div className="order-section">
                            <h2>📝 Observações</h2>
                            {order.customerNotes && (
                                <div className="notes-item">
                                    <h4>Suas Observações:</h4>
                                    <p>{order.customerNotes}</p>
                                </div>
                            )}
                            {order.internalNotes && (
                                <div className="notes-item">
                                    <h4>Observações da Empresa:</h4>
                                    <p>{order.internalNotes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Order Summary */}
                    <div className="order-section">
                        <h2>💰 Resumo Financeiro</h2>
                        <div className="order-summary">
                            <div className="summary-line">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            {order.discountAmount > 0 && (
                                <div className="summary-line discount">
                                    <span>Desconto</span>
                                    <span>-{formatCurrency(order.discountAmount)}</span>
                                </div>
                            )}
                            <div className="summary-line">
                                <span>Frete</span>
                                <span>{formatCurrency(order.shippingAmount)}</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-total">
                                <span>Total</span>
                                <span>{formatCurrency(order.totalAmount)}</span>
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

export default WholesaleOrderDetail;