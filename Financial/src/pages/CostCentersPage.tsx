import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { CostCenterDTO, CostCenterFilters } from '../types/costCenter';
import type { Company } from '../types/company';
import { costCenterService } from '../services/costCenterService';
import { companyService } from '../services/companyService';
import { FormModal, Notification } from '../components/ui';
import CostCenterTree from '../components/CostCenterTree';
import CostCenterForm, { type CostCenterFormRef } from '../components/forms/CostCenterForm';
import './CostCentersPage.css';

const CostCentersPage: React.FC = () => {
  // Estado dos dados
  const [costCenters, setCostCenters] = useState<CostCenterDTO[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CostCenterFilters>({});

  // Estado dos modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CostCenterDTO | null>(null);
  const [parentCostCenter, setParentCostCenter] = useState<CostCenterDTO | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Referência para o formulário
  const formRef = useRef<CostCenterFormRef>(null);

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
      const data = await costCenterService.findAll({ ...filters, companyId: selectedCompanyId });
      setCostCenters(data);
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error);
      showNotification('error', 'Erro ao carregar centros de custo');
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

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = e.target.value;
    setSelectedCompanyId(companyId);
    sessionStorage.setItem('selectedCompanyId', companyId);
  };

  const handleCreate = (parent?: CostCenterDTO) => {
    console.log('🔍 CostCentersPage - handleCreate chamado');
    console.log('🔍 CostCentersPage - selectedCompanyId:', selectedCompanyId);
    console.log('🔍 CostCentersPage - parent:', parent);
    
    if (!selectedCompanyId) {
      console.log('❌ CostCentersPage - Nenhuma empresa selecionada');
      showNotification('warning', 'Selecione uma empresa primeiro');
      return;
    }
    
    console.log('✅ CostCentersPage - Abrindo formulário');
    setSelectedItem(null);
    setParentCostCenter(parent || null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: CostCenterDTO) => {
    setSelectedItem(item);
    setParentCostCenter(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (item: CostCenterDTO) => {
    if (!window.confirm(`Deseja realmente desativar o centro de custo "${item.costCenterName}"?`)) {
      return;
    }

    try {
      await costCenterService.deactivate(item.id);
      showNotification('success', 'Centro de custo desativado com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao desativar centro de custo:', error);
      showNotification('error', 'Erro ao desativar centro de custo');
    }
  };

  const handleFormSubmit = async () => {
    console.log('🔍 CostCentersPage - handleFormSubmit iniciado (via FormModal)');
    
    if (formRef.current) {
      try {
        await formRef.current.submit();
      } catch (error) {
        console.error('❌ CostCentersPage - Erro no submit do formulário:', error);
        // Não re-throw aqui, deixa o CostCenterForm lidar com o erro
      }
    }
  };

  const handleFormDataSubmit = async (formData: unknown) => {
    console.log('🔍 CostCentersPage - handleFormDataSubmit iniciado');
    console.log('🔍 CostCentersPage - formData recebido:', formData);
    console.log('🔍 CostCentersPage - selectedItem:', selectedItem);
    
    try {
      setFormLoading(true);
      if (selectedItem) {
        console.log('🔍 CostCentersPage - Atualizando centro de custo existente');
        await costCenterService.update(selectedItem.id, formData as Parameters<typeof costCenterService.update>[1]);
        showNotification('success', 'Centro de custo atualizado com sucesso');
      } else {
        console.log('🔍 CostCentersPage - Criando novo centro de custo');
        await costCenterService.create(formData as Parameters<typeof costCenterService.create>[0]);
        showNotification('success', 'Centro de custo criado com sucesso');
      }
      setIsFormOpen(false);
      loadData();
    } catch (error: any) {
      console.error('❌ CostCentersPage - Erro ao salvar centro de custo:', error);
      
      // Tratamento específico de erros
      let errorMessage = 'Erro ao salvar centro de custo';
      
      if (error?.response?.status === 409 || error?.response?.status === 400) {
        // Erro de conflito (código duplicado) ou validação
        const responseData = error.response?.data;
        if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (responseData?.error) {
          errorMessage = responseData.error;
        } else if (error.response.status === 409) {
          errorMessage = 'Já existe um centro de custo com este código';
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
    setParentCostCenter(null);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchText: e.target.value });
  };

  // Construir árvore de centros de custo
  const costCenterTree = costCenterService.buildTree(costCenters);

  return (
    <div className="cost-centers-page">
      <div className="page-header">
        <h1>Centros de Custo</h1>
        <button className="btn-primary" onClick={() => handleCreate()} disabled={!selectedCompanyId}>
          + Novo Centro de Custo
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
            placeholder="Buscar centros de custo..."
            value={filters.searchText || ''}
            onChange={handleFilterChange}
            className="search-input"
          />
        </div>
      </div>

      {!selectedCompanyId ? (
        <div className="empty-state">
          <span className="empty-icon">🏢</span>
          <p>Selecione uma empresa para visualizar os centros de custo</p>
        </div>
      ) : loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Carregando centros de custo...</span>
        </div>
      ) : costCenters.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🏢</span>
          <p>Nenhum centro de custo encontrado</p>
          <button className="btn-secondary" onClick={() => handleCreate()}>
            Criar primeiro centro de custo
          </button>
        </div>
      ) : (
        <CostCenterTree
          costCenters={costCenterTree}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddChild={handleCreate}
        />
      )}

      <FormModal
        isOpen={isFormOpen}
        title={selectedItem ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        loading={formLoading}
        showFooter={true}
      >
        <CostCenterForm
          ref={formRef}
          initialData={selectedItem}
          parentCostCenter={parentCostCenter}
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

export default CostCentersPage;
