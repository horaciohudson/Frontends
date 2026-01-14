import React, { useEffect, useState } from 'react';
import { healthService } from '../../services/healthService';
import { SystemHealthResponse } from '../../types';
import ModuleCard from '../../components/ModuleCard/ModuleCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const [health, setHealth] = useState<SystemHealthResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadHealth = async () => {
        try {
            setLoading(true);
            const data = await healthService.checkAllModules();
            setHealth(data);
            setError('');
        } catch (err) {
            setError('Erro ao carregar status dos módulos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHealth();
        // Atualizar a cada 30 segundos
        const interval = setInterval(loadHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !health) {
        return <LoadingSpinner />;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Visão geral dos módulos Sigeve</p>
                </div>
                <button onClick={loadHealth} className="btn-refresh">
                    Atualizar
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {health && (
                <>
                    <div className="dashboard-stats">
                        <div className="stat-card">
                            <h3>Status Geral</h3>
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
                        <div className="stat-card">
                            <h3>Total de Módulos</h3>
                            <p className="stat-value">{health.totalModules}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Módulos Online</h3>
                            <p className="stat-value success">{health.onlineModules}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Módulos Offline</h3>
                            <p className="stat-value danger">
                                {health.totalModules - health.onlineModules}
                            </p>
                        </div>
                    </div>

                    <div className="modules-grid">
                        {health.modules.map((module) => (
                            <ModuleCard key={module.name} module={module} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
