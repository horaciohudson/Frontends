import React, { useState, useEffect } from 'react';
import { rawMaterialStockService } from '../services/rawMaterialStockService';
import { rawMaterialMovementService } from '../services/rawMaterialMovementService';
import { companyService, type Company } from '../services/companyService';
import type { RawMaterialStock, RawMaterialMovement } from '../types/rawMaterialStock';
import RawMaterialMovementForm from '../components/forms/RawMaterialMovementForm';
import './RawMaterialStockPage.css';

const RawMaterialStockPage: React.FC = () => {
    const [stocks, setStocks] = useState<RawMaterialStock[]>([]);
    const [movements, setMovements] = useState<RawMaterialMovement[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'stock' | 'movements'>('stock');
    const [lowStockFilter, setLowStockFilter] = useState<boolean>(false);
    const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);

    console.log('📦 [RAW MATERIAL STOCK] Page rendered, selectedCompanyId:', selectedCompanyId);

    // Carregar empresas
    useEffect(() => {
        const loadCompanies = async () => {
            try {
                console.log('🏢 [RAW MATERIAL STOCK] Loading companies...');
                const data = await companyService.getAllCompanies();
                setCompanies(data.content || []);

                // Recupera empresa selecionada do sessionStorage ou seleciona a primeira
                const savedCompanyId = sessionStorage.getItem('selectedCompanyId');
                if (savedCompanyId && data.content.some((c: Company) => c.id === savedCompanyId)) {
                    console.log('🏢 [RAW MATERIAL STOCK] Using saved company ID:', savedCompanyId);
                    setSelectedCompanyId(savedCompanyId);
                } else if (data.content.length > 0) {
                    const firstCompanyId = data.content[0].id;
                    console.log('🏢 [RAW MATERIAL STOCK] Using first company ID:', firstCompanyId);
                    setSelectedCompanyId(firstCompanyId);
                    sessionStorage.setItem('selectedCompanyId', firstCompanyId);
                } else {
                    console.log('🏢 [RAW MATERIAL STOCK] No companies available');
                }
            } catch (error) {
                console.error('🏢 [RAW MATERIAL STOCK] Error loading companies:', error);
                setError('Erro ao carregar empresas');
            }
        };

        loadCompanies();
    }, []);

    useEffect(() => {
        console.log('📦 [RAW MATERIAL STOCK] Company changed, selectedCompanyId:', selectedCompanyId);
        if (selectedCompanyId) {
            if (activeTab === 'stock') {
                loadStocks();
            } else {
                loadMovements();
            }
        }
    }, [selectedCompanyId, activeTab, lowStockFilter, lowStockThreshold]);

    const loadStocks = async () => {
        if (!selectedCompanyId) return;

        try {
            setLoading(true);
            setError(null);
            console.log('📦 [RAW MATERIAL STOCK] Loading stocks for company:', selectedCompanyId);

            let data: RawMaterialStock[];
            if (lowStockFilter) {
                data = await rawMaterialStockService.getLowStock(selectedCompanyId, lowStockThreshold);
            } else {
                data = await rawMaterialStockService.getByCompany(selectedCompanyId);
            }

            console.log('✅ [RAW MATERIAL STOCK] Stocks loaded:', data.length, 'stocks');
            setStocks(data);
        } catch (err: any) {
            console.error('💥 [RAW MATERIAL STOCK] Error loading stocks:', err);
            setError(err.message || 'Erro ao carregar estoques');
        } finally {
            setLoading(false);
        }
    };

    const loadMovements = async () => {
        if (!selectedCompanyId) return;

        try {
            setLoading(true);
            setError(null);
            console.log('📦 [RAW MATERIAL STOCK] Loading movements for company:', selectedCompanyId);

            const data = await rawMaterialMovementService.getByCompany(selectedCompanyId);
            console.log('✅ [RAW MATERIAL STOCK] Movements loaded:', data.length, 'movements');
            setMovements(data);
        } catch (err: any) {
            console.error('💥 [RAW MATERIAL STOCK] Error loading movements:', err);
            setError(err.message || 'Erro ao carregar movimentações');
        } finally {
            setLoading(false);
        }
    };

    const formatQuantity = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4
        }).format(value);
    };

    const formatCurrency = (value?: number) => {
        if (!value) return '-';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatDate = (date?: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('pt-BR');
    };

    const formatDateTime = (date?: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('pt-BR');
    };

    const getMovementTypeLabel = (type: string) => {
        return type === 'IN' ? 'Entrada' : 'Saída';
    };

    const getMovementOriginLabel = (origin: string) => {
        const labels: Record<string, string> = {
            'PURCHASE': 'Compra',
            'PRODUCTION': 'Produção',
            'ADJUSTMENT': 'Ajuste',
            'RETURN': 'Devolução',
            'TRANSFER': 'Transferência'
        };
        return labels[origin] || origin;
    };

    const getStockStatusClass = (stock: RawMaterialStock) => {
        if (stock.availableQuantity <= 0) return 'stock-empty';
        if (stock.availableQuantity <= lowStockThreshold) return 'stock-low';
        return 'stock-normal';
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        if (activeTab === 'stock') {
            loadStocks();
        } else {
            loadMovements();
        }
    };

    const handleFormCancel = () => {
        setShowForm(false);
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const companyId = e.target.value;
        console.log('🏢 [RAW MATERIAL STOCK] Company selection changed to:', companyId);
        setSelectedCompanyId(companyId);
        sessionStorage.setItem('selectedCompanyId', companyId);
        setStocks([]);
        setMovements([]);
    };

    const handleTabChange = (tab: 'stock' | 'movements') => {
        setActiveTab(tab);
        setError(null);
    };

    return (
        <div className="raw-material-stock-page">
            <div className="page-header">
                <h1>📦 Estoque de Matéria Prima</h1>
                <button
                    className="btn-primary"
                    onClick={() => setShowForm(true)}
                    disabled={!selectedCompanyId}
                >
                    + Nova Movimentação
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
                <RawMaterialMovementForm
                    companyId={selectedCompanyId}
                    onSuccess={handleFormSuccess}
                    onCancel={handleFormCancel}
                />
            )}

            {error && <div className="alert alert-error">{error}</div>}

            {!selectedCompanyId ? (
                <div className="empty-state">
                    <p>Selecione uma empresa para visualizar o estoque de matéria prima</p>
                </div>
            ) : (
                <>
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'stock' ? 'active' : ''}`}
                            onClick={() => handleTabChange('stock')}
                        >
                            Estoque Atual
                        </button>
                        <button
                            className={`tab ${activeTab === 'movements' ? 'active' : ''}`}
                            onClick={() => handleTabChange('movements')}
                        >
                            Movimentações
                        </button>
                    </div>

                    {activeTab === 'stock' && (
                        <>
                            <div className="filters">
                                <div className="filter-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={lowStockFilter}
                                            onChange={(e) => setLowStockFilter(e.target.checked)}
                                        />
                                        Apenas estoque baixo
                                    </label>
                                </div>
                                {lowStockFilter && (
                                    <div className="filter-group">
                                        <label>Limite:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={lowStockThreshold}
                                            onChange={(e) => setLowStockThreshold(parseFloat(e.target.value) || 0)}
                                            style={{ width: '100px' }}
                                        />
                                    </div>
                                )}
                            </div>

                            {loading ? (
                                <div className="loading">Carregando...</div>
                            ) : (
                                <>
                                    <table className="stocks-table">
                                        <thead>
                                            <tr>
                                                <th>Matéria Prima</th>
                                                <th>Quantidade Total</th>
                                                <th>Quantidade Reservada</th>
                                                <th>Quantidade Disponível</th>
                                                <th>Status</th>
                                                <th>Última Movimentação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stocks.map(stock => (
                                                <tr key={stock.id}>
                                                    <td>{stock.rawMaterialId}</td>
                                                    <td className="text-right">{formatQuantity(stock.quantity)}</td>
                                                    <td className="text-right">{formatQuantity(stock.reservedQuantity)}</td>
                                                    <td className="text-right">{formatQuantity(stock.availableQuantity)}</td>
                                                    <td>
                                                        <span className={`stock-badge ${getStockStatusClass(stock)}`}>
                                                            {stock.availableQuantity <= 0 ? 'Sem Estoque' :
                                                             stock.availableQuantity <= lowStockThreshold ? 'Estoque Baixo' : 'Normal'}
                                                        </span>
                                                    </td>
                                                    <td>{formatDateTime(stock.lastMovementDate)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {stocks.length === 0 && (
                                        <div className="empty-state">
                                            <p>Nenhum estoque encontrado para esta empresa</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {activeTab === 'movements' && (
                        <>
                            {loading ? (
                                <div className="loading">Carregando...</div>
                            ) : (
                                <>
                                    <table className="movements-table">
                                        <thead>
                                            <tr>
                                                <th>Data</th>
                                                <th>Matéria Prima</th>
                                                <th>Tipo</th>
                                                <th>Origem</th>
                                                <th>Documento</th>
                                                <th>Quantidade</th>
                                                <th>Custo Unit.</th>
                                                <th>Custo Total</th>
                                                <th>Observações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {movements.map(movement => (
                                                <tr key={movement.id}>
                                                    <td>{formatDate(movement.movementDate)}</td>
                                                    <td>{movement.rawMaterialId}</td>
                                                    <td>
                                                        <span className={`movement-badge ${movement.movementType.toLowerCase()}`}>
                                                            {getMovementTypeLabel(movement.movementType)}
                                                        </span>
                                                    </td>
                                                    <td>{getMovementOriginLabel(movement.movementOrigin)}</td>
                                                    <td>{movement.documentNumber || '-'}</td>
                                                    <td className="text-right">{formatQuantity(movement.quantity)}</td>
                                                    <td className="text-right">{formatCurrency(movement.unitCost)}</td>
                                                    <td className="text-right">{formatCurrency(movement.totalCost)}</td>
                                                    <td>{movement.notes || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {movements.length === 0 && (
                                        <div className="empty-state">
                                            <p>Nenhuma movimentação encontrada para esta empresa</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default RawMaterialStockPage;