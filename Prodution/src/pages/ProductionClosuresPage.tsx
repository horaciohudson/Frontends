import React, { useState, useEffect } from 'react';
import { productionClosureService } from '../services/productionClosureService';
import { companyService, type Company } from '../services/companyService';
import type { ProductionClosure } from '../types/productionClosure';
import ProductionClosureForm from '../components/forms/ProductionClosureForm';
import './ProductionClosuresPage.css';

const ProductionClosuresPage: React.FC = () => {
    const [closures, setClosures] = useState<ProductionClosure[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | undefined>();
    const [exportFilter, setExportFilter] = useState<string>('all');

    console.log('🔒 [PRODUCTION CLOSURES] Page rendered, selectedCompanyId:', selectedCompanyId);

    // Carregar empresas
    useEffect(() => {
        const loadCompanies = async () => {
            try {
                console.log('🏢 [PRODUCTION CLOSURES] Loading companies...');
                const data = await companyService.getAllCompanies();
                setCompanies(data.content || []);

                // Recupera empresa selecionada do sessionStorage ou seleciona a primeira
                const savedCompanyId = sessionStorage.getItem('selectedCompanyId');
                if (savedCompanyId && data.content.some((c: Company) => c.id === savedCompanyId)) {
                    console.log('🏢 [PRODUCTION CLOSURES] Using saved company ID:', savedCompanyId);
                    setSelectedCompanyId(savedCompanyId);
                } else if (data.content.length > 0) {
                    const firstCompanyId = data.content[0].id;
                    console.log('🏢 [PRODUCTION CLOSURES] Using first company ID:', firstCompanyId);
                    setSelectedCompanyId(firstCompanyId);
                    sessionStorage.setItem('selectedCompanyId', firstCompanyId);
                } else {
                    console.log('🏢 [PRODUCTION CLOSURES] No companies available');
                }
            } catch (error) {
                console.error('🏢 [PRODUCTION CLOSURES] Error loading companies:', error);
                setError('Erro ao carregar empresas');
            }
        };

        loadCompanies();
    }, []);

    useEffect(() => {
        console.log('🔒 [PRODUCTION CLOSURES] Company changed, selectedCompanyId:', selectedCompanyId);
        if (selectedCompanyId) {
            loadClosures();
        }
    }, [selectedCompanyId, exportFilter]);

    const loadClosures = async () => {
        if (!selectedCompanyId) return;

        try {
            setLoading(true);
            setError(null);
            console.log('🔒 [PRODUCTION CLOSURES] Loading closures for company:', selectedCompanyId);

            let data: ProductionClosure[];
            if (exportFilter === 'all') {
                data = await productionClosureService.getByCompany(selectedCompanyId);
            } else {
                const exported = exportFilter === 'exported';
                data = await productionClosureService.getByExportStatus(selectedCompanyId, exported);
            }

            console.log('✅ [PRODUCTION CLOSURES] Closures loaded:', data.length, 'closures');
            setClosures(data);
        } catch (err: any) {
            console.error('💥 [PRODUCTION CLOSURES] Error loading closures:', err);
            setError(err.message || 'Erro ao carregar fechamentos');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatDate = (date?: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('pt-BR');
    };

    const handleExportToFinancial = async (closure: ProductionClosure) => {
        const financialDocumentId = prompt('Digite o ID do documento financeiro:');
        if (!financialDocumentId) return;

        try {
            await productionClosureService.exportToFinancial(closure.id, financialDocumentId);
            loadClosures();
            alert('Fechamento exportado para o financeiro com sucesso!');
        } catch (err: any) {
            alert(err.message || 'Erro ao exportar fechamento');
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingId(undefined);
        loadClosures();
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingId(undefined);
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const companyId = e.target.value;
        console.log('🏢 [PRODUCTION CLOSURES] Company selection changed to:', companyId);
        setSelectedCompanyId(companyId);
        sessionStorage.setItem('selectedCompanyId', companyId);
        setClosures([]);
    };

    return (
        <div className="production-closures-page">
            <div className="page-header">
                <h1>🔒 Fechamento de Produção</h1>
                <button
                    className="btn-primary"
                    onClick={() => setShowForm(true)}
                    disabled={!selectedCompanyId}
                >
                    + Novo Fechamento
                </button>
            </div>

            <div className="page-filters">
                <div className="form-group">
                    <label htmlFor="company-select">Empresa:</label>
                    <select
                        id="company-select"
                        value={selectedCompanyId}
                        onChange={handleCompanyChange}
                        className="form-input"
                    >
                        <option value="">Selecione uma empresa</option>
                        {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                                {company.corporateName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {showForm && (
                <ProductionClosureForm
                    companyId={selectedCompanyId}
                    closureId={editingId}
                    onSuccess={handleFormSuccess}
                    onCancel={handleFormCancel}
                />
            )}

            {error && <div className="alert alert-error">{error}</div>}

            {!selectedCompanyId ? (
                <div className="empty-state">
                    <p>Selecione uma empresa para visualizar os fechamentos de produção</p>
                </div>
            ) : (
                <>
                    <div className="filters">
                        <div className="filter-group">
                            <label>Status de Exportação:</label>
                            <select value={exportFilter} onChange={(e) => setExportFilter(e.target.value)}>
                                <option value="all">Todos</option>
                                <option value="exported">Exportados</option>
                                <option value="not_exported">Não Exportados</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading">Carregando...</div>
                    ) : (
                        <>
                            <table className="closures-table">
                                <thead>
                                    <tr>
                                        <th>Ordem de Produção</th>
                                        <th>Data Fechamento</th>
                                        <th>Custo Total</th>
                                        <th>Material</th>
                                        <th>Serviço</th>
                                        <th>Mão de Obra</th>
                                        <th>Indiretos</th>
                                        <th>Status Exportação</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {closures.map(closure => (
                                        <tr key={closure.id}>
                                            <td>{closure.productionOrderId}</td>
                                            <td>{formatDate(closure.closureDate)}</td>
                                            <td className="text-right">{formatCurrency(closure.totalCost)}</td>
                                            <td className="text-right">{formatCurrency(closure.totalMaterial)}</td>
                                            <td className="text-right">{formatCurrency(closure.totalService)}</td>
                                            <td className="text-right">{formatCurrency(closure.totalLabor)}</td>
                                            <td className="text-right">{formatCurrency(closure.totalIndirect)}</td>
                                            <td>
                                                <span className={`export-badge ${closure.exportedToFinancial ? 'exported' : 'not-exported'}`}>
                                                    {closure.exportedToFinancial ? 'Exportado' : 'Não Exportado'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    {!closure.exportedToFinancial && (
                                                        <button
                                                            className="btn-sm btn-export"
                                                            onClick={() => handleExportToFinancial(closure)}
                                                            title="Exportar para Financeiro"
                                                        >
                                                            📤
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn-sm btn-view"
                                                        onClick={() => alert('Visualização não implementada')}
                                                        title="Visualizar"
                                                    >
                                                        👁️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {closures.length === 0 && (
                                <div className="empty-state">
                                    <p>Nenhum fechamento encontrado para esta empresa</p>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductionClosuresPage;