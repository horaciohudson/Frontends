import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import api from '../services/api';
import './WholesaleReports.css';

interface OrderSummary {
    totalOrders: number;
    totalAmount: number;
    averageOrderValue: number;
    pendingOrders: number;
    completedOrders: number;
}

interface MonthlyData {
    month: string;
    orders: number;
    amount: number;
}

function WholesaleReports() {
    const { hasRole, isAuthenticated, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [wholesalerId, setWholesalerId] = useState<number | null>(null);
    const [summary, setSummary] = useState<OrderSummary | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Redirect if not a wholesaler
    if (!isAuthenticated || !hasRole('REVENDA')) {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        // Set default dates (last 6 months)
        const today = new Date();
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1);

        setEndDate(today.toISOString().split('T')[0]);
        setStartDate(sixMonthsAgo.toISOString().split('T')[0]);

        loadWholesaler();
    }, [user]);

    useEffect(() => {
        if (wholesalerId && startDate && endDate) {
            loadReports();
        }
    }, [wholesalerId, startDate, endDate]);

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

    const loadReports = async () => {
        try {
            setLoading(true);
            setError('');

            // Load all orders for the wholesaler
            const ordersResponse = await api.get(`/wholesale-orders/wholesaler/${wholesalerId}`);
            const orders = ordersResponse.data.content || [];

            // Filter by date range
            const filteredOrders = orders.filter((order: any) => {
                const orderDate = new Date(order.orderDate);
                return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
            });

            // Calculate summary
            const totalOrders = filteredOrders.length;
            const totalAmount = filteredOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
            const pendingOrders = filteredOrders.filter((o: any) => o.status === 'PENDING' || o.status === 'PROCESSING').length;
            const completedOrders = filteredOrders.filter((o: any) => o.status === 'COMPLETED').length;

            setSummary({
                totalOrders,
                totalAmount,
                averageOrderValue: totalOrders > 0 ? totalAmount / totalOrders : 0,
                pendingOrders,
                completedOrders
            });

            // Group by month
            const monthlyMap = new Map<string, { orders: number; amount: number }>();

            filteredOrders.forEach((order: any) => {
                const date = new Date(order.orderDate);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                if (!monthlyMap.has(monthKey)) {
                    monthlyMap.set(monthKey, { orders: 0, amount: 0 });
                }

                const data = monthlyMap.get(monthKey)!;
                data.orders += 1;
                data.amount += order.totalAmount;
            });

            // Convert to array and sort
            const monthly = Array.from(monthlyMap.entries())
                .map(([month, data]) => ({
                    month: formatMonthYear(month),
                    orders: data.orders,
                    amount: data.amount
                }))
                .sort((a, b) => a.month.localeCompare(b.month));

            setMonthlyData(monthly);
        } catch (err: any) {
            console.error('Error loading reports:', err);
            setError('Erro ao carregar relatórios');
        } finally {
            setLoading(false);
        }
    };

    const formatMonthYear = (monthKey: string) => {
        const [year, month] = monthKey.split('-');
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return `${months[parseInt(month) - 1]}/${year}`;
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const exportToCSV = () => {
        if (!monthlyData.length) return;

        const headers = ['Mês', 'Pedidos', 'Valor Total'];
        const rows = monthlyData.map(data => [
            data.month,
            data.orders.toString(),
            data.amount.toFixed(2)
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `relatorio_compras_${startDate}_${endDate}.csv`;
        link.click();
    };

    const getMaxAmount = () => {
        if (!monthlyData.length) return 0;
        return Math.max(...monthlyData.map(d => d.amount));
    };

    return (
        <div className="wholesale-reports">
            <div className="container">
                <div className="reports-header">
                    <div className="breadcrumb">
                        <Link to="/wholesale">Central do Atacadista</Link>
                        <span> / </span>
                        <span>Relatórios</span>
                    </div>
                    <h1>📊 Relatórios</h1>
                    <p className="subtitle">Análise de compras e faturamento</p>
                </div>

                <div className="filters-section">
                    <div className="date-filters">
                        <div className="filter-group">
                            <label>Data Inicial:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="date-input"
                            />
                        </div>
                        <div className="filter-group">
                            <label>Data Final:</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="date-input"
                            />
                        </div>
                        <button onClick={exportToCSV} className="btn-export" disabled={!monthlyData.length}>
                            📥 Exportar CSV
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Carregando relatórios...</p>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && summary && (
                    <>
                        <div className="summary-cards">
                            <div className="summary-card">
                                <div className="card-icon">📦</div>
                                <div className="card-content">
                                    <div className="card-label">Total de Pedidos</div>
                                    <div className="card-value">{summary.totalOrders}</div>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon">💰</div>
                                <div className="card-content">
                                    <div className="card-label">Valor Total</div>
                                    <div className="card-value">{formatCurrency(summary.totalAmount)}</div>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon">📈</div>
                                <div className="card-content">
                                    <div className="card-label">Ticket Médio</div>
                                    <div className="card-value">{formatCurrency(summary.averageOrderValue)}</div>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon">⏳</div>
                                <div className="card-content">
                                    <div className="card-label">Pedidos Pendentes</div>
                                    <div className="card-value">{summary.pendingOrders}</div>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-icon">✅</div>
                                <div className="card-content">
                                    <div className="card-label">Pedidos Concluídos</div>
                                    <div className="card-value">{summary.completedOrders}</div>
                                </div>
                            </div>
                        </div>

                        {monthlyData.length > 0 ? (
                            <>
                                <div className="chart-section">
                                    <h2>Evolução de Compras por Mês</h2>
                                    <div className="chart-container">
                                        <div className="chart-bars">
                                            {monthlyData.map((data, index) => (
                                                <div key={index} className="bar-group">
                                                    <div className="bar-wrapper">
                                                        <div
                                                            className="bar"
                                                            style={{
                                                                height: `${(data.amount / getMaxAmount()) * 100}%`
                                                            }}
                                                            title={`${data.month}: ${formatCurrency(data.amount)}`}
                                                        >
                                                            <span className="bar-value">{formatCurrency(data.amount)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="bar-label">{data.month}</div>
                                                    <div className="bar-orders">{data.orders} pedidos</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="table-section">
                                    <h2>Detalhamento Mensal</h2>
                                    <div className="table-container">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Mês</th>
                                                    <th>Quantidade de Pedidos</th>
                                                    <th>Valor Total</th>
                                                    <th>Ticket Médio</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {monthlyData.map((data, index) => (
                                                    <tr key={index}>
                                                        <td>{data.month}</td>
                                                        <td>{data.orders}</td>
                                                        <td>{formatCurrency(data.amount)}</td>
                                                        <td>{formatCurrency(data.amount / data.orders)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td><strong>Total</strong></td>
                                                    <td><strong>{summary.totalOrders}</strong></td>
                                                    <td><strong>{formatCurrency(summary.totalAmount)}</strong></td>
                                                    <td><strong>{formatCurrency(summary.averageOrderValue)}</strong></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">📊</div>
                                <h3>Nenhum dado encontrado</h3>
                                <p>Não há pedidos no período selecionado.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default WholesaleReports;
