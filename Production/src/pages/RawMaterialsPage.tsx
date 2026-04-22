import React, { useState, useEffect } from 'react';
import { rawMaterialService } from '../services/rawMaterialService';
import { companyService, type Company } from '../services/companyService';
import { authService } from '../services/authService';
import type { RawMaterialDTO, CreateRawMaterialDTO, UpdateRawMaterialDTO } from '../types/rawMaterial';
import RawMaterialGrid from '../components/ui/RawMaterialGrid';
import RawMaterialFormModal from '../components/ui/RawMaterialFormModal';
import RawMaterialFilterControls from '../components/ui/RawMaterialFilterControls';
import ErrorBoundary from '../components/ErrorBoundary';
import './RawMaterialsPage.css';

const RawMaterialsPage: React.FC = () => {
    const [materials, setMaterials] = useState<RawMaterialDTO[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [showForm, setShowForm] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<RawMaterialDTO | undefined>();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
    const [stockControlFilter, setStockControlFilter] = useState<'all' | 'controlled' | 'not_controlled'>('all');

    // Carregar empresas
    useEffect(() => {
        const loadCompanies = async () => {
            try {
                const data = await companyService.getAllCompanies();
                setCompanies(data.content || []);

                // Recupera empresa selecionada do sessionStorage ou seleciona a primeira
                const savedCompanyId = sessionStorage.getItem('selectedCompanyId');

                if (savedCompanyId && data.content.some((c: Company) => c.id === savedCompanyId)) {
                    setSelectedCompanyId(savedCompanyId);
                } else if (data.content.length > 0) {
                    const firstCompanyId = data.content[0].id;
                    setSelectedCompanyId(firstCompanyId);
                    sessionStorage.setItem('selectedCompanyId', firstCompanyId);
                }
            } catch (error) {
                console.error('Erro ao carregar empresas:', error);
                setError('Erro ao carregar empresas');
            }
        };

        loadCompanies();
    }, []);

    useEffect(() => {
        if (selectedCompanyId) {
            loadMaterials();
        }
    }, [selectedCompanyId]);

    const loadMaterials = async () => {
        if (!selectedCompanyId) {
            console.log('🧱 [RAW MATERIALS] No company selected, skipping load');
            setLoading(false);
            return;
        }

        try {
            console.log(`🧱 [RAW MATERIALS] Loading materials for company: ${selectedCompanyId}`);
            setLoading(true);
            setError('');
            const data = await rawMaterialService.findAllByCompany(selectedCompanyId);
            console.log('🧱 [RAW MATERIALS] Materials received from API:', data);

            if (!Array.isArray(data)) {
                console.error('🧱 [RAW MATERIALS] Expected array from API but got:', typeof data, data);
                setMaterials([]);
            } else {
                setMaterials(data);
                console.log(`🧱 [RAW MATERIALS] ${data.length} materials set to state`);
            }
        } catch (err) {
            setError('Erro ao carregar matérias-primas. Verifique se o backend está rodando.');
            console.error('🧱 [RAW MATERIALS] Error loading materials:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        if (!selectedCompanyId || selectedCompanyId.trim() === '') {
            const errorMsg = 'Por favor, selecione uma empresa antes de criar uma nova matéria-prima.';
            setError(errorMsg);
            alert(errorMsg);
            return;
        }

        // Validate that the selected company exists in the companies list
        const selectedCompany = companies.find(c => c.id === selectedCompanyId);
        if (!selectedCompany) {
            const errorMsg = 'A empresa selecionada não é válida. Por favor, selecione uma empresa válida.';
            setError(errorMsg);
            alert(errorMsg);
            return;
        }

        setError('');
        setEditingMaterial(undefined);
        setShowForm(true);
    };

    const handleCopyAccessToken = async () => {
        const token = authService.getToken();
        if (!token) {
            alert('Nenhum token de acesso encontrado. Faça login novamente.');
            return;
        }

        const tokenValue = token.trim();
        const bearerValue = `Bearer ${tokenValue}`;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(tokenValue);
                alert('Token copiado para área de transferência.');
                return;
            }

            const textArea = document.createElement('textarea');
            textArea.value = tokenValue;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const copied = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (copied) {
                alert('Token copiado para área de transferência.');
                return;
            }
        } catch (error) {
            console.warn('Falha ao copiar token automaticamente:', error);
        }

        window.prompt('Copie manualmente o token abaixo:', bearerValue);
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const companyId = e.target.value;
        setSelectedCompanyId(companyId);
        sessionStorage.setItem('selectedCompanyId', companyId);
    };

    const handleEdit = (material: RawMaterialDTO) => {
        setEditingMaterial(material);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta matéria-prima?')) {
            return;
        }

        try {
            await rawMaterialService.delete(id, selectedCompanyId);
            await loadMaterials();
            alert('Matéria-prima excluída com sucesso!');
        } catch (err) {
            alert('Erro ao excluir matéria-prima');
            console.error('Erro ao excluir matéria-prima:', err);
        }
    };

    const handleToggleActive = async (material: RawMaterialDTO) => {
        try {
            await rawMaterialService.update(material.id, { isActive: !material.isActive }, selectedCompanyId);
            await loadMaterials();
        } catch (err) {
            alert('Erro ao alterar status da matéria-prima');
            console.error('Erro ao alterar status:', err);
        }
    };

    const handleSubmit = async (data: CreateRawMaterialDTO | UpdateRawMaterialDTO) => {
        try {
            if (editingMaterial) {
                await rawMaterialService.update(editingMaterial.id, data as UpdateRawMaterialDTO, selectedCompanyId);
                alert('Matéria-prima atualizada com sucesso!');
            } else {
                await rawMaterialService.create(data as CreateRawMaterialDTO);
                alert('Matéria-prima criada com sucesso!');
            }

            setShowForm(false);
            setEditingMaterial(undefined);
            await loadMaterials();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erro ao salvar matéria-prima';
            console.error('Erro ao salvar matéria-prima:', err);
            alert(errorMessage);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingMaterial(undefined);
    };

    const filteredMaterials = materials.filter(material => {
        if (!material) return false;

        const name = material.name || '';
        const code = material.code || '';

        const matchesSearch =
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            code.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesActiveFilter =
            filterActive === 'all' ||
            (filterActive === 'active' && material.isActive) ||
            (filterActive === 'inactive' && !material.isActive);

        const matchesStockControlFilter =
            stockControlFilter === 'all' ||
            (stockControlFilter === 'controlled' && material.stockControl) ||
            (stockControlFilter === 'not_controlled' && !material.stockControl);

        return matchesSearch && matchesActiveFilter && matchesStockControlFilter;
    });

    // Debug filtered results
    useEffect(() => {
        console.log(`🧱 [RAW MATERIALS] Filter Summary:`, {
            total: materials.length,
            filtered: filteredMaterials.length,
            searchTerm,
            filterActive,
            stockControlFilter
        });
    }, [materials.length, filteredMaterials.length, searchTerm, filterActive, stockControlFilter]);

    const materialCounts = {
        total: materials.length,
        active: materials.filter(m => m.isActive).length,
        inactive: materials.filter(m => !m.isActive).length,
        controlled: materials.filter(m => m.stockControl).length,
        notControlled: materials.filter(m => !m.stockControl).length
    };

    return (
        <ErrorBoundary>
            <div className="raw-materials-page">
                <div className="page-header">
                    <h1 className="page-title">🧱 Matérias-Primas</h1>
                    <div className="header-actions">
                        <button
                            onClick={handleCopyAccessToken}
                            className="btn btn-secondary"
                            title="Copiar token de acesso para integração com Studio"
                        >
                            🔐 Token Acesso
                        </button>
                        <button
                            onClick={handleCreate}
                            className={`btn btn-primary ${!selectedCompanyId ? 'btn-disabled' : ''}`}
                            disabled={!selectedCompanyId}
                            title={!selectedCompanyId ? 'Selecione uma empresa primeiro' : 'Criar nova matéria-prima'}
                        >
                            + Nova Matéria-Prima
                        </button>
                    </div>
                </div>

                <div className="page-filters">
                    <div className="form-group">
                        <label htmlFor="company-select">Empresa:</label>
                        <select
                            id="company-select"
                            value={selectedCompanyId}
                            onChange={handleCompanyChange}
                            className={`form-input ${!selectedCompanyId ? 'form-input-warning' : ''}`}
                        >
                            <option value="">Selecione uma empresa</option>
                            {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.corporateName}
                                </option>
                            ))}
                        </select>
                        {!selectedCompanyId && (
                            <div className="form-warning">
                                ⚠️ Selecione uma empresa para habilitar a criação de matérias-primas
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <RawMaterialFilterControls
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filterActive={filterActive}
                    onFilterChange={setFilterActive}
                    stockControlFilter={stockControlFilter}
                    onStockControlFilterChange={setStockControlFilter}
                    materialCounts={materialCounts}
                />

                <RawMaterialGrid
                    materials={filteredMaterials}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                    selectedCompanyId={selectedCompanyId}
                />

                <RawMaterialFormModal
                    isOpen={showForm}
                    material={editingMaterial}
                    companyId={selectedCompanyId}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={loading}
                />
            </div>
        </ErrorBoundary>
    );
};

export default RawMaterialsPage;
