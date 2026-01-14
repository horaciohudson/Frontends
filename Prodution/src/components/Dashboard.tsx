import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productionOrderService } from '../services/productionOrderService';
import { productionExecutionService } from '../services/productionExecutionService';
import { productionClosureService } from '../services/productionClosureService';
import { rawMaterialStockService } from '../services/rawMaterialStockService';
import { productionCostService } from '../services/productionCostService';
import { formatCurrency, formatDate } from '../utils/formatting';
import type { ProductionOrder } from '../types/productionOrder';
import type { ProductionExecution } from '../types/productionExecution';
import type { ProductionClosure } from '../types/productionClosure';
import type { RawMaterialStock } from '../types/rawMaterialStock';
import './Dashboard.css';

interface DashboardProps {
  user?: {
    id: string;
    username: string;
    tenantId: string;
    tenantCode: string;
    tenantName?: string;
    roles?: string[];
  };
}

interface ProductionSummary {
  totalOrders: number;
  ordersInProgress: number;
  ordersCompleted: number;
  ordersPending: number;
  totalProduction: number;
  totalCosts: number;
  lowStockItems: number;
  totalStockValue: number;
  monthlyProduction: number;
  monthlyCosts: number;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ProductionSummary>({
    totalOrders: 0,
    ordersInProgress: 0,
    ordersCompleted: 0,
    ordersPending: 0,
    totalProduction: 0,
    totalCosts: 0,
    lowStockItems: 0,
    totalStockValue: 0,
    monthlyProduction: 0,
    monthlyCosts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<ProductionOrder[]>([]);
  const [lowStockItems, setLowStockItems] = useState<RawMaterialStock[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<ProductionExecution[]>([]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Datas para filtros
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];

      // Carregar dados em paralelo
      const [
        ordersData,
        executionsData,
        closuresData,
        stockData,
        costsData,
      ] = await Promise.all([
        productionOrderService.findAll(0, 100).catch(() => ({ content: [], totalElements: 0 })),
        productionExecutionService.findAll(0, 100).catch(() => ({ content: [], totalElements: 0 })),
        productionClosureService.findAll(0, 100).catch(() => ({ content: [], totalElements: 0 })),
        rawMaterialStockService.findAll(0, 100).catch(() => ({ content: [], totalElements: 0 })),
        productionCostService.findAll(0, 100).catch(() => ({ content: [], totalElements: 0 })),
      ]);

      // Calcular estatísticas das ordens
      const orders = ordersData.content || [];
      const totalOrders = orders.length;
      const ordersInProgress = orders.filter(order => order.status === 'IN_PROGRESS').length;
      const ordersCompleted = orders.filter(order => order.status === 'FINISHED').length;
      const ordersPending = orders.filter(order => order.status === 'PLANNED').length;

      // Calcular produção total (quantidade produzida)
      const executions = executionsData.content || [];
      const totalProduction = executions.reduce((sum, exec) => sum + (exec.quantityDone || 0), 0);

      // Calcular custos totais
      const costs = costsData.content || [];
      const totalCosts = costs.reduce((sum, cost) => sum + (cost.totalCost || 0), 0);

      // Calcular estoque
      const stock = stockData.content || [];
      const totalStockValue = stock.reduce((sum, item) => sum + (item.currentQuantity * item.unitCost), 0);
      const lowStockItems = stock.filter(item => item.currentQuantity <= item.minimumQuantity).length;

      // Calcular dados mensais
      const monthlyExecutions = executions.filter(exec => {
        const execDate = new Date(exec.startTime);
        return execDate >= startOfMonth && execDate <= endOfMonth;
      });
      const monthlyProduction = monthlyExecutions.reduce((sum, exec) => sum + (exec.quantityDone || 0), 0);

      const monthlyCosts = costs.filter(cost => {
        const costDate = new Date(cost.createdAt);
        return costDate >= startOfMonth && costDate <= endOfMonth;
      }).reduce((sum, cost) => sum + (cost.totalCost || 0), 0);

      setSummary({
        totalOrders,
        ordersInProgress,
        ordersCompleted,
        ordersPending,
        totalProduction,
        totalCosts,
        lowStockItems,
        totalStockValue,
        monthlyProduction,
        monthlyCosts,
      });

      // Definir listas para exibição
      setRecentOrders(orders.slice(0, 5));
      setLowStockItems(stock.filter(item => item.currentQuantity <= item.minimumQuantity).slice(0, 5));
      setRecentExecutions(executions.slice(0, 5));

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  // Renderizar mini gráfico de produção
  const renderProductionChart = () => {
    if (recentExecutions.length === 0) {
      return (
        <div className="chart-placeholder">
          <p>Sem dados de execução para o período</p>
        </div>
      );
    }

    const maxValue = Math.max(
      ...recentExecutions.map(exec => exec.quantityDone || 0),
      1
    );

    return (
      <div className="mini-chart">
        <div className="chart-bars">
          {recentExecutions.slice(-10).map((execution, index) => (
            <div key={index} className="chart-bar-group">
              <div
                className="chart-bar production"
                style={{ height: `${((execution.quantityDone || 0) / maxValue) * 100}%` }}
                title={`Produzido: ${execution.quantityDone || 0} unidades`}
              />
              <span className="chart-label">{execution.startTime?.slice(8, 10)}</span>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <span className="legend-item"><span className="legend-color production" /> Produção</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <p>Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>🏭 Dashboard de Produção - {user?.tenantName || user?.tenantCode || 'SIGEVE'}</h2>
        <p>Bem-vindo ao Sistema de Gestão de Produção</p>
        {user?.tenantCode && (
          <div className="company-info">
            <span>🖥️ {user.tenantCode} | Sistema de Produção: {user.tenantCode}</span>
          </div>
        )}
      </div>

      <div className="dashboard-cards">
        <div
          className="dashboard-card production-orders clickable"
          onClick={() => handleCardClick('/ordens-producao')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/ordens-producao')}
        >
          <div className="card-icon">📋</div>
          <div className="card-content">
            <h3>Ordens de Produção</h3>
            <p className="card-value">{summary.totalOrders}</p>
            <span className="card-subtitle">
              {summary.ordersInProgress} em andamento | {summary.ordersPending} pendentes
            </span>
          </div>
        </div>

        <div
          className="dashboard-card production-volume clickable"
          onClick={() => handleCardClick('/execucao-producao')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/execucao-producao')}
        >
          <div className="card-icon">⚙️</div>
          <div className="card-content">
            <h3>Produção Total</h3>
            <p className="card-value">{summary.totalProduction.toLocaleString()}</p>
            <span className="card-subtitle">unidades produzidas</span>
          </div>
        </div>

        <div
          className="dashboard-card production-costs clickable"
          onClick={() => handleCardClick('/custos-producao')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/custos-producao')}
        >
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Custos de Produção</h3>
            <p className="card-value">{formatCurrency(summary.totalCosts)}</p>
            <span className="card-subtitle">custos totais</span>
          </div>
        </div>

        <div
          className="dashboard-card stock-alert clickable"
          onClick={() => handleCardClick('/estoque-materias-primas')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/estoque-materias-primas')}
        >
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <h3>Estoque Baixo</h3>
            <p className="card-value stock-alert">{summary.lowStockItems}</p>
            <span className="card-subtitle">
              itens abaixo do mínimo | Valor total: {formatCurrency(summary.totalStockValue)}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>📊 Produção Recente</h3>
          {renderProductionChart()}
        </div>

        <div className="chart-container summary-container">
          <h3>📈 Resumo Mensal</h3>
          <div className="summary-grid">
            <div className="summary-item production">
              <span className="summary-label">Produção</span>
              <span className="summary-value">{summary.monthlyProduction.toLocaleString()} un</span>
            </div>
            <div className="summary-item costs">
              <span className="summary-label">Custos</span>
              <span className="summary-value">{formatCurrency(summary.monthlyCosts)}</span>
            </div>
            <div className="summary-item efficiency">
              <span className="summary-label">Ordens Concluídas</span>
              <span className="summary-value">{summary.ordersCompleted}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-lists">
        <div className="dashboard-list-container">
          <h3>📋 Ordens Recentes</h3>
          {recentOrders.length === 0 ? (
            <div className="empty-list">
              <p>Nenhuma ordem de produção encontrada</p>
            </div>
          ) : (
            <div className="recent-list">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="recent-item clickable"
                  onClick={() => handleCardClick('/ordens-producao')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/ordens-producao')}
                >
                  <span className="recent-icon">📋</span>
                  <div className="recent-content">
                    <p><strong>Ordem #{order.code}</strong></p>
                    <span>
                      {order.productName} - {order.quantityPlanned} unidades - Status: {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-list-container">
          <h3>🚨 Estoque Baixo</h3>
          {lowStockItems.length === 0 ? (
            <div className="empty-list">
              <p>Todos os itens estão com estoque adequado</p>
            </div>
          ) : (
            <div className="recent-list">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="recent-item stock-alert clickable"
                  onClick={() => handleCardClick('/estoque-materias-primas')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/estoque-materias-primas')}
                >
                  <span className="recent-icon">⚠️</span>
                  <div className="recent-content">
                    <p><strong>{item.rawMaterialName}</strong></p>
                    <span className="stock-alert-text">
                      Atual: {item.currentQuantity} {item.unit} | Mínimo: {item.minimumQuantity} {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-actions">
        <button
          className="action-button primary"
          onClick={() => handleCardClick('/ordens-producao')}
        >
          ➕ Nova Ordem de Produção
        </button>
        <button
          className="action-button secondary"
          onClick={() => handleCardClick('/execucao-producao')}
        >
          ⚙️ Executar Produção
        </button>
        <button
          className="action-button tertiary"
          onClick={() => handleCardClick('/estoque-materias-primas')}
        >
          📦 Ver Estoque
        </button>
        <button
          className="action-button quaternary"
          onClick={() => handleCardClick('/custos-producao')}
        >
          💰 Custos de Produção
        </button>
      </div>
    </div>
  );
};

export default Dashboard;