import React, { useState } from 'react';
import { dataSyncService } from '../../services/dataSyncService';
import './DataSync.css';

const DataSync: React.FC = () => {
    const [exportModule, setExportModule] = useState('manager');
    const [exportEntity, setExportEntity] = useState('users');
    const [exportFormat, setExportFormat] = useState<'CSV' | 'EXCEL' | 'JSON'>('CSV');
    const [exportLoading, setExportLoading] = useState(false);

    const [importModule, setImportModule] = useState('manager');
    const [importEntity, setImportEntity] = useState('users');
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importLoading, setImportLoading] = useState(false);
    const [importResult, setImportResult] = useState<any>(null);

    const handleExport = async () => {
        try {
            setExportLoading(true);
            const blob = await dataSyncService.exportData({
                module: exportModule,
                entity: exportEntity,
                format: exportFormat,
            });

            const extension = exportFormat === 'CSV' ? 'csv' : exportFormat === 'EXCEL' ? 'xlsx' : 'json';
            dataSyncService.downloadFile(blob, `${exportEntity}_export.${extension}`);
        } catch (err) {
            console.error(err);
            alert('Erro ao exportar dados');
        } finally {
            setExportLoading(false);
        }
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
                            <select value={exportModule} onChange={(e) => setExportModule(e.target.value)}>
                                <option value="manager">Manager</option>
                                <option value="financial">Financial</option>
                                <option value="production">Production</option>
                                <option value="cloud">Cloud</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Entidade</label>
                            <input
                                type="text"
                                value={exportEntity}
                                onChange={(e) => setExportEntity(e.target.value)}
                                placeholder="Ex: users, products, etc"
                            />
                        </div>

                        <div className="form-group">
                            <label>Formato</label>
                            <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value as any)}>
                                <option value="CSV">CSV</option>
                                <option value="EXCEL">Excel</option>
                                <option value="JSON">JSON</option>
                            </select>
                        </div>

                        <button onClick={handleExport} disabled={exportLoading} className="btn-primary">
                            {exportLoading ? 'Exportando...' : 'Exportar'}
                        </button>
                    </div>
                </div>

                {/* Import Section */}
                <div className="sync-section">
                    <h2>Importar Dados</h2>
                    <div className="form">
                        <div className="form-group">
                            <label>Módulo</label>
                            <select value={importModule} onChange={(e) => setImportModule(e.target.value)}>
                                <option value="manager">Manager</option>
                                <option value="financial">Financial</option>
                                <option value="production">Production</option>
                                <option value="cloud">Cloud</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Entidade</label>
                            <input
                                type="text"
                                value={importEntity}
                                onChange={(e) => setImportEntity(e.target.value)}
                                placeholder="Ex: users, products, etc"
                            />
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
            </div>
        </div>
    );
};

export default DataSync;
