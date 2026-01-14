import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import api from '../services/api';
import './WholesaleInvoices.css';

interface WholesaleInvoice {
    id: number;
    invoiceNumber: string;
    invoiceSeries?: string;
    invoiceKey?: string;
    issueDate: string;
    dueDate: string;
    totalAmount: number;
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    paidAt?: string;
    paidAmount?: number;
    pdfUrl?: string;
    xmlUrl?: string;
    order: {
        id: number;
        orderNumber: string;
    };
}

interface Wholesaler {
    id: number;
    corporateName: string;
    cnpj: string;
}

function WholesaleInvoices() {
    const { hasRole, isAuthenticated, user } = useAuth();
    const [invoices, setInvoices] = useState<WholesaleInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [wholesalerId, setWholesalerId] = useState<number | null>(null);

    // Redirect if not a wholesaler
    if (!isAuthenticated || !hasRole('REVENDA')) {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        loadWholesaler();
    }, [user]);

    useEffect(() => {
        if (wholesalerId) {
            loadInvoices();
        }
    }, [wholesalerId, filterStatus, currentPage]);

    const loadWholesaler = async () => {
        try {
            const response = await api.get(`/wholesalers/user/${user?.id}`);
            setWholesalerId(response.data.id);
        } catch (err: any) {
            console.error('Error loading wholesaler:', err);
            setError('Erro ao carregar dados do atacadista');
            setLoading(false);
        }
    };

    const loadInvoices = async () => {
        try {
            setLoading(true);
            setError('');

            let url = `/wholesale-invoices/wholesaler/${wholesalerId}?page=${currentPage}&size=10&sort=issueDate,desc`;

            if (filterStatus !== 'ALL') {
                url = `/wholesale-invoices/wholesaler/${wholesalerId}/status/${filterStatus}?page=${currentPage}&size=10&sort=issueDate,desc`;
            }

            const response = await api.get(url);
            setInvoices(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
        } catch (err: any) {
            console.error('Error loading invoices:', err);
            setError('Erro ao carregar notas fiscais');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            PENDING: { label: 'Pendente', className: 'status-pending' },
            PAID: { label: 'Paga', className: 'status-paid' },
            OVERDUE: { label: 'Vencida', className: 'status-overdue' },
            CANCELLED: { label: 'Cancelada', className: 'status-cancelled' }
        };
        const badge = badges[status as keyof typeof badges] || { label: status, className: '' };
        return <span className={`status-badge ${badge.className}`}>{badge.label}</span>;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const getDaysUntilDue = (dueDate: string, status: string) => {
        if (status === 'PAID' || status === 'CANCELLED') return null;

        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return <span className="days-overdue">Vencida há {Math.abs(diffDays)} dias</span>;
        } else if (diffDays === 0) {
            return <span className="days-today">Vence hoje</span>;
        } else if (diffDays <= 7) {
            return <span className="days-soon">Vence em {diffDays} dias</span>;
        }
        return <span className="days-normal">Vence em {diffDays} dias</span>;
    };

    return (
        <div className="wholesale-invoices">
            <div className="container">
                <div className="invoices-header">
                    <div className="breadcrumb">
                        <Link to="/wholesale">Central do Atacadista</Link>
                        <span> / </span>
                        <span>Notas Fiscais</span>
                    </div>
                    <h1>📄 Notas Fiscais</h1>
                    <p className="subtitle">Gerencie suas notas fiscais e boletos</p>
                </div>

                <div className="filters-section">
                    <div className="filter-group">
                        <label>Filtrar por Status:</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(0);
                            }}
                            className="filter-select"
                        >
                            <option value="ALL">Todos</option>
                            <option value="PENDING">Pendente</option>
                            <option value="PAID">Paga</option>
                            <option value="OVERDUE">Vencida</option>
                            <option value="CANCELLED">Cancelada</option>
                        </select>
                    </div>
                </div>

                {loading && (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Carregando notas fiscais...</p>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && invoices.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">📄</div>
                        <h3>Nenhuma nota fiscal encontrada</h3>
                        <p>Você ainda não possui notas fiscais {filterStatus !== 'ALL' ? 'com este status' : ''}.</p>
                    </div>
                )}

                {!loading && !error && invoices.length > 0 && (
                    <>
                        <div className="invoices-list">
                            {invoices.map((invoice) => (
                                <div key={invoice.id} className="invoice-card">
                                    <div className="invoice-header">
                                        <div className="invoice-number">
                                            <strong>NF-e {invoice.invoiceNumber}</strong>
                                            {invoice.invoiceSeries && <span className="series">Série {invoice.invoiceSeries}</span>}
                                        </div>
                                        {getStatusBadge(invoice.status)}
                                    </div>

                                    <div className="invoice-body">
                                        <div className="invoice-info">
                                            <div className="info-row">
                                                <span className="label">Pedido:</span>
                                                <span className="value">#{invoice.order.orderNumber}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">Emissão:</span>
                                                <span className="value">{formatDate(invoice.issueDate)}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">Vencimento:</span>
                                                <span className="value">{formatDate(invoice.dueDate)}</span>
                                            </div>
                                            {invoice.paidAt && (
                                                <div className="info-row">
                                                    <span className="label">Pago em:</span>
                                                    <span className="value">{formatDate(invoice.paidAt)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="invoice-amount">
                                            <div className="amount-label">Valor Total</div>
                                            <div className="amount-value">{formatCurrency(invoice.totalAmount)}</div>
                                            {invoice.paidAmount && invoice.paidAmount !== invoice.totalAmount && (
                                                <div className="paid-amount">Pago: {formatCurrency(invoice.paidAmount)}</div>
                                            )}
                                        </div>
                                    </div>

                                    {getDaysUntilDue(invoice.dueDate, invoice.status) && (
                                        <div className="invoice-due-info">
                                            {getDaysUntilDue(invoice.dueDate, invoice.status)}
                                        </div>
                                    )}

                                    {(invoice.pdfUrl || invoice.xmlUrl) && (
                                        <div className="invoice-actions">
                                            {invoice.pdfUrl && (
                                                <a
                                                    href={invoice.pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-download btn-pdf"
                                                >
                                                    📥 Download PDF
                                                </a>
                                            )}
                                            {invoice.xmlUrl && (
                                                <a
                                                    href={invoice.xmlUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-download btn-xml"
                                                >
                                                    📥 Download XML
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                    disabled={currentPage === 0}
                                    className="btn-page"
                                >
                                    ← Anterior
                                </button>
                                <span className="page-info">
                                    Página {currentPage + 1} de {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                    disabled={currentPage === totalPages - 1}
                                    className="btn-page"
                                >
                                    Próxima →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default WholesaleInvoices;
