import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { FinancialCategoryDTO, FinancialCategoryFilters } from '../types/financialCategory';
import type { Company } from '../types/company';
import { financialCategoryService } from '../services/financialCategoryService';
import { companyService } from '../services/companyService';
import { FormModal, Notification } from '../components/ui';
import CategoryTree from '../components/CategoryTree';
import FinancialCategoryForm, { type FinancialCategoryFormRef } from '../components/forms/FinancialCategoryForm';
import './FinancialCategoriesPage.css';

const FinancialCategoriesPage: React.FC = () => {
  // Estado dos dados
  const [categories, setCategories] = useState<FinancialCategoryDTO[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FinancialCategoryFilters>({});

  // Estado dos modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FinancialCategoryDTO | null>(null);
  const [parentCategory, setParentCategory] = useState<FinancialCategoryDTO | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Estado de notificação
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    visible: boolean;
  }>({ type: 'info', message: '', visible: false });

  // Referência para o formulário
  const formRef = useRef<FinancialCategoryFormRef>(null);

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
    if (!selectedCompanyId) return;
    
    try {
      setLoading(true);
      const data = await financialCategoryService.findAll(filters);
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      showNotification('error', 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, [filters, selectedCompanyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ type, message, visible: true });
  };

  const handleCreate = (parent?: FinancialCategoryDTO) => {
    if (!selectedCompanyId) {
      showNotification('warning', 'Selecione uma empresa primeiro');
      return;
    }
    setSelectedItem(null);
    setParentCategory(parent || null);
    setIsFormOpen(true);
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = e.target.value;
    setSelectedCompanyId(companyId);
    sessionStorage.setItem('selectedCompanyId', companyId);
  };

  const handleEdit = (item: FinancialCategoryDTO) => {
    setSelectedItem(item);
    setParentCategory(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (item: FinancialCategoryDTO) => {
    if (!window.confirm(`Deseja realmente desativar a categoria "${item.categoryName}"?`)) {
      return;
    }

    try {
      await financialCategoryService.deactivate(item.id);
      showNotification('success', 'Categoria desativada com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao desativar categoria:', error);
      showNotification('error', 'Erro ao desativar categoria');
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

  const handleFormDataSubmit = async (formData: unknown) => {
    try {
      setFormLoading(true);
      if (selectedItem) {
        await financialCategoryService.update(selectedItem.id, formData as Parameters<typeof financialCategoryService.update>[1]);
        showNotification('success', 'Categoria atualizada com sucesso');
      } else {
        await financialCategoryService.create(formData as Parameters<typeof financialCategoryService.create>[0]);
        showNotification('success', 'Categoria criada com sucesso');
      }
      setIsFormOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error);
      
      // Tratamento específico de erros
      let errorMessage = 'Erro ao salvar categoria';
      
      if (error?.response?.status === 409 || error?.response?.status === 400) {
        const responseData = error.response?.data;
        if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (responseData?.error) {
          errorMessage = responseData.error;
        } else if (error.response.status === 409) {
          errorMessage = 'Já existe uma categoria com este código';
        } else {
          errorMessage = 'Dados inválidos. Verifique os campos preenchidos';
        }
      } else if (error?.response?.status === 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente';
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
    setParentCategory(null);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchText: e.target.value });
  };

  // Construir árvore de categorias
  const categoryTree = financialCategoryService.buildTree(categories);

  return (
    <div className="financial-categories-page">
      <div className="page-header">
        <h1>Categorias Financeiras</h1>
        <button className="btn-primary" onClick={() => handleCreate()} disabled={!selectedCompanyId}>
          + Nova Categoria
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
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.corporateName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <input
            type="text"
            placeholder="Buscar categorias..."
            value={filters.searchText || ''}
            onChange={handleFilterChange}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Carregando categorias...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📁</span>
          <p>Nenhuma categoria encontrada</p>
          <button className="btn-secondary" onClick={() => handleCreate()}>
            Criar primeira categoria
          </button>
        </div>
      ) : (
        <CategoryTree
          categories={categoryTree}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddChild={handleCreate}
        />
      )}

      <FormModal
        isOpen={isFormOpen}
        title={selectedItem ? 'Editar Categoria' : 'Nova Categoria'}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        loading={formLoading}
        showFooter={true}
      >
        <FinancialCategoryForm
          ref={formRef}
          initialData={selectedItem}
          parentCategory={parentCategory}
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

export default FinancialCategoriesPage;
