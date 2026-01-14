import React, { useEffect, useState } from 'react';
import { healthService } from '../../services/healthService';
import { launcherService } from '../../services/launcherService';
import { SystemHealthResponse } from '../../types';
import ModuleCard from '../../components/ModuleCard/ModuleCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './SystemLauncher.css';

const SystemLauncher: React.FC = () => {
    const [health, setHealth] = useState<SystemHealthResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    }, []);

    const handleStart = async (moduleName: string) => {
        try {
            setActionLoading(moduleName);
            const response = await launcherService.startModule(moduleName);
            setMessage({
                type: response.success ? 'success' : 'error',
                text: response.message,
            });
            setTimeout(() => loadHealth(), 2000);
        } catch (err) {
            setMessage({
                type: 'error',
                text: 'Erro ao iniciar módulo',
            });
        } finally {
            setActionLoading(null);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    const handleStop = async (moduleName: string) => {
        try {
            setActionLoading(moduleName);
            const response = await launcherService.stopModule(moduleName);
            setMessage({
                type: response.success ? 'success' : 'error',
                text: response.message,
            });
            setTimeout(() => loadHealth(), 2000);
        } catch (err) {
            setMessage({
                type: 'error',
                text: 'Erro ao parar módulo',
            });
        } finally {
            setActionLoading(null);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    const handleRestart = async (moduleName: string) => {
        try {
            setActionLoading(moduleName);
            const response = await launcherService.restartModule(moduleName);
            setMessage({
                type: response.success ? 'success' : 'error',
                text: response.message,
            });
            setTimeout(() => loadHealth(), 2000);
        } catch (err) {
            setMessage({
                type: 'error',
                text: 'Erro ao reiniciar módulo',
            });
        } finally {
            setActionLoading(null);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="system-launcher">
            <div className="page-header">
                <h1>System Launcher</h1>
                <p>Gerenciar módulos do sistema</p>
            </div>

            {message && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="modules-grid">
                {health?.modules.map((module) => (
                    <ModuleCard
                        key={module.name}
                        module={module}
                        onStart={() => handleStart(module.name)}
                        onStop={() => handleStop(module.name)}
                        onRestart={() => handleRestart(module.name)}
                    />
                ))}
            </div>

            {actionLoading && (
                <div className="action-overlay">
                    <LoadingSpinner />
                    <p>Processando ação em {actionLoading}...</p>
                </div>
            )}
        </div>
    );
};

export default SystemLauncher;
