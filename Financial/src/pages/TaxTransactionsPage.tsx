import React, { useState, useEffect, useCallback } from 'react';
import { taxTransactionService, type TaxTransaction, type CreateTaxTransactionDTO } from '../services/taxTransactionService';
import { companyService } from '../services/companyService';
import TaxTransactionForm from '../components/forms/TaxTransactionForm';
import DataTable from '../components/ui/DataTable';
import { FormModal, Notification, StatusBadge } from '../components/ui';
import type { ColumnDefinition } from '../types/common';
import './TaxTransactionsPage.css';

const TaxTransactionsPage: React.FC = () => {
    const [transactions, setTransactions] = useState<TaxTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCompanyContextReady, setIsCompanyContextReady] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<TaxTransaction | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
    } | null>(null);

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

    const loadTransactions = useCallback(async () => {
        if (!isCompanyContextReady) return; // Aguardar contexto
        try {
            setLoading(true);
            const data = await taxTransactionService.getAll(statusFilter || undefined);
            setTransactions(data);
        } catch (error) {
            console.error('Erro ao carregar impostos:', error);
            setNotification({
                message: 'Erro ao carregar impostos',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [statusFilter, isCompanyContextReady]);

    useEffect(() => {
        if (isCompanyContextReady) {
            loadTransactions();
        }
    }, [loadTransactions, isCompanyContextReady]);

    const handleCreate = () => {
        setEditingTransaction(null);
        setShowForm(true);
    };

    const handleEdit = (transaction: TaxTransaction) => {
        setEditingTransaction(transaction);
        setShowForm(true);
    };

    const handleSubmit = async (data: CreateTaxTransactionDTO) => {
        try {
            if (editingTransaction) {
                await taxTransactionService.update(editingTransaction.id, data);
                setNotification({
                    message: 'Imposto atualizado com sucesso!',
                    type: 'success',
                });
            } else {
                await taxTransactionService.create(data);
                setNotification({
                    message: 'Imposto criado com sucesso!',
                    type: 'success',
                });
            }
            setShowForm(false);
            setEditingTransaction(null);
            loadTransactions();
        } catch (error: any) {
            setNotification({
                message: error.message || 'Erro ao salvar imposto',
                type: 'error',
            });
            throw error;
        }
    };

    const handlePay = async (transaction: TaxTransaction) => {
        const reference = window.prompt('Número da referência de pagamento (opcional):');
        if (reference === null) return; // User cancelled

        try {
            await taxTransactionService.markAsPaid(transaction.id, reference || undefined);
            setNotification({
                message: 'Imposto marcado como pago!',
                type: 'success',
            });
            loadTransactions();
        } catch (error) {
            setNotification({
                message: 'Erro ao marcar imposto como pago',
                type: 'error',
            });
        }
    };

    const handleCancel = async (transaction: TaxTransaction) => {
        if (!window.confirm(`Deseja realmente cancelar o imposto "${transaction.taxTypeName}"?`)) {
            return;
        }

        try {
            await taxTransactionService.cancel(transaction.id);
            setNotification({
                message: 'Imposto cancelado com sucesso!',
                type: 'success',
            });
            loadTransactions();
        } catch (error) {
            setNotification({
                message: 'Erro ao cancelar imposto',
                type: 'error',
            });
        }
    };

    const handleDelete = async (transaction: TaxTransaction) => {
        if (!window.confirm(`Deseja realmente excluir o imposto "${transaction.taxTypeName}"?`)) {
            return;
        }

        try {
            await taxTransactionService.delete(transaction.id);
            setNotification({
                message: 'Imposto excluído com sucesso!',
                type: 'success',
            });
            loadTransactions();
        } catch (error) {
            setNotification({
                message: 'Erro ao excluir imposto',
                type: 'error',
            });
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID':
                return '#22c55e';
            case 'PENDING':
                return '#f59e0b';
            case 'OVERDUE':
                return '#ef4444';
            case 'CANCELLED':
                return '#6b7280';
            default:
                return '#6b7280';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PAID':
                return 'Pago';
            case 'PENDING':
                return 'Pendente';
            case 'OVERDUE':
                return 'Vencido';
            case 'CANCELLED':
                return 'Cancelado';
            default:
                return status;
        }
    };

    const columns: ColumnDefinition<TaxTransaction>[] = [
        {
            key: 'taxTypeCode',
            header: 'Código',
            width: '100px',
        },
        {
            key: 'taxTypeName',
            header: 'Tipo de Imposto',
        },
        {
            key: 'competenceDate',
            header: 'Competência',
            render: (value) => formatDate(value as string),
            width: '120px',
        },
        {
            key: 'dueDate',
            header: 'Vencimento',
            render: (value) => formatDate(value as string),
            width: '120px',
        },
        {
            key: 'taxAmount',
            header: 'Valor',
            render: (value) => formatCurrency(value as number),
            width: '130px',
        },
        {
            key: 'status',
            header: 'Status',
            render: (value) => (
                <StatusBadge
                    status={value as string}
                    label={getStatusLabel(value as string)}
                    color={getStatusColor(value as string)}
                />
            ),
            width: '120px',
        },
    ];


    return (
        <div className="tax-transactions-page">
            <div className="page-header">
                <h1>💰 Impostos a Pagar</h1>
                <button className="btn-primary" onClick={handleCreate}>
                    + Novo Lançamento
                </button>
            </div>

            {/* Filtros */}
            <div className="filters">
                <button
                    className={`filter-btn ${statusFilter === '' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('')}
                >
                    📋 Todos
                </button>
                <button
                    className={`filter-btn ${statusFilter === 'PENDING' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('PENDING')}
                >
                    ⏳ Pendentes
                </button>
                <button
                    className={`filter-btn ${statusFilter === 'OVERDUE' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('OVERDUE')}
                >
                    ⚠️ Vencidos
                </button>
                <button
                    className={`filter-btn ${statusFilter === 'PAID' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('PAID')}
                >
                    ✅ Pagos
                </button>
                <button
                    className={`filter-btn ${statusFilter === 'CANCELLED' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('CANCELLED')}
                >
                    🚫 Cancelados
                </button>
            </div>

            <DataTable
                data={transactions}
                columns={columns}
                loading={loading}
                actions={[
                    {
                        label: 'Editar',
                        icon: '✏️',
                        onClick: handleEdit,
                    },
                    {
                        label: 'Excluir',
                        icon: '🗑️',
                        onClick: handleDelete,
                        variant: 'danger',
                    },
                    // Ações dinâmicas integradas do getRowActions
                    {
                        label: 'Pagar',
                        icon: '💰',
                        onClick: handlePay,
                        show: (transaction) => transaction.status === 'PENDING' || transaction.status === 'OVERDUE',
                        variant: 'primary',
                    },
                    {
                        label: 'Cancelar',
                        icon: '🚫',
                        onClick: handleCancel,
                        show: (transaction) => transaction.status !== 'CANCELLED' && transaction.status !== 'PAID',
                        variant: 'danger',
                    }
                ]}
                emptyMessage="Nenhum imposto encontrado"
            />

            <FormModal
                isOpen={showForm}
                title={editingTransaction ? 'Editar Imposto' : 'Novo Lançamento de Imposto'}
                onClose={() => {
                    setShowForm(false);
                    setEditingTransaction(null);
                }}
                showFooter={false}
            >
                <TaxTransactionForm
                    initialData={editingTransaction}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingTransaction(null);
                    }}
                />
            </FormModal>

            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    visible={!!notification}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};

export default TaxTransactionsPage;
