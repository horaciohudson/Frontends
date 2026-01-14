import React from 'react';
import type { CashFlowSummary } from '../types/cashFlow';
import { formatCurrency } from '../utils/formatting';
import './CashFlowSummary.css';

interface CashFlowSummaryProps {
  summary: CashFlowSummary;
}

const CashFlowSummaryCard: React.FC<CashFlowSummaryProps> = ({ summary }) => {
  return (
    <div className="cash-flow-summary">
      <div className="summary-card inflow">
        <div className="card-icon">📈</div>
        <div className="card-content">
          <span className="card-label">Entradas</span>
          <span className="card-value">{formatCurrency(summary.totalInflows)}</span>
          {summary.pendingInflows > 0 && (
            <span className="card-pending">
              {formatCurrency(summary.pendingInflows)} pendente
            </span>
          )}
        </div>
      </div>

      <div className="summary-card outflow">
        <div className="card-icon">📉</div>
        <div className="card-content">
          <span className="card-label">Saídas</span>
          <span className="card-value">{formatCurrency(summary.totalOutflows)}</span>
          {summary.pendingOutflows > 0 && (
            <span className="card-pending">
              {formatCurrency(summary.pendingOutflows)} pendente
            </span>
          )}
        </div>
      </div>

      <div className={`summary-card balance ${summary.balance >= 0 ? 'positive' : 'negative'}`}>
        <div className="card-icon">{summary.balance >= 0 ? '💰' : '⚠️'}</div>
        <div className="card-content">
          <span className="card-label">Saldo</span>
          <span className="card-value">{formatCurrency(summary.balance)}</span>
        </div>
      </div>
    </div>
  );
};

export default CashFlowSummaryCard;
