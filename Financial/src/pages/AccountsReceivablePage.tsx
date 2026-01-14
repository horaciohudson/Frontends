import React, { useState, useEffect, useCallback } from 'react';
import type { AccountsReceivableDTO, AccountsReceivableFilters } from '../types/accountsReceivable';
import type { ColumnDefinition, ActionDefinition, PaginationState, FilterDefinition } from '../types/common';
import { ReceivableStatus, ReceivableStatusLabels, ReceivableStatusColors, PriorityLabels, PriorityColors } from '../types/enums';
import { accountsReceivableService } from '../services/accountsReceivableService';
import { companyService } from '../services/companyService';
import { DataTable, FilterBar, StatusBadge, FormModal, Notification, ErrorNotification } from '../components/ui';
import { formatCurrency, formatDate } from '../utils/formatting';
import { AccountsReceivableForm, ReceiptForm } from '../components/forms';
import { useErrorHandler } from '../hooks/useErrorHandler';
import './AccountsReceivablePage.css';

const AccountsReceivablePage: React.FC = () => {
  // Hook para tratamento de erros
  const { error, showError, clearError, setLoading: setErrorLoading } = useErrorHandler();

  // Estado dos dados
  const [data, setData] = useState<AccountsReceivableDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompanyContextReady, setIsCompanyContextReady] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  });

  // Estado dos filtros
  const [filters, setFilters] = useState<AccountsReceivableFilters>({});
  const [sortField, setSortField] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Estado dos modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReceiptFormOpen, setIsReceiptFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AccountsReceivableDTO | null>(null);

  // Estado de notificação
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    visible: boolean;
  }>({ type: 'info', message: '', visible: false });


  // Inicializar contexto da empresa
  useEffect(() => {
    const initCompanyContext = async () => {
      try {
        const storedCompanyId = sessionStorage.getItem('selectedCompanyId');
        if (!storedCompanyId) {
          console.log('🔍 Contexto de empresa não encontrado. Buscando empresas...');
          const response = await companyService.getAllCompanies();
          if (response.content && response.content.length > 0) {
            // Preferir empresa ativa
            const activeCompany = response.content.find(c => c.isActive) || response.content[0];
            sessionStorage.setItem('selectedCompanyId', activeCompany.id);
            console.log('✅ Contexto de empresa definido automaticamente:', activeCompany.tradeName || activeCompany.corporateName);
          } else {
            console.warn('⚠️ Nenhuma empresa encontrada para o usuário.');
          }
        } else {
          console.log('✅ Contexto de empresa já existente:', storedCompanyId);
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar contexto de empresa:', error);
      } finally {
        setIsCompanyContextReady(true);
      }
    };

    initCompanyContext();
  }, []);

  // Carregar dados
  const loadData = useCallback(async () => {
    if (!isCompanyContextReady) return; // Aguardar contexto

    try {
      setLoading(true);
      clearError();

      const response = await accountsReceivableService.findAll({
        page: pagination.page,
        size: pagination.size,
        sortBy: sortField,
        sortDir: sortDirection,
        ...filters,
      });

      if (response && response.content) {
        setData(response.content);
        setPagination(prev => ({
          ...prev,
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0,
        }));
      } else {
        console.warn('⚠️ Resposta da API inválida:', response);
        setData([]);
        setPagination(prev => ({
          ...prev,
          totalElements: 0,
          totalPages: 0,
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar contas a receber:', error);
      showError(error, 'Carregamento de contas a receber');
      showNotification('error', 'Erro ao carregar contas a receber');

      setData([]);
      setPagination(prev => ({
        ...prev,
        totalElements: 0,
        totalPages: 0,
      }));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, sortField, sortDirection, filters, isCompanyContextReady, clearError, showError]);

  // Efeito para carregar dados quando o contexto estiver pronto ou filtros mudarem
  useEffect(() => {
    if (isCompanyContextReady) {
      loadData();
    }
  }, [loadData, isCompanyContextReady]);

  // Handlers
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ type, message, visible: true });
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  };

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setFilters(newFilters as AccountsReceivableFilters);
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 0 }));
    loadData();
  };

  const handleClearFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: AccountsReceivableDTO) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleReceipt = (item: AccountsReceivableDTO) => {
    setSelectedItem(item);
    setIsReceiptFormOpen(true);
  };

  const handleDelete = async (item: AccountsReceivableDTO) => {
    if (!window.confirm(`Deseja realmente excluir a conta "${item.receivableDescription}"?`)) {
      return;
    }

    try {
      setErrorLoading(true);
      await accountsReceivableService.delete(item.id);
      showNotification('success', 'Conta excluída com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      showError(error, 'Exclusão de conta a receber');
      showNotification('error', 'Erro ao excluir conta');
    } finally {
      setErrorLoading(false);
    }
  };

  const handleFormSubmit = async (formData: unknown) => {
    try {
      setErrorLoading(true);
      if (selectedItem) {
        await accountsReceivableService.update(selectedItem.id, formData as Parameters<typeof accountsReceivableService.update>[1]);
        showNotification('success', 'Conta atualizada com sucesso');
      } else {
        await accountsReceivableService.create(formData as Parameters<typeof accountsReceivableService.create>[0]);
        showNotification('success', 'Conta criada com sucesso');
      }
      setIsFormOpen(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      showError(error, 'Criação/atualização de conta a receber');
      showNotification('error', 'Erro ao salvar conta');
      throw error;
    } finally {
      setErrorLoading(false);
    }
  };

  const handleReceiptSubmit = async (receiptData: unknown) => {
    if (!selectedItem) return;

    try {
      setErrorLoading(true);
      await accountsReceivableService.processReceipt(selectedItem.id, receiptData as Parameters<typeof accountsReceivableService.processReceipt>[1]);
      showNotification('success', 'Recebimento processado com sucesso');
      setIsReceiptFormOpen(false);
      loadData();
    } catch (error) {
      console.error('Erro ao processar recebimento:', error);
      showError(error, 'Processamento de recebimento');
      showNotification('error', 'Erro ao processar recebimento');
      throw error;
    } finally {
      setErrorLoading(false);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedItem(null);
  };

  const handleReceiptFormClose = () => {
    setIsReceiptFormOpen(false);
    setSelectedItem(null);
  };


  // Definição das colunas
  const columns: ColumnDefinition<AccountsReceivableDTO>[] = [
    {
      key: 'receivableCode',
      header: 'Código',
      sortable: true,
      width: '100px',
    },
    {
      key: 'receivableDescription',
      header: 'Descrição',
      sortable: true,
    },
    {
      key: 'customerName',
      header: 'Cliente',
      sortable: true,
    },
    {
      key: 'originalAmount',
      header: 'Valor',
      sortable: true,
      align: 'right',
      width: '120px',
      render: (_value: unknown, row: AccountsReceivableDTO) => formatCurrency(row.originalAmount),
    },
    {
      key: 'dueDate',
      header: 'Vencimento',
      sortable: true,
      width: '110px',
      render: (_value: unknown, row: AccountsReceivableDTO) => formatDate(row.dueDate),
    },
    {
      key: 'receiptStatus',
      header: 'Status',
      sortable: true,
      width: '100px',
      render: (_value: unknown, row: AccountsReceivableDTO) => (
        <StatusBadge
          status={row.receiptStatus}
          label={ReceivableStatusLabels[row.receiptStatus] || row.receiptStatus}
          color={ReceivableStatusColors[row.receiptStatus]}
        />
      ),
    },
    {
      key: 'priorityLevel',
      header: 'Prioridade',
      sortable: true,
      width: '100px',
      render: (_value: unknown, row: AccountsReceivableDTO) => (
        <StatusBadge
          status={row.priorityLevel}
          label={PriorityLabels[row.priorityLevel] || row.priorityLevel}
          color={PriorityColors[row.priorityLevel]}
          size="small"
        />
      ),
    },
  ];

  // Definição das ações
  const actions: ActionDefinition<AccountsReceivableDTO>[] = [
    {
      label: 'Editar',
      icon: '✏️',
      variant: 'secondary',
      onClick: handleEdit,
    },
    {
      label: 'Receber',
      icon: '💵',
      variant: 'primary',
      onClick: handleReceipt,
      show: (item) => item.receiptStatus !== ReceivableStatus.RECEIVED && item.receiptStatus !== ReceivableStatus.CANCELLED,
    },
    {
      label: 'Excluir',
      icon: '🗑️',
      variant: 'danger',
      onClick: handleDelete,
      show: (item) => item.receiptStatus === ReceivableStatus.PENDING,
    },
  ];

  // Definição dos filtros
  const filterDefinitions: FilterDefinition[] = [
    {
      key: 'searchText',
      label: 'Buscar',
      type: 'text',
      placeholder: 'Código, descrição ou cliente...',
    },
    {
      key: 'receiptStatus',
      label: 'Status',
      type: 'select',
      options: Object.entries(ReceivableStatusLabels).map(([value, label]) => ({ value, label })),
    },
    {
      key: 'priorityLevel',
      label: 'Prioridade',
      type: 'select',
      options: Object.entries(PriorityLabels).map(([value, label]) => ({ value, label })),
    },
    {
      key: 'dateRange',
      label: 'Período de Vencimento',
      type: 'dateRange',
    },
  ];

  return (
    <div className="accounts-receivable-page">
      <div className="page-header">
        <h1>Contas a Receber</h1>
        <button className="btn-primary" onClick={handleCreate}>
          + Nova Conta
        </button>
      </div>

      <FilterBar
        filters={filterDefinitions}
        values={filters as Record<string, unknown>}
        onChange={handleFilterChange}
        onSearch={handleSearch}
        onClear={handleClearFilters}
        loading={loading}
      />

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSort={handleSort}
        sortField={sortField}
        sortDirection={sortDirection}
        actions={actions}
        onRowClick={handleEdit}
        emptyMessage="Nenhuma conta a receber encontrada"
      />

      <FormModal
        isOpen={isFormOpen}
        title={selectedItem ? 'Editar Conta a Receber' : 'Nova Conta a Receber'}
        onClose={handleFormClose}
      >
        <AccountsReceivableForm
          initialData={selectedItem}
          onSubmit={handleFormSubmit}
          onCancel={handleFormClose}
        />
      </FormModal>

      <FormModal
        isOpen={isReceiptFormOpen}
        title="Processar Recebimento"
        onClose={handleReceiptFormClose}
      >
        <ReceiptForm
          accountReceivable={selectedItem}
          onSubmit={handleReceiptSubmit}
        />
      </FormModal>

      <Notification
        type={notification.type}
        message={notification.message}
        visible={notification.visible}
        onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
      />

      <ErrorNotification
        error={error}
        onClose={clearError}
      />
    </div>
  );
};

export default AccountsReceivablePage;
