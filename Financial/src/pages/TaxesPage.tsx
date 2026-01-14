import React, { useState, useEffect, useCallback } from 'react';
import type { TaxDTO, TaxFilters, TaxCategory } from '../types/tax';
import { TAX_CATEGORY_LABELS } from '../types/tax';
import type { ColumnDefinition } from '../types/common';
import { taxService } from '../services/taxService';
import { companyService } from '../services/companyService';
import DataTable from '../components/ui/DataTable';
import { FormModal, Notification, StatusBadge } from '../components/ui';
import TaxForm from '../components/forms/TaxForm';
import './TaxesPage.css';

const TaxesPage: React.FC = () => {
  // Estado dos dados
  const [taxes, setTaxes] = useState<TaxDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaxFilters>({});

  // Estado dos modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TaxDTO | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Estado de notificação
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    visible: boolean;
  }>({ type: 'info', message: '', visible: false });

  // Estado para controlar se o contexto de empresa foi inicializado
  const [companyContextReady, setCompanyContextReady] = useState(false);

  // Inicializar contexto de empresa
  useEffect(() => {
    const initCompanyContext = async () => {
      try {
        const response = await companyService.getAllCompanies();
        if (response.content && response.content.length > 0) {
          const selectedCompanyId = sessionStorage.getItem('selectedCompanyId');
          if (!selectedCompanyId) {
            sessionStorage.setItem('selectedCompanyId', response.content[0].id);
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
    if (!companyContextReady) return;

    try {
      setLoading(true);
      const data = await taxService.findAll(filters);
      setTaxes(data);
    } catch (error) {
      console.error('Erro ao carregar impostos:', error);
      showNotification('error', 'Erro ao carregar impostos');
    } finally {
      setLoading(false);
    }
  }, [filters, companyContextReady]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ type, message, visible: true });
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: TaxDTO) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (item: TaxDTO) => {
    if (!window.confirm(`Deseja realmente desativar o imposto "${item.taxName}"?`)) {
      return;
    }

    try {
      await taxService.deactivate(item.id);
      showNotification('success', 'Imposto desativado com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao desativar imposto:', error);
      showNotification('error', 'Erro ao desativar imposto');
    }
  };

  const handleFormSubmit = async (formData: unknown) => {
    try {
      setFormLoading(true);
      if (selectedItem) {
        await taxService.update(selectedItem.id, formData as Parameters<typeof taxService.update>[1]);
        showNotification('success', 'Imposto atualizado com sucesso');
      } else {
        await taxService.create(formData as Parameters<typeof taxService.create>[0]);
        showNotification('success', 'Imposto criado com sucesso');
      }
      setIsFormOpen(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar imposto:', error);
      showNotification('error', 'Erro ao salvar imposto');
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
    const value = e.target.value as TaxCategory | '';
    setFilters({ ...filters, taxType: value || undefined });
  };

  // Definição das colunas
  const columns: ColumnDefinition<TaxDTO>[] = [
    {
      key: 'taxCode',
      header: 'Código',
      width: '120px',
    },
    {
      key: 'taxName',
      header: 'Nome',
    },
    {
      key: 'defaultRate',
      header: 'Alíquota',
      render: (value) => `${(value as number).toFixed(2)}%`,
      align: 'right',
      width: '100px',
    },
    {
      key: 'taxCategory',
      header: 'Categoria',
      render: (value) => TAX_CATEGORY_LABELS[value as TaxCategory],
      width: '120px',
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value) => (
        <StatusBadge
          status={value ? 'ACTIVE' : 'INACTIVE'}
          label={value ? 'Ativo' : 'Inativo'}
          color={value ? '#22c55e' : '#ef4444'}
        />
      ),
      width: '100px',
    },
  ];

  // Ações da tabela
  const actions = [
    {
      label: 'Editar',
      icon: '✏️',
      onClick: handleEdit,
    },
    {
      label: 'Desativar',
      icon: '🗑️',
      onClick: handleDelete,
      show: (row: TaxDTO) => row.isActive,
      variant: 'danger' as const,
    },
  ];

  return (
    <div className="taxes-page">
      <div className="page-header">
        <h1>Configuração de Impostos</h1>
        <button className="btn-primary" onClick={handleCreate}>
          + Novo Tipo de Imposto
        </button>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Buscar impostos..."
          value={filters.searchText || ''}
          onChange={handleFilterChange}
          className="search-input"
        />
        <select
          value={filters.taxType || ''}
          onChange={handleTypeFilterChange}
          className="type-filter"
        >
          <option value="">Todas as categorias</option>
          {Object.entries(TAX_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <DataTable
        data={taxes}
        columns={columns}
        actions={actions}
        loading={loading}
        emptyMessage="Nenhum imposto encontrado"
      />

      <FormModal
        isOpen={isFormOpen}
        title={selectedItem ? 'Editar Imposto' : 'Novo Imposto'}
        onClose={handleFormClose}
        onSubmit={() => { }}
        loading={formLoading}
        showFooter={false}
      >
        <TaxForm
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

export default TaxesPage;
