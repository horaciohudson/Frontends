import { useState, useEffect } from 'react';
import { salesAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Pagination from '../common/Pagination';
import './SalesList.css';

interface Sale {
    id: number;
    customerName: string;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    itemCount: number;
}

interface SalesListProps {
    onViewDetails?: (saleId: number) => void;
}

function SalesList({ onViewDetails }: SalesListProps) {
    const { showNotification } = useNotification();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        loadSales();
    }, [currentPage]);

    const loadSales = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await salesAPI.getAll(currentPage, 10);
            const data = response.data.data;
            setSales(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (err: any) {
            console.error('Error loading sales:', err);
            setError('Erro ao carregar vendas');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            PENDING: { label: 'Pendente', className: 'status-pending' },
            CONFIRMED: { label: 'Confirmado', className: 'status-confirmed' },
            PROCESSING: { label: 'Processando', className: 'status-processing' },
            SHIPPED: { label: 'Enviado', className: 'status-shipped' },
            DELIVERED: { label: 'Entregue', className: 'status-delivered' },
            CANCELLED: { label: 'Cancelado', className: 'status-cancelled' },
        };

        const statusInfo = statusMap[status] || { label: status, className: '' };
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

    const handleIssueInvoice = async (saleId: number) => {
        try {
            // TODO: Implementar integração com API de NF-e
            showNotification('info', 'Funcionalidade de emissão de NF será implementada em breve');
            console.log('Emitir NF para venda:', saleId);
        } catch (err: any) {
            showNotification('error', 'Erro ao emitir nota fiscal');
        }
    };

    if (loading && sales.length === 0) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="admin-sales-list">
            <div className="list-header">
                <div>
                    <h2>💰 Gerenciar Vendas</h2>
                    <p className="list-subtitle">
                        {totalElements} venda{totalElements !== 1 ? 's' : ''} registrada{totalElements !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {error && <ErrorMessage message={error} onClose={() => setError('')} />}

            {loading ? (
                <LoadingSpinner />
            ) : sales.length === 0 ? (
                <div className="empty-state">
                    <p>📭 Nenhuma venda encontrada</p>
                </div>
            ) : (
                <>
                    <div className="sales-table-container">
                        <table className="sales-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Data</th>
                                    <th>Itens</th>
                                    <th>Valor Total</th>
                                    <th>Pagamento</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map((sale) => (
                                    <tr key={sale.id}>
                                        <td>#{sale.id}</td>
                                        <td className="customer-name-cell">
                                            <strong>{sale.customerName}</strong>
                                        </td>
                                        <td>{formatDate(sale.createdAt)}</td>
                                        <td>{sale.itemCount} {sale.itemCount === 1 ? 'item' : 'itens'}</td>
                                        <td className="amount-cell">
                                            <strong>R$ {sale.totalAmount.toFixed(2)}</strong>
                                        </td>
                                        <td>{sale.paymentMethod || '-'}</td>
                                        <td>{getStatusBadge(sale.status)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                {onViewDetails && (
                                                    <button
                                                        className="btn-action btn-view"
                                                        onClick={() => onViewDetails(sale.id)}
                                                        title="Ver Detalhes"
                                                    >
                                                        👁️
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-action btn-invoice"
                                                    onClick={() => handleIssueInvoice(sale.id)}
                                                    title="Emitir Nota Fiscal"
                                                >
                                                    📄
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default SalesList;
