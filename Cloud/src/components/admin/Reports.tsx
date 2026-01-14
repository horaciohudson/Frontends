import { useState, useEffect } from 'react';
import { salesAPI, productsAPI, usersAPI } from '../../services/api';
import './Reports.css';

interface ReportData {
    type: string;
    data: any[];
    summary: any;
}

function Reports() {
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [currentReport, setCurrentReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Set default date range (last 30 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        setDateRange({
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        });
    }, []);

    const generateSalesReport = async () => {
        setLoading(true);
        try {
            const response = await salesAPI.getAll(0, 100);
            const sales = response.data.data?.content || [];
            
            // Filter by date range
            const filteredSales = sales.filter((sale: any) => {
                const saleDate = new Date(sale.saleDate);
                const start = new Date(dateRange.startDate);
                const end = new Date(dateRange.endDate);
                return saleDate >= start && saleDate <= end;
            });

            // Calculate summary
            const totalSales = filteredSales.length;
            const totalRevenue = filteredSales.reduce((sum: number, sale: any) => sum + (sale.totalAmount || 0), 0);
            const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

            setCurrentReport({
                type: 'Vendas',
                data: filteredSales,
                summary: {
                    totalSales,
                    totalRevenue,
                    avgTicket
                }
            });
        } catch (err) {
            console.error('Error generating sales report:', err);
            alert('Erro ao gerar relatório de vendas');
        } finally {
            setLoading(false);
        }
    };

    const generateProductsReport = async () => {
        setLoading(true);
        try {
            const response = await productsAPI.getAll(0, 100);
            const products = response.data.data?.content || [];

            // Calculate summary
            const totalProducts = products.length;
            const activeProducts = products.filter((p: any) => p.status === 'ACTIVE').length;
            const totalStock = products.reduce((sum: number, p: any) => sum + (p.stockQuantity || 0), 0);
            const lowStock = products.filter((p: any) => (p.stockQuantity || 0) < 10).length;

            setCurrentReport({
                type: 'Produtos',
                data: products,
                summary: {
                    totalProducts,
                    activeProducts,
                    totalStock,
                    lowStock
                }
            });
        } catch (err) {
            console.error('Error generating products report:', err);
            alert('Erro ao gerar relatório de produtos');
        } finally {
            setLoading(false);
        }
    };

    const generateCustomersReport = async () => {
        setLoading(true);
        try {
            const response = await usersAPI.getAll();
            const users = response.data || [];
            
            // Filter customers only
            const customers = users.filter((u: any) => 
                u.roles?.includes('ROLE_CLIENTE')
            );

            // Calculate summary
            const totalCustomers = customers.length;
            const activeCustomers = customers.filter((c: any) => c.isActive).length;
            const verifiedCustomers = customers.filter((c: any) => c.isVerified).length;

            setCurrentReport({
                type: 'Clientes',
                data: customers,
                summary: {
                    totalCustomers,
                    activeCustomers,
                    verifiedCustomers
                }
            });
        } catch (err) {
            console.error('Error generating customers report:', err);
            alert('Erro ao gerar relatório de clientes');
        } finally {
            setLoading(false);
        }
    };

    const generateStockReport = async () => {
        setLoading(true);
        try {
            const response = await productsAPI.getAll(0, 100);
            const products = response.data.data?.content || [];

            // Calculate summary
            const outOfStock = products.filter((p: any) => (p.stockQuantity || 0) === 0).length;
            const lowStock = products.filter((p: any) => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) < 10).length;
            const normalStock = products.filter((p: any) => (p.stockQuantity || 0) >= 10).length;
            const totalValue = products.reduce((sum: number, p: any) => 
                sum + ((p.price || 0) * (p.stockQuantity || 0)), 0
            );

            setCurrentReport({
                type: 'Estoque',
                data: products,
                summary: {
                    outOfStock,
                    lowStock,
                    normalStock,
                    totalValue
                }
            });
        } catch (err) {
            console.error('Error generating stock report:', err);
            alert('Erro ao gerar relatório de estoque');
        } finally {
            setLoading(false);
        }
    };

    const generateFinancialReport = async () => {
        setLoading(true);
        try {
            const response = await salesAPI.getAll(0, 100);
            const sales = response.data.data?.content || [];
            
            // Filter by date range
            const filteredSales = sales.filter((sale: any) => {
                const saleDate = new Date(sale.saleDate);
                const start = new Date(dateRange.startDate);
                const end = new Date(dateRange.endDate);
                return saleDate >= start && saleDate <= end;
            });

            // Calculate by status
            const completed = filteredSales.filter((s: any) => s.status === 'COMPLETED');
            const pending = filteredSales.filter((s: any) => s.status === 'PENDING_PAYMENT');
            const cancelled = filteredSales.filter((s: any) => s.status === 'CANCELLED');

            const totalRevenue = completed.reduce((sum: number, sale: any) => sum + (sale.totalAmount || 0), 0);
            const pendingRevenue = pending.reduce((sum: number, sale: any) => sum + (sale.totalAmount || 0), 0);
            const cancelledRevenue = cancelled.reduce((sum: number, sale: any) => sum + (sale.totalAmount || 0), 0);

            setCurrentReport({
                type: 'Financeiro',
                data: filteredSales,
                summary: {
                    totalRevenue,
                    pendingRevenue,
                    cancelledRevenue,
                    completedCount: completed.length,
                    pendingCount: pending.length,
                    cancelledCount: cancelled.length
                }
            });
        } catch (err) {
            console.error('Error generating financial report:', err);
            alert('Erro ao gerar relatório financeiro');
        } finally {
            setLoading(false);
        }
    };

    const generatePerformanceReport = async () => {
        setLoading(true);
        try {
            const [salesResponse, productsResponse] = await Promise.all([
                salesAPI.getAll(0, 100),
                productsAPI.getAll(0, 100)
            ]);

            const sales = salesResponse.data.data?.content || [];
            const products = productsResponse.data.data?.content || [];
            
            // Filter sales by date range
            const filteredSales = sales.filter((sale: any) => {
                const saleDate = new Date(sale.saleDate);
                const start = new Date(dateRange.startDate);
                const end = new Date(dateRange.endDate);
                return saleDate >= start && saleDate <= end;
            });

            // Calculate metrics
            const totalSales = filteredSales.length;
            const totalRevenue = filteredSales.reduce((sum: number, sale: any) => sum + (sale.totalAmount || 0), 0);
            const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
            
            // Calculate conversion rate (assuming 100 visits per sale as placeholder)
            const estimatedVisits = totalSales * 10;
            const conversionRate = estimatedVisits > 0 ? (totalSales / estimatedVisits) * 100 : 0;

            // Active products
            const activeProducts = products.filter((p: any) => p.status === 'ACTIVE').length;

            setCurrentReport({
                type: 'Performance',
                data: filteredSales,
                summary: {
                    totalSales,
                    totalRevenue,
                    avgTicket,
                    conversionRate,
                    activeProducts
                }
            });
        } catch (err) {
            console.error('Error generating performance report:', err);
            alert('Erro ao gerar relatório de performance');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = (reportType: string) => {
        switch (reportType) {
            case 'Vendas':
                generateSalesReport();
                break;
            case 'Produtos':
                generateProductsReport();
                break;
            case 'Clientes':
                generateCustomersReport();
                break;
            case 'Estoque':
                generateStockReport();
                break;
            case 'Financeiro':
                generateFinancialReport();
                break;
            case 'Performance':
                generatePerformanceReport();
                break;
            default:
                alert(`Relatório de ${reportType} em desenvolvimento`);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const renderReportContent = () => {
        if (!currentReport) return null;

        if (currentReport.type === 'Vendas') {
            return (
                <div className="report-content">
                    <div className="report-summary">
                        <div className="summary-card">
                            <span className="summary-label">Total de Vendas</span>
                            <span className="summary-value">{currentReport.summary.totalSales}</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-label">Receita Total</span>
                            <span className="summary-value">{formatCurrency(currentReport.summary.totalRevenue)}</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-label">Ticket Médio</span>
                            <span className="summary-value">{formatCurrency(currentReport.summary.avgTicket)}</span>
                        </div>
                    </div>

                    <div className="report-table-container">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Data</th>
                                    <th>Valor</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentReport.data.map((sale: any) => (
                                    <tr key={sale.saleId}>
                                        <td>#{sale.saleId}</td>
                                        <td>{sale.customerName}</td>
                                        <td>{formatDate(sale.saleDate)}</td>
                                        <td>{formatCurrency(sale.totalAmount)}</td>
                                        <td>{sale.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        if (currentReport.type === 'Produtos') {
            return (
                <div className="report-content">
                    <div className="report-summary">
                        <div className="summary-card">
                            <span className="summary-label">Total de Produtos</span>
                            <span className="summary-value">{currentReport.summary.totalProducts}</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-label">Produtos Ativos</span>
                            <span className="summary-value">{currentReport.summary.activeProducts}</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-label">Estoque Total</span>
                            <span className="summary-value">{currentReport.summary.totalStock}</span>
                        </div>
                        <div className="summary-card alert">
                            <span className="summary-label">Estoque Baixo</span>
                            <span className="summary-value">{currentReport.summary.lowStock}</span>
                        </div>
                    </div>

                    <div className="report-table-container">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>Categoria</th>
                                    <th>Preço</th>
                                    <th>Estoque</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentReport.data.map((product: any) => (
                                    <tr key={product.productId}>
                                        <td>#{product.productId}</td>
                                        <td>{product.name}</td>
                                        <td>{product.categoryName}</td>
                                        <td>{formatCurrency(product.price)}</td>
                                        <td className={product.stockQuantity < 10 ? 'low-stock' : ''}>
                                            {product.stockQuantity}
                                        </td>
                                        <td>{product.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        if (currentReport.type === 'Clientes') {
            return (
                <div className="report-content">
                    <div className="report-summary">
                        <div className="summary-card">
                            <span className="summary-label">Total de Clientes</span>
                            <span className="summary-value">{currentReport.summary.totalCustomers}</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-label">Clientes Ativos</span>
                            <span className="summary-value">{currentReport.summary.activeCustomers}</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-label">Email Verificado</span>
                            <span className="summary-value">{currentReport.summary.verifiedCustomers}</span>
                        </div>
                    </div>

                    <div className="report-table-container">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Verificado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentReport.data.map((customer: any) => (
                                    <tr key={customer.id}>
                                        <td>#{customer.id}</td>
                                        <td>{customer.firstName} {customer.lastName}</td>
                                        <td>{customer.email}</td>
                                        <td>{customer.isActive ? 'Ativo' : 'Inativo'}</td>
                                        <td>{customer.isVerified ? '✓' : '✗'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        if (currentReport.type === 'Estoque') {
            return (
                <div className="report-content">
                    <div className="report-summary">
                        <div className="summary-card alert">
                            <span className="summary-label">Sem Estoque</span>
                            <span className="summary-value">{currentReport.summary.outOfStock}</span>
                        </div>
                        <div className="summary-card alert">
                            <span className="summary-label">Estoque Baixo</span>
                            <span className="summary-value">{currentReport.summary.lowStock}</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-label">Estoque Normal</span>
                            <span className="summary-value">{currentReport.summary.normalStock}</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-label">Valor Total em Estoque</span>
                            <span className="summary-value">{formatCurrency(currentReport.summary.totalValue)}</span>
                        </div>
                    </div>

                    <div className="report-table-container">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Produto</th>
                                    <th>Categoria</th>
                                    <th>Preço</th>
                                    <th>Estoque</th>
                                    <th>Valor Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentReport.data
                                    .sort((a: any, b: any) => (a.stockQuantity || 0) - (b.stockQuantity || 0))
                                    .map((product: any) => (
                                    <tr key={product.productId}>
                                        <td>#{product.productId}</td>
                                        <td>{product.name}</td>
                                        <td>{product.categoryName}</td>
                                        <td>{formatCurrency(product.price)}</td>
                                        <td className={
                                            (product.stockQuantity || 0) === 0 ? 'low-stock' :
                                            (product.stockQuantity || 0) < 10 ? 'low-stock' : ''
                                        }>
                                            {product.stockQuantity || 0}
                                        </td>
                                        <td>{formatCurrency((product.price || 0) * (product.stockQuantity || 0))}</td>
                                        <td>{product.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        if (currentReport.type === 'Financeiro') {
            return (
                <div className="report-content">
                    <div className="report-summary">
                        <div className="summary-card">
                            <span className="summary-label">Receita Confirmada</span>
                            <span className="summary-value">{formatCurrency(currentReport.summary.totalRevenue)}</span>
                        </div>
                        <div className="summary-card alert">
                            <span className="summary-label">Receita Pendente</span>
                            <span className="summary-value">{formatCurrency(currentReport.summary.pendingRevenue)}</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-label">Vendas Concluídas</span>
                            <span className="summary-value">{currentReport.summary.completedCount}</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-label">Vendas Pendentes</span>
                            <span className="summary-value">{currentReport.summary.pendingCount}</span>
                        </div>
                    </div>

                    <div className="report-table-container">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Data</th>
                                    <th>Valor</th>
                                    <th>Status</th>
                                    <th>Tipo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentReport.data.map((sale: any) => (
                                    <tr key={sale.saleId}>
                                        <td>#{sale.saleId}</td>
                                        <td>{sale.customerName}</td>
                                        <td>{formatDate(sale.saleDate)}</td>
                                        <td>{formatCurrency(sale.totalAmount)}</td>
                                        <td>
                                            <span className={`status-badge ${sale.status.toLowerCase()}`}>
                                                {sale.status === 'COMPLETED' ? 'Concluída' :
                                                 sale.status === 'PENDING_PAYMENT' ? 'Pendente' :
                                                 sale.status === 'CANCELLED' ? 'Cancelada' : sale.status}
                                            </span>
                                        </td>
                                        <td>{sale.paymentMethod || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        if (currentReport.type === 'Performance') {
            return (
                <div className="report-content">
                    <div className="report-summary">
                        <div className="summary-card">
                            <span className="summary-label">Total de Vendas</span>
                            <span className="summary-value">{currentReport.summary.totalSales}</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-label">Receita Total</span>
                            <span className="summary-value">{formatCurrency(currentReport.summary.totalRevenue)}</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-label">Ticket Médio</span>
                            <span className="summary-value">{formatCurrency(currentReport.summary.avgTicket)}</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-label">Taxa de Conversão</span>
                            <span className="summary-value">{currentReport.summary.conversionRate.toFixed(2)}%</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-label">Produtos Ativos</span>
                            <span className="summary-value">{currentReport.summary.activeProducts}</span>
                        </div>
                    </div>

                    <div className="report-table-container">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Data</th>
                                    <th>Valor</th>
                                    <th>Itens</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentReport.data
                                    .sort((a: any, b: any) => (b.totalAmount || 0) - (a.totalAmount || 0))
                                    .map((sale: any) => (
                                    <tr key={sale.saleId}>
                                        <td>#{sale.saleId}</td>
                                        <td>{sale.customerName}</td>
                                        <td>{formatDate(sale.saleDate)}</td>
                                        <td>{formatCurrency(sale.totalAmount)}</td>
                                        <td>{sale.items || '-'}</td>
                                        <td>{sale.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="admin-reports">
            <div className="reports-header">
                <h2>📊 Relatórios</h2>
                <p>Gere relatórios detalhados sobre vendas, produtos e usuários</p>
            </div>

            <div className="date-filter">
                <h3>Período</h3>
                <div className="date-inputs">
                    <div className="form-group">
                        <label htmlFor="startDate">Data Inicial</label>
                        <input
                            type="date"
                            id="startDate"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="endDate">Data Final</label>
                        <input
                            type="date"
                            id="endDate"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                    </div>
                </div>
            </div>

            {loading && (
                <div className="report-loading">
                    <p>Gerando relatório...</p>
                </div>
            )}

            {currentReport && !loading && (
                <div className="report-result">
                    <div className="report-result-header">
                        <h3>📄 Relatório de {currentReport.type}</h3>
                        <button 
                            className="btn-secondary"
                            onClick={() => setCurrentReport(null)}
                        >
                            Limpar
                        </button>
                    </div>
                    {renderReportContent()}
                </div>
            )}

            <div className="reports-grid">
                <div className="report-card">
                    <div className="report-icon">💰</div>
                    <h3>Relatório de Vendas</h3>
                    <p>Vendas por período, produtos mais vendidos, ticket médio</p>
                    <button 
                        className="btn-primary"
                        onClick={() => handleGenerateReport('Vendas')}
                    >
                        Gerar Relatório
                    </button>
                </div>

                <div className="report-card">
                    <div className="report-icon">👕</div>
                    <h3>Relatório de Produtos</h3>
                    <p>Estoque, produtos mais visualizados, categorias</p>
                    <button 
                        className="btn-primary"
                        onClick={() => handleGenerateReport('Produtos')}
                    >
                        Gerar Relatório
                    </button>
                </div>

                <div className="report-card">
                    <div className="report-icon">👥</div>
                    <h3>Relatório de Clientes</h3>
                    <p>Novos clientes, clientes ativos, perfil de compra</p>
                    <button 
                        className="btn-primary"
                        onClick={() => handleGenerateReport('Clientes')}
                    >
                        Gerar Relatório
                    </button>
                </div>

                <div className="report-card">
                    <div className="report-icon">📦</div>
                    <h3>Relatório de Estoque</h3>
                    <p>Produtos em falta, estoque baixo, movimentações</p>
                    <button 
                        className="btn-primary"
                        onClick={() => handleGenerateReport('Estoque')}
                    >
                        Gerar Relatório
                    </button>
                </div>

                <div className="report-card">
                    <div className="report-icon">💳</div>
                    <h3>Relatório Financeiro</h3>
                    <p>Faturamento, formas de pagamento, comissões</p>
                    <button 
                        className="btn-primary"
                        onClick={() => handleGenerateReport('Financeiro')}
                    >
                        Gerar Relatório
                    </button>
                </div>

                <div className="report-card">
                    <div className="report-icon">📈</div>
                    <h3>Relatório de Performance</h3>
                    <p>Métricas de vendas, conversão, crescimento</p>
                    <button 
                        className="btn-primary"
                        onClick={() => handleGenerateReport('Performance')}
                    >
                        Gerar Relatório
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Reports;
