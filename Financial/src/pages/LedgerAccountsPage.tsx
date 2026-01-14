import React, { useState, useEffect, useCallback } from 'react';
import type { LedgerAccountDTO, LedgerAccountFilters, AccountType } from '../types/ledgerAccount';
import type { Company } from '../services/companyService';
import { ACCOUNT_TYPE_LABELS } from '../types/ledgerAccount';
import { ledgerAccountService } from '../services/ledgerAccountService';
import { companyService } from '../services/companyService';
import { FormModal, Notification } from '../components/ui';
import LedgerAccountTree from '../components/LedgerAccountTree';
import LedgerAccountForm from '../components/forms/LedgerAccountForm';
import './LedgerAccountsPage.css';

const LedgerAccountsPage: React.FC = () => {
  // Estado dos dados
  const [accounts, setAccounts] = useState<LedgerAccountDTO[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LedgerAccountFilters>({});

  // Estado dos modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LedgerAccountDTO | null>(null);
  const [parentAccount, setParentAccount] = useState<LedgerAccountDTO | null>(null);
  const [formLoading, setFormLoading] = useState(false);

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
        const response = await companyService.getAllCompanies();
        if (response.content && response.content.length > 0) {
          setCompanies(response.content);

          // Selecionar empresa do sessionStorage ou a primeira ativa
          const storedCompanyId = sessionStorage.getItem('selectedCompanyId');
          if (storedCompanyId && response.content.some(c => c.id === storedCompanyId)) {
            setSelectedCompanyId(storedCompanyId);
          } else {
            const activeCompany = response.content.find(c => c.isActive) || response.content[0];
            setSelectedCompanyId(activeCompany.id);
            sessionStorage.setItem('selectedCompanyId', activeCompany.id);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
        showNotification('error', 'Erro ao carregar empresas');
      }
    };
    loadCompanies();
  }, []);

  // Carregar dados quando empresa mudar
  const loadData = useCallback(async () => {
    if (!selectedCompanyId) return;

    try {
      setLoading(true);
      const data = await ledgerAccountService.findAll(filters);
      setAccounts(data);
    } catch (error) {
      console.error('Erro ao carregar plano de contas:', error);
      showNotification('error', 'Erro ao carregar plano de contas');
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

  const handleCreate = (parent?: LedgerAccountDTO) => {
    setSelectedItem(null);
    setParentAccount(parent || null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: LedgerAccountDTO) => {
    setSelectedItem(item);
    setParentAccount(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (item: LedgerAccountDTO) => {
    if (!window.confirm(`Deseja realmente desativar a conta "${item.accountName}"?`)) {
      return;
    }

    try {
      await ledgerAccountService.deactivate(String(item.id));
      showNotification('success', 'Conta desativada com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao desativar conta:', error);
      showNotification('error', 'Erro ao desativar conta');
    }
  };

  const handleFormSubmit = async (formData: unknown) => {
    try {
      setFormLoading(true);
      if (selectedItem) {
        await ledgerAccountService.update(String(selectedItem.id), formData as Parameters<typeof ledgerAccountService.update>[1]);
        showNotification('success', 'Conta atualizada com sucesso');
      } else {
        await ledgerAccountService.create(formData as Parameters<typeof ledgerAccountService.create>[0]);
        showNotification('success', 'Conta criada com sucesso');
      }
      setIsFormOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Erro ao salvar conta:', error);

      let errorMessage = 'Erro ao salvar conta';

      if (error?.response?.status === 409) {
        errorMessage = 'Já existe uma conta com este código nesta empresa';
      } else if (error?.response?.status === 404) {
        errorMessage = 'Conta não encontrada';
      } else if (error?.response?.data?.message) {
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
    setParentAccount(null);
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = e.target.value;
    setSelectedCompanyId(companyId);
    sessionStorage.setItem('selectedCompanyId', companyId);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchText: e.target.value });
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as AccountType | '';
    setFilters({ ...filters, accountType: value || undefined });
  };

  // Construir árvore de contas
  const accountTree = ledgerAccountService.buildTree(accounts);

  return (
    <div className="ledger-accounts-page">
      <div className="page-header">
        <h1>Plano de Contas</h1>
        <button className="btn-primary" onClick={() => handleCreate()}>
          + Nova Conta
        </button>
      </div>

      <div className="filters-bar">
        <select
          value={selectedCompanyId}
          onChange={handleCompanyChange}
          className="company-selector"
          disabled={companies.length === 0}
        >
          <option value="">Selecione uma empresa</option>
          {companies.map(company => (
            <option key={company.id} value={company.id}>
              {company.corporateName} {company.cnpj ? `- ${company.cnpj}` : ''}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Buscar contas..."
          value={filters.searchText || ''}
          onChange={handleFilterChange}
          className="search-input"
        />
        <select
          value={filters.accountType || ''}
          onChange={handleTypeFilterChange}
          className="type-filter"
        >
          <option value="">Todos os tipos</option>
          {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Carregando plano de contas...</span>
        </div>
      ) : accounts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <p>Nenhuma conta encontrada</p>
          <button className="btn-secondary" onClick={() => handleCreate()}>
            Criar primeira conta
          </button>
        </div>
      ) : (
        <LedgerAccountTree
          accounts={accountTree}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddChild={handleCreate}
        />
      )}

      <FormModal
        isOpen={isFormOpen}
        title={selectedItem ? 'Editar Conta' : 'Nova Conta'}
        onClose={handleFormClose}
        onSubmit={() => { }}
        loading={formLoading}
        showFooter={false}
      >
        <LedgerAccountForm
          initialData={selectedItem}
          parentAccount={parentAccount}
          onSubmit={handleFormSubmit}
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

export default LedgerAccountsPage;
