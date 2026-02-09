import React, { useState, useEffect } from 'react';
import { rawMaterialMovementService } from '../services/rawMaterialMovementService';
import { rawMaterialService } from '../services/rawMaterialService';
import { companyService, type Company } from '../services/companyService';
import type { RawMaterialMovement } from '../types/rawMaterialStock';
import type { RawMaterialDTO } from '../types/rawMaterial';
import RawMaterialMovementForm from '../components/forms/RawMaterialMovementForm';
import './RawMaterialMovementsPage.css';

const RawMaterialMovementsPage: React.FC = () => {
    const [movements, setMovements] = useState<RawMaterialMovement[]>([]);
    const [rawMaterials, setRawMaterials] = useState<RawMaterialDTO[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [selectedRawMaterialId, setSelectedRawMaterialId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingMovement, setEditingMovement] = useState<RawMaterialMovement | undefined>();

    // Filtros
    const [dateFilter, setDateFilter] = useState({
        startDate: '',
        endDate: ''
    });
    const [movementTypeFilter, setMovementTypeFilter] = useState<string>('');
    const [movementOriginFilter, setMovementOriginFilter] = useState<string>('');

    console.log('📋 [RAW MATERIAL MOVEMENTS] Page rendered, selectedCompanyId:', selectedCompanyId);

    // Carregar empresas
    useEffect(() => {
        const loadCompanies = async () => {
            try {
                console.log('🏢 [RAW MATERIAL MOVEMENTS] Loading companies...');
                const data = await companyService.getAllCompanies();
                setCompanies(data.content || []);

                // Recupera empresa selecionada do sessionStorage ou seleciona a primeira
                const savedCompanyId = sessionStorage.getItem('selectedCompanyId');
                if (savedCompanyId && data.content.some((c: Company) => c.id === savedCompanyId)) {
                    console.log('🏢 [RAW MATERIAL MOVEMENTS] Using saved company ID:', savedCompanyId);
                    setSelectedCompanyId(savedCompanyId);
                } else if (data.content.length > 0) {
                    const firstCompanyId = data.content[0].id;
                    console.log('🏢 [RAW MATERIAL MOVEMENTS] Using first company ID:', firstCompanyId);
                    setSelectedCompanyId(firstCompanyId);
                    sessionStorage.setItem('selectedCompanyId', firstCompanyId);
                } else {
                    console.log('🏢 [RAW MATERIAL MOVEMENTS] No companies available');
                }
            } catch (error) {
                console.error('🏢 [RAW MATERIAL MOVEMENTS] Error loading companies:', error);
                setError('Erro ao carregar empresas');
            }
        };

        loadCompanies();
    }, []);

    // Carregar matérias-primas quando empresa for selecionada
    useEffect(() => {
        if (selectedCompanyId) {
            loadRawMaterials();
            loadMovements();
        }
    }, [selectedCompanyId]);

    // Recarregar movimentações quando filtros mudarem
    useEffect(() => {
        if (selectedCompanyId) {
            loadMovements();
        }
    }, [selectedRawMaterialId, dateFilter, movementTypeFilter, movementOriginFilter]);

    const loadRawMaterials = async () => {
        if (!selectedCompanyId) return;

        try {
            console.log('🧱 [RAW MATERIAL MOVEMENTS] Loading raw materials for company:', selectedCompanyId);
            const data = await rawMaterialService.findAllByCompany(selectedCompanyId, true);
            setRawMaterials(data);
            console.log('✅ [RAW MATERIAL MOVEMENTS] Raw materials loaded:', data.length, 'materials');
        } catch (error) {
            console.error('💥 [RAW MATERIAL MOVEMENTS] Error loading raw materials:', error);
        }
    };

    const loadMovements = async () => {
        if (!selectedCompanyId) return;

        try {
            setLoading(true);
            setError(null);
            console.log('📋 [RAW MATERIAL MOVEMENTS] Loading movements for company:', selectedCompanyId);

            let data: RawMaterialMovement[];
            
            if (selectedRawMaterialId) {
                data = await rawMaterialMovementService.getByRawMaterial(selectedRawMaterialId);
            } else {
                data = await rawMaterialMovementService.getByCompany(selectedCompanyId);
            }

            // Aplicar filtros locais
            let filteredData = data;

            // Filtro por data
            if (dateFilter.startDate) {
                filteredData = filteredData.filter(movement => 
                    new Date(movement.movementDate) >= new Date(dateFilter.startDate)
                );
            }
            if (dateFilter.endDate) {
                filteredData = filteredData.filter(movement => 
                    new Date(movement.movementDate) <= new Date(dateFilter.endDate)
                );
            }

            // Filtro por tipo de movimento
            if (movementTypeFilter) {
                filteredData = filteredData.filter(movement => 
                    movement.movementType === movementTypeFilter
                );
            }

            // Filtro por origem do movimento
            if (movementOriginFilter) {
                filteredData = filteredData.filter(movement => 
                    movement.movementOrigin === movementOriginFilter
                );
            }

            // Ordenar por data (mais recente primeiro)
            filteredData.sort((a, b) => 
                new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()
            );

            console.log('✅ [RAW MATERIAL MOVEMENTS] Movements loaded:', filteredData.length, 'movements');
            setMovements(filteredData);
        } catch (err: any) {
            console.error('💥 [RAW MATERIAL MOVEMENTS] Error loading movements:', err);
            setError(err.message || 'Erro ao carregar movimentações');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (movementId: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta movimentação?')) {
            return;
        }

        try {
            setLoading(true);
            await rawMaterialMovementService.delete(movementId);
            await loadMovements();
            console.log('✅ [RAW MATERIAL MOVEMENTS] Movement deleted successfully');
        } catch (error: any) {
            console.error('💥 [RAW MATERIAL MOVEMENTS] Error deleting movement:', error);
            setError(error.message || 'Erro ao excluir movimentação');
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

    const getRawMaterialName = (rawMaterialId: string) => {
        const material = rawMaterials.find(m => m.id === rawMaterialId);
        return material ? material.name : rawMaterialId;
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingMovement(undefined);
        loadMovements();
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingMovement(undefined);
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const companyId = e.target.value;
        console.log('🏢 [RAW MATERIAL MOVEMENTS] Company selection changed to:', companyId);
        setSelectedCompanyId(companyId);
        sessionStorage.setItem('selectedCompanyId', companyId);
        setMovements([]);
        setRawMaterials([]);
        setSelectedRawMaterialId('');
    };

    const handleEdit = (movement: RawMaterialMovement) => {
        setEditingMovement(movement);
        setShowForm(true);
    };

    const handleNewMovement = () => {
        setEditingMovement(undefined);
        setShowForm(true);
    };

    const clearFilters = () => {
        setSelectedRawMaterialId('');
        setDateFilter({ startDate: '', endDate: '' });
        setMovementTypeFilter('');
        setMovementOriginFilter('');
    };

    return (
        <div className="raw-material-movements-page">
            <div className="page-header">
                <h1>📋 Movimentações de Matéria Prima</h1>
                <button
                    className="btn-primary"
                    onClick={handleNewMovement}
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
                    movement={editingMovement}
                    onSuccess={handleFormSuccess}
                    onCancel={handleFormCancel}
                />
            )}

            {error && <div className="alert alert-error">{error}</div>}

            {!selectedCompanyId ? (
                <div className="empty-state">
                    <p>Selecione uma empresa para visualizar as movimentações de matéria prima</p>
                </div>
            ) : (
                <>
                    <div className="filters-section">
                        <h3>Filtros</h3>
                        <div className="filters-grid">
                            <div className="filter-group">
                                <label>Matéria-Prima:</label>
                                <select
                                    value={selectedRawMaterialId}
                                    onChange={(e) => setSelectedRawMaterialId(e.target.value)}
                                    className="form-input"
                                >
                                    <option value="">Todas</option>
                                    {rawMaterials.map(material => (
                                        <option key={material.id} value={material.id}>
                                            {material.name}
                                        </option>
                                    ))}
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
                                <label>Tipo:</label>
                                <select
                                    value={movementTypeFilter}
                                    onChange={(e) => setMovementTypeFilter(e.target.value)}
                                    className="form-input"
                                >
                                    <option value="">Todos</option>
                                    <option value="IN">Entrada</option>
                                    <option value="OUT">Saída</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Origem:</label>
                                <select
                                    value={movementOriginFilter}
                                    onChange={(e) => setMovementOriginFilter(e.target.value)}
                                    className="form-input"
                                >
                                    <option value="">Todas</option>
                                    <option value="PURCHASE">Compra</option>
                                    <option value="PRODUCTION">Produção</option>
                                    <option value="ADJUSTMENT">Ajuste</option>
                                    <option value="RETURN">Devolução</option>
                                    <option value="TRANSFER">Transferência</option>
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
                            <div className="movements-summary">
                                <p>Total de movimentações: <strong>{movements.length}</strong></p>
                            </div>

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
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movements.map(movement => (
                                        <tr key={movement.id}>
                                            <td>{formatDate(movement.movementDate)}</td>
                                            <td>{getRawMaterialName(movement.rawMaterialId)}</td>
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
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        onClick={() => handleEdit(movement)}
                                                        className="btn-edit"
                                                        title="Editar"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(movement.id)}
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

                            {movements.length === 0 && (
                                <div className="empty-state">
                                    <p>Nenhuma movimentação encontrada para os filtros selecionados</p>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default RawMaterialMovementsPage;