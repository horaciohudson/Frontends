import React from 'react';
import './StatusBadge.css';

interface StatusBadgeProps {
    status: 'online' | 'offline' | 'degraded' | 'healthy' | 'down';
    text?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
    const getStatusClass = () => {
        switch (status) {
            case 'online':
            case 'healthy':
                return 'status-badge-success';
            case 'offline':
            case 'down':
                return 'status-badge-danger';
            case 'degraded':
                return 'status-badge-warning';
            default:
                return 'status-badge-default';
        }
    };

    const getStatusText = () => {
        if (text) return text;

        switch (status) {
            case 'online':
                return 'Online';
            case 'offline':
                return 'Offline';
            case 'degraded':
                return 'Degradado';
            case 'healthy':
                return 'Saudável';
            case 'down':
                return 'Inativo';
            default:
                return status;
        }
    };

    return (
        <span className={`status-badge ${getStatusClass()}`}>
            <span className="status-dot"></span>
            {getStatusText()}
        </span>
    );
};

export default StatusBadge;
