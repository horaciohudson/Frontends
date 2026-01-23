import React from 'react';
import { Chip } from '@mui/material';
import { NFeStatus } from '../../types';

interface StatusBadgeProps {
    status: NFeStatus;
}

const statusConfig: Record<NFeStatus, { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' }> = {
    CREATED: { label: 'Criada', color: 'default' },
    SIGNED: { label: 'Assinada', color: 'info' },
    SENT: { label: 'Enviada', color: 'info' },
    AUTHORIZED: { label: 'Autorizada', color: 'success' },
    REJECTED: { label: 'Rejeitada', color: 'error' },
    CANCELLED: { label: 'Cancelada', color: 'warning' },
    ERROR: { label: 'Erro', color: 'error' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const config = statusConfig[status] || { label: status || 'Desconhecido', color: 'default' as const };

    return (
        <Chip
            label={config.label}
            color={config.color}
            size="small"
        />
    );
};
