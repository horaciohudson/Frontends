import React, { useState, useEffect } from 'react';
import { productionExecutionService } from '../services/productionExecutionService';
import { productionOrderService } from '../services/productionOrderService';
import { companyService, type Company } from '../services/companyService';
import type { ProductionExecution, QualityStatus } from '../types/productionExecution';
import type { ProductionOrder } from '../types/productionOrder';
import ProductionExecutionForm from '../components/forms/ProductionExecutionForm';
import './ProductionExecutionsPage.css';

const ProductionExecutionsPage: React.FC = () => {
    const [executions, setExecutions] = useState<ProductionExecution[]>([]);
    const [orders, setOrders] = useState<ProductionOrder[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | undefined>();
    const [orderFilter, setOrderFilter] = useState<string>('');
    const [qualityFilter, setQualityFilter] = useState<string>('');

    console.log('⚙️ [PRODUCTION EXECUTIONS] Page rendered, selectedCompanyId:', selectedCompanyId);

    // Carregar empresas
    useEffect(() => {
        const loadCompanies = async () => {
            try {
                console.log('🏢 [PRODUCTION EXECUTIONS] Loading companies...');
                const data = await companyService.getAllCompanies();
                setCompanies(data.content || []);

                // Recupera empresa selecionada do sessionStorage ou seleciona a primeira
                const savedCompanyId = sessionStorage.getItem('selectedCompanyId');
                if (savedCompanyId && data.content.some((c: Company) => c.id === savedCompanyId)) {
                    console.log('🏢 [PRODUCTION EXECUTIONS] Using saved company ID:', savedCompanyId);
                    setSelectedCompanyId(savedCompanyId);
                } else if (data.content.length > 0) {
                    const firstCompanyId = data.content[0].id;
                    console.log('🏢 [PRODUCTION EXECUTIONS] Using first company ID:', firstCompanyId);
                    setSelectedCompanyId(firstCompanyId);
                    sessionStorage.setItem('selectedCompanyId', firstCompanyId);
                } else {
                    console.log('🏢 [PRODUCTION EXECUTIONS] No companies available');
                }
            } catch (error) {
                console.error('🏢 [PRODUCTION EXECUTIONS] Error loading companies:', error);
                setError('Erro ao carregar empresas');
            }
        };

        loadCompanies();
    }, []);

    useEffect(() => {
        console.log('⚙️ [PRODUCTION EXECUTIONS] Company changed, selectedCompanyId:', selectedCompanyId);
        if (selectedCompanyId) {
            loadOrders();
        }
    }, [selectedCompanyId]);

    useEffect(() => {
        if (orderFilter) {
            loadExecutionsByOrder();
        }
    }, [orderFilter]);

    const loadOrders = async () => {
        try {
            console.log('📋 [PRODUCTION EXECUTIONS] Loading orders for selectedCompanyId:', selectedCompanyId);
            const data = await productionOrderService.getAllByCompany(selectedCompanyId);
            console.log('✅ [PRODUCTION EXECUTIONS] Orders loaded:', data.length, 'orders');
            setOrders(data);
        } catch (err: any) {
            console.error('💥 [PRODUCTION EXECUTIONS] Error loading orders:', err);
        }
    };

    const loadExecutionsByOrder = async () => {
        if (!orderFilter) return;

        try {
            setLoading(true);
            setError(null);
            const data = await productionExecutionService.getByProductionOrder(orderFilter);
            setExecutions(data);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar execuções');
        } finally {
            setLoading(false);
        }
    };

    const getQualityBadgeClass = (status?: QualityStatus) => {
        switch (status) {
            case 'APPROVED': return 'quality-approved';
            case 'REJECTED': return 'quality-rejected';
            case 'REWORK': return 'quality-rework';
            default: return 'quality-pending';
        }
    };

    const getQualityLabel = (status?: QualityStatus) => {
        switch (status) {
            case 'APPROVED': return 'Aprovado';
            case 'REJECTED': return 'Rejeitado';
            case 'REWORK': return 'Retrabalho';
            default: return 'Pendente';
        }
    };

    const formatDateTime = (date?: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('pt-BR');
    };

    const calculateDuration = (start?: string, end?: string) => {
        if (!start || !end) return '-';
        const startDate = new Date(start);
        const endDate = new Date(end);
        const minutes = Math.floor((endDate.getTime() - startDate.getTime()) / 60000);

        if (minutes < 60) {
            return `${minutes} min`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}min`;
    };

    const calculateLossPercentage = (done: number, loss: number) => {
        if (done === 0) return '0%';
        return `${((loss / done) * 100).toFixed(2)}%`;
    };

    const handleEdit = (id: string) => {
        setEditingId(id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Deseja realmente excluir esta execução?')) {
            try {
                await productionExecutionService.delete(id);
                loadExecutionsByOrder();
            } catch (err: any) {
                alert(err.message || 'Erro ao excluir execução');
            }
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingId(undefined);
        loadExecutionsByOrder();
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingId(undefined);
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const companyId = e.target.value;
        console.log('🏢 [PRODUCTION EXECUTIONS] Company selection changed to:', companyId);
        setSelectedCompanyId(companyId);
        sessionStorage.setItem('selectedCompanyId', companyId);
        // Reset filters when company changes
        setOrderFilter('');
        setQualityFilter('');
        setExecutions([]);
    };

    const filteredExecutions = executions.filter(execution => {
        if (qualityFilter && execution.qualityStatus !== qualityFilter) {
            return false;
        }
        return true;
    });

    return (
        <div className="production-executions-page">
            <div className="page-header">
                <h1>⚙️ Execução de Produção</h1>
                <button
                    className="btn-primary"
                    onClick={() => setShowForm(true)}
                    disabled={!orderFilter}
                >
                    + Nova Execução
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
                <ProductionExecutionForm
                    companyId={selectedCompanyId}
                    executionId={editingId}
                    onSuccess={handleFormSuccess}
                    onCancel={handleFormCancel}
                />
            )}

            {error && <div className="alert alert-error">{error}</div>}

            {!selectedCompanyId ? (
                <div className="empty-state">
                    <p>Selecione uma empresa para visualizar as execuções de produção</p>
                </div>
            ) : (
                <>
                    <div className="filters">
                        <div className="filter-group">
                            <label>Ordem de Produção:</label>
                            <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)}>
                                <option value="">Selecione uma ordem...</option>
                                {orders.map(order => (
                                    <option key={order.id} value={order.id}>
                                        {order.code} - {order.productName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {orderFilter && (
                            <div className="filter-group">
                                <label>Status de Qualidade:</label>
                                <select value={qualityFilter} onChange={(e) => setQualityFilter(e.target.value)}>
                                    <option value="">Todos</option>
                                    <option value="APPROVED">Aprovado</option>
                                    <option value="REJECTED">Rejeitado</option>
                                    <option value="REWORK">Retrabalho</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {!orderFilter ? (
                        <div className="empty-state">
                            <p>Selecione uma ordem de produção para visualizar as execuções</p>
                        </div>
                    ) : loading ? (
                        <div className="loading">Carregando...</div>
                    ) : (
                        <>
                            <table className="executions-table">
                                <thead>
                                    <tr>
                                        <th>Início</th>
                                        <th>Término</th>
                                        <th>Duração</th>
                                        <th>Qtd. Realizada</th>
                                        <th>Qtd. Perda</th>
                                        <th>% Perda</th>
                                        <th>Status Qualidade</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExecutions.map(execution => (
                                        <tr key={execution.id}>
                                            <td>{formatDateTime(execution.startTime)}</td>
                                            <td>{formatDateTime(execution.endTime)}</td>
                                            <td>{calculateDuration(execution.startTime, execution.endTime)}</td>
                                            <td className="text-right">{execution.quantityDone.toFixed(2)}</td>
                                            <td className="text-right">{execution.lossQuantity.toFixed(2)}</td>
                                            <td className="text-right">
                                                {calculateLossPercentage(execution.quantityDone, execution.lossQuantity)}
                                            </td>
                                            <td>
                                                <span className={`quality-badge ${getQualityBadgeClass(execution.qualityStatus)}`}>
                                                    {getQualityLabel(execution.qualityStatus)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-sm btn-edit"
                                                        onClick={() => handleEdit(execution.id)}
                                                        title="Editar"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="btn-sm btn-delete"
                                                        onClick={() => handleDelete(execution.id)}
                                                        title="Excluir"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredExecutions.length === 0 && (
                                <div className="empty-state">
                                    <p>Nenhuma execução encontrada para esta ordem</p>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductionExecutionsPage;
