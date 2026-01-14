import { useState, useEffect } from 'react';
import { salesAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import './SaleDetail.css';

interface SaleDetailProps {
    saleId: number;
    onClose: () => void;
}

interface SaleItem {
    saleItemId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

interface Address {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
}

interface Sale {
    id: number;
    saleDate: string;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    customerName: string;
    customerEmail?: string;
    items: SaleItem[];
    deliveryAddress?: Address;
}

function SaleDetail({ saleId, onClose }: SaleDetailProps) {
    const [sale, setSale] = useState<Sale | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadSaleDetail();
    }, [saleId]);

    const loadSaleDetail = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await salesAPI.getSaleById(saleId);
            setSale(response.data.data || response.data);
        } catch (err: any) {
            console.error('Error loading sale detail:', err);
            setError(err.response?.data?.message || 'Erro ao carregar detalhes da venda');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!sale) return;

        try {
            setUpdating(true);
            await salesAPI.updateStatus(saleId, newStatus);
            setSale({ ...sale, status: newStatus });
            alert('Status atualizado com sucesso!');
        } catch (err: any) {
            console.error('Error updating status:', err);
            alert(err.response?.data?.message || 'Erro ao atualizar status');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            'CART': { label: 'Carrinho', className: 'status-pending' },
            'PENDING': { label: 'Pendente', className: 'status-pending' },
            'PENDING_PAYMENT': { label: 'Aguardando Pagamento', className: 'status-pending' },
            'PAID': { label: 'Pago', className: 'status-confirmed' },
            'PROCESSING': { label: 'Processando', className: 'status-processing' },
            'SHIPPED': { label: 'Enviado', className: 'status-shipped' },
            'DELIVERED': { label: 'Entregue', className: 'status-delivered' },
            'COMPLETED': { label: 'Concluído', className: 'status-delivered' },
            'CANCELLED': { label: 'Cancelado', className: 'status-cancelled' },
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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    if (loading) {
        return (
            <div className="sale-detail">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="sale-detail">
                <ErrorMessage message={error} />
                <button className="btn btn-secondary" onClick={onClose}>
                    Voltar
                </button>
            </div>
        );
    }

    if (!sale) {
        return (
            <div className="sale-detail">
                <ErrorMessage message="Venda não encontrada" />
                <button className="btn btn-secondary" onClick={onClose}>
                    Voltar
                </button>
            </div>
        );
    }

    return (
        <div className="sale-detail">
            <div className="sale-detail-header">
                <div>
                    <h2>Detalhes da Venda #{sale.id}</h2>
                    <p className="sale-date">{formatDate(sale.saleDate)}</p>
                </div>
                <button className="btn-close" onClick={onClose}>✕</button>
            </div>

            <div className="sale-detail-content">
                {/* Status and Actions */}
                <div className="detail-card">
                    <h3>Status do Pedido</h3>
                    <div className="status-section">
                        <div className="current-status">
                            {getStatusBadge(sale.status)}
                        </div>
                        <div className="status-actions">
                            <label>Atualizar Status:</label>
                            <select
                                value={sale.status}
                                onChange={(e) => handleStatusUpdate(e.target.value)}
                                disabled={updating}
                            >
                                <option value="PENDING">Pendente</option>
                                <option value="PENDING_PAYMENT">Aguardando Pagamento</option>
                                <option value="PAID">Pago</option>
                                <option value="PROCESSING">Processando</option>
                                <option value="SHIPPED">Enviado</option>
                                <option value="DELIVERED">Entregue</option>
                                <option value="COMPLETED">Concluído</option>
                                <option value="CANCELLED">Cancelado</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Customer Information */}
                <div className="detail-card">
                    <h3>Informações do Cliente</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Nome:</span>
                            <span className="info-value">{sale.customerName || '-'}</span>
                        </div>
                        {sale.customerEmail && (
                            <div className="info-item">
                                <span className="info-label">Email:</span>
                                <span className="info-value">{sale.customerEmail}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Delivery Address */}
                {sale.deliveryAddress && (
                    <div className="detail-card">
                        <h3>Endereço de Entrega</h3>
                        <div className="address-info">
                            <p>{sale.deliveryAddress.street}, {sale.deliveryAddress.number}</p>
                            {sale.deliveryAddress.complement && <p>{sale.deliveryAddress.complement}</p>}
                            <p>{sale.deliveryAddress.neighborhood}</p>
                            <p>{sale.deliveryAddress.city} - {sale.deliveryAddress.state}</p>
                            <p>CEP: {sale.deliveryAddress.zipCode}</p>
                        </div>
                    </div>
                )}

                {/* Payment Method */}
                <div className="detail-card">
                    <h3>Método de Pagamento</h3>
                    <p className="payment-method">{sale.paymentMethod}</p>
                </div>

                {/* Order Items */}
                <div className="detail-card">
                    <h3>Itens do Pedido</h3>
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Quantidade</th>
                                <th>Preço Unitário</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.items.map((item) => (
                                <tr key={item.saleItemId}>
                                    <td>{item.productName}</td>
                                    <td>{item.quantity}</td>
                                    <td>{formatCurrency(item.unitPrice)}</td>
                                    <td>{formatCurrency(item.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={3}><strong>Total</strong></td>
                                <td><strong>{formatCurrency(sale.totalAmount)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="sale-detail-footer">
                <button className="btn btn-secondary" onClick={onClose}>
                    Voltar à Lista
                </button>
            </div>
        </div>
    );
}

export default SaleDetail;
