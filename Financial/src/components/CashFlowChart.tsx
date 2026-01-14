import React, { useMemo } from 'react';
import { formatCurrency } from '../utils/formatting';
import type { CashFlowChartData } from '../types/cashFlow';
import './CashFlowChart.css';

export interface CashFlowChartProps {
  data: CashFlowChartData[];
  title?: string;
  showLegend?: boolean;
  height?: number;
  maxBars?: number;
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({
  data,
  title = 'Fluxo de Caixa',
  showLegend = true,
  height = 200,
  maxBars = 30,
}) => {
  const chartData = useMemo(() => {
    return data.slice(-maxBars);
  }, [data, maxBars]);

  const { maxValue, totals } = useMemo(() => {
    const totalInflows = chartData.reduce((sum, d) => sum + (d.inflows || 0), 0);
    const totalOutflows = chartData.reduce((sum, d) => sum + (d.outflows || 0), 0);
    const max = Math.max(
      ...chartData.map(d => Math.max(d.inflows || 0, d.outflows || 0)),
      1
    );
    return {
      maxValue: max,
      totals: {
        inflows: totalInflows,
        outflows: totalOutflows,
        balance: totalInflows - totalOutflows,
      },
    };
  }, [chartData]);

  const formatDateLabel = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length >= 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  };

  if (chartData.length === 0) {
    return (
      <div className="cashflow-chart">
        {title && <h3 className="chart-title">{title}</h3>}
        <div className="chart-empty">
          <span className="empty-icon">📊</span>
          <p>Sem dados de fluxo de caixa para o período selecionado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cashflow-chart">
      {title && <h3 className="chart-title">{title}</h3>}
      
      <div className="chart-totals">
        <div className="total-item inflow">
          <span className="total-label">Total Entradas</span>
          <span className="total-value">{formatCurrency(totals.inflows)}</span>
        </div>
        <div className="total-item outflow">
          <span className="total-label">Total Saídas</span>
          <span className="total-value">{formatCurrency(totals.outflows)}</span>
        </div>
        <div className={`total-item balance ${totals.balance >= 0 ? 'positive' : 'negative'}`}>
          <span className="total-label">Saldo</span>
          <span className="total-value">{formatCurrency(totals.balance)}</span>
        </div>
      </div>

      <div className="chart-container" style={{ height: `${height}px` }}>
        <div className="chart-y-axis">
          <span>{formatCurrency(maxValue)}</span>
          <span>{formatCurrency(maxValue / 2)}</span>
          <span>R$ 0</span>
        </div>
        
        <div className="chart-area">
          <div className="chart-grid">
            <div className="grid-line" />
            <div className="grid-line" />
            <div className="grid-line" />
          </div>
          
          <div className="chart-bars">
            {chartData.map((item, index) => {
              const inflowHeight = ((item.inflows || 0) / maxValue) * 100;
              const outflowHeight = ((item.outflows || 0) / maxValue) * 100;
              
              return (
                <div key={index} className="bar-group">
                  <div className="bars-container">
                    <div
                      className="bar inflow"
                      style={{ height: `${inflowHeight}%` }}
                      title={`Entradas: ${formatCurrency(item.inflows || 0)}`}
                    />
                    <div
                      className="bar outflow"
                      style={{ height: `${outflowHeight}%` }}
                      title={`Saídas: ${formatCurrency(item.outflows || 0)}`}
                    />
                  </div>
                  <span className="bar-label">{formatDateLabel(item.date)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showLegend && (
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color inflow" />
            <span className="legend-text">Entradas</span>
          </div>
          <div className="legend-item">
            <span className="legend-color outflow" />
            <span className="legend-text">Saídas</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlowChart;
