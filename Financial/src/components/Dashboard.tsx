import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountsPayableService } from '../services/accountsPayableService';
import { accountsReceivableService } from '../services/accountsReceivableService';
import { cashFlowService } from '../services/cashFlowService';
import { bankAccountService } from '../services/bankAccountService';
import { formatCurrency, formatDate } from '../utils/formatting';
import type { AccountsPayableDTO } from '../types/accountsPayable';
import type { AccountsReceivableDTO } from '../types/accountsReceivable';
import type { CashFlowChartData } from '../types/cashFlow';
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

interface DashboardSummary {
  totalReceivables: number;
  receivablesCount: number;
  totalPayables: number;
  payablesCount: number;
  overdueReceivables: number;
  overdueReceivablesCount: number;
  overduePayables: number;
  overduePayablesCount: number;
  availableBalance: number;
  monthlyInflows: number;
  monthlyOutflows: number;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalReceivables: 0,
    receivablesCount: 0,
    totalPayables: 0,
    payablesCount: 0,
    overdueReceivables: 0,
    overdueReceivablesCount: 0,
    overduePayables: 0,
    overduePayablesCount: 0,
    availableBalance: 0,
    monthlyInflows: 0,
    monthlyOutflows: 0,
  });
  const [upcomingPayables, setUpcomingPayables] = useState<AccountsPayableDTO[]>([]);
  const [overdueReceivablesList, setOverdueReceivablesList] = useState<AccountsReceivableDTO[]>([]);
  const [chartData, setChartData] = useState<CashFlowChartData[]>([]);

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
        pendingPayables,
        pendingReceivables,
        overduePayablesData,
        overdueReceivablesData,
        availableBalance,
        upcomingPayablesData,
        cashFlowChartData,
      ] = await Promise.all([
        accountsPayableService.findPending(0, 100).catch(() => ({ content: [], totalElements: 0 })),
        accountsReceivableService.findPending(0, 100).catch(() => ({ content: [], totalElements: 0 })),
        accountsPayableService.findOverdue(0, 100).catch(() => ({ content: [], totalElements: 0 })),
        accountsReceivableService.findOverdue(0, 10).catch(() => ({ content: [], totalElements: 0 })),
        bankAccountService.getTotalAvailableBalance().catch(() => 0),
        accountsPayableService.findDueInNextDays(7, 0, 5).catch(() => ({ content: [] })),
        cashFlowService.getChartData(startDate, endDate).catch(() => []),
      ]);

      // Calcular totais
      const totalPayables = pendingPayables.content.reduce((sum, item) => sum + (item.remainingAmount || 0), 0);
      const totalReceivables = pendingReceivables.content.reduce((sum, item) => sum + (item.remainingAmount || 0), 0);
      const overduePayablesTotal = overduePayablesData.content.reduce((sum, item) => sum + (item.remainingAmount || 0), 0);
      const overdueReceivablesTotal = overdueReceivablesData.content.reduce((sum, item) => sum + (item.remainingAmount || 0), 0);

      // Calcular fluxo mensal
      const monthlyInflows = cashFlowChartData.reduce((sum, item) => sum + (item.inflows || 0), 0);
      const monthlyOutflows = cashFlowChartData.reduce((sum, item) => sum + (item.outflows || 0), 0);

      setSummary({
        totalReceivables,
        receivablesCount: pendingReceivables.totalElements || pendingReceivables.content.length,
        totalPayables,
        payablesCount: pendingPayables.totalElements || pendingPayables.content.length,
        overdueReceivables: overdueReceivablesTotal,
        overdueReceivablesCount: overdueReceivablesData.totalElements || overdueReceivablesData.content.length,
        overduePayables: overduePayablesTotal,
        overduePayablesCount: overduePayablesData.totalElements || overduePayablesData.content.length,
        availableBalance,
        monthlyInflows,
        monthlyOutflows,
      });

      setUpcomingPayables(upcomingPayablesData.content || []);
      setOverdueReceivablesList(overdueReceivablesData.content || []);
      setChartData(cashFlowChartData);
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

  // Renderizar mini gráfico de barras simples
  const renderMiniChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="chart-placeholder">
          <p>Sem dados de fluxo de caixa para o período</p>
        </div>
      );
    }

    const maxValue = Math.max(
      ...chartData.map(d => Math.max(d.inflows || 0, d.outflows || 0)),
      1
    );

    return (
      <div className="mini-chart">
        <div className="chart-bars">
          {chartData.slice(-15).map((data, index) => (
            <div key={index} className="chart-bar-group">
              <div
                className="chart-bar inflow"
                style={{ height: `${((data.inflows || 0) / maxValue) * 100}%` }}
                title={`Entradas: ${formatCurrency(data.inflows || 0)}`}
              />
              <div
                className="chart-bar outflow"
                style={{ height: `${((data.outflows || 0) / maxValue) * 100}%` }}
                title={`Saídas: ${formatCurrency(data.outflows || 0)}`}
              />
              <span className="chart-label">{data.date?.slice(8, 10)}</span>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <span className="legend-item"><span className="legend-color inflow" /> Entradas</span>
          <span className="legend-item"><span className="legend-color outflow" /> Saídas</span>
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
        <h2>💰 Dashboard Financeiro - {user?.tenantName || user?.tenantCode || 'SIGEVE'}</h2>
        <p>Bem-vindo ao Sistema Financeiro Integrado</p>
        {user?.tenantCode && (
          <div className="company-info">
            <span>🖥️ {user.tenantCode} | Sistema Cliente: {user.tenantCode}</span>
          </div>
        )}
        {user && (
          <div className="user-info" style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
            <strong>Debug - Informações do Usuário:</strong><br />
            <span>👤 Usuário: {user.username} (ID: {user.id})</span><br />
            <span>🏢 Tenant: {user.tenantCode} (ID: {user.tenantId})</span><br />
            <span>🔑 Roles: {user.roles?.join(', ') || 'Nenhuma'}</span>
          </div>
        )}
      </div>

      <div className="dashboard-cards">
        <div
          className="dashboard-card accounts-receivable clickable"
          onClick={() => handleCardClick('/contas-receber')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/contas-receber')}
        >
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3>Contas a Receber</h3>
            <p className="card-value">{formatCurrency(summary.totalReceivables)}</p>
            <span className="card-subtitle">{summary.receivablesCount} títulos em aberto</span>
          </div>
        </div>

        <div
          className="dashboard-card accounts-payable clickable"
          onClick={() => handleCardClick('/contas-pagar')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/contas-pagar')}
        >
          <div className="card-icon">📉</div>
          <div className="card-content">
            <h3>Contas a Pagar</h3>
            <p className="card-value">{formatCurrency(summary.totalPayables)}</p>
            <span className="card-subtitle">{summary.payablesCount} títulos pendentes</span>
          </div>
        </div>

        <div
          className="dashboard-card cash-flow clickable"
          onClick={() => handleCardClick('/fluxo-caixa')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/fluxo-caixa')}
        >
          <div className="card-icon">💵</div>
          <div className="card-content">
            <h3>Saldo Disponível</h3>
            <p className="card-value">{formatCurrency(summary.availableBalance)}</p>
            <span className="card-subtitle">Contas bancárias ativas</span>
          </div>
        </div>

        <div className="dashboard-card overdue-alert">
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <h3>Itens Vencidos</h3>
            <p className="card-value overdue">
              {summary.overduePayablesCount + summary.overdueReceivablesCount}
            </p>
            <span className="card-subtitle">
              {summary.overduePayablesCount} a pagar | {summary.overdueReceivablesCount} a receber
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>📊 Fluxo de Caixa - Mês Atual</h3>
          {renderMiniChart()}
        </div>

        <div className="chart-container summary-container">
          <h3>📈 Resumo Mensal</h3>
          <div className="summary-grid">
            <div className="summary-item positive">
              <span className="summary-label">Entradas</span>
              <span className="summary-value">{formatCurrency(summary.monthlyInflows)}</span>
            </div>
            <div className="summary-item negative">
              <span className="summary-label">Saídas</span>
              <span className="summary-value">{formatCurrency(summary.monthlyOutflows)}</span>
            </div>
            <div className="summary-item balance">
              <span className="summary-label">Saldo</span>
              <span className={`summary-value ${summary.monthlyInflows - summary.monthlyOutflows >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(summary.monthlyInflows - summary.monthlyOutflows)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-lists">
        <div className="dashboard-list-container">
          <h3>📅 Próximos Pagamentos (7 dias)</h3>
          {upcomingPayables.length === 0 ? (
            <div className="empty-list">
              <p>Nenhum pagamento nos próximos 7 dias</p>
            </div>
          ) : (
            <div className="recent-list">
              {upcomingPayables.map((item) => (
                <div
                  key={item.id}
                  className="recent-item clickable"
                  onClick={() => handleCardClick('/contas-pagar')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/contas-pagar')}
                >
                  <span className="recent-icon">💸</span>
                  <div className="recent-content">
                    <p><strong>{item.supplierName || item.description}</strong></p>
                    <span>
                      {formatCurrency(item.remainingAmount)} - Vence em {formatDate(item.dueDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-list-container">
          <h3>🚨 Recebíveis Vencidos</h3>
          {overdueReceivablesList.length === 0 ? (
            <div className="empty-list">
              <p>Nenhum recebível vencido</p>
            </div>
          ) : (
            <div className="recent-list">
              {overdueReceivablesList.map((item) => (
                <div
                  key={item.id}
                  className="recent-item overdue clickable"
                  onClick={() => handleCardClick('/contas-receber')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleCardClick('/contas-receber')}
                >
                  <span className="recent-icon">⚠️</span>
                  <div className="recent-content">
                    <p><strong>{item.customerName || item.description}</strong></p>
                    <span className="overdue-text">
                      {formatCurrency(item.remainingAmount)} - Venceu em {formatDate(item.dueDate)}
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
          onClick={() => handleCardClick('/contas-pagar')}
        >
          ➕ Nova Conta a Pagar
        </button>
        <button
          className="action-button secondary"
          onClick={() => handleCardClick('/contas-receber')}
        >
          ➕ Nova Conta a Receber
        </button>
        <button
          className="action-button tertiary"
          onClick={() => handleCardClick('/fluxo-caixa')}
        >
          📊 Ver Fluxo de Caixa
        </button>

        {user && !user.roles?.includes('ROLE_ADMIN') && (
          <button
            className="action-button"
            style={{ backgroundColor: '#f59e0b', color: 'white' }}
            onClick={async () => {
              try {
                // Tentar atribuir ROLE_ADMIN ao usuário atual
                const response = await fetch(`http://localhost:8081/api/users/${user.id}/roles/ROLE_ADMIN`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'X-Tenant-ID': '1', // Usando valor numérico para teste
                    'Content-Type': 'application/json'
                  }
                });

                if (response.ok) {
                  alert('Role ADMIN atribuída com sucesso! Recarregue a página.');
                  window.location.reload();
                } else {
                  const error = await response.text();
                  alert(`Erro ao atribuir role: ${error}`);
                }
              } catch (error) {
                alert(`Erro: ${error}`);
              }
            }}
          >
            🔑 Atribuir Role ADMIN (Debug)
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
