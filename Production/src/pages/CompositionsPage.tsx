import React, { useState, useEffect } from 'react';
import { compositionService } from '../services/compositionService';
import { productionProductService } from '../services/productionProductService';
import { companyService, type Company } from '../services/companyService';
import type { CompositionDTO, CreateCompositionDTO, UpdateCompositionDTO, CompositionWithDetails } from '../types/composition';
import type { ProductionProductDTO } from '../types/productionProduct';
import CompositionGrid from '../components/ui/CompositionGrid';
import CompositionFormModal from '../components/ui/CompositionFormModal';
import CompositionItemsModal from '../components/ui/CompositionItemsModal';
import CompositionFilterControls from '../components/ui/CompositionFilterControls';
import ErrorBoundary from '../components/ErrorBoundary';
import './CompositionsPage.css';

const CompositionsPage: React.FC = () => {
    const [compositions, setCompositions] = useState<CompositionWithDetails[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [products, setProducts] = useState<ProductionProductDTO[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [showForm, setShowForm] = useState(false);
    const [editingComposition, setEditingComposition] = useState<CompositionDTO | undefined>();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
    const [filterApproved, setFilterApproved] = useState<'all' | 'approved' | 'pending'>('all');

    // Estado para formulário de itens inline
    const [showItemsForm, setShowItemsForm] = useState(false);
    const [selectedComposition, setSelectedComposition] = useState<CompositionDTO | null>(null);

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
            loadCompositions();
            loadProducts();
        }
    }, [selectedCompanyId]);

    const loadCompositions = async () => {
        if (!selectedCompanyId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');
            const data = await compositionService.findAllByCompany(selectedCompanyId);

            // Enriquecer com dados dos produtos
            const enrichedCompositions: CompositionWithDetails[] = data.map(composition => ({
                ...composition,
                productName: products.find(p => p.id === composition.productionProductId)?.description || 'Produto não encontrado'
                // itemsCount e totalCost já vêm da API
            }));

            setCompositions(enrichedCompositions);
        } catch (err) {
            setError('Erro ao carregar composições. Verifique se o backend está rodando.');
            console.error('Erro ao carregar composições:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        if (!selectedCompanyId) return;

        try {
            const data = await productionProductService.findAll(selectedCompanyId);
            setProducts(data);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        }
    };

    const handleCreate = () => {
        if (!selectedCompanyId || selectedCompanyId.trim() === '') {
            const errorMsg = 'Por favor, selecione uma empresa antes de criar uma nova composição.';
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
        setEditingComposition(undefined);
        setShowForm(true);
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const companyId = e.target.value;
        setSelectedCompanyId(companyId);
        sessionStorage.setItem('selectedCompanyId', companyId);
    };

    const handleEdit = (composition: CompositionWithDetails) => {
        setEditingComposition(composition);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta composição?')) {
            return;
        }

        try {
            await compositionService.delete(id, selectedCompanyId);
            await loadCompositions();
            alert('Composição excluída com sucesso!');
        } catch (err) {
            alert('Erro ao excluir composição');
            console.error('Erro ao excluir composição:', err);
        }
    };

    const handleToggleActive = async (composition: CompositionWithDetails) => {
        try {
            await compositionService.update(composition.id, { isActive: !composition.isActive }, selectedCompanyId);
            await loadCompositions();
        } catch (err) {
            alert('Erro ao alterar status da composição');
            console.error('Erro ao alterar status:', err);
        }
    };

    const handleApprove = async (composition: CompositionWithDetails) => {
        if (!window.confirm('Tem certeza que deseja aprovar esta composição?')) {
            return;
        }

        try {
            await compositionService.approve(composition.id, selectedCompanyId);
            alert('Composição aprovada com sucesso!');
            loadCompositions();
        } catch (error) {
            console.error('Erro ao aprovar composição:', error);
            alert('Erro ao aprovar composição');
        }
    };

    const handleRowDoubleClick = (composition: CompositionWithDetails) => {
        setSelectedComposition(composition);
        setShowItemsForm(true);
        setShowForm(false); // Fechar formulário de composição se estiver aberto
    };

    const handleBackToCompositions = () => {
        setShowItemsForm(false);
        setSelectedComposition(null);
        // Recarregar composições para atualizar totalCost
        loadCompositions();
    };

    const handleSubmit = async (data: CreateCompositionDTO | UpdateCompositionDTO) => {
        try {
            if (editingComposition) {
                await compositionService.update(editingComposition.id, data as UpdateCompositionDTO, selectedCompanyId);
                alert('Composição atualizada com sucesso!');
            } else {
                await compositionService.create(data as CreateCompositionDTO);
                alert('Composição criada com sucesso!');
            }

            setShowForm(false);
            setEditingComposition(undefined);
            await loadCompositions();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erro ao salvar composição';
            console.error('Erro ao salvar composição:', err);
            alert(errorMessage);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingComposition(undefined);
    };

    const filteredCompositions = compositions.filter(composition => {
        const matchesSearch =
            composition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (composition.productName && composition.productName.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesActiveFilter =
            filterActive === 'all' ||
            (filterActive === 'active' && composition.isActive) ||
            (filterActive === 'inactive' && !composition.isActive);

        const matchesApprovedFilter =
            filterApproved === 'all' ||
            (filterApproved === 'approved' && composition.approvedBy) ||
            (filterApproved === 'pending' && !composition.approvedBy);

        return matchesSearch && matchesActiveFilter && matchesApprovedFilter;
    });

    const compositionCounts = {
        total: compositions.length,
        active: compositions.filter(c => c.isActive).length,
        inactive: compositions.filter(c => !c.isActive).length,
        approved: compositions.filter(c => c.approvedBy).length,
        pending: compositions.filter(c => !c.approvedBy).length
    };

    return (
        <ErrorBoundary>
            <div className="compositions-page">
                {!showItemsForm ? (
                    <>
                        <div className="page-header">
                            <h1 className="page-title">📝 Composições (BOM)</h1>
                            <button
                                onClick={handleCreate}
                                className={`btn btn-primary ${!selectedCompanyId ? 'btn-disabled' : ''}`}
                                disabled={!selectedCompanyId}
                                title={!selectedCompanyId ? 'Selecione uma empresa primeiro' : 'Criar nova composição'}
                            >
                                + Nova Composição
                            </button>
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
                                        ⚠️ Selecione uma empresa para habilitar a criação de composições
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        <CompositionFilterControls
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            filterActive={filterActive}
                            onFilterChange={setFilterActive}
                            filterApproved={filterApproved}
                            onApprovedFilterChange={setFilterApproved}
                            compositionCounts={compositionCounts}
                        />

                        <CompositionGrid
                            compositions={filteredCompositions}
                            loading={loading}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggleActive={handleToggleActive}
                            onApprove={handleApprove}
                            onRowDoubleClick={handleRowDoubleClick}
                            selectedCompanyId={selectedCompanyId}
                            selectedCompositionId={selectedComposition?.id}
                        />

                        <CompositionFormModal
                            isOpen={showForm}
                            composition={editingComposition}
                            companyId={selectedCompanyId}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            loading={loading}
                        />
                    </>
                ) : (
                    <div className="items-form-container">
                        <div className="items-form-header">
                            <h2>📦 Itens da Composição: {selectedComposition?.name}</h2>
                            <div className="items-form-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleBackToCompositions}
                                >
                                    ← Voltar para Composições
                                </button>
                            </div>
                        </div>
                        {selectedComposition && (
                            <CompositionItemsModal
                                isOpen={false}
                                composition={selectedComposition}
                                companyId={selectedCompanyId}
                                onClose={handleBackToCompositions}
                            />
                        )}
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default CompositionsPage;