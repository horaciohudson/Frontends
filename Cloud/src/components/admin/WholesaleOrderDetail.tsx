import { useState, useEffect } from 'react';
import { wholesaleOrdersAPI } from '../../services/api';
import './WholesaleOrderDetail.css';

interface WholesaleOrderDetailProps {
    orderId: number;
    onClose: () => void;
    onUpdate: () => void;
}

interface OrderItem {
    id: number;
    product: {
        id: number;
        name: string;
        sku: string;
    };
    size: string | null;
    color: string | null;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

interface Order {
    id: number;
    orderNumber: string;
    orderUuid: string;
    status: string;
    wholesaler: {
        id: number;
        companyName: string;
        cnpj: string;
    };
    subtotal: number;
    discountAmount: number;
    shippingAmount: number;
    totalAmount: number;
    paymentTermDays: number;
    paymentDueDate: string | null;
    freightType: string;
    shippingCompany: string | null;
    trackingCode: string | null;
    customerNotes: string | null;
    internalNotes: string | null;
    submittedAt: string | null;
    confirmedAt: string | null;
    productionStartAt: string | null;
    readyAt: string | null;
    invoicedAt: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
    cancelledAt: string | null;
    cancellationReason: string | null;
    items: OrderItem[];
}

function WholesaleOrderDetail({ orderId, onClose, onUpdate }: WholesaleOrderDetailProps) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [trackingCode, setTrackingCode] = useState('');
    const [shippingCompany, setShippingCompany] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showShippingModal, setShowShippingModal] = useState(false);

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            console.log('🔍 Carregando pedido ID:', orderId);
            const data = await wholesaleOrdersAPI.getById(orderId);
            console.log('📦 Dados do pedido:', data);
            console.log('📦 Items do pedido:', data?.items);
            console.log('📦 Quantidade de items:', data?.items?.length);
            setOrder(data);
            setTrackingCode(data.trackingCode || '');
            setShippingCompany(data.shippingCompany || '');
        } catch (err: any) {
            console.error('❌ Erro ao carregar pedido:', err);
            setError(err.message || 'Erro ao carregar pedido');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusAction = async (action: string) => {
        if (!order) return;

        try {
            setActionLoading(true);
            setError(null);

            switch (action) {
                case 'confirm':
                    await wholesaleOrdersAPI.confirm(order.id);
                    break;
                case 'start-production':
                    await wholesaleOrdersAPI.startProduction(order.id);
                    break;
                case 'mark-ready':
                    await wholesaleOrdersAPI.markReady(order.id);
                    break;
                case 'mark-invoiced':
                    await wholesaleOrdersAPI.markInvoiced(order.id);
                    break;
                case 'mark-delivered':
                    await wholesaleOrdersAPI.markDelivered(order.id);
                    break;
            }

            await loadOrder();
            onUpdate();
        } catch (err: any) {
            setError(err.message || `Erro ao executar ação: ${action}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleShip = async () => {
        if (!order || !trackingCode || !shippingCompany) {
            setError('Código de rastreio e transportadora são obrigatórios');
            return;
        }

        try {
            setActionLoading(true);
            setError(null);
            await wholesaleOrdersAPI.markShipped(order.id, trackingCode, shippingCompany);
            setShowShippingModal(false);
            await loadOrder();
            onUpdate();
        } catch (err: any) {
            setError(err.message || 'Erro ao marcar como enviado');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!order || !cancelReason.trim()) {
            setError('Motivo do cancelamento é obrigatório');
            return;
        }

        try {
            setActionLoading(true);
            setError(null);
            await wholesaleOrdersAPI.cancel(order.id, cancelReason);
            setShowCancelModal(false);
            await loadOrder();
            onUpdate();
        } catch (err: any) {
            setError(err.message || 'Erro ao cancelar pedido');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            DRAFT: 'Rascunho',
            SUBMITTED: 'Aguardando Aprovação',
            CONFIRMED: 'Confirmado',
            IN_PRODUCTION: 'Em Produção',
            READY: 'Pronto',
            INVOICED: 'Faturado',
            SHIPPED: 'Enviado',
            DELIVERED: 'Entregue',
            CANCELLED: 'Cancelado'
        };
        return labels[status] || status;
    };

    const getStatusClass = (status: string) => {
        const classes: Record<string, string> = {
            DRAFT: 'status-draft',
            SUBMITTED: 'status-submitted',
            CONFIRMED: 'status-confirmed',
            IN_PRODUCTION: 'status-production',
            READY: 'status-ready',
            INVOICED: 'status-invoiced',
            SHIPPED: 'status-shipped',
            DELIVERED: 'status-delivered',
            CANCELLED: 'status-cancelled'
        };
        return classes[status] || '';
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    if (loading) {
        return <div className="wholesale-order-detail loading">Carregando...</div>;
    }

    if (error && !order) {
        return (
            <div className="wholesale-order-detail error">
                <p>{error}</p>
                <button onClick={onClose}>Voltar</button>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className="wholesale-order-detail">
            <div className="detail-header">
                <div>
                    <h2>Pedido {order.orderNumber}</h2>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                    </span>
                </div>
                <button className="btn-close" onClick={onClose}>✕</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="detail-content">
                {/* Informações do Revendedor */}
                <section className="detail-section">
                    <h3>Revendedor</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Empresa:</label>
                            <span>{order.wholesaler.companyName}</span>
                        </div>
                        <div className="info-item">
                            <label>CNPJ:</label>
                            <span>{order.wholesaler.cnpj}</span>
                        </div>
                    </div>
                </section>

                {/* Informações do Pedido */}
                <section className="detail-section">
                    <h3>Informações do Pedido</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Número:</label>
                            <span>{order.orderNumber}</span>
                        </div>
                        <div className="info-item">
                            <label>UUID:</label>
                            <span className="uuid">{order.orderUuid}</span>
                        </div>
                        <div className="info-item">
                            <label>Prazo de Pagamento:</label>
                            <span>{order.paymentTermDays} dias</span>
                        </div>
                        <div className="info-item">
                            <label>Tipo de Frete:</label>
                            <span>{order.freightType}</span>
                        </div>
                    </div>
                </section>

                {/* Itens do Pedido */}
                <section className="detail-section">
                    <h3>Itens do Pedido ({order.items?.length || 0})</h3>
                    {!order.items || order.items.length === 0 ? (
                        <p className="empty-message">⚠️ Nenhum item encontrado neste pedido</p>
                    ) : (
                        <table className="items-table">
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>SKU</th>
                                    <th>Tamanho</th>
                                    <th>Cor</th>
                                    <th>Qtd</th>
                                    <th>Preço Unit.</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.product.name}</td>
                                        <td>{item.product.sku}</td>
                                        <td>{item.size || '-'}</td>
                                        <td>{item.color || '-'}</td>
                                        <td>{item.quantity}</td>
                                        <td>{formatCurrency(item.unitPrice)}</td>
                                        <td>{formatCurrency(item.subtotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                {/* Valores */}
                <section className="detail-section">
                    <h3>Valores</h3>
                    <div className="totals-grid">
                        <div className="total-item">
                            <label>Subtotal:</label>
                            <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="total-item">
                            <label>Desconto:</label>
                            <span>-{formatCurrency(order.discountAmount)}</span>
                        </div>
                        <div className="total-item">
                            <label>Frete:</label>
                            <span>{formatCurrency(order.shippingAmount)}</span>
                        </div>
                        <div className="total-item total">
                            <label>Total:</label>
                            <span>{formatCurrency(order.totalAmount)}</span>
                        </div>
                    </div>
                </section>

                {/* Informações de Envio */}
                {(order.trackingCode || order.shippingCompany) && (
                    <section className="detail-section">
                        <h3>Informações de Envio</h3>
                        <div className="info-grid">
                            {order.shippingCompany && (
                                <div className="info-item">
                                    <label>Transportadora:</label>
                                    <span>{order.shippingCompany}</span>
                                </div>
                            )}
                            {order.trackingCode && (
                                <div className="info-item">
                                    <label>Código de Rastreio:</label>
                                    <span>{order.trackingCode}</span>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Datas */}
                <section className="detail-section">
                    <h3>Histórico</h3>
                    <div className="timeline">
                        {order.submittedAt && (
                            <div className="timeline-item">
                                <label>Enviado:</label>
                                <span>{formatDate(order.submittedAt)}</span>
                            </div>
                        )}
                        {order.confirmedAt && (
                            <div className="timeline-item">
                                <label>Confirmado:</label>
                                <span>{formatDate(order.confirmedAt)}</span>
                            </div>
                        )}
                        {order.productionStartAt && (
                            <div className="timeline-item">
                                <label>Produção Iniciada:</label>
                                <span>{formatDate(order.productionStartAt)}</span>
                            </div>
                        )}
                        {order.readyAt && (
                            <div className="timeline-item">
                                <label>Pronto:</label>
                                <span>{formatDate(order.readyAt)}</span>
                            </div>
                        )}
                        {order.invoicedAt && (
                            <div className="timeline-item">
                                <label>Faturado:</label>
                                <span>{formatDate(order.invoicedAt)}</span>
                            </div>
                        )}
                        {order.shippedAt && (
                            <div className="timeline-item">
                                <label>Enviado:</label>
                                <span>{formatDate(order.shippedAt)}</span>
                            </div>
                        )}
                        {order.deliveredAt && (
                            <div className="timeline-item">
                                <label>Entregue:</label>
                                <span>{formatDate(order.deliveredAt)}</span>
                            </div>
                        )}
                        {order.cancelledAt && (
                            <div className="timeline-item cancelled">
                                <label>Cancelado:</label>
                                <span>{formatDate(order.cancelledAt)}</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Observações */}
                {(order.customerNotes || order.internalNotes || order.cancellationReason) && (
                    <section className="detail-section">
                        <h3>Observações</h3>
                        {order.customerNotes && (
                            <div className="notes-item">
                                <label>Observações do Cliente:</label>
                                <p>{order.customerNotes}</p>
                            </div>
                        )}
                        {order.internalNotes && (
                            <div className="notes-item">
                                <label>Observações Internas:</label>
                                <p>{order.internalNotes}</p>
                            </div>
                        )}
                        {order.cancellationReason && (
                            <div className="notes-item cancelled">
                                <label>Motivo do Cancelamento:</label>
                                <p>{order.cancellationReason}</p>
                            </div>
                        )}
                    </section>
                )}

                {/* Ações */}
                <section className="detail-section">
                    <h3>Ações</h3>
                    <div className="actions-grid">
                        {order.status === 'SUBMITTED' && (
                            <button
                                className="btn-action btn-confirm"
                                onClick={() => handleStatusAction('confirm')}
                                disabled={actionLoading}
                            >
                                Confirmar Pedido
                            </button>
                        )}
                        {order.status === 'CONFIRMED' && (
                            <button
                                className="btn-action btn-production"
                                onClick={() => handleStatusAction('start-production')}
                                disabled={actionLoading}
                            >
                                Iniciar Produção
                            </button>
                        )}
                        {order.status === 'IN_PRODUCTION' && (
                            <button
                                className="btn-action btn-ready"
                                onClick={() => handleStatusAction('mark-ready')}
                                disabled={actionLoading}
                            >
                                Marcar como Pronto
                            </button>
                        )}
                        {order.status === 'READY' && (
                            <button
                                className="btn-action btn-invoice"
                                onClick={() => handleStatusAction('mark-invoiced')}
                                disabled={actionLoading}
                            >
                                Marcar como Faturado
                            </button>
                        )}
                        {order.status === 'INVOICED' && (
                            <button
                                className="btn-action btn-ship"
                                onClick={() => setShowShippingModal(true)}
                                disabled={actionLoading}
                            >
                                Marcar como Enviado
                            </button>
                        )}
                        {order.status === 'SHIPPED' && (
                            <button
                                className="btn-action btn-deliver"
                                onClick={() => handleStatusAction('mark-delivered')}
                                disabled={actionLoading}
                            >
                                Marcar como Entregue
                            </button>
                        )}
                        {(order.status === 'DRAFT' || order.status === 'SUBMITTED' || order.status === 'CONFIRMED') && (
                            <button
                                className="btn-action btn-cancel"
                                onClick={() => setShowCancelModal(true)}
                                disabled={actionLoading}
                            >
                                Cancelar Pedido
                            </button>
                        )}
                    </div>
                </section>
            </div>

            {/* Modal de Envio */}
            {showShippingModal && (
                <div className="modal-overlay" onClick={() => setShowShippingModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Informações de Envio</h3>
                        <div className="form-group">
                            <label>Transportadora *</label>
                            <input
                                type="text"
                                value={shippingCompany}
                                onChange={e => setShippingCompany(e.target.value)}
                                placeholder="Nome da transportadora"
                            />
                        </div>
                        <div className="form-group">
                            <label>Código de Rastreio *</label>
                            <input
                                type="text"
                                value={trackingCode}
                                onChange={e => setTrackingCode(e.target.value)}
                                placeholder="Código de rastreamento"
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn-primary"
                                onClick={handleShip}
                                disabled={actionLoading || !trackingCode || !shippingCompany}
                            >
                                Confirmar Envio
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => setShowShippingModal(false)}
                                disabled={actionLoading}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Cancelamento */}
            {showCancelModal && (
                <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Cancelar Pedido</h3>
                        <div className="form-group">
                            <label>Motivo do Cancelamento *</label>
                            <textarea
                                value={cancelReason}
                                onChange={e => setCancelReason(e.target.value)}
                                placeholder="Descreva o motivo do cancelamento"
                                rows={4}
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn-danger"
                                onClick={handleCancel}
                                disabled={actionLoading || !cancelReason.trim()}
                            >
                                Confirmar Cancelamento
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => setShowCancelModal(false)}
                                disabled={actionLoading}
                            >
                                Voltar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WholesaleOrderDetail;
