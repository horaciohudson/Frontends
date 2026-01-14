import React from 'react';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: string;
  label: string;
  color?: string;
  size?: 'small' | 'medium';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  color,
  size = 'medium'
}) => {
  return (
    <span
      className={`status-badge status-badge-${size}`}
      style={{ backgroundColor: color ? `${color}20` : undefined, color: color }}
      data-status={status}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
