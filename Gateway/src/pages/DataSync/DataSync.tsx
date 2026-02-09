import React, { useState } from 'react';
import { dataSyncService } from '../../services/dataSyncService';
import { ExportState, ExportError, ExportErrorType } from '../../types';
import './DataSync.css';

const DataSync: React.FC = () => {
    // Definição das entidades por módulo
    const moduleEntities: Record<string, { value: string; label: string }[]> = {
        manager: [
            { value: 'users', label: 'Usuários' },
            { value: 'products', label: 'Produtos' },
            { value: 'categories', label: 'Categorias' },
            { value: 'subcategories', label: 'Subcategorias' },
            { value: 'customers', label: 'Clientes' },
            { value: 'sales', label: 'Vendas' },
            { value: 'suppliers', label: 'Fornecedores' },
            { value: 'companies', label: 'Empresas' }
        ],
        financial: [
            { value: 'companies', label: 'Empresas' },
            { value: 'customers', label: 'Clientes' },
            { value: 'accounts_payable', label: 'Contas a Pagar' },
            { value: 'accounts_receivable', label: 'Contas a Receber' },
            { value: 'bank_accounts', label: 'Contas Bancárias' },
            { value: 'invoices', label: 'Notas Fiscais' },
            { value: 'cash_flow', label: 'Fluxo de Caixa' },
            { value: 'cost_centers', label: 'Centros de Custo' }
        ],
        production: [
            { value: 'users', label: 'Usuários' },
            { value: 'production_orders', label: 'Ordens de Produção' },
            { value: 'products', label: 'Produtos' },
            { value: 'categories', label: 'Categorias' },
            { value: 'subcategories', label: 'Subcategorias' },
            { value: 'raw_materials', label: 'Matérias-Primas' },
            { value: 'production_executions', label: 'Execuções de Produção' }
        ],
        cloud: [
            { value: 'users', label: 'Usuários' },
            { value: 'products', label: 'Produtos' },
            { value: 'categories', label: 'Categorias' },
            { value: 'subcategories', label: 'Subcategorias' },
            { value: 'companies', label: 'Empresas' },
            { value: 'backups', label: 'Backups' },
            { value: 'logs', label: 'Logs' }
        ]
    };

    const [exportModule, setExportModule] = useState('manager');
    const [exportEntity, setExportEntity] = useState(moduleEntities['manager'][0].value);
    const [exportFormat, setExportFormat] = useState<'CSV' | 'EXCEL' | 'JSON'>('CSV');

    // Enhanced export state management
    const [exportState, setExportState] = useState<ExportState>({
        loading: false,
        error: null,
        success: false,
        progress: 0,
        cancellable: false,
        retryCount: 0
    });

    const [importModule, setImportModule] = useState('manager');
    const [importEntity, setImportEntity] = useState('users');
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importLoading, setImportLoading] = useState(false);
    const [importResult, setImportResult] = useState<any>(null);

    const handleExport = async () => {
        try {
            // Reset state and start loading
            setExportState(prev => ({
                loading: true,
                error: null,
                success: false,
                progress: 0,
                cancellable: true,
                retryCount: prev.retryCount || 0
            }));

            const blob = await dataSyncService.exportData({
                module: exportModule,
                entity: exportEntity,
                format: exportFormat,
            }, (progress) => {
                // Update progress
                setExportState(prev => ({ ...prev, progress }));
            });

            // Automatic file download on success
            const extension = exportFormat === 'CSV' ? 'csv' : exportFormat === 'EXCEL' ? 'xlsx' : 'json';
            dataSyncService.downloadFile(blob, `${exportEntity}_export.${extension}`);

            // Set success state
            setExportState({
                loading: false,
                error: null,
                success: true,
                progress: 100,
                cancellable: false,
                retryCount: 0
            });

            // Clear success message after 3 seconds
            setTimeout(() => {
                setExportState(prev => ({ ...prev, success: false }));
            }, 3000);

        } catch (err) {
            console.error('Export error:', err);

            // Handle cancellation
            if (err instanceof Error && err.message === 'EXPORT_CANCELLED') {
                setExportState(prev => ({
                    loading: false,
                    error: null,
                    success: false,
                    progress: 0,
                    cancellable: false,
                    retryCount: prev.retryCount || 0
                }));
                return;
            }

            // Set error state with structured error information
            setExportState(prev => ({
                loading: false,
                error: err as ExportError,
                success: false,
                progress: 0,
                cancellable: false,
                retryCount: prev.retryCount || 0
            }));
        }
    };

    const handleRetry = () => {
        // Increment retry count and attempt export again
        setExportState(prev => ({
            ...prev,
            retryCount: (prev.retryCount || 0) + 1
        }));
        handleExport();
    };

    const handleCancel = () => {
        dataSyncService.cancelExport();
        setExportState(prev => ({
            loading: false,
            error: null,
            success: false,
            progress: 0,
            cancellable: false,
            retryCount: prev.retryCount || 0
        }));
    };

    const clearError = () => {
        setExportState(prev => ({ ...prev, error: null }));
    };

    const handleImport = async () => {
        if (!importFile) {
            alert('Selecione um arquivo');
            return;
        }

        try {
            setImportLoading(true);
            const result = await dataSyncService.importData(importModule, importEntity, importFile);
            setImportResult(result);
        } catch (err) {
            console.error(err);
            alert('Erro ao importar dados');
        } finally {
            setImportLoading(false);
        }
    };

    const renderExportError = (error: ExportError) => {
        const getErrorIcon = (type: ExportErrorType) => {
            switch (type) {
                case ExportErrorType.NETWORK_ERROR:
                    return '🌐';
                case ExportErrorType.AUTHENTICATION_ERROR:
                    return '🔒';
                case ExportErrorType.TIMEOUT_ERROR:
                    return '⏱️';
                case ExportErrorType.VALIDATION_ERROR:
                    return '⚠️';
                case ExportErrorType.CONFIGURATION_ERROR:
                    return '⚙️';
                case ExportErrorType.DATA_ERROR:
                    return '📊';
                default:
                    return '❌';
            }
        };

        const getErrorCategory = (type: ExportErrorType) => {
            switch (type) {
                case ExportErrorType.NETWORK_ERROR:
                    return 'Erro de Conexão';
                case ExportErrorType.AUTHENTICATION_ERROR:
                    return 'Erro de Autenticação';
                case ExportErrorType.TIMEOUT_ERROR:
                    return 'Tempo Esgotado';
                case ExportErrorType.VALIDATION_ERROR:
                    return 'Dados Inválidos';
                case ExportErrorType.CONFIGURATION_ERROR:
                    return 'Erro de Configuração';
                case ExportErrorType.DATA_ERROR:
                    return 'Erro de Processamento';
                case ExportErrorType.SERVER_ERROR:
                    return 'Erro do Servidor';
                default:
                    return 'Erro Desconhecido';
            }
        };

        const getRetryGuidance = (type: ExportErrorType, retryCount: number) => {
            if (!error.retryable) return null;

            if (retryCount >= 3) {
                return 'Muitas tentativas falharam. Aguarde alguns minutos antes de tentar novamente.';
            }

            switch (type) {
                case ExportErrorType.NETWORK_ERROR:
                    return 'Verifique sua conexão de internet e tente novamente.';
                case ExportErrorType.TIMEOUT_ERROR:
                    return 'A operação demorou muito. Tente novamente ou reduza o volume de dados.';
                case ExportErrorType.SERVER_ERROR:
                    return 'Erro temporário do servidor. Tente novamente em alguns momentos.';
                default:
                    return 'Tente novamente.';
            }
        };

        const currentRetryCount = exportState.retryCount || 0;

        return (
            <div className={`export-error ${error.type.toLowerCase()}`}>
                <div className="error-header">
                    <span className="error-icon">{getErrorIcon(error.type)}</span>
                    <span className="error-title">{getErrorCategory(error.type)}</span>
                    <button className="error-close" onClick={clearError}>×</button>
                </div>
                <div className="error-message">{error.message}</div>
                {error.details && (
                    <div className="error-details">
                        <strong>Detalhes:</strong> {error.details}
                    </div>
                )}
                <div className="error-info">
                    <span>Código: {error.code}</span>
                    {error.timestamp && (
                        <span>Horário: {new Date(error.timestamp).toLocaleString()}</span>
                    )}
                    {currentRetryCount > 0 && (
                        <span>Tentativas: {currentRetryCount}</span>
                    )}
                </div>
                {error.retryable && (
                    <div className="error-guidance">
                        {getRetryGuidance(error.type, currentRetryCount)}
                    </div>
                )}
                {error.retryable && currentRetryCount < 3 && (
                    <div className="error-actions">
                        <button className="btn-retry" onClick={handleRetry}>
                            {currentRetryCount > 0 ? `Tentar Novamente (${currentRetryCount + 1})` : 'Tentar Novamente'}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderProgressIndicator = () => {
        if (!exportState.loading) return null;

        return (
            <div className="progress-container">
                <div className="progress-header">
                    <span className="progress-title">Exportando dados...</span>
                    {exportState.cancellable && (
                        <button className="btn-cancel" onClick={handleCancel}>
                            Cancelar
                        </button>
                    )}
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${exportState.progress || 0}%` }}
                    ></div>
                </div>
                <div className="progress-text">
                    {exportState.progress ? `${exportState.progress}%` : 'Preparando...'}
                </div>
            </div>
        );
    };

    const renderExportSuccess = () => (
        <div className="export-success">
            <div className="success-header">
                <span className="success-icon">✅</span>
                <span className="success-title">Exportação Concluída</span>
            </div>
            <div className="success-message">
                O arquivo foi baixado automaticamente para seu computador.
            </div>
        </div>
    );

    return (
        <div className="data-sync">
            <div className="page-header">
                <h1>Data Sync</h1>
                <p>Importação e exportação de dados entre módulos</p>
            </div>

            <div className="sync-sections">
                {/* Export Section */}
                <div className="sync-section">
                    <h2>Exportar Dados</h2>
                    <div className="form">
                        <div className="form-group">
                            <label>Módulo</label>
                            <select
                                value={exportModule}
                                onChange={(e) => {
                                    const newModule = e.target.value;
                                    setExportModule(newModule);
                                    setExportEntity(moduleEntities[newModule][0].value);
                                }}
                                disabled={exportState.loading}
                            >
                                <option value="manager">Manager</option>
                                <option value="financial">Financial</option>
                                <option value="production">Production</option>
                                <option value="cloud">Cloud</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Entidade</label>
                            <select
                                value={exportEntity}
                                onChange={(e) => setExportEntity(e.target.value)}
                                disabled={exportState.loading}
                            >
                                {moduleEntities[exportModule].map((entity) => (
                                    <option key={entity.value} value={entity.value}>
                                        {entity.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Formato</label>
                            <select
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value as any)}
                                disabled={exportState.loading}
                            >
                                <option value="CSV">CSV</option>
                                <option value="EXCEL">Excel</option>
                                <option value="JSON">JSON</option>
                            </select>
                        </div>

                        <button
                            onClick={handleExport}
                            disabled={exportState.loading}
                            className={`btn-primary ${exportState.loading ? 'loading' : ''}`}
                        >
                            {exportState.loading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    {exportState.progress ? `Exportando... ${exportState.progress}%` : 'Preparando...'}
                                </>
                            ) : (
                                'Exportar'
                            )}
                        </button>

                        {/* Progress Indicator */}
                        {renderProgressIndicator()}

                        {/* Export Status Messages */}
                        {exportState.error && renderExportError(exportState.error)}
                        {exportState.success && renderExportSuccess()}
                    </div>
                </div>

                {/* Import Section */}
                <div className="sync-section">
                    <h2>Importar Dados</h2>
                    <div className="form">
                        <div className="form-group">
                            <label>Módulo</label>
                            <select
                                value={importModule}
                                onChange={(e) => {
                                    const newModule = e.target.value;
                                    setImportModule(newModule);
                                    setImportEntity(moduleEntities[newModule][0].value);
                                }}
                            >
                                <option value="manager">Manager</option>
                                <option value="financial">Financial</option>
                                <option value="production">Production</option>
                                <option value="cloud">Cloud</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Entidade</label>
                            <select
                                value={importEntity}
                                onChange={(e) => setImportEntity(e.target.value)}
                            >
                                {moduleEntities[importModule].map((entity) => (
                                    <option key={entity.value} value={entity.value}>
                                        {entity.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Arquivo</label>
                            <input
                                type="file"
                                accept=".csv,.xlsx,.json"
                                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                            />
                        </div>

                        <button onClick={handleImport} disabled={importLoading || !importFile} className="btn-primary">
                            {importLoading ? 'Importando...' : 'Importar'}
                        </button>
                    </div>

                    {importResult && (
                        <div className={`result ${importResult.success ? 'success' : 'error'}`}>
                            <h3>{importResult.success ? 'Importação Concluída' : 'Erro na Importação'}</h3>
                            <p>{importResult.message}</p>
                            <div className="result-stats">
                                <div>Processados: {importResult.recordsProcessed}</div>
                                <div>Sucesso: {importResult.recordsSuccess}</div>
                                <div>Falhas: {importResult.recordsFailed}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sync Section */}
                <div className="sync-section">
                    <h2>Sincronização Direta (Broadcast)</h2>
                    <div className="form">
                        <div className="form-group">
                            <label>Módulo Origem</label>
                            <select
                                value={exportModule}
                                onChange={(e) => {
                                    const newModule = e.target.value;
                                    setExportModule(newModule);
                                    setExportEntity(moduleEntities[newModule][0].value);
                                }}
                                disabled={exportState.loading}
                            >
                                <option value="manager">Manager</option>
                                <option value="financial">Financial</option>
                                <option value="production">Production</option>
                                <option value="cloud">Cloud</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Módulos Destino</label>
                            <div className="info-text">Todos (exceto origem)</div>
                        </div>

                        <div className="form-group">
                            <label>Entidade</label>
                            <select
                                value={exportEntity}
                                onChange={(e) => setExportEntity(e.target.value)}
                                disabled={exportState.loading}
                            >
                                {moduleEntities[exportModule].map((entity) => (
                                    <option key={entity.value} value={entity.value}>
                                        {entity.label}
                                    </option>
                                ))}
                            </select>
                            {(exportEntity.toLowerCase() === 'users' || exportEntity.toLowerCase() === 'user') &&
                                <span className="error-text">Sincronização de usuários não é permitida.</span>
                            }
                        </div>

                        <button
                            onClick={async () => {
                                if (exportEntity.toLowerCase() === 'users' || exportEntity.toLowerCase() === 'user') {
                                    alert("Sincronização de usuários não permitida.");
                                    return;
                                }
                                try {
                                    setExportState(prev => ({ ...prev, loading: true }));
                                    const result = await dataSyncService.syncData({
                                        sourceModule: exportModule,
                                        targetModules: ["manager", "financial", "production", "cloud"], // Send all, backend filters source
                                        entity: exportEntity
                                    });
                                    alert(result.message);
                                } catch (e: any) {
                                    alert("Erro: " + (e.response?.data?.message || e.message));
                                } finally {
                                    setExportState(prev => ({ ...prev, loading: false }));
                                }
                            }}
                            disabled={exportState.loading}
                            className="btn-primary"
                        >
                            {exportState.loading ? 'Sincronizando...' : 'Sincronizar Agora'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataSync;
