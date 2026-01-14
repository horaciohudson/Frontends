import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { CustomerDTO, CustomerFilters } from '../types/customer';
import type { Company } from '../services/companyService';
import { customerService } from '../services/customerService';
import { companyService } from '../services/companyService';
import { FormModal, Notification } from '../components/ui';
import CustomerForm, { type CustomerFormRef } from '../components/forms/CustomerForm';
import { getCustomerTypeLabel, formatCpfCnpj, formatPhone } from '../types/customer';
import './CustomersPage.css';

const CustomersPage: React.FC = () => {
  // Estado dos dados
  const [customers, setCustomers] = useState<CustomerDTO[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CustomerFilters>({});

  // Estado dos modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CustomerDTO | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Referência para o formulário
  const formRef = useRef<CustomerFormRef>(null);

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
      const data = await customerService.findAll({ ...filters, companyId: selectedCompanyId });
      setCustomers(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      showNotification('error', 'Erro ao carregar clientes');
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
    console.log('🔍 CustomersPage - handleCreate chamado');
    console.log('🔍 CustomersPage - selectedCompanyId:', selectedCompanyId);
    
    if (!selectedCompanyId) {
      console.log('❌ CustomersPage - Nenhuma empresa selecionada');
      showNotification('warning', 'Selecione uma empresa primeiro');
      return;
    }
    
    console.log('✅ CustomersPage - Abrindo formulário');
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: CustomerDTO) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (item: CustomerDTO) => {
    if (!window.confirm(`Deseja realmente desativar o cliente "${item.customerName}"?`)) {
      return;
    }

    try {
      await customerService.deactivate(item.id);
      showNotification('success', 'Cliente desativado com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao desativar cliente:', error);
      showNotification('error', 'Erro ao desativar cliente');
    }
  };

  const handleActivate = async (item: CustomerDTO) => {
    try {
      await customerService.activate(item.id);
      showNotification('success', 'Cliente ativado com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao ativar cliente:', error);
      showNotification('error', 'Erro ao ativar cliente');
    }
  };

  const handleFormSubmit = async () => {
    console.log('🔍 CustomersPage - handleFormSubmit iniciado (via FormModal)');
    
    if (formRef.current) {
      try {
        await formRef.current.submit();
      } catch (error) {
        console.error('❌ CustomersPage - Erro no submit do formulário:', error);
        // Não re-throw aqui, deixa o CustomerForm lidar com o erro
      }
    }
  };

  const handleFormDataSubmit = async (formData: unknown) => {
    console.log('🔍 CustomersPage - handleFormDataSubmit iniciado');
    console.log('🔍 CustomersPage - formData recebido:', formData);
    console.log('🔍 CustomersPage - selectedItem:', selectedItem);
    
    try {
      setFormLoading(true);
      if (selectedItem) {
        console.log('🔍 CustomersPage - Atualizando cliente existente');
        await customerService.update(selectedItem.id, formData as Parameters<typeof customerService.update>[1]);
        showNotification('success', 'Cliente atualizado com sucesso');
      } else {
        console.log('🔍 CustomersPage - Criando novo cliente');
        await customerService.create(formData as Parameters<typeof customerService.create>[0]);
        showNotification('success', 'Cliente criado com sucesso');
      }
      setIsFormOpen(false);
      loadData();
    } catch (error: any) {
      console.error('❌ CustomersPage - Erro ao salvar cliente:', error);
      
      // Tratamento específico de erros
      let errorMessage = 'Erro ao salvar cliente';
      
      if (error?.response?.status === 409 || error?.response?.status === 400) {
        // Erro de conflito (código duplicado) ou validação
        const responseData = error.response?.data;
        if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (responseData?.error) {
          errorMessage = responseData.error;
        } else if (error.response.status === 409) {
          errorMessage = 'Já existe um cliente com este código ou CPF/CNPJ';
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
    <div className="customers-page">
      <div className="page-header">
        <h1>Clientes</h1>
        <button className="btn-primary" onClick={handleCreate} disabled={!selectedCompanyId}>
          + Novo Cliente
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
            placeholder="Buscar clientes..."
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
          <p>Selecione uma empresa para visualizar os clientes</p>
        </div>
      ) : loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Carregando clientes...</span>
        </div>
      ) : customers.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">👥</span>
          <p>Nenhum cliente encontrado</p>
          <button className="btn-secondary" onClick={handleCreate}>
            Criar primeiro cliente
          </button>
        </div>
      ) : (
        <div className="customers-table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Tipo</th>
                <th>CPF/CNPJ</th>
                <th>Contato</th>
                <th>Limite Crédito</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className={!customer.isActive ? 'inactive' : ''}>
                  <td className="code-cell">{customer.customerCode}</td>
                  <td className="name-cell">{customer.customerName}</td>
                  <td className="type-cell">{getCustomerTypeLabel(customer.customerType)}</td>
                  <td className="document-cell">{formatCpfCnpj(customer.cpfCnpj)}</td>
                  <td className="contact-cell">
                    {customer.email && <div>{customer.email}</div>}
                    {customer.phone && <div>{formatPhone(customer.phone)}</div>}
                  </td>
                  <td className="credit-cell">
                    {customer.creditLimit ? `R$ ${customer.creditLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
                  </td>
                  <td className="status-cell">
                    <span className={`status-badge ${customer.isActive ? 'active' : 'inactive'}`}>
                      {customer.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="actions-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(customer)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      {customer.isActive ? (
                        <button
                          className="btn-deactivate"
                          onClick={() => handleDelete(customer)}
                          title="Desativar"
                        >
                          🚫
                        </button>
                      ) : (
                        <button
                          className="btn-activate"
                          onClick={() => handleActivate(customer)}
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
        title={selectedItem ? 'Editar Cliente' : 'Novo Cliente'}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        loading={formLoading}
        showFooter={true}
        size="large"
      >
        <CustomerForm
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

export default CustomersPage;