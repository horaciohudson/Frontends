import React, { useState, useEffect, useCallback } from 'react';
import type { CashMovementDTO, CashMovementFilters } from '../types/cashMovement';
import type { ColumnDefinition, ActionDefinition, PaginationState, FilterDefinition } from '../types/common';
import { CashMovementType, CashMovementTypeLabels, CashMovementTypeColors, CashMovementStatus, CashMovementStatusLabels, CashMovementStatusColors } from '../types/enums';
import { cashMovementService } from '../services/cashMovementService';
import { companyService } from '../services/companyService';
import { DataTable, FilterBar, StatusBadge, FormModal, Notification } from '../components/ui';
import { CashMovementForm } from '../components/forms/CashMovementForm';
import { formatCurrency, formatDate } from '../utils/formatting';
import './CashMovementPage.css';

export const CashMovementPage: React.FC = () => {
    const [movements, setMovements] = useState<CashMovementDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CashMovementDTO | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isCompanyContextReady, setIsCompanyContextReady] = useState(false);

    const [pagination, setPagination] = useState<PaginationState>({
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
    });

    const [filters, setFilters] = useState<CashMovementFilters>({
        page: 0,
        size: 20,
    });

    // Initialize company context
    useEffect(() => {
        const initCompanyContext = async () => {
            try {
                const storedCompanyId = sessionStorage.getItem('selectedCompanyId');
                if (!storedCompanyId) {
                    const response = await companyService.getAllCompanies();
                    if (response.content && response.content.length > 0) {
                        const activeCompany = response.content.find(c => c.isActive) || response.content[0];
                        sessionStorage.setItem('selectedCompanyId', activeCompany.id);
                    }
                }
            } catch (error) {
                console.error('Erro ao inicializar contexto de empresa:', error);
            } finally {
                setIsCompanyContextReady(true);
            }
        };
        initCompanyContext();
    }, []);

    const loadData = useCallback(async () => {
        if (!isCompanyContextReady) return;

        try {
            setLoading(true);
            const response = await cashMovementService.findAll(filters);
            setMovements(response.content);
            setPagination({
                page: response.page,
                size: response.size,
                totalElements: response.totalElements,
                totalPages: response.totalPages,
            });
        } catch (error) {
            console.error('Erro ao carregar movimentos:', error);
            showNotification('error', 'Erro ao carregar movimentos');
        } finally {
            setLoading(false);
        }
    }, [filters, isCompanyContextReady]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleCreate = () => {
        setSelectedItem(null);
        setIsFormOpen(true);
    };

    const handleEdit = (item: CashMovementDTO) => {
        setSelectedItem(item);
        setIsFormOpen(true);
    };

    const handleDelete = async (item: CashMovementDTO) => {
        if (!window.confirm('Tem certeza que deseja excluir este movimento?')) {
            return;
        }

        try {
            await cashMovementService.delete(item.id);
            showNotification('success', 'Movimento excluído com sucesso');
            loadData();
        } catch (error) {
            console.error('Erro ao excluir movimento:', error);
            showNotification('error', 'Erro ao excluir movimento');
        }
    };

    const handleMarkAsCleared = async (item: CashMovementDTO) => {
        try {
            await cashMovementService.markAsCleared(item.id);
            showNotification('success', 'Movimento marcado como compensado');
            loadData();
        } catch (error) {
            console.error('Erro ao marcar como compensado:', error);
            showNotification('error', 'Erro ao marcar como compensado');
        }
    };

    const handleMarkAsReconciled = async (item: CashMovementDTO) => {
        try {
            await cashMovementService.markAsReconciled(item.id);
            showNotification('success', 'Movimento marcado como conciliado');
            loadData();
        } catch (error) {
            console.error('Erro ao marcar como conciliado:', error);
            showNotification('error', 'Erro ao marcar como conciliado');
        }
    };

    const handleCancel = async (item: CashMovementDTO) => {
        const reason = window.prompt('Motivo do cancelamento:');
        if (!reason) return;

        try {
            await cashMovementService.cancel(item.id, reason);
            showNotification('success', 'Movimento cancelado com sucesso');
            loadData();
        } catch (error) {
            console.error('Erro ao cancelar movimento:', error);
            showNotification('error', 'Erro ao cancelar movimento');
        }
    };

    const handleFormSubmit = async (data: any) => {
        try {
            if (selectedItem) {
                await cashMovementService.update(selectedItem.id, { ...data, id: selectedItem.id });
                showNotification('success', 'Movimento atualizado com sucesso');
            } else {
                await cashMovementService.create(data);
                showNotification('success', 'Movimento criado com sucesso');
            }
            setIsFormOpen(false);
            setSelectedItem(null);
            loadData();
        } catch (error: any) {
            console.error('Erro ao salvar movimento:', error);
            showNotification('error', error.response?.data?.message || 'Erro ao salvar movimento');
        }
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
        setSelectedItem(null);
    };

    // Column definitions
    const columns: ColumnDefinition<CashMovementDTO>[] = [
        {
            key: 'movementDate',
            header: 'Data',
            sortable: true,
            width: '100px',
            render: (_value: unknown, row: CashMovementDTO) => formatDate(row.movementDate),
        },
        {
            key: 'movementType',
            header: 'Tipo',
            sortable: true,
            width: '100px',
            render: (_value: unknown, row: CashMovementDTO) => (
                <StatusBadge
                    status={row.movementType}
                    label={CashMovementTypeLabels[row.movementType as CashMovementType] || row.movementType}
                    color={CashMovementTypeColors[row.movementType as CashMovementType]}
                />
            ),
        },
        {
            key: 'description',
            header: 'Descrição',
            sortable: true,
        },
        {
            key: 'beneficiaryName',
            header: 'Beneficiário/Pagador',
            sortable: true,
            width: '180px',
        },
        {
            key: 'amount',
            header: 'Valor',
            sortable: true,
            align: 'right',
            width: '120px',
            render: (_value: unknown, row: CashMovementDTO) => (
                <span className={row.movementType === CashMovementType.INFLOW ? 'amount-inflow' : 'amount-outflow'}>
                    {row.movementType === CashMovementType.OUTFLOW ? '-' : '+'}{formatCurrency(row.amount)}
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
            key: 'movementStatus',
            header: 'Status',
            sortable: true,
            width: '120px',
            render: (_value: unknown, row: CashMovementDTO) => (
                <StatusBadge
                    status={row.movementStatus}
                    label={CashMovementStatusLabels[row.movementStatus as CashMovementStatus] || row.movementStatus}
                    color={CashMovementStatusColors[row.movementStatus as CashMovementStatus]}
                />
            ),
        },
    ];

    // Action definitions
    const actions: ActionDefinition<CashMovementDTO>[] = [
        {
            label: 'Editar',
            icon: '✏️',
            variant: 'secondary',
            onClick: handleEdit,
            show: (item) => item.movementStatus === CashMovementStatus.PENDING,
        },
        {
            label: 'Compensar',
            icon: '✓',
            variant: 'primary',
            onClick: handleMarkAsCleared,
            show: (item) => item.movementStatus === CashMovementStatus.PENDING,
        },
        {
            label: 'Conciliar',
            icon: '🔗',
            variant: 'primary',
            onClick: handleMarkAsReconciled,
            show: (item) => item.movementStatus === CashMovementStatus.CLEARED,
        },
        {
            label: 'Cancelar',
            icon: '🚫',
            variant: 'danger',
            onClick: handleCancel,
            show: (item) => item.movementStatus !== CashMovementStatus.CANCELLED,
        },
        {
            label: 'Excluir',
            icon: '🗑️',
            variant: 'danger',
            onClick: handleDelete,
            show: (item) => item.movementStatus === CashMovementStatus.PENDING,
        },
    ];

    // Filter definitions
    const filterDefinitions: FilterDefinition[] = [
        {
            key: 'searchText',
            label: 'Buscar',
            type: 'text',
            placeholder: 'Descrição, beneficiário ou documento...',
        },
        {
            key: 'movementType',
            label: 'Tipo',
            type: 'select',
            options: Object.entries(CashMovementTypeLabels).map(([value, label]) => ({ value, label: String(label) })),
        },
        {
            key: 'movementStatus',
            label: 'Status',
            type: 'select',
            options: Object.entries(CashMovementStatusLabels).map(([value, label]) => ({ value, label: String(label) })),
        },
    ];

    return (
        <div className="cash-movement-page">
            <div className="page-header">
                <h1>Movimento de Caixa</h1>
                <button className="btn-primary" onClick={handleCreate}>
                    + Novo Movimento
                </button>
            </div>

            <FilterBar
                filters={filterDefinitions}
                values={filters as Record<string, unknown>}
                onChange={(values) => setFilters({ ...filters, ...values })}
                onSearch={loadData}
                onClear={() => setFilters({ page: 0, size: 20 })}
            />

            <DataTable
                data={movements}
                columns={columns}
                actions={actions}
                loading={loading}
                pagination={pagination}
                onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
                onSizeChange={(size) => setFilters(prev => ({ ...prev, size, page: 0 }))}
            />

            <FormModal
                isOpen={isFormOpen}
                onClose={handleFormCancel}
                title={selectedItem ? 'Editar Movimento' : 'Novo Movimento'}
            >
                <CashMovementForm
                    initialData={selectedItem}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            </FormModal>

            {notification && (
                <Notification
                    visible={true}
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};
