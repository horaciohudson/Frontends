import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { PaymentMethodDTO, PaymentMethodFilters } from '../types/paymentMethod';
import type { Company } from '../services/companyService';
import { paymentMethodService } from '../services/paymentMethodService';
import { companyService } from '../services/companyService';
import { FormModal, Notification } from '../components/ui';
import PaymentMethodForm, { type PaymentMethodFormRef } from '../components/forms/PaymentMethodForm';
import { getPaymentMethodTypeLabel } from '../types/paymentMethod';
import './PaymentMethodsPage.css';

const PaymentMethodsPage: React.FC = () => {
  // Estado dos dados
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDTO[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PaymentMethodFilters>({});

  // Estado dos modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PaymentMethodDTO | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Referência para o formulário
  const formRef = useRef<PaymentMethodFormRef>(null);

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
      const data = await paymentMethodService.findAll({ ...filters, companyId: selectedCompanyId });
      setPaymentMethods(data);
    } catch (error) {
      console.error('Erro ao carregar métodos de pagamento:', error);
      showNotification('error', 'Erro ao carregar métodos de pagamento');
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

  const handleCreate = () => {
    console.log('🔍 PaymentMethodsPage - handleCreate chamado');
    console.log('🔍 PaymentMethodsPage - selectedCompanyId:', selectedCompanyId);
    
    if (!selectedCompanyId) {
      console.log('❌ PaymentMethodsPage - Nenhuma empresa selecionada');
      showNotification('warning', 'Selecione uma empresa primeiro');
      return;
    }
    
    console.log('✅ PaymentMethodsPage - Abrindo formulário');
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: PaymentMethodDTO) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (item: PaymentMethodDTO) => {
    if (!window.confirm(`Deseja realmente desativar o método de pagamento "${item.methodName}"?`)) {
      return;
    }

    try {
      await paymentMethodService.deactivate(item.id);
      showNotification('success', 'Método de pagamento desativado com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao desativar método de pagamento:', error);
      showNotification('error', 'Erro ao desativar método de pagamento');
    }
  };

  const handleActivate = async (item: PaymentMethodDTO) => {
    try {
      await paymentMethodService.activate(item.id);
      showNotification('success', 'Método de pagamento ativado com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao ativar método de pagamento:', error);
      showNotification('error', 'Erro ao ativar método de pagamento');
    }
  };

  const handleFormSubmit = async () => {
    console.log('🔍 PaymentMethodsPage - handleFormSubmit iniciado (via FormModal)');
    
    if (formRef.current) {
      try {
        await formRef.current.submit();
      } catch (error) {
        console.error('❌ PaymentMethodsPage - Erro no submit do formulário:', error);
        // Não re-throw aqui, deixa o PaymentMethodForm lidar com o erro
      }
    }
  };

  const handleFormDataSubmit = async (formData: unknown) => {
    console.log('🔍 PaymentMethodsPage - handleFormDataSubmit iniciado');
    console.log('🔍 PaymentMethodsPage - formData recebido:', formData);
    console.log('🔍 PaymentMethodsPage - selectedItem:', selectedItem);
    
    try {
      setFormLoading(true);
      if (selectedItem) {
        console.log('🔍 PaymentMethodsPage - Atualizando método de pagamento existente');
        await paymentMethodService.update(selectedItem.id, formData as Parameters<typeof paymentMethodService.update>[1]);
        showNotification('success', 'Método de pagamento atualizado com sucesso');
      } else {
        console.log('🔍 PaymentMethodsPage - Criando novo método de pagamento');
        await paymentMethodService.create(formData as Parameters<typeof paymentMethodService.create>[0]);
        showNotification('success', 'Método de pagamento criado com sucesso');
      }
      setIsFormOpen(false);
      loadData();
    } catch (error: any) {
      console.error('❌ PaymentMethodsPage - Erro ao salvar método de pagamento:', error);
      
      // Tratamento específico de erros
      let errorMessage = 'Erro ao salvar método de pagamento';
      
      if (error?.response?.status === 409 || error?.response?.status === 400) {
        // Erro de conflito (código duplicado) ou validação
        const responseData = error.response?.data;
        if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (responseData?.error) {
          errorMessage = responseData.error;
        } else if (error.response.status === 409) {
          errorMessage = 'Já existe um método de pagamento com este código';
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
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchText: e.target.value });
  };

  const handleActiveFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters({ 
      ...filters, 
      isActive: value === '' ? undefined : value === 'true' 
    });
  };

  return (
    <div className="payment-methods-page">
      <div className="page-header">
        <h1>Métodos de Pagamento</h1>
        <button className="btn-primary" onClick={handleCreate} disabled={!selectedCompanyId}>
          + Novo Método de Pagamento
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
            placeholder="Buscar métodos de pagamento..."
            value={filters.searchText || ''}
            onChange={handleFilterChange}
            className="search-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={filters.isActive === undefined ? '' : String(filters.isActive)}
            onChange={handleActiveFilterChange}
            className="status-filter"
          >
            <option value="">Todos</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
        </div>
      </div>

      {!selectedCompanyId ? (
        <div className="empty-state">
          <span className="empty-icon">🏢</span>
          <p>Selecione uma empresa para visualizar os métodos de pagamento</p>
        </div>
      ) : loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Carregando métodos de pagamento...</span>
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">💳</span>
          <p>Nenhum método de pagamento encontrado</p>
          <button className="btn-secondary" onClick={handleCreate}>
            Criar primeiro método de pagamento
          </button>
        </div>
      ) : (
        <div className="payment-methods-table-container">
          <table className="payment-methods-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Parcelas</th>
                <th>Taxa</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paymentMethods.map((method) => (
                <tr key={method.id} className={!method.isActive ? 'inactive' : ''}>
                  <td className="code-cell">{method.methodCode}</td>
                  <td className="name-cell">{method.methodName}</td>
                  <td className="type-cell">{getPaymentMethodTypeLabel(method.methodType)}</td>
                  <td className="installments-cell">
                    {method.defaultInstallments === method.maxInstallments 
                      ? `${method.defaultInstallments}x`
                      : `${method.defaultInstallments}-${method.maxInstallments}x`
                    }
                  </td>
                  <td className="fee-cell">
                    {method.hasFee ? `${method.feePercentage}%` : 'Sem taxa'}
                  </td>
                  <td className="status-cell">
                    <span className={`status-badge ${method.isActive ? 'active' : 'inactive'}`}>
                      {method.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="actions-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(method)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      {method.isActive ? (
                        <button
                          className="btn-deactivate"
                          onClick={() => handleDelete(method)}
                          title="Desativar"
                        >
                          🚫
                        </button>
                      ) : (
                        <button
                          className="btn-activate"
                          onClick={() => handleActivate(method)}
                          title="Ativar"
                        >
                          ✅
                        </button>
                      )}
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
        title={selectedItem ? 'Editar Método de Pagamento' : 'Novo Método de Pagamento'}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        loading={formLoading}
        showFooter={true}
        size="large"
      >
        <PaymentMethodForm
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

export default PaymentMethodsPage;