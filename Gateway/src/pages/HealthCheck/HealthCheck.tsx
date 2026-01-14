import React, { useEffect, useState } from 'react';
import { healthService } from '../../services/healthService';
import { SystemHealthResponse } from '../../types';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './HealthCheck.css';

const HealthCheck: React.FC = () => {
    const [health, setHealth] = useState<SystemHealthResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const loadHealth = async () => {
        try {
            setLoading(true);
            const data = await healthService.checkAllModules();
            setHealth(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHealth();
        const interval = setInterval(loadHealth, 10000); // Atualizar a cada 10 segundos
        return () => clearInterval(interval);
    }, []);

    if (loading && !health) {
        return <LoadingSpinner />;
    }

    return (
        <div className="health-check">
            <div className="page-header">
                <div>
                    <h1>Health Check</h1>
                    <p>Monitoramento em tempo real dos módulos</p>
                </div>
                <button onClick={loadHealth} className="btn-refresh">
                    Atualizar
                </button>
            </div>

            {health && (
                <>
                    <div className="health-summary">
                        <div className="summary-item">
                            <span className="label">Status Geral:</span>
                            <StatusBadge
                                status={
                                    health.status === 'HEALTHY'
                                        ? 'healthy'
                                        : health.status === 'DEGRADED'
                                            ? 'degraded'
                                            : 'down'
                                }
                                text={health.status}
                            />
                        </div>
                        <div className="summary-item">
                            <span className="label">Última Verificação:</span>
                            <span className="value">
                                {new Date(health.timestamp).toLocaleString('pt-BR')}
                            </span>
                        </div>
                    </div>

                    <div className="health-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Módulo</th>
                                    <th>Status</th>
                                    <th>URL</th>
                                    <th>Versão</th>
                                    <th>Tempo de Resposta</th>
                                    <th>Última Verificação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {health.modules.map((module) => (
                                    <tr key={module.name}>
                                        <td className="module-name">{module.name}</td>
                                        <td>
                                            <StatusBadge status={module.online ? 'online' : 'offline'} />
                                        </td>
                                        <td className="url">{module.url}</td>
                                        <td>{module.version}</td>
                                        <td className={module.responseTimeMs > 1000 ? 'slow' : 'fast'}>
                                            {module.responseTimeMs}ms
                                        </td>
                                        <td>{new Date(module.lastCheck).toLocaleTimeString('pt-BR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default HealthCheck;
