import { useState, useEffect } from 'react';
import { wholesaleOrdersAPI } from '../../services/api';
import './WholesaleOrdersList.css';

interface WholesaleOrder {
    id: number;
    orderNumber: string;
    wholesaler: {
        id: number;
        companyName: string;
        cnpj: string;
    };
    status: string;
    totalAmount: number;
    submittedAt: string;
    confirmedAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
}

interface WholesaleOrdersListProps {
    onViewDetail: (orderId: number) => void;
}

function WholesaleOrdersList({ onViewDetail }: WholesaleOrdersListProps) {
    const [orders, setOrders] = useState<WholesaleOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    useEffect(() => {
        loadOrders();
    }, [statusFilter]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await wholesaleOrdersAPI.getAll();

            // Garantir que response.data seja um array
            const data = response?.content || response?.data || response || [];
            let filteredOrders = Array.isArray(data) ? data : [];

            if (statusFilter !== 'ALL') {
                filteredOrders = filteredOrders.filter((order: WholesaleOrder) => order.status === statusFilter);
            }

            setOrders(filteredOrders);
        } catch (error) {
            console.error('Error loading wholesale orders:', error);
            setOrders([]); // Garantir que orders seja um array vazio em caso de erro
            alert('Erro ao carregar pedidos atacado');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
            DRAFT: { label: 'Rascunho', className: 'status-draft' },
            SUBMITTED: { label: 'Enviado', className: 'status-submitted' },
            CONFIRMED: { label: 'Confirmado', className: 'status-confirmed' },
            IN_PRODUCTION: { label: 'Em Produção', className: 'status-production' },
            READY: { label: 'Pronto', className: 'status-ready' },
            SHIPPED: { label: 'Enviado', className: 'status-shipped' },
            DELIVERED: { label: 'Entregue', className: 'status-delivered' },
            CANCELLED: { label: 'Cancelado', className: 'status-cancelled' },
        };

        const config = statusConfig[status] || { label: status, className: 'status-default' };
        return <span className={`status-badge ${config.className}`}>{config.label}</span>;
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    };

    if (loading) {
        return <div className="loading">Carregando pedidos...</div>;
    }

    return (
        <div className="wholesale-orders-list">
            <div className="list-header">
                <h2>📦 Pedidos Atacado</h2>
                <div className="header-actions">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="status-filter"
                    >
                        <option value="ALL">Todos os Status</option>
                        <option value="SUBMITTED">Enviados</option>
                        <option value="CONFIRMED">Confirmados</option>
                        <option value="IN_PRODUCTION">Em Produção</option>
                        <option value="READY">Prontos</option>
                        <option value="SHIPPED">Enviados</option>
                        <option value="DELIVERED">Entregues</option>
                        <option value="CANCELLED">Cancelados</option>
                    </select>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="empty-state">
                    <p>📭 Nenhum pedido encontrado</p>
                </div>
            ) : (
                <div className="orders-table-container">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Número</th>
                                <th>Revendedor</th>
                                <th>CNPJ</th>
                                <th>Status</th>
                                <th>Valor Total</th>
                                <th>Data Envio</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td className="order-number">{order.orderNumber}</td>
                                    <td>{order.wholesaler.companyName}</td>
                                    <td>{order.wholesaler.cnpj}</td>
                                    <td>{getStatusBadge(order.status)}</td>
                                    <td className="amount">{formatCurrency(order.totalAmount)}</td>
                                    <td>{formatDate(order.submittedAt)}</td>
                                    <td>
                                        <button
                                            className="btn-view"
                                            onClick={() => onViewDetail(order.id)}
                                        >
                                            Ver Detalhes
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default WholesaleOrdersList;
