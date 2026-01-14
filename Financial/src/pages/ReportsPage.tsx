import React, { useState, useCallback } from 'react';
import { accountsPayableService } from '../services/accountsPayableService';
import { accountsReceivableService } from '../services/accountsReceivableService';
import { cashFlowService } from '../services/cashFlowService';
import { formatCurrency, formatDate } from '../utils/formatting';
import Notification from '../components/ui/Notification';
import './ReportsPage.css';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface ReportData {
  headers: string[];
  rows: (string | number)[][];
  totals?: Record<string, number>;
}

const reportTypes: ReportType[] = [
  {
    id: 'payables-by-status',
    name: 'Contas a Pagar por Status',
    description: 'Resumo de contas a pagar agrupadas por status',
    icon: '📊',
  },
  {
    id: 'receivables-by-status',
    name: 'Contas a Receber por Status',
    description: 'Resumo de contas a receber agrupadas por status',
    icon: '📈',
  },
  {
    id: 'cashflow-summary',
    name: 'Resumo de Fluxo de Caixa',
    description: 'Entradas e saídas por período',
    icon: '💰',
  },
  {
    id: 'overdue-payables',
    name: 'Contas a Pagar Vencidas',
    description: 'Lista de contas a pagar em atraso',
    icon: '⚠️',
  },
  {
    id: 'overdue-receivables',
    name: 'Contas a Receber Vencidas',
    description: 'Lista de contas a receber em atraso',
    icon: '🚨',
  },
];

const ReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [notification, setNotification] = useState<{
    type: NotificationType;
    message: string;
    visible: boolean;
  }>({ type: 'info', message: '', visible: false });

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message, visible: true });
  };

  const generateReport = useCallback(async () => {
    if (!selectedReport) {
      showNotification('warning', 'Selecione um tipo de relatório');
      return;
    }

    setLoading(true);
    setReportData(null);

    try {
      let data: ReportData;

      switch (selectedReport) {
        case 'payables-by-status': {
          const stats = await accountsPayableService.getSumByStatus();
          data = {
            headers: ['Status', 'Quantidade', 'Valor Total'],
            rows: stats.map(s => [
              translateStatus(s.status),
              s.count || 0,
              formatCurrency(s.total),
            ]),
            totals: {
              'Valor Total': stats.reduce((sum, s) => sum + s.total, 0),
            },
          };
          break;
        }

        case 'receivables-by-status': {
          const stats = await accountsReceivableService.getSumByStatus();
          data = {
            headers: ['Status', 'Quantidade', 'Valor Total'],
            rows: stats.map(s => [
              translateStatus(s.status),
              s.count || 0,
              formatCurrency(s.total),
            ]),
            totals: {
              'Valor Total': stats.reduce((sum, s) => sum + s.total, 0),
            },
          };
          break;
        }

        case 'cashflow-summary': {
          const summary = await cashFlowService.getSummary(startDate, endDate);
          data = {
            headers: ['Descrição', 'Valor'],
            rows: [
              ['Total de Entradas', formatCurrency(summary.totalInflows)],
              ['Total de Saídas', formatCurrency(summary.totalOutflows)],
              ['Saldo do Período', formatCurrency(summary.balance)],
              ['Entradas Pendentes', formatCurrency(summary.pendingInflows)],
              ['Saídas Pendentes', formatCurrency(summary.pendingOutflows)],
            ],
          };
          break;
        }

        case 'overdue-payables': {
          const result = await accountsPayableService.findOverdue(0, 100);
          data = {
            headers: ['Código', 'Fornecedor', 'Vencimento', 'Valor', 'Dias Atraso'],
            rows: result.map(item => [
              item.payableCode,
              item.supplierName || '-',
              formatDate(item.dueDate),
              formatCurrency(item.remainingAmount),
              calculateDaysOverdue(item.dueDate),
            ]),
            totals: {
              'Valor Total': result.reduce((sum, item) => sum + item.remainingAmount, 0),
            },
          };
          break;
        }

        case 'overdue-receivables': {
          const result = await accountsReceivableService.findOverdue(0, 100);
          data = {
            headers: ['Código', 'Cliente', 'Vencimento', 'Valor', 'Dias Atraso'],
            rows: result.content.map(item => [
              item.receivableCode,
              item.customerName || '-',
              formatDate(item.dueDate),
              formatCurrency(item.remainingAmount),
              calculateDaysOverdue(item.dueDate),
            ]),
            totals: {
              'Valor Total': result.content.reduce((sum, item) => sum + item.remainingAmount, 0),
            },
          };
          break;
        }

        default:
          throw new Error('Tipo de relatório não suportado');
      }

      setReportData(data);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      showNotification('error', 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  }, [selectedReport, startDate, endDate]);

  const translateStatus = (status: string): string => {
    const translations: Record<string, string> = {
      PENDING: 'Pendente',
      SCHEDULED: 'Agendado',
      PARTIAL: 'Parcial',
      PAID: 'Pago',
      RECEIVED: 'Recebido',
      OVERDUE: 'Vencido',
      CANCELLED: 'Cancelado',
      FAILED: 'Falhou',
      DISPUTED: 'Disputado',
      IN_PROCESS: 'Em Processo',
      REJECTED: 'Rejeitado',
      REFUNDED: 'Reembolsado',
      ON_HOLD: 'Em Espera',
    };
    return translations[status] || status;
  };

  const calculateDaysOverdue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const report = reportTypes.find(r => r.id === selectedReport);
    const filename = `${report?.name || 'relatorio'}_${new Date().toISOString().split('T')[0]}.csv`;

    const csvContent = [
      reportData.headers.join(';'),
      ...reportData.rows.map(row => row.join(';')),
      '',
      ...(reportData.totals
        ? Object.entries(reportData.totals).map(([key, value]) => `${key};${formatCurrency(value)}`)
        : []),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);

    showNotification('success', 'Relatório exportado com sucesso');
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>📋 Relatórios Financeiros</h1>
        <p>Gere relatórios e análises do sistema financeiro</p>
      </div>

      <div className="reports-content">
        <div className="reports-sidebar">
          <h3>Tipos de Relatório</h3>
          <div className="report-types">
            {reportTypes.map((report) => (
              <div
                key={report.id}
                className={`report-type-card ${selectedReport === report.id ? 'selected' : ''}`}
                onClick={() => setSelectedReport(report.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedReport(report.id)}
              >
                <span className="report-icon">{report.icon}</span>
                <div className="report-info">
                  <h4>{report.name}</h4>
                  <p>{report.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="reports-main">
          <div className="report-filters">
            <div className="filter-group">
              <label htmlFor="startDate">Data Inicial</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label htmlFor="endDate">Data Final</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button
              className="btn-generate"
              onClick={generateReport}
              disabled={loading || !selectedReport}
            >
              {loading ? '⏳ Gerando...' : '📊 Gerar Relatório'}
            </button>
          </div>

          {reportData && (
            <div className="report-result">
              <div className="report-header">
                <h3>{reportTypes.find(r => r.id === selectedReport)?.name}</h3>
                <div className="report-actions">
                  <button className="btn-export" onClick={exportToCSV}>
                    📥 Exportar CSV
                  </button>
                  <button className="btn-print" onClick={printReport}>
                    🖨️ Imprimir
                  </button>
                </div>
              </div>

              <div className="report-table-container">
                <table className="report-table">
                  <thead>
                    <tr>
                      {reportData.headers.map((header, index) => (
                        <th key={index}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.rows.length === 0 ? (
                      <tr>
                        <td colSpan={reportData.headers.length} className="empty-row">
                          Nenhum dado encontrado para o período selecionado
                        </td>
                      </tr>
                    ) : (
                      reportData.rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex}>{cell}</td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                  {reportData.totals && (
                    <tfoot>
                      {Object.entries(reportData.totals).map(([key, value]) => (
                        <tr key={key} className="totals-row">
                          <td colSpan={reportData.headers.length - 1}>
                            <strong>{key}</strong>
                          </td>
                          <td>
                            <strong>{formatCurrency(value)}</strong>
                          </td>
                        </tr>
                      ))}
                    </tfoot>
                  )}
                </table>
              </div>

              <div className="report-footer">
                <p>
                  Período: {formatDate(startDate)} a {formatDate(endDate)}
                </p>
                <p>Gerado em: {new Date().toLocaleString('pt-BR')}</p>
              </div>
            </div>
          )}

          {!reportData && !loading && (
            <div className="report-placeholder">
              <span className="placeholder-icon">📊</span>
              <p>Selecione um tipo de relatório e clique em "Gerar Relatório"</p>
            </div>
          )}

          {loading && (
            <div className="report-loading">
              <div className="loading-spinner" />
              <p>Gerando relatório...</p>
            </div>
          )}
        </div>
      </div>

      <Notification
        type={notification.type}
        message={notification.message}
        visible={notification.visible}
        onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
};

export default ReportsPage;
