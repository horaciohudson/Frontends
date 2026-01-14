import React, { useState, useEffect, useCallback } from 'react';
import type { LedgerEntryDTO, LedgerEntryFilters } from '../types/ledgerEntry';
import { LEDGER_ENTRY_STATUS_LABELS, LEDGER_ENTRY_STATUS_COLORS } from '../types/ledgerEntry';
import type { ColumnDefinition } from '../types/common';
import { ledgerEntryService } from '../services/ledgerEntryService';
import { companyService } from '../services/companyService';
import DataTable from '../components/ui/DataTable';
import { FormModal, Notification, StatusBadge } from '../components/ui';
import LedgerEntryForm from '../components/forms/LedgerEntryForm';
import { formatCurrency, formatDate } from '../utils/formatting';
import './LedgerEntriesPage.css';

const LedgerEntriesPage: React.FC = () => {
  // Estado dos dados
  const [entries, setEntries] = useState<LedgerEntryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LedgerEntryFilters>({});
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  // Estado dos modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LedgerEntryDTO | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Estado de notificação
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    visible: boolean;
  }>({ type: 'info', message: '', visible: false });

  // Estado para controlar se o contexto de empresa foi inicializado
  const [companyContextReady, setCompanyContextReady] = useState(false);
  const [companies, setCompanies] = useState<Array<{ id: string; corporateName: string; cnpj?: string }>>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // Inicializar contexto de empresa
  useEffect(() => {
    const initCompanyContext = async () => {
      try {
        const response = await companyService.getAllCompanies();
        if (response.content && response.content.length > 0) {
          setCompanies(response.content);

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
        console.error('Erro ao inicializar contexto de empresa:', error);
      } finally {
        setCompanyContextReady(true);
      }
    };

    initCompanyContext();
  }, []);

  // Carregar dados
  const loadData = useCallback(async () => {
    if (!companyContextReady || !selectedCompanyId) return;

    try {
      setLoading(true);
      const result = await ledgerEntryService.findAll(filters, {
        page: pagination.page,
        size: pagination.size,
      });
      setEntries(result.content);
      setPagination(prev => ({
        ...prev,
        totalElements: result.totalElements,
        totalPages: result.totalPages,
      }));
    } catch (error) {
      console.error('Erro ao carregar lançamentos:', error);
      showNotification('error', 'Erro ao carregar lançamentos');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.size, companyContextReady, selectedCompanyId]);

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
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: LedgerEntryDTO) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (item: LedgerEntryDTO) => {
    if (!window.confirm(`Deseja realmente cancelar o lançamento "${item.description}"?`)) {
      return;
    }

    try {
      await ledgerEntryService.cancel(item.id);
      showNotification('success', 'Lançamento cancelado com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao cancelar lançamento:', error);
      showNotification('error', 'Erro ao cancelar lançamento');
    }
  };

  const handlePost = async (item: LedgerEntryDTO) => {
    if (!window.confirm(`Deseja lançar "${item.description}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await ledgerEntryService.post(item.id);
      showNotification('success', 'Lançamento efetivado com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao efetivar lançamento:', error);
      showNotification('error', 'Erro ao efetivar lançamento');
    }
  };

  const handleFormSubmit = async (formData: unknown) => {
    try {
      setFormLoading(true);
      if (selectedItem) {
        // Edição não implementada nesta versão
        showNotification('warning', 'Edição de lançamentos não está disponível nesta versão');
      } else {
        // Criar lançamento duplo
        await ledgerEntryService.createDoubleEntry(formData as Parameters<typeof ledgerEntryService.createDoubleEntry>[0]);
        showNotification('success', 'Lançamento criado com sucesso');
      }
      setIsFormOpen(false);
      loadData();
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchText: e.target.value });
  };

  const handleDateFilterChange = (field: 'startDate' | 'endDate', value: string) => {
    setFilters({ ...filters, [field]: value });
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // Definição das colunas
  const columns: ColumnDefinition<LedgerEntryDTO>[] = [
    {
      key: 'entryDate',
      header: 'Data',
      render: (value) => formatDate(value as string),
      width: '100px',
    },
    {
      key: 'description',
      header: 'Descrição',
    },
    {
      key: 'ledgerAccountCode',
      header: 'Conta',
      render: (_, row) => (
        <span title={row.ledgerAccountName}>
          {row.ledgerAccountCode}
        </span>
      ),
      width: '120px',
    },
    {
      key: 'entryType',
      header: 'Tipo',
      render: (value) => (
        <span style={{
          fontWeight: 'bold',
          color: value === 'DEBIT' ? '#dc2626' : '#16a34a'
        }}>
          {value === 'DEBIT' ? 'D' : 'C'}
        </span>
      ),
      width: '60px',
    },
    {
      key: 'amount',
      header: 'Valor',
      render: (value) => formatCurrency(value as number),
      align: 'right',
      width: '120px',
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <StatusBadge
          status={value as string}
          label={LEDGER_ENTRY_STATUS_LABELS[value as keyof typeof LEDGER_ENTRY_STATUS_LABELS]}
          color={LEDGER_ENTRY_STATUS_COLORS[value as keyof typeof LEDGER_ENTRY_STATUS_COLORS]}
        />
      ),
      width: '100px',
    },
  ];

  // Ações da tabela
  const actions = [
    {
      label: 'Lançar',
      icon: '✓',
      onClick: handlePost,
      show: (row: LedgerEntryDTO) => row.status === 'DRAFT',
      variant: 'primary' as const,
    },
    {
      label: 'Editar',
      icon: '✏️',
      onClick: handleEdit,
      show: (row: LedgerEntryDTO) => row.status === 'DRAFT',
    },
    {
      label: 'Cancelar',
      icon: '🗑️',
      onClick: handleDelete,
      show: (row: LedgerEntryDTO) => row.status === 'DRAFT',
      variant: 'danger' as const,
    },
  ];

  return (
    <div className="ledger-entries-page">
      <div className="page-header">
        <h1>Lançamentos Contábeis</h1>
        <button className="btn-primary" onClick={handleCreate}>
          + Novo Lançamento
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
          placeholder="Buscar lançamentos..."
          value={filters.searchText || ''}
          onChange={handleFilterChange}
          className="search-input"
        />
        <div className="date-filters">
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
            className="date-input"
          />
          <span>até</span>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
            className="date-input"
          />
        </div>
      </div>

      <DataTable
        data={entries}
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
        <LedgerEntryForm
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

export default LedgerEntriesPage;
