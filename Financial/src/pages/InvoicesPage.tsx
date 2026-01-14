import React, { useState, useEffect, useCallback } from 'react';
import type { InvoiceDTO, InvoiceFilters, InvoiceType, InvoiceStatus } from '../types/invoice';
import { INVOICE_TYPE_LABELS, INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '../types/invoice';
import type { ColumnDefinition } from '../types/common';
import { invoiceService } from '../services/invoiceService';
import { companyService } from '../services/companyService';
import DataTable from '../components/ui/DataTable';
import { FormModal, Notification, StatusBadge } from '../components/ui';
import InvoiceForm from '../components/forms/InvoiceForm';
import { formatCurrency, formatDate } from '../utils/formatting';
import './InvoicesPage.css';

const InvoicesPage: React.FC = () => {
  // Estado dos dados
  const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompanyContextReady, setIsCompanyContextReady] = useState(false);
  const [filters, setFilters] = useState<InvoiceFilters>({});
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  // Estado dos modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InvoiceDTO | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Estado de notificação
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    visible: boolean;
  }>({ type: 'info', message: '', visible: false });

  // Carregar dados
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await invoiceService.findAll(filters, {
        page: pagination.page,
        size: pagination.size,
      });
      setInvoices(result.content);
      setPagination(prev => ({
        ...prev,
        totalElements: result.totalElements,
        totalPages: result.totalPages,
      }));
    } catch (error) {
      console.error('Erro ao carregar notas fiscais:', error);
      showNotification('error', 'Erro ao carregar notas fiscais');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.size]);

  // Inicializar contexto da empresa
  useEffect(() => {
    const initCompanyContext = async () => {
      try {
        const storedCompanyId = sessionStorage.getItem('selectedCompanyId');
        if (!storedCompanyId) {
          console.log('🔍 Contexto de empresa não encontrado. Buscando empresas...');
          const response = await companyService.getAllCompanies();
          if (response.content && response.content.length > 0) {
            const activeCompany = response.content.find(c => c.isActive) || response.content[0];
            sessionStorage.setItem('selectedCompanyId', activeCompany.id);
            console.log('✅ Contexto de empresa definido automaticamente:', activeCompany.tradeName || activeCompany.corporateName);
          } else {
            console.warn('⚠️ Nenhuma empresa encontrada para o usuário.');
          }
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar contexto de empresa:', error);
      } finally {
        setIsCompanyContextReady(true);
      }
    };
    initCompanyContext();
  }, []);

  useEffect(() => {
    if (isCompanyContextReady) {
      loadData();
    }
  }, [loadData, isCompanyContextReady]);

  // Handlers
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ type, message, visible: true });
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: InvoiceDTO) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleCancel = async (item: InvoiceDTO) => {
    if (!window.confirm(`Deseja realmente cancelar a nota fiscal "${item.invoiceNumber}"?`)) {
      return;
    }

    try {
      await invoiceService.cancel(item.id);
      showNotification('success', 'Nota fiscal cancelada com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao cancelar nota fiscal:', error);
      showNotification('error', 'Erro ao cancelar nota fiscal');
    }
  };

  const handleIssue = async (item: InvoiceDTO) => {
    if (!window.confirm(`Deseja emitir a nota fiscal "${item.invoiceNumber}"?`)) {
      return;
    }

    try {
      await invoiceService.issue(item.id);
      showNotification('success', 'Nota fiscal emitida com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao emitir nota fiscal:', error);
      showNotification('error', 'Erro ao emitir nota fiscal');
    }
  };

  const handleFormSubmit = async (formData: unknown) => {
    try {
      setFormLoading(true);
      if (selectedItem) {
        await invoiceService.update(selectedItem.id, formData as Parameters<typeof invoiceService.update>[1]);
        showNotification('success', 'Nota fiscal atualizada com sucesso');
      } else {
        await invoiceService.create(formData as Parameters<typeof invoiceService.create>[0]);
        showNotification('success', 'Nota fiscal criada com sucesso');
      }
      setIsFormOpen(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar nota fiscal:', error);
      showNotification('error', 'Erro ao salvar nota fiscal');
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

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as InvoiceType | '';
    setFilters({ ...filters, invoiceType: value || undefined });
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as InvoiceStatus | '';
    setFilters({ ...filters, status: value || undefined });
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // Definição das colunas
  const columns: ColumnDefinition<InvoiceDTO>[] = [
    {
      key: 'invoiceNumber',
      header: 'Número',
      render: (_, row) => `${row.invoiceNumber}/${row.series}`,
      width: '120px',
    },
    {
      key: 'issueDate',
      header: 'Data',
      render: (value) => formatDate(value as string),
      width: '100px',
    },
    {
      key: 'invoiceType',
      header: 'Tipo',
      render: (value) => INVOICE_TYPE_LABELS[value as InvoiceType],
      width: '100px',
    },
    {
      key: 'customerName',
      header: 'Cliente/Fornecedor',
      render: (_, row) => row.customerName || row.supplierName || '-',
    },
    {
      key: 'totalAmount',
      header: 'Valor Total',
      render: (value) => formatCurrency(value as number),
      align: 'right',
      width: '130px',
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <StatusBadge
          status={value as string}
          label={INVOICE_STATUS_LABELS[value as InvoiceStatus]}
          color={INVOICE_STATUS_COLORS[value as InvoiceStatus]}
        />
      ),
      width: '100px',
    },
  ];

  // Ações da tabela
  const actions = [
    {
      label: 'Emitir',
      icon: '✓',
      onClick: handleIssue,
      show: (row: InvoiceDTO) => row.status === 'DRAFT',
      variant: 'primary' as const,
    },
    {
      label: 'Editar',
      icon: '✏️',
      onClick: handleEdit,
      show: (row: InvoiceDTO) => row.status === 'DRAFT',
    },
    {
      label: 'Cancelar',
      icon: '🗑️',
      onClick: handleCancel,
      show: (row: InvoiceDTO) => row.status !== 'CANCELLED',
      variant: 'danger' as const,
    },
  ];

  return (
    <div className="invoices-page">
      <div className="page-header">
        <h1>Notas Fiscais</h1>
        <button className="btn-primary" onClick={handleCreate}>
          + Nova Nota Fiscal
        </button>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Buscar notas fiscais..."
          value={filters.searchText || ''}
          onChange={handleFilterChange}
          className="search-input"
        />
        <select
          value={filters.invoiceType || ''}
          onChange={handleTypeFilterChange}
          className="type-filter"
        >
          <option value="">Todos os tipos</option>
          {Object.entries(INVOICE_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={filters.status || ''}
          onChange={handleStatusFilterChange}
          className="status-filter"
        >
          <option value="">Todos os status</option>
          {Object.entries(INVOICE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <DataTable
        data={invoices}
        columns={columns}
        actions={actions}
        loading={loading}
        pagination={{
          page: pagination.page,
          size: pagination.size,
          totalElements: pagination.totalElements,
          totalPages: pagination.totalPages,
        }}
        onPageChange={handlePageChange}
        emptyMessage="Nenhuma nota fiscal encontrada"
      />

      <FormModal
        isOpen={isFormOpen}
        title={selectedItem ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}
        onClose={handleFormClose}
        onSubmit={() => { }}
        loading={formLoading}
        showFooter={false}
        size="large"
      >
        <InvoiceForm
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

export default InvoicesPage;
