import { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { salesAPI } from '../../services/api';
import './SalesChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface SalesData {
  date: string;
  amount: number;
  count: number;
}

interface StatusData {
  status: string;
  count: number;
}

function SalesChart() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'7days' | '30days' | '90days'>('7days');

  useEffect(() => {
    loadChartData();
  }, [period]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar vendas reais da API
      const response = await salesAPI.getAll(0, 1000); // Buscar muitas vendas para análise
      const allSales = response.data.data?.content || [];

      // Calcular período
      const days = period === '7days' ? 7 : period === '30days' ? 30 : 90;
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - days);

      // Filtrar vendas do período
      const periodSales = allSales.filter((sale: any) => {
        const saleDate = new Date(sale.saleDate);
        return saleDate >= startDate && saleDate <= today;
      });

      // Agrupar vendas por dia
      const salesByDay = new Map<string, { amount: number; count: number }>();
      
      // Inicializar todos os dias do período com zero
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (days - 1 - i));
        const dateStr = date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
        salesByDay.set(dateStr, { amount: 0, count: 0 });
      }

      // Preencher com dados reais
      periodSales.forEach((sale: any) => {
        const saleDate = new Date(sale.saleDate);
        const dateStr = saleDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
        
        const existing = salesByDay.get(dateStr) || { amount: 0, count: 0 };
        salesByDay.set(dateStr, {
          amount: existing.amount + (sale.totalAmount || 0),
          count: existing.count + 1
        });
      });

      // Converter para array
      const salesDataArray: SalesData[] = Array.from(salesByDay.entries()).map(([date, data]) => ({
        date,
        amount: data.amount,
        count: data.count
      }));

      // Agrupar por status
      const statusCounts = new Map<string, number>();
      allSales.forEach((sale: any) => {
        const status = sale.status || 'Desconhecido';
        statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
      });

      // Mapear status para português
      const statusMap: Record<string, string> = {
        'PENDING_PAYMENT': 'Pendente',
        'PENDING': 'Pendente',
        'CONFIRMED': 'Confirmado',
        'PROCESSING': 'Processando',
        'SHIPPED': 'Enviado',
        'DELIVERED': 'Entregue',
        'CANCELLED': 'Cancelado'
      };

      const statusDataArray: StatusData[] = Array.from(statusCounts.entries()).map(([status, count]) => ({
        status: statusMap[status] || status,
        count
      }));

      setSalesData(salesDataArray);
      setStatusData(statusDataArray);
    } catch (err) {
      console.error('Erro ao carregar dados de gráficos:', err);
      setError('Erro ao carregar dados de vendas');
      
      // Fallback para dados simulados em caso de erro
      const mockSalesData: SalesData[] = generateMockSalesData(period);
      const mockStatusData: StatusData[] = [
        { status: 'Pendente', count: 12 },
        { status: 'Confirmado', count: 28 },
        { status: 'Enviado', count: 45 },
        { status: 'Entregue', count: 89 },
        { status: 'Cancelado', count: 5 }
      ];
      setSalesData(mockSalesData);
      setStatusData(mockStatusData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockSalesData = (period: string): SalesData[] => {
    const days = period === '7days' ? 7 : period === '30days' ? 30 : 90;
    const data: SalesData[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });

      data.push({
        date: dateStr,
        amount: Math.floor(Math.random() * 5000) + 1000,
        count: Math.floor(Math.random() * 20) + 5
      });
    }

    return data;
  };

  if (loading) {
    return <div className="sales-chart-loading">Carregando gráficos...</div>;
  }

  if (error) {
    return <div className="sales-chart-error">{error}</div>;
  }

  // Dados para gráfico de linha (Vendas por dia)
  const lineChartData = {
    labels: salesData.map(d => d.date),
    datasets: [
      {
        label: 'Vendas (R$)',
        data: salesData.map(d => d.amount),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };

  // Dados para gráfico de barras (Quantidade de pedidos)
  const barChartData = {
    labels: salesData.map(d => d.date),
    datasets: [
      {
        label: 'Quantidade de Pedidos',
        data: salesData.map(d => d.count),
        backgroundColor: '#764ba2',
        borderColor: '#764ba2',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  // Dados para gráfico de pizza (Status dos pedidos)
  const doughnutChartData = {
    labels: statusData.map(d => d.status),
    datasets: [
      {
        data: statusData.map(d => d.count),
        backgroundColor: [
          '#FFC107',
          '#2196F3',
          '#4CAF50',
          '#8BC34A',
          '#F44336'
        ],
        borderColor: '#fff',
        borderWidth: 2
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          font: { size: 12 },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        borderColor: '#667eea',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="sales-chart-container">
      <div className="chart-header">
        <h2>📊 Análise de Vendas</h2>
        <div className="period-selector">
          <button
            className={`period-btn ${period === '7days' ? 'active' : ''}`}
            onClick={() => setPeriod('7days')}
          >
            7 dias
          </button>
          <button
            className={`period-btn ${period === '30days' ? 'active' : ''}`}
            onClick={() => setPeriod('30days')}
          >
            30 dias
          </button>
          <button
            className={`period-btn ${period === '90days' ? 'active' : ''}`}
            onClick={() => setPeriod('90days')}
          >
            90 dias
          </button>
        </div>
      </div>

      <div className="charts-grid">
        {/* Gráfico de Linha */}
        <div className="chart-card">
          <h3>💰 Faturamento por Dia</h3>
          <div className="chart-wrapper">
            <Line data={lineChartData} options={chartOptions as any} />
          </div>
        </div>

        {/* Gráfico de Barras */}
        <div className="chart-card">
          <h3>📦 Quantidade de Pedidos</h3>
          <div className="chart-wrapper">
            <Bar data={barChartData} options={chartOptions as any} />
          </div>
        </div>

        {/* Gráfico de Pizza */}
        <div className="chart-card chart-card-full">
          <h3>🎯 Status dos Pedidos</h3>
          <div className="chart-wrapper chart-wrapper-small">
            <Doughnut data={doughnutChartData} options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: {
                  position: 'right' as const,
                  labels: {
                    font: { size: 12 },
                    padding: 15,
                    usePointStyle: true
                  }
                }
              }
            } as any} />
          </div>
        </div>
      </div>

      {/* Resumo de Estatísticas */}
      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">Total de Vendas</span>
          <span className="stat-value">
            R$ {salesData.reduce((sum, d) => sum + d.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total de Pedidos</span>
          <span className="stat-value">
            {salesData.reduce((sum, d) => sum + d.count, 0)}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Ticket Médio</span>
          <span className="stat-value">
            R$ {(salesData.reduce((sum, d) => sum + d.amount, 0) / salesData.reduce((sum, d) => sum + d.count, 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pedidos Entregues</span>
          <span className="stat-value">
            {statusData.find(s => s.status === 'Entregue')?.count || 0}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SalesChart;
