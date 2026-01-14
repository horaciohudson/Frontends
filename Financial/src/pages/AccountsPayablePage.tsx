import React, { useState, useEffect, useCallback } from 'react';
import type { AccountsPayableDTO, AccountsPayableFilters } from '../types/accountsPayable';
import type { ColumnDefinition, ActionDefinition, PaginationState, FilterDefinition } from '../types/common';
import { PaymentStatus, PaymentStatusLabels, PaymentStatusColors } from '../types/enums';
import { accountsPayableService } from '../services/accountsPayableService';
import { companyService } from '../services/companyService'; // Importar companyService
import { DataTable, FilterBar, StatusBadge, FormModal, Notification, ErrorNotification } from '../components/ui';
import { formatCurrency, formatDate } from '../utils/formatting';
import { AccountsPayableForm, PaymentForm } from '../components/forms';
import { useErrorHandler } from '../hooks/useErrorHandler';
import './AccountsPayablePage.css';

const AccountsPayablePage: React.FC = () => {
  // Hook para tratamento de erros
  const { error, showError, clearError, setLoading: setErrorLoading } = useErrorHandler();

  // Estado dos dados
  const [data, setData] = useState<AccountsPayableDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompanyContextReady, setIsCompanyContextReady] = useState(false); // Novo estado
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  });

  // Estado dos filtros
  const [filters, setFilters] = useState<AccountsPayableFilters>({});
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Estado dos modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AccountsPayableDTO | null>(null);

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
      clearError(); // Limpar erros anteriores

      // Temporariamente removendo ordenação até o backend ser corrigido
      const response = await accountsPayableService.findAll({
        page: pagination.page,
        size: pagination.size,
        // sortBy: 'id', // Removido temporariamente
        // sortDir: sortDirection, // Removido temporariamente
        ...filters,
      });

      // Verificar se a resposta é válida
      if (response && response.content) {


        setData(response.content);
        setPagination(prev => ({
          ...prev,
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0,
        }));
      } else {
        console.warn('⚠️ Resposta da API inválida:', response);
        setData([]); // Definir array vazio como fallback
        setPagination(prev => ({
          ...prev,
          totalElements: 0,
          totalPages: 0,
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar contas a pagar:', error);
      showError(error, 'Carregamento de contas a pagar');
      showNotification('error', 'Erro ao carregar contas a pagar');

      // Garantir que data seja sempre um array em caso de erro
      setData([]);
      setPagination(prev => ({
        ...prev,
        totalElements: 0,
        totalPages: 0,
      }));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, sortField, sortDirection, filters, clearError, showError, isCompanyContextReady]);

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
    setFilters(newFilters as AccountsPayableFilters);
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

  const handleEdit = (item: AccountsPayableDTO) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handlePayment = (item: AccountsPayableDTO) => {
    setSelectedItem(item);
    setIsPaymentFormOpen(true);
  };

  const handleDelete = async (item: AccountsPayableDTO) => {
    if (!window.confirm(`Deseja realmente excluir a conta "${item.payableDescription}"?`)) {
      return;
    }

    try {
      setErrorLoading(true);
      await accountsPayableService.delete(item.id);
      showNotification('success', 'Conta excluída com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      showError(error, 'Exclusão de conta a pagar');
      showNotification('error', 'Erro ao excluir conta');
    } finally {
      setErrorLoading(false);
    }
  };

  const handleFormSubmit = async (formData: unknown) => {
    try {
      setErrorLoading(true);
      if (selectedItem) {
        await accountsPayableService.update(selectedItem.id, formData as Parameters<typeof accountsPayableService.update>[1]);
        showNotification('success', 'Conta atualizada com sucesso');
      } else {
        await accountsPayableService.create(formData as Parameters<typeof accountsPayableService.create>[0]);
        showNotification('success', 'Conta criada com sucesso');
      }
      setIsFormOpen(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      showError(error, 'Criação/atualização de conta a pagar');
      showNotification('error', 'Erro ao salvar conta');
      throw error;
    } finally {
      setErrorLoading(false);
    }
  };

  const handlePaymentSubmit = async (paymentData: unknown) => {
    if (!selectedItem) return;

    try {
      setErrorLoading(true);
      await accountsPayableService.processPayment(selectedItem.id, paymentData as Parameters<typeof accountsPayableService.processPayment>[1]);
      showNotification('success', 'Pagamento processado com sucesso');
      setIsPaymentFormOpen(false);
      loadData();
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      showError(error, 'Processamento de pagamento');
      showNotification('error', 'Erro ao processar pagamento');
      throw error;
    } finally {
      setErrorLoading(false);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedItem(null);
  };

  const handlePaymentFormClose = () => {
    setIsPaymentFormOpen(false);
    setSelectedItem(null);
  };


  // Definição das colunas
  const columns: ColumnDefinition<AccountsPayableDTO>[] = [
    {
      key: 'payableCode',
      header: 'Código',
      sortable: true,
      width: '100px',
    },
    {
      key: 'payableDescription',
      header: 'Descrição',
      sortable: true,
    },
    {
      key: 'supplierName',
      header: 'Fornecedor',
      sortable: true,
    },
    {
      key: 'categoryName',
      header: 'Categoria',
      sortable: true,
      render: (_value: unknown, row: AccountsPayableDTO) => row.categoryName || row.category || '-',
    },
    {
      key: 'costCenterName',
      header: 'Centro de Custo',
      sortable: true,
      render: (_value: unknown, row: AccountsPayableDTO) => row.costCenterName || row.costCenter || '-',
    },
    {
      key: 'originalAmount',
      header: 'Valor',
      sortable: true,
      align: 'right',
      width: '120px',
      render: (_value: unknown, row: AccountsPayableDTO) => formatCurrency(row.originalAmount),
    },
    {
      key: 'dueDate',
      header: 'Vencimento',
      sortable: true,
      width: '110px',
      render: (_value: unknown, row: AccountsPayableDTO) => formatDate(row.dueDate),
    },
    {
      key: 'paymentStatus',
      header: 'Status',
      sortable: true,
      width: '100px',
      render: (_value: unknown, row: AccountsPayableDTO) => (
        <StatusBadge
          status={row.paymentStatus}
          label={PaymentStatusLabels[row.paymentStatus] || row.paymentStatus}
          color={PaymentStatusColors[row.paymentStatus]}
        />
      ),
    },
  ];

  // Definição das ações
  const actions: ActionDefinition<AccountsPayableDTO>[] = [
    {
      label: 'Editar',
      icon: '✏️',
      variant: 'secondary',
      onClick: handleEdit,
    },
    {
      label: 'Pagar',
      icon: '💰',
      variant: 'primary',
      onClick: handlePayment,
      show: (item) => item.paymentStatus !== PaymentStatus.PAID && item.paymentStatus !== PaymentStatus.CANCELLED,
    },
    {
      label: 'Excluir',
      icon: '🗑️',
      variant: 'danger',
      onClick: handleDelete,
      show: (item) => item.paymentStatus === PaymentStatus.PENDING,
    },
  ];

  // Definição dos filtros
  const filterDefinitions: FilterDefinition[] = [
    {
      key: 'searchText',
      label: 'Buscar',
      type: 'text',
      placeholder: 'Código, descrição ou fornecedor...',
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: Object.entries(PaymentStatusLabels).map(([value, label]) => ({ value, label })),
    },
    {
      key: 'dateRange',
      label: 'Período de Vencimento',
      type: 'dateRange',
    },
  ];

  return (
    <div className="accounts-payable-page">
      <div className="page-header">
        <h1>Contas a Pagar</h1>
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
        emptyMessage="Nenhuma conta a pagar encontrada"
      />

      <FormModal
        isOpen={isFormOpen}
        title={selectedItem ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}
        onClose={handleFormClose}
      >
        <AccountsPayableForm
          initialData={selectedItem}
          onSubmit={handleFormSubmit}
          onCancel={handleFormClose}
        />
      </FormModal>

      <FormModal
        isOpen={isPaymentFormOpen}
        title="Processar Pagamento"
        onClose={handlePaymentFormClose}
      >
        <PaymentForm
          accountPayable={selectedItem}
          onSubmit={handlePaymentSubmit}
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

export default AccountsPayablePage;
