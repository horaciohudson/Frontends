import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ProductionStepDTO, CreateProductionStepDTO } from '../types/productionStep';
import type { Company } from '../services/companyService';
import { productionStepService } from '../services/productionStepService';
import { companyService } from '../services/companyService';
import { FormModal, Notification } from '../components/ui';
import ProductionStepForm, { type ProductionStepFormRef } from '../components/forms/ProductionStepForm';
import './ProductionStepsPage.css';

const ProductionStepsPage: React.FC = () => {
    // Estado dos dados
    const [steps, setSteps] = useState<ProductionStepDTO[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

    // Estado dos modais
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ProductionStepDTO | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Referência para o formulário
    const formRef = useRef<ProductionStepFormRef>(null);

    // Estado de notificação
    const [notification, setNotification] = useState<{
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
        visible: boolean;
    }>({ type: 'info', message: '', visible: false });

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
                showNotification('error', 'Erro ao carregar empresas');
            }
        };

        loadCompanies();
    }, []);

    // Carregar dados
    const loadData = useCallback(async () => {
        if (!selectedCompanyId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await productionStepService.findAll(selectedCompanyId, false);
            setSteps(data);
        } catch (error) {
            console.error('Erro ao carregar etapas de produção:', error);
            showNotification('error', 'Erro ao carregar etapas de produção');
        } finally {
            setLoading(false);
        }
    }, [selectedCompanyId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Handlers
    const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
        setNotification({ type, message, visible: true });
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const companyId = e.target.value;
        setSelectedCompanyId(companyId);
        sessionStorage.setItem('selectedCompanyId', companyId);
    };

    const handleCreate = () => {
        if (!selectedCompanyId) {
            showNotification('warning', 'Selecione uma empresa primeiro');
            return;
        }

        setSelectedItem(null);
        setIsFormOpen(true);
    };

    const handleEdit = (item: ProductionStepDTO) => {
        setSelectedItem(item);
        setIsFormOpen(true);
    };

    const handleDelete = async (item: ProductionStepDTO) => {
        if (!window.confirm(`Deseja realmente excluir a etapa "${item.name}"?`)) {
            return;
        }

        try {
            await productionStepService.delete(item.id);
            showNotification('success', 'Etapa excluída com sucesso');
            loadData();
        } catch (error) {
            console.error('Erro ao excluir etapa:', error);
            showNotification('error', 'Erro ao excluir etapa');
        }
    };

    const handleActivate = async (item: ProductionStepDTO) => {
        try {
            await productionStepService.activate(item.id);
            showNotification('success', 'Etapa ativada com sucesso');
            loadData();
        } catch (error) {
            console.error('Erro ao ativar etapa:', error);
            showNotification('error', 'Erro ao ativar etapa');
        }
    };

    const handleDeactivate = async (item: ProductionStepDTO) => {
        try {
            await productionStepService.deactivate(item.id);
            showNotification('success', 'Etapa desativada com sucesso');
            loadData();
        } catch (error) {
            console.error('Erro ao desativar etapa:', error);
            showNotification('error', 'Erro ao desativar etapa');
        }
    };

    const handleFormSubmit = async () => {
        if (formRef.current) {
            try {
                await formRef.current.submit();
            } catch (error) {
                console.error('Erro no submit do formulário:', error);
            }
        }
    };

    const handleFormDataSubmit = async (formData: CreateProductionStepDTO) => {
        try {
            setFormLoading(true);
            if (selectedItem) {
                await productionStepService.update(selectedItem.id, formData);
                showNotification('success', 'Etapa atualizada com sucesso');
            } else {
                await productionStepService.create(formData);
                showNotification('success', 'Etapa criada com sucesso');
            }
            setIsFormOpen(false);
            loadData();
        } catch (error: any) {
            console.error('Erro ao salvar etapa:', error);

            let errorMessage = 'Erro ao salvar etapa';
            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            showNotification('error', errorMessage);
            throw error;
        } finally {
            setFormLoading(false);
        }
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setSelectedItem(null);
    };

    // Filtrar etapas
    const filteredSteps = steps.filter(step => {
        const matchesSearch = step.name.toLowerCase().includes(searchText.toLowerCase()) ||
            step.description?.toLowerCase().includes(searchText.toLowerCase());

        const matchesFilter = filterActive === 'all' ||
            (filterActive === 'active' && step.isActive) ||
            (filterActive === 'inactive' && !step.isActive);

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="production-steps-page">
            <div className="page-header">
                <h1>Etapas de Produção</h1>
                <button className="btn-primary" onClick={handleCreate} disabled={!selectedCompanyId}>
                    + Nova Etapa
                </button>
            </div>

            <div className="filters-bar">
                <div className="form-group">
                    <label htmlFor="company-select">Empresa:</label>
                    <select
                        id="company-select"
                        value={selectedCompanyId}
                        onChange={handleCompanyChange}
                        className="company-select"
                    >
                        <option value="">Selecione uma empresa</option>
                        {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                                {company.corporateName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Buscar etapas..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="status-filter">Status:</label>
                    <select
                        id="status-filter"
                        value={filterActive}
                        onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                        className="status-filter"
                    >
                        <option value="all">Todos</option>
                        <option value="active">Ativos</option>
                        <option value="inactive">Inativos</option>
                    </select>
                </div>
            </div>

            {!selectedCompanyId ? (
                <div className="empty-state">
                    <span className="empty-icon">🏢</span>
                    <p>Selecione uma empresa para visualizar as etapas de produção</p>
                </div>
            ) : loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <span>Carregando etapas...</span>
                </div>
            ) : filteredSteps.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">📋</span>
                    <p>Nenhuma etapa encontrada</p>
                    <button className="btn-secondary" onClick={handleCreate}>
                        Criar primeira etapa
                    </button>
                </div>
            ) : (
                <div className="steps-table-container">
                    <table className="steps-table">
                        <thead>
                            <tr>
                                <th>Sequência</th>
                                <th>Nome</th>
                                <th>Descrição</th>
                                <th>Tempo Estimado (min)</th>
                                <th>Terceirizada</th>
                                <th>Requer Aprovação</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSteps.map((step) => (
                                <tr key={step.id} className={!step.isActive ? 'inactive' : ''}>
                                    <td className="sequence-cell">{step.sequence}</td>
                                    <td className="name-cell">{step.name}</td>
                                    <td className="description-cell">{step.description || '-'}</td>
                                    <td className="time-cell">{step.estimatedTime || 0}</td>
                                    <td className="boolean-cell">{step.isOutsourced ? 'Sim' : 'Não'}</td>
                                    <td className="boolean-cell">{step.requiresApproval ? 'Sim' : 'Não'}</td>
                                    <td className="status-cell">
                                        <span className={`status-badge ${step.isActive ? 'active' : 'inactive'}`}>
                                            {step.isActive ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="actions-buttons">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEdit(step)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            {step.isActive ? (
                                                <button
                                                    className="btn-deactivate"
                                                    onClick={() => handleDeactivate(step)}
                                                    title="Desativar"
                                                >
                                                    🚫
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn-activate"
                                                    onClick={() => handleActivate(step)}
                                                    title="Ativar"
                                                >
                                                    ✅
                                                </button>
                                            )}
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(step)}
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
                </div>
            )}

            <FormModal
                isOpen={isFormOpen}
                title={selectedItem ? 'Editar Etapa de Produção' : 'Nova Etapa de Produção'}
                onClose={handleFormClose}
                onSubmit={handleFormSubmit}
                loading={formLoading}
                showFooter={true}
            >
                <ProductionStepForm
                    ref={formRef}
                    initialData={selectedItem}
                    selectedCompanyId={selectedCompanyId}
                    onSubmit={handleFormDataSubmit}
                />
            </FormModal>

            <Notification
                type={notification.type}
                message={notification.message}
                visible={notification.visible}
                onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
            />
        </div>
    );
};

export default ProductionStepsPage;
