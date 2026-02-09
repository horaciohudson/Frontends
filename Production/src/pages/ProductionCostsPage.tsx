import React, { useState, useEffect } from 'react';
import { productionCostService } from '../services/productionCostService';
import { productionOrderService } from '../services/productionOrderService';
import { companyService, type Company } from '../services/companyService';
import type { ProductionCost, ProductionCostType } from '../types/productionCost';
import { ProductionCostTypeLabels, ProductionCostTypeColors } from '../types/productionCost';
import type { ProductionOrder } from '../types/productionOrder';
import ProductionCostForm from '../components/forms/ProductionCostForm';
import './ProductionCostsPage.css';

const ProductionCostsPage: React.FC = () => {
    const [costs, setCosts] = useState<ProductionCost[]>([]);
    const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingCost, setEditingCost] = useState<ProductionCost | undefined>();

    // Filtros
    const [selectedOrderId, setSelectedOrderId] = useState<string>('');
    const [selectedCostType, setSelectedCostType] = useState<string>('');
    const [dateFilter, setDateFilter] = useState({
        startDate: '',
        endDate: ''
    });
    const [approvalFilter, setApprovalFilter] = useState<string>(''); // 'approved', 'pending', ''

    console.log('💰 [PRODUCTION COSTS] Page rendered, selectedCompanyId:', selectedCompanyId);

    // Carregar empresas
    useEffect(() => {
        const loadCompanies = async () => {
            try {
                console.log('🏢 [PRODUCTION COSTS] Loading companies...');
                const data = await companyService.getAllCompanies();
                setCompanies(data.content || []);

                // Recupera empresa selecionada do sessionStorage ou seleciona a primeira
                const savedCompanyId = sessionStorage.getItem('selectedCompanyId');
                if (savedCompanyId && data.content.some((c: Company) => c.id === savedCompanyId)) {
                    console.log('🏢 [PRODUCTION COSTS] Using saved company ID:', savedCompanyId);
                    setSelectedCompanyId(savedCompanyId);
                } else if (data.content.length > 0) {
                    const firstCompanyId = data.content[0].id;
                    console.log('🏢 [PRODUCTION COSTS] Using first company ID:', firstCompanyId);
                    setSelectedCompanyId(firstCompanyId);
                    sessionStorage.setItem('selectedCompanyId', firstCompanyId);
                } else {
                    console.log('🏢 [PRODUCTION COSTS] No companies available');
                }
            } catch (error) {
                console.error('🏢 [PRODUCTION COSTS] Error loading companies:', error);
                setError('Erro ao carregar empresas');
            }
        };

        loadCompanies();
    }, []);

    // Carregar ordens de produção quando empresa for selecionada
    useEffect(() => {
        if (selectedCompanyId) {
            console.log('💰 [PRODUCTION COSTS] Company selected, loading data for:', selectedCompanyId);
            loadProductionOrders();
        }
    }, [selectedCompanyId]);

    // Carregar custos quando ordens de produção forem carregadas ou quando não houver ordens
    useEffect(() => {
        if (selectedCompanyId) {
            // Se já tentou carregar ordens (productionOrders foi inicializado)
            console.log('💰 [PRODUCTION COSTS] Loading costs - orders count:', productionOrders.length);
            loadCosts();
        }
    }, [productionOrders, selectedOrderId, selectedCostType, dateFilter, approvalFilter]);

    const loadProductionOrders = async () => {
        if (!selectedCompanyId) return;

        try {
            console.log('🏭 [PRODUCTION COSTS] Loading production orders for company:', selectedCompanyId);
            const data = await productionOrderService.getAllByCompany(selectedCompanyId);
            setProductionOrders(data);
            console.log('✅ [PRODUCTION COSTS] Production orders loaded:', data.length, 'orders');
        } catch (error) {
            console.error('💥 [PRODUCTION COSTS] Error loading production orders:', error);
        }
    };

    const loadCosts = async () => {
        if (!selectedCompanyId) return;

        try {
            setLoading(true);
            setError(null);
            console.log('💰 [PRODUCTION COSTS] Loading costs for company:', selectedCompanyId);

            let data: ProductionCost[] = [];

            if (selectedOrderId) {
                // Buscar custos por ordem específica
                console.log('💰 [PRODUCTION COSTS] Loading costs for order:', selectedOrderId);
                data = await productionCostService.getByProductionOrder(selectedOrderId);
            } else if (selectedCostType) {
                // Buscar custos por tipo
                console.log('💰 [PRODUCTION COSTS] Loading costs by type:', selectedCostType);
                data = await productionCostService.getByType(selectedCompanyId, selectedCostType as ProductionCostType);
            } else {
                // Buscar custos de todas as ordens da empresa
                console.log('💰 [PRODUCTION COSTS] Loading costs for all orders of company...');
                console.log('💰 [PRODUCTION COSTS] Available production orders:', productionOrders.length);
                
                if (productionOrders.length === 0) {
                    console.log('💰 [PRODUCTION COSTS] No production orders found - no costs to load');
                    data = [];
                } else {
                    const allCosts: ProductionCost[] = [];
                    
                    for (const order of productionOrders) {
                        try {
                            console.log('💰 [PRODUCTION COSTS] Loading costs for order:', order.id);
                            const orderCosts = await productionCostService.getByProductionOrder(order.id);
                            allCosts.push(...orderCosts);
                            console.log('💰 [PRODUCTION COSTS] Found', orderCosts.length, 'costs for order', order.id);
                        } catch (error) {
                            console.warn('💰 [PRODUCTION COSTS] Error loading costs for order:', order.id, error);
                        }
                    }
                    
                    data = allCosts;
                    console.log('💰 [PRODUCTION COSTS] Total costs loaded from all orders:', data.length);
                }
            }

            // Aplicar filtros locais
            let filteredData = data;

            // Filtro por data
            if (dateFilter.startDate) {
                filteredData = filteredData.filter(cost => 
                    cost.costDate && new Date(cost.costDate) >= new Date(dateFilter.startDate)
                );
            }
            if (dateFilter.endDate) {
                filteredData = filteredData.filter(cost => 
                    cost.costDate && new Date(cost.costDate) <= new Date(dateFilter.endDate)
                );
            }

            // Filtro por aprovação
            if (approvalFilter === 'approved') {
                filteredData = filteredData.filter(cost => cost.approvedAt);
            } else if (approvalFilter === 'pending') {
                filteredData = filteredData.filter(cost => !cost.approvedAt);
            }

            // Ordenar por data (mais recente primeiro)
            filteredData.sort((a, b) => {
                const dateA = new Date(a.costDate || a.createdAt || '').getTime();
                const dateB = new Date(b.costDate || b.createdAt || '').getTime();
                return dateB - dateA;
            });

            console.log('✅ [PRODUCTION COSTS] Costs loaded and filtered:', filteredData.length, 'costs');
            setCosts(filteredData);
        } catch (err: any) {
            console.error('💥 [PRODUCTION COSTS] Error loading costs:', err);
            setError(err.message || 'Erro ao carregar custos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (costId: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este custo?')) {
            return;
        }

        try {
            setLoading(true);
            await productionCostService.delete(costId);
            await loadCosts();
            console.log('✅ [PRODUCTION COSTS] Cost deleted successfully');
        } catch (error: any) {
            console.error('💥 [PRODUCTION COSTS] Error deleting cost:', error);
            setError(error.message || 'Erro ao excluir custo');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (costId: string) => {
        if (!window.confirm('Tem certeza que deseja aprovar este custo?')) {
            return;
        }

        try {
            setLoading(true);
            await productionCostService.approve(costId);
            await loadCosts();
            console.log('✅ [PRODUCTION COSTS] Cost approved successfully');
        } catch (error: any) {
            console.error('💥 [PRODUCTION COSTS] Error approving cost:', error);
            setError(error.message || 'Erro ao aprovar custo');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value?: number) => {
        if (!value) return '-';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatQuantity = (value?: number) => {
        if (!value) return '-';
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4
        }).format(value);
    };

    const formatDate = (date?: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('pt-BR');
    };

    const getCostTypeLabel = (type: ProductionCostType) => {
        return ProductionCostTypeLabels[type] || type;
    };

    const getCostTypeColor = (type: ProductionCostType) => {
        return ProductionCostTypeColors[type] || '#666';
    };

    const getProductionOrderName = (orderId: string) => {
        const order = productionOrders.find(o => o.id === orderId);
        return order ? `${order.id.substring(0, 8)} - ${order.productName}` : orderId;
    };

    const getTotalCosts = () => {
        return costs.reduce((sum, cost) => sum + (cost.totalCost || 0), 0);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingCost(undefined);
        loadCosts();
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingCost(undefined);
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const companyId = e.target.value;
        console.log('🏢 [PRODUCTION COSTS] Company selection changed to:', companyId);
        setSelectedCompanyId(companyId);
        sessionStorage.setItem('selectedCompanyId', companyId);
        setCosts([]);
        setProductionOrders([]);
        setSelectedOrderId('');
    };

    const handleEdit = (cost: ProductionCost) => {
        setEditingCost(cost);
        setShowForm(true);
    };

    const handleNewCost = () => {
        setEditingCost(undefined);
        setShowForm(true);
    };

    const clearFilters = () => {
        setSelectedOrderId('');
        setSelectedCostType('');
        setDateFilter({ startDate: '', endDate: '' });
        setApprovalFilter('');
    };

    return (
        <div className="production-costs-page">
            <div className="page-header">
                <h1>💰 Custos de Produção</h1>
                <button
                    className="btn-primary"
                    onClick={handleNewCost}
                    disabled={!selectedCompanyId}
                >
                    + Novo Custo
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
                <ProductionCostForm
                    companyId={selectedCompanyId}
                    cost={editingCost}
                    onSuccess={handleFormSuccess}
                    onCancel={handleFormCancel}
                />
            )}

            {error && <div className="alert alert-error">{error}</div>}

            {!selectedCompanyId ? (
                <div className="empty-state">
                    <p>Selecione uma empresa para visualizar os custos de produção</p>
                </div>
            ) : (
                <>
                    <div className="filters-section">
                        <h3>Filtros</h3>
                        <div className="filters-grid">
                            <div className="filter-group">
                                <label>Ordem de Produção:</label>
                                <select
                                    value={selectedOrderId}
                                    onChange={(e) => setSelectedOrderId(e.target.value)}
                                    className="form-input"
                                >
                                    <option value="">Todas</option>
                                    {productionOrders.map(order => (
                                        <option key={order.id} value={order.id}>
                                            {getProductionOrderName(order.id)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Tipo de Custo:</label>
                                <select
                                    value={selectedCostType}
                                    onChange={(e) => setSelectedCostType(e.target.value)}
                                    className="form-input"
                                >
                                    <option value="">Todos</option>
                                    <option value="MATERIAL">Material</option>
                                    <option value="SERVICE">Serviço</option>
                                    <option value="LABOR">Mão de Obra</option>
                                    <option value="INDIRECT">Custo Indireto</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Data Inicial:</label>
                                <input
                                    type="date"
                                    value={dateFilter.startDate}
                                    onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="form-input"
                                />
                            </div>

                            <div className="filter-group">
                                <label>Data Final:</label>
                                <input
                                    type="date"
                                    value={dateFilter.endDate}
                                    onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="form-input"
                                />
                            </div>

                            <div className="filter-group">
                                <label>Status de Aprovação:</label>
                                <select
                                    value={approvalFilter}
                                    onChange={(e) => setApprovalFilter(e.target.value)}
                                    className="form-input"
                                >
                                    <option value="">Todos</option>
                                    <option value="approved">Aprovados</option>
                                    <option value="pending">Pendentes</option>
                                </select>
                            </div>

                            <div className="filter-actions">
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="btn-secondary"
                                >
                                    Limpar Filtros
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading">Carregando...</div>
                    ) : (
                        <>
                            <div className="costs-summary">
                                <div className="summary-item">
                                    <span>Total de custos: <strong>{costs.length}</strong></span>
                                </div>
                                <div className="summary-item">
                                    <span>Valor total: <strong>{formatCurrency(getTotalCosts())}</strong></span>
                                </div>
                                <div className="summary-item">
                                    <span>Aprovados: <strong>{costs.filter(c => c.approvedAt).length}</strong></span>
                                </div>
                                <div className="summary-item">
                                    <span>Pendentes: <strong>{costs.filter(c => !c.approvedAt).length}</strong></span>
                                </div>
                            </div>

                            <table className="costs-table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Ordem de Produção</th>
                                        <th>Tipo</th>
                                        <th>Quantidade</th>
                                        <th>Custo Unit.</th>
                                        <th>Custo Total</th>
                                        <th>Status</th>
                                        <th>Observações</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {costs.map(cost => (
                                        <tr key={cost.id}>
                                            <td>{formatDate(cost.costDate)}</td>
                                            <td>{getProductionOrderName(cost.productionOrderId)}</td>
                                            <td>
                                                <span 
                                                    className="cost-type-badge"
                                                    style={{ backgroundColor: getCostTypeColor(cost.costType) }}
                                                >
                                                    {getCostTypeLabel(cost.costType)}
                                                </span>
                                            </td>
                                            <td className="text-right">{formatQuantity(cost.quantity)}</td>
                                            <td className="text-right">{formatCurrency(cost.unitCost)}</td>
                                            <td className="text-right">{formatCurrency(cost.totalCost)}</td>
                                            <td>
                                                {cost.approvedAt ? (
                                                    <span className="status-badge approved">
                                                        ✅ Aprovado
                                                    </span>
                                                ) : (
                                                    <span className="status-badge pending">
                                                        ⏳ Pendente
                                                    </span>
                                                )}
                                            </td>
                                            <td>{cost.notes || '-'}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        onClick={() => handleEdit(cost)}
                                                        className="btn-edit"
                                                        title="Editar"
                                                    >
                                                        ✏️
                                                    </button>
                                                    {!cost.approvedAt && (
                                                        <button
                                                            onClick={() => handleApprove(cost.id)}
                                                            className="btn-approve"
                                                            title="Aprovar"
                                                        >
                                                            ✅
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(cost.id)}
                                                        className="btn-delete"
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

                            {costs.length === 0 && (
                                <div className="empty-state">
                                    <p>Nenhum custo encontrado para os filtros selecionados</p>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductionCostsPage;