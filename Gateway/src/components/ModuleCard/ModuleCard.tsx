import React from 'react';
import { ModuleStatus } from '../../types';
import StatusBadge from '../StatusBadge/StatusBadge';
import './ModuleCard.css';

interface ModuleCardProps {
    module: ModuleStatus;
    onStart?: () => void;
    onStop?: () => void;
    onRestart?: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
    module,
    onStart,
    onStop,
    onRestart,
}) => {
    return (
        <div className="module-card">
            <div className="module-card-header">
                <h3>{module.name}</h3>
                <StatusBadge status={module.online ? 'online' : 'offline'} />
            </div>

            <div className="module-card-body">
                <div className="module-info">
                    <div className="module-info-item">
                        <span className="label">URL:</span>
                        <span className="value">{module.url}</span>
                    </div>
                    <div className="module-info-item">
                        <span className="label">Versão:</span>
                        <span className="value">{module.version}</span>
                    </div>
                    <div className="module-info-item">
                        <span className="label">Tempo de Resposta:</span>
                        <span className="value">{module.responseTimeMs}ms</span>
                    </div>
                    <div className="module-info-item">
                        <span className="label">Última Verificação:</span>
                        <span className="value">
                            {new Date(module.lastCheck).toLocaleString('pt-BR')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="module-card-footer">
                {onStart && (
                    <button
                        className="btn btn-success"
                        onClick={onStart}
                        disabled={module.online}
                    >
                        Iniciar
                    </button>
                )}
                {onStop && (
                    <button
                        className="btn btn-danger"
                        onClick={onStop}
                        disabled={!module.online}
                    >
                        Parar
                    </button>
                )}
                {onRestart && (
                    <button
                        className="btn btn-warning"
                        onClick={onRestart}
                        disabled={!module.online}
                    >
                        Reiniciar
                    </button>
                )}
            </div>
        </div>
    );
};

export default ModuleCard;
