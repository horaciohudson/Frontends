import React, { useState, useEffect } from 'react';
import { productionOrderService } from '../services/productionOrderService';
import { companyService, type Company } from '../services/companyService';
import type { ProductionOrder } from '../types/productionOrder';
import { ProductionOrderStatus, PriorityLevel } from '../types/productionOrder';
import ProductionOrderForm from '../components/forms/ProductionOrderForm';
import './ProductionOrdersPage.css';

const ProductionOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<ProductionOrder[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [showForm, setShowForm] = useState(false);

    console.log('📋 [PRODUCTION ORDERS] Page rendered, selectedCompanyId:', selectedCompanyId);

    // Carregar empresas
    useEffect(() => {
        const loadCompanies = async () => {
            try {
                console.log('🏢 [PRODUCTION ORDERS] Loading companies...');
                const data = await companyService.getAllCompanies();
                setCompanies(data.content || []);

                // Recupera empresa selecionada do sessionStorage ou seleciona a primeira
                const savedCompanyId = sessionStorage.getItem('selectedCompanyId');
                if (savedCompanyId && data.content.some((c: Company) => c.id === savedCompanyId)) {
                    console.log('🏢 [PRODUCTION ORDERS] Using saved company ID:', savedCompanyId);
                    setSelectedCompanyId(savedCompanyId);
                } else if (data.content.length > 0) {
                    const firstCompanyId = data.content[0].id;
                    console.log('🏢 [PRODUCTION ORDERS] Using first company ID:', firstCompanyId);
                    setSelectedCompanyId(firstCompanyId);
                    sessionStorage.setItem('selectedCompanyId', firstCompanyId);
                } else {
                    console.log('🏢 [PRODUCTION ORDERS] No companies available');
                }
            } catch (error) {
                console.error('🏢 [PRODUCTION ORDERS] Error loading companies:', error);
                setError('Erro ao carregar empresas');
            }
        };

        loadCompanies();
    }, []);

    useEffect(() => {
        console.log('📋 [PRODUCTION ORDERS] useEffect triggered, selectedCompanyId:', selectedCompanyId, 'statusFilter:', statusFilter);
        if (selectedCompanyId) {
            loadOrders();
        } else {
            console.log('⚠️ [PRODUCTION ORDERS] No selectedCompanyId found, not loading orders');
        }
    }, [selectedCompanyId, statusFilter]);

    const loadOrders = async () => {
        try {
            console.log('📋 [PRODUCTION ORDERS] Loading orders for selectedCompanyId:', selectedCompanyId, 'statusFilter:', statusFilter);
            setLoading(true);
            setError(null);
            const data = await productionOrderService.getAllByCompany(selectedCompanyId, statusFilter);
            console.log('✅ [PRODUCTION ORDERS] Orders loaded:', data.length, 'orders');
            setOrders(data);
        } catch (err: any) {
            console.error('💥 [PRODUCTION ORDERS] Error loading orders:', err);
            setError(err.message || 'Erro ao carregar ordens de produção');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case ProductionOrderStatus.PLANNED: return 'status-planned';
            case ProductionOrderStatus.IN_PROGRESS: return 'status-in-progress';
            case ProductionOrderStatus.FINISHED: return 'status-finished';
            case ProductionOrderStatus.CANCELED: return 'status-canceled';
            default: return '';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case ProductionOrderStatus.PLANNED: return 'Planejada';
            case ProductionOrderStatus.IN_PROGRESS: return 'Em Andamento';
            case ProductionOrderStatus.FINISHED: return 'Finalizada';
            case ProductionOrderStatus.CANCELED: return 'Cancelada';
            default: return status;
        }
    };

    const getPriorityBadgeClass = (priority: string) => {
        switch (priority) {
            case PriorityLevel.LOW: return 'priority-low';
            case PriorityLevel.MEDIUM: return 'priority-medium';
            case PriorityLevel.HIGH: return 'priority-high';
            case PriorityLevel.URGENT: return 'priority-urgent';
            default: return '';
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case PriorityLevel.LOW: return 'Baixa';
            case PriorityLevel.MEDIUM: return 'Média';
            case PriorityLevel.HIGH: return 'Alta';
            case PriorityLevel.URGENT: return 'Urgente';
            default: return priority;
        }
    };

    const formatDate = (date?: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('pt-BR');
    };

    const calculateProgress = (order: ProductionOrder) => {
        if (!order.quantityPlanned || order.quantityPlanned === 0) return 0;
        return Math.round((order.quantityProduced / order.quantityPlanned) * 100);
    };

    const handleStart = async (id: string) => {
        if (confirm('Deseja iniciar esta ordem de produção?')) {
            try {
                await productionOrderService.start(id);
                loadOrders();
            } catch (err: any) {
                alert(err.message || 'Erro ao iniciar ordem');
            }
        }
    };

    const handleFinish = async (id: string) => {
        if (confirm('Deseja finalizar esta ordem de produção?')) {
            try {
                await productionOrderService.finish(id);
                loadOrders();
            } catch (err: any) {
                alert(err.message || 'Erro ao finalizar ordem');
            }
        }
    };

    const handleCancel = async (id: string) => {
        const reason = prompt('Motivo do cancelamento:');
        if (reason) {
            try {
                await productionOrderService.cancel(id, reason);
                loadOrders();
            } catch (err: any) {
                alert(err.message || 'Erro ao cancelar ordem');
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Deseja realmente excluir esta ordem?')) {
            try {
                await productionOrderService.delete(id);
                loadOrders();
            } catch (err: any) {
                alert(err.message || 'Erro ao excluir ordem');
            }
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        loadOrders();
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const companyId = e.target.value;
        console.log('🏢 [PRODUCTION ORDERS] Company selection changed to:', companyId);
        setSelectedCompanyId(companyId);
        sessionStorage.setItem('selectedCompanyId', companyId);
    };

    return (
        <div className="production-orders-page">
            <div className="page-header">
                <h1>📋 Ordens de Produção</h1>
                <button 
                    className="btn-primary" 
                    onClick={() => setShowForm(true)}
                    disabled={!selectedCompanyId}
                >
                    + Nova Ordem
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
                <ProductionOrderForm
                    companyId={selectedCompanyId}
                    onSuccess={handleFormSuccess}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {error && <div className="alert alert-error">{error}</div>}

            <div className="filters">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">Todos os Status</option>
                    <option value={ProductionOrderStatus.PLANNED}>Planejada</option>
                    <option value={ProductionOrderStatus.IN_PROGRESS}>Em Andamento</option>
                    <option value={ProductionOrderStatus.FINISHED}>Finalizada</option>
                    <option value={ProductionOrderStatus.CANCELED}>Cancelada</option>
                </select>
            </div>

            {loading ? (
                <div className="loading">Carregando...</div>
            ) : !selectedCompanyId ? (
                <div className="empty-state">
                    <p>Selecione uma empresa para visualizar as ordens de produção</p>
                </div>
            ) : (
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Produto</th>
                            <th>Status</th>
                            <th>Prioridade</th>
                            <th>Qtd. Planejada</th>
                            <th>Qtd. Produzida</th>
                            <th>Progresso</th>
                            <th>Prazo</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td><strong>{order.code}</strong></td>
                                <td>{order.productName || '-'}</td>
                                <td>
                                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </td>
                                <td>
                                    <span className={`priority-badge ${getPriorityBadgeClass(order.priority)}`}>
                                        {getPriorityLabel(order.priority)}
                                    </span>
                                </td>
                                <td>{order.quantityPlanned}</td>
                                <td>{order.quantityProduced}</td>
                                <td>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${calculateProgress(order)}%` }}></div>
                                        <span className="progress-text">{calculateProgress(order)}%</span>
                                    </div>
                                </td>
                                <td>{formatDate(order.deadline)}</td>
                                <td>
                                    <div className="action-buttons">
                                        {order.status === ProductionOrderStatus.PLANNED && (
                                            <button className="btn-sm btn-success" onClick={() => handleStart(order.id)}>Iniciar</button>
                                        )}
                                        {order.status === ProductionOrderStatus.IN_PROGRESS && (
                                            <button className="btn-sm btn-primary" onClick={() => handleFinish(order.id)}>Finalizar</button>
                                        )}
                                        {order.status !== ProductionOrderStatus.FINISHED && order.status !== ProductionOrderStatus.CANCELED && (
                                            <button className="btn-sm btn-warning" onClick={() => handleCancel(order.id)}>Cancelar</button>
                                        )}
                                        <button className="btn-sm btn-danger" onClick={() => handleDelete(order.id)}>Excluir</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {!loading && orders.length === 0 && (
                <div className="empty-state">
                    <p>Nenhuma ordem de produção encontrada</p>
                </div>
            )}
        </div>
    );
};

export default ProductionOrdersPage;
