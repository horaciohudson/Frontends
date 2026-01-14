import React, { useState, useEffect, useCallback } from 'react';
import { cashFlowService } from '../services/cashFlowService';
import { bankAccountService } from '../services/bankAccountService';
import { formatCurrency, formatDate } from '../utils/formatting';
import DataTable from '../components/ui/DataTable';
import Notification from '../components/ui/Notification';
import type { CashFlowDTO } from '../types/cashFlow';
import type { BankAccount } from '../types/BankAccount';
import type { ColumnDefinition } from '../types/common';
import './ReconciliationPage.css';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface ReconciliationSummary {
  totalTransactions: number;
  reconciledCount: number;
  unreconciledCount: number;
  reconciledAmount: number;
  unreconciledAmount: number;
}

const ReconciliationPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<CashFlowDTO[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState<number | ''>('');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [showOnlyUnreconciled, setShowOnlyUnreconciled] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [summary, setSummary] = useState<ReconciliationSummary>({
    totalTransactions: 0,
    reconciledCount: 0,
    unreconciledCount: 0,
    reconciledAmount: 0,
    unreconciledAmount: 0,
  });
  const [notification, setNotification] = useState<{
    type: NotificationType;
    message: string;
    visible: boolean;
  }>({ type: 'info', message: '', visible: false });

  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  });

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message, visible: true });
  };

  const loadBankAccounts = useCallback(async () => {
    try {
      const accounts = await bankAccountService.findActiveAccounts();
      setBankAccounts(accounts);
    } catch (error) {
      console.error('Erro ao carregar contas bancárias:', error);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      // Buscar todas as transações (o backend ainda não tem filtro específico para não conciliadas)
      const result = await cashFlowService.findAll({
        page: pagination.page,
        size: pagination.size,
        bankAccountId: selectedBankAccount || undefined,
        startDate,
        endDate,
      });

      // Filtrar no frontend se necessário
      let filteredContent = result.content;
      if (showOnlyUnreconciled) {
        filteredContent = result.content.filter(t => t.reconciliationId == null);
      }

      setTransactions(filteredContent);
      setPagination(prev => ({
        ...prev,
        totalElements: showOnlyUnreconciled ? filteredContent.length : result.totalElements,
        totalPages: showOnlyUnreconciled ? Math.ceil(filteredContent.length / pagination.size) : result.totalPages,
      }));

      // Calcular resumo
      const reconciled = result.content.filter(t => t.reconciliationId != null);
      const unreconciled = result.content.filter(t => t.reconciliationId == null);

      setSummary({
        totalTransactions: result.totalElements,
        reconciledCount: reconciled.length,
        unreconciledCount: unreconciled.length,
        reconciledAmount: reconciled.reduce((sum, t) => sum + t.amount, 0),
        unreconciledAmount: unreconciled.reduce((sum, t) => sum + t.amount, 0),
      });
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      showNotification('error', 'Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  }, [selectedBankAccount, startDate, endDate, showOnlyUnreconciled, pagination.page, pagination.size]); // eslint-disable-line react-hooks/exhaustive-deps

  // Inicializar contexto da empresa antes de carregar dados
  useEffect(() => {
    const initCompanyContext = async () => {
      try {
        const storedCompanyId = sessionStorage.getItem('selectedCompanyId');
        if (!storedCompanyId) {
          const { companyService } = await import('../services/companyService');
          const response = await companyService.getAllCompanies();
          if (response.content && response.content.length > 0) {
            const activeCompany = response.content.find(c => c.isActive) || response.content[0];
            sessionStorage.setItem('selectedCompanyId', activeCompany.id);
          }
        }

        // Carregar dados APÓS inicializar o contexto
        await loadBankAccounts();
        await loadTransactions();
      } catch (error) {
        console.error('Erro ao inicializar contexto de empresa:', error);
      }
    };
    initCompanyContext();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Recarregar quando filtros mudarem
  useEffect(() => {
    const storedCompanyId = sessionStorage.getItem('selectedCompanyId');
    if (storedCompanyId) {
      loadTransactions();
    }
  }, [selectedBankAccount, startDate, endDate, showOnlyUnreconciled, pagination.page, pagination.size]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReconcile = async (id: number) => {
    try {
      await cashFlowService.reconcile(id);
      showNotification('success', 'Transação conciliada com sucesso');
      loadTransactions();
    } catch (error) {
      console.error('Erro ao conciliar:', error);
      showNotification('error', 'Erro ao conciliar transação');
    }
  };

  const handleUnreconcile = async (id: number) => {
    try {
      await cashFlowService.unreconcile(id);
      showNotification('success', 'Conciliação removida com sucesso');
      loadTransactions();
    } catch (error) {
      console.error('Erro ao remover conciliação:', error);
      showNotification('error', 'Erro ao remover conciliação');
    }
  };

  const handleBulkReconcile = async () => {
    if (selectedIds.size === 0) {
      showNotification('warning', 'Selecione ao menos uma transação');
      return;
    }

    setLoading(true);
    try {
      const promises = Array.from(selectedIds).map(id => cashFlowService.reconcile(id));
      await Promise.all(promises);
      showNotification('success', `${selectedIds.size} transações conciliadas`);
      setSelectedIds(new Set());
      loadTransactions();
    } catch (error) {
      console.error('Erro ao conciliar em lote:', error);
      showNotification('error', 'Erro ao conciliar transações');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const unreconciledIds = transactions.filter(t => t.reconciliationId == null).map(t => t.id);
    if (selectedIds.size === unreconciledIds.length && unreconciledIds.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(unreconciledIds));
    }
  };

  const columns: ColumnDefinition<CashFlowDTO>[] = [
    {
      key: 'select',
      header: '☐',
      render: (_: unknown, row: CashFlowDTO) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.id)}
          onChange={() => toggleSelection(row.id)}
          disabled={row.reconciliationId != null}
        />
      ),
      width: '50px',
    },
    {
      key: 'flowDate',
      header: 'Data',
      render: (value: unknown) => formatDate(value as string),
      sortable: true,
      width: '100px',
    },
    {
      key: 'description',
      header: 'Descrição',
      sortable: true,
    },
    {
      key: 'flowType',
      header: 'Tipo',
      render: (value: unknown) => (
        <span className={`type-badge ${value === 'INFLOW' ? 'inflow' : 'outflow'}`}>
          {value === 'INFLOW' ? '↑ Entrada' : '↓ Saída'}
        </span>
      ),
      width: '100px',
    },
    {
      key: 'amount',
      header: 'Valor',
      render: (value: unknown, row: CashFlowDTO) => (
        <span className={row.flowType === 'INFLOW' ? 'amount-positive' : 'amount-negative'}>
          {formatCurrency(value as number)}
        </span>
      ),
      sortable: true,
      width: '120px',
    },
    {
      key: 'bankAccountName',
      header: 'Conta',
      width: '150px',
    },
    {
      key: 'reconciliationId',
      header: 'Status',
      render: (value: unknown) => (
        <span className={`status-badge ${value != null ? 'reconciled' : 'pending'}`}>
          {value != null ? '✓ Conciliado' : '○ Pendente'}
        </span>
      ),
      width: '120px',
    },
  ];

  const actions = [
    {
      label: 'Conciliar',
      onClick: (row: CashFlowDTO) => handleReconcile(row.id),
      show: (row: CashFlowDTO) => row.reconciliationId == null,
      variant: 'primary' as const,
    },
    {
      label: 'Desconciliar',
      onClick: (row: CashFlowDTO) => handleUnreconcile(row.id),
      show: (row: CashFlowDTO) => row.reconciliationId != null,
      variant: 'secondary' as const,
    },
  ];

  return (
    <div className="reconciliation-page">
      <div className="page-header">
        <h1>🔄 Conciliação Bancária</h1>
        <p>Concilie as transações do fluxo de caixa com os extratos bancários</p>
      </div>

      <div className="reconciliation-filters">
        <div className="filter-group">
          <label htmlFor="bankAccount">Conta Bancária</label>
          <select
            id="bankAccount"
            value={selectedBankAccount}
            onChange={(e) => setSelectedBankAccount(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Todas as contas</option>
            {bankAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.accountName} - {account.bankName}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="startDate">Data Inicial</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="endDate">Data Final</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="filter-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={showOnlyUnreconciled}
              onChange={(e) => setShowOnlyUnreconciled(e.target.checked)}
            />
            Mostrar apenas não conciliados
          </label>
        </div>

        <button
          className="btn-filter"
          onClick={() => {
            setPagination(prev => ({ ...prev, page: 0 }));
            loadTransactions();
          }}
        >
          🔍 Filtrar
        </button>
      </div>

      <div className="reconciliation-summary">
        <div className="summary-card">
          <span className="summary-label">Total de Transações</span>
          <span className="summary-value">{summary.totalTransactions}</span>
        </div>
        <div className="summary-card reconciled">
          <span className="summary-label">Conciliadas</span>
          <span className="summary-value">{summary.reconciledCount}</span>
          <span className="summary-amount">{formatCurrency(summary.reconciledAmount)}</span>
        </div>
        <div className="summary-card unreconciled">
          <span className="summary-label">Pendentes</span>
          <span className="summary-value">{summary.unreconciledCount}</span>
          <span className="summary-amount">{formatCurrency(summary.unreconciledAmount)}</span>
        </div>
      </div>

      <div className="bulk-actions">
        <button className="btn-select-all" onClick={handleSelectAll}>
          {selectedIds.size === transactions.filter(t => t.reconciliationId == null).length && transactions.filter(t => t.reconciliationId == null).length > 0
            ? '☐ Desmarcar Todos'
            : '☑ Selecionar Todos'}
        </button>
        {selectedIds.size > 0 && (
          <>
            <span>{selectedIds.size} transação(ões) selecionada(s)</span>
            <button className="btn-bulk-reconcile" onClick={handleBulkReconcile}>
              ✓ Conciliar Selecionadas
            </button>
            <button className="btn-clear-selection" onClick={() => setSelectedIds(new Set())}>
              ✕ Limpar Seleção
            </button>
          </>
        )}
      </div>

      <div className="reconciliation-table">
        <DataTable
          data={transactions}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={(page: number) => setPagination(prev => ({ ...prev, page }))}
          onSort={() => { }}
          actions={actions}
        />
      </div>

      <Notification
        type={notification.type}
        message={notification.message}
        visible={notification.visible}
        onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
};

export default ReconciliationPage;
