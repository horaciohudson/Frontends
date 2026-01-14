import React from 'react';
import './SummaryCard.css';

export interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  onClick?: () => void;
  loading?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  onClick,
  loading = false,
}) => {
  const isClickable = !!onClick;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`summary-card ${variant} ${isClickable ? 'clickable' : ''}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
    >
      {icon && (
        <div className="summary-card-icon">
          {icon}
        </div>
      )}
      <div className="summary-card-content">
        <h3 className="summary-card-title">{title}</h3>
        {loading ? (
          <div className="summary-card-loading">
            <div className="loading-bar" />
          </div>
        ) : (
          <>
            <p className="summary-card-value">{value}</p>
            {subtitle && <span className="summary-card-subtitle">{subtitle}</span>}
          </>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;
