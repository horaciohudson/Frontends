import React, { useState, useEffect, useCallback } from 'react';
import { dailyClosureService } from '../services/dailyClosureService';
import { bankAccountService } from '../services/bankAccountService';
import { formatCurrency, formatDate } from '../utils/formatting';
import DataTable from '../components/ui/DataTable';
import Notification from '../components/ui/Notification';
import DailyClosureForm from '../components/DailyClosureForm';
import type { DailyClosureDTO, ClosureStatus, ClosureScope } from '../types/dailyClosure';
import type { BankAccount } from '../types/BankAccount';
import type { ColumnDefinition } from '../types/common';
import './DailyClosurePage.css';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

const DailyClosurePage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [closures, setClosures] = useState<DailyClosureDTO[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [selectedBankAccount, setSelectedBankAccount] = useState<number | ''>('');
    const [selectedStatus, setSelectedStatus] = useState<ClosureStatus | ''>('');
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [showForm, setShowForm] = useState(false);
    const [editingClosure, setEditingClosure] = useState<DailyClosureDTO | null>(null);

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
            const response = await bankAccountService.findAll();
            setBankAccounts(response.content || []);
        } catch (error) {
            console.error('Erro ao carregar contas bancárias:', error);
            showNotification('error', 'Erro ao carregar contas bancárias');
        }
    }, []);

    const loadClosures = useCallback(async () => {
        setLoading(true);
        try {
            const result = await dailyClosureService.findAll({
                page: pagination.page,
                size: pagination.size,
                startDate,
                endDate,
                status: selectedStatus || undefined,
                bankAccountId: selectedBankAccount || undefined,
            });

            setClosures(result.content);
            setPagination(prev => ({
                ...prev,
                totalElements: result.totalElements,
                totalPages: result.totalPages,
            }));
        } catch (error) {
            console.error('Erro ao carregar fechamentos:', error);
            showNotification('error', 'Erro ao carregar fechamentos');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.size, startDate, endDate, selectedStatus, selectedBankAccount]);

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

                await loadBankAccounts();
                await loadClosures();
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
            loadClosures();
        }
    }, [selectedBankAccount, selectedStatus, startDate, endDate, pagination.page, pagination.size]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleClose = async (id: number) => {
        try {
            await dailyClosureService.close(id);
            showNotification('success', 'Fechamento concluído com sucesso');
            loadClosures();
        } catch (error) {
            console.error('Erro ao fechar:', error);
            showNotification('error', 'Erro ao fechar fechamento');
        }
    };

    const handleLock = async (id: number) => {
        try {
            await dailyClosureService.lock(id);
            showNotification('success', 'Fechamento bloqueado com sucesso');
            loadClosures();
        } catch (error) {
            console.error('Erro ao bloquear:', error);
            showNotification('error', 'Erro ao bloquear fechamento');
        }
    };

    const handleReopen = async (id: number) => {
        try {
            await dailyClosureService.reopen(id);
            showNotification('success', 'Fechamento reaberto com sucesso');
            loadClosures();
        } catch (error) {
            console.error('Erro ao reabrir:', error);
            showNotification('error', 'Erro ao reabrir fechamento');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja deletar este fechamento?')) {
            return;
        }

        try {
            await dailyClosureService.delete(id);
            showNotification('success', 'Fechamento deletado com sucesso');
            loadClosures();
        } catch (error) {
            console.error('Erro ao deletar:', error);
            showNotification('error', 'Erro ao deletar fechamento');
        }
    };

    const handleCreate = () => {
        setEditingClosure(null);
        setShowForm(true);
    };

    const handleEdit = (closure: DailyClosureDTO) => {
        setEditingClosure(closure);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingClosure(null);
        loadClosures();
    };

    const getStatusBadgeClass = (status: ClosureStatus) => {
        switch (status) {
            case 'OPEN':
                return 'status-open';
            case 'CLOSED':
                return 'status-closed';
            case 'LOCKED':
                return 'status-locked';
            default:
                return '';
        }
    };

    const getStatusLabel = (status: ClosureStatus) => {
        switch (status) {
            case 'OPEN':
                return '🔓 Aberto';
            case 'CLOSED':
                return '🔒 Fechado';
            case 'LOCKED':
                return '🔐 Bloqueado';
            default:
                return status;
        }
    };

    const getScopeLabel = (scope: ClosureScope) => {
        return scope === 'DAILY' ? 'Diário' : 'Mensal';
    };

    const columns: ColumnDefinition<DailyClosureDTO>[] = [
        {
            key: 'closureDate',
            header: 'Data',
            render: (value: unknown) => formatDate(value as string),
            width: '120px',
        },
        {
            key: 'closureScope',
            header: 'Escopo',
            render: (value: unknown) => getScopeLabel(value as ClosureScope),
            width: '100px',
        },
        {
            key: 'bankAccountName',
            header: 'Conta',
            render: (value: unknown, row: DailyClosureDTO) => (
                <span>{value || (row.bankAccountId ? `Conta #${row.bankAccountId}` : 'Geral')}</span>
            ),
            width: '150px',
        },
        {
            key: 'openingBalance',
            header: 'Saldo Abertura',
            render: (value: unknown) => formatCurrency(value as number),
            width: '130px',
        },
        {
            key: 'totalInflows',
            header: 'Entradas',
            render: (value: unknown) => formatCurrency(value as number),
            width: '120px',
        },
        {
            key: 'totalOutflows',
            header: 'Saídas',
            render: (value: unknown) => formatCurrency(value as number),
            width: '120px',
        },
        {
            key: 'closingBalance',
            header: 'Saldo Fechamento',
            render: (value: unknown) => formatCurrency(value as number),
            width: '130px',
        },
        {
            key: 'transactionCount',
            header: 'Transações',
            width: '100px',
        },
        {
            key: 'closureStatus',
            header: 'Status',
            render: (value: unknown) => (
                <span className={`status-badge ${getStatusBadgeClass(value as ClosureStatus)}`}>
                    {getStatusLabel(value as ClosureStatus)}
                </span>
            ),
            width: '120px',
        },
    ];

    const actions = [
        {
            label: 'Fechar',
            onClick: (row: DailyClosureDTO) => handleClose(row.id),
            show: (row: DailyClosureDTO) => row.canBeClosed === true,
            variant: 'primary' as const,
        },
        {
            label: 'Bloquear',
            onClick: (row: DailyClosureDTO) => handleLock(row.id),
            show: (row: DailyClosureDTO) => row.canBeLocked === true,
            variant: 'warning' as const,
        },
        {
            label: 'Reabrir',
            onClick: (row: DailyClosureDTO) => handleReopen(row.id),
            show: (row: DailyClosureDTO) => row.canBeReopened === true,
            variant: 'secondary' as const,
        },
        {
            label: 'Editar',
            onClick: (row: DailyClosureDTO) => handleEdit(row),
            show: (row: DailyClosureDTO) => row.canBeModified === true,
            variant: 'secondary' as const,
        },
        {
            label: 'Deletar',
            onClick: (row: DailyClosureDTO) => handleDelete(row.id),
            show: (row: DailyClosureDTO) => row.canBeModified === true,
            variant: 'danger' as const,
        },
    ];

    return (
        <div className="daily-closure-page">
            <div className="page-header">
                <h1>🔒 Fechamento Diário</h1>
                <button className="btn-primary" onClick={handleCreate}>
                    ➕ Novo Fechamento
                </button>
            </div>

            <div className="filters-section">
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
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as ClosureStatus | '')}
                    >
                        <option value="">Todos</option>
                        <option value="OPEN">Aberto</option>
                        <option value="CLOSED">Fechado</option>
                        <option value="LOCKED">Bloqueado</option>
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

                <button className="btn-filter" onClick={() => loadClosures()}>
                    🔍 Filtrar
                </button>
            </div>

            <DataTable
                columns={columns}
                data={closures}
                actions={actions}
                loading={loading}
                pagination={{
                    page: pagination.page,
                    size: pagination.size,
                    totalElements: pagination.totalElements,
                    totalPages: pagination.totalPages,
                    onPageChange: (page: number) => setPagination(prev => ({ ...prev, page })),
                    onPageSizeChange: (size: number) => setPagination(prev => ({ ...prev, size, page: 0 })),
                }}
            />

            {notification.visible && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    visible={notification.visible}
                    onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
                />
            )}

            {showForm && (
                <div className="modal-overlay" onClick={handleFormClose}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <DailyClosureForm
                            closure={editingClosure}
                            onClose={handleFormClose}
                            onSuccess={handleFormClose}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyClosurePage;
