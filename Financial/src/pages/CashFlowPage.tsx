import React, { useState, useEffect, useCallback } from 'react';
import type { CashFlowDTO, CashFlowFilters, CashFlowSummary } from '../types/cashFlow';
import type { ColumnDefinition, ActionDefinition, PaginationState, FilterDefinition } from '../types/common';
import { CashFlowStatus, CashFlowStatusLabels, CashFlowStatusColors, CashFlowType, CashFlowTypeLabels, CashFlowTypeColors } from '../types/enums';
import { cashFlowService } from '../services/cashFlowService';
import { companyService } from '../services/companyService';
import { DataTable, FilterBar, StatusBadge, FormModal, Notification, DateRangePicker } from '../components/ui';
import { formatCurrency, formatDate } from '../utils/formatting';
import CashFlowForm from '../components/forms/CashFlowForm';
import CashFlowSummaryCard from '../components/CashFlowSummary';
import './CashFlowPage.css';

const CashFlowPage: React.FC = () => {
  // Estado dos dados
  const [data, setData] = useState<CashFlowDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompanyContextReady, setIsCompanyContextReady] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  });

  // Estado dos filtros
  const [filters, setFilters] = useState<CashFlowFilters>({});
  const [sortField, setSortField] = useState('flowDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Estado do período
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  // Estado do resumo
  const [summary, setSummary] = useState<CashFlowSummary>({
    totalInflows: 0,
    totalOutflows: 0,
    balance: 0,
    pendingInflows: 0,
    pendingOutflows: 0,
  });

  // Estado dos modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CashFlowDTO | null>(null);
  const [formLoading, setFormLoading] = useState(false);

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
      const response = await cashFlowService.findAll({
        page: pagination.page,
        size: pagination.size,
        sortBy: sortField,
        sortDir: sortDirection,
        startDate,
        endDate,
        ...filters,
      });
      setData(response.content);
      setPagination(prev => ({
        ...prev,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
      }));
    } catch (error) {
      console.error('Erro ao carregar fluxo de caixa:', error);
      showNotification('error', 'Erro ao carregar fluxo de caixa');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, sortField, sortDirection, startDate, endDate, filters, isCompanyContextReady]);

  const loadSummary = useCallback(async () => {
    try {
      const summaryData = await cashFlowService.getSummary(startDate, endDate);
      setSummary(summaryData);
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
      // Calcular resumo localmente se a API falhar
      const inflows = data.filter(d => d.flowType === CashFlowType.INFLOW).reduce((sum, d) => sum + d.amount, 0);
      const outflows = data.filter(d => d.flowType === CashFlowType.OUTFLOW).reduce((sum, d) => sum + d.amount, 0);
      setSummary({
        totalInflows: inflows,
        totalOutflows: outflows,
        balance: inflows - outflows,
        pendingInflows: 0,
        pendingOutflows: 0,
      });
    }
  }, [startDate, endDate, data]);

  useEffect(() => {
    if (isCompanyContextReady) {
      loadData();
    }
  }, [loadData, isCompanyContextReady]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

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
    setFilters(newFilters as CashFlowFilters);
  };

  const handleDateRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setPagination(prev => ({ ...prev, page: 0 }));
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

  const handleEdit = (item: CashFlowDTO) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleMarkAsPaid = async (item: CashFlowDTO) => {
    try {
      await cashFlowService.markAsPaid(item.id);
      showNotification('success', 'Lançamento marcado como pago');
      loadData();
      loadSummary();
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      showNotification('error', 'Erro ao marcar como pago');
    }
  };

  const handleDelete = async (item: CashFlowDTO) => {
    if (!window.confirm(`Deseja realmente excluir o lançamento "${item.description}"?`)) {
      return;
    }

    try {
      await cashFlowService.delete(item.id);
      showNotification('success', 'Lançamento excluído com sucesso');
      loadData();
      loadSummary();
    } catch (error) {
      console.error('Erro ao excluir lançamento:', error);
      showNotification('error', 'Erro ao excluir lançamento');
    }
  };

  const handleFormSubmit = async (formData: unknown) => {
    try {
      setFormLoading(true);
      if (selectedItem) {
        await cashFlowService.update(selectedItem.id, formData as Parameters<typeof cashFlowService.update>[1]);
        showNotification('success', 'Lançamento atualizado com sucesso');
      } else {
        await cashFlowService.create(formData as Parameters<typeof cashFlowService.create>[0]);
        showNotification('success', 'Lançamento criado com sucesso');
      }
      setIsFormOpen(false);
      loadData();
      loadSummary();
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error);
      showNotification('error', 'Erro ao salvar lançamento');
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedItem(null);
  };


  // Definição das colunas
  const columns: ColumnDefinition<CashFlowDTO>[] = [
    {
      key: 'flowDate',
      header: 'Data',
      sortable: true,
      width: '100px',
      render: (_value: unknown, row: CashFlowDTO) => formatDate(row.flowDate),
    },
    {
      key: 'flowType',
      header: 'Tipo',
      sortable: true,
      width: '100px',
      render: (_value: unknown, row: CashFlowDTO) => (
        <StatusBadge
          status={row.flowType}
          label={CashFlowTypeLabels[row.flowType] || row.flowType}
          color={CashFlowTypeColors[row.flowType]}
        />
      ),
    },
    {
      key: 'description',
      header: 'Descrição',
      sortable: true,
    },
    {
      key: 'amount',
      header: 'Valor',
      sortable: true,
      align: 'right',
      width: '120px',
      render: (_value: unknown, row: CashFlowDTO) => (
        <span className={row.flowType === CashFlowType.INFLOW ? 'amount-inflow' : 'amount-outflow'}>
          {row.flowType === CashFlowType.OUTFLOW ? '-' : '+'}{formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Categoria',
      sortable: true,
      width: '150px',
    },
    {
      key: 'flowStatus',
      header: 'Status',
      sortable: true,
      width: '100px',
      render: (_value: unknown, row: CashFlowDTO) => (
        <StatusBadge
          status={row.flowStatus}
          label={CashFlowStatusLabels[row.flowStatus as CashFlowStatus] || row.flowStatus}
          color={CashFlowStatusColors[row.flowStatus as CashFlowStatus]}
        />
      ),
    },
  ];

  // Definição das ações
  const actions: ActionDefinition<CashFlowDTO>[] = [
    {
      label: 'Editar',
      icon: '✏️',
      variant: 'secondary',
      onClick: handleEdit,
    },
    {
      label: 'Pagar',
      icon: '✓',
      variant: 'primary',
      onClick: handleMarkAsPaid,
      show: (item) => item.flowStatus === CashFlowStatus.PENDING,
    },
    {
      label: 'Excluir',
      icon: '🗑️',
      variant: 'danger',
      onClick: handleDelete,
      show: (item) => item.flowStatus === CashFlowStatus.PENDING,
    },
  ];

  // Definição dos filtros
  const filterDefinitions: FilterDefinition[] = [
    {
      key: 'searchText',
      label: 'Buscar',
      type: 'text',
      placeholder: 'Descrição ou beneficiário...',
    },
    {
      key: 'flowType',
      label: 'Tipo',
      type: 'select',
      options: Object.entries(CashFlowTypeLabels).map(([value, label]) => ({ value, label: String(label) })),
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: Object.entries(CashFlowStatusLabels).map(([value, label]) => ({ value, label: String(label) })),
    },
  ];

  return (
    <div className="cash-flow-page">
      <div className="page-header">
        <h1>Fluxo de Caixa</h1>
        <button className="btn-primary" onClick={handleCreate}>
          + Novo Lançamento
        </button>
      </div>

      <div className="cash-flow-controls">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateRangeChange}
        />
      </div>

      <CashFlowSummaryCard summary={summary} />

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
        emptyMessage="Nenhum lançamento encontrado"
      />

      <FormModal
        isOpen={isFormOpen}
        title={selectedItem ? 'Editar Lançamento' : 'Novo Lançamento'}
        onClose={handleFormClose}
        onSubmit={() => { }}
        loading={formLoading}
        showFooter={false}
      >
        <CashFlowForm
          initialData={selectedItem}
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

export default CashFlowPage;
