import React, { useState, useEffect } from 'react';
import { transferService } from '../services/transferService';
import { bankAccountService } from '../services/bankAccountService';
import { companyService } from '../services/companyService';
import type { Transfer } from '../types/transfer';
import type { BankAccount } from '../types/BankAccount';
import { formatCurrency, formatDate } from '../utils/formatting';
import DataTable from '../components/ui/DataTable';
import { FormModal, Notification } from '../components/ui';
import type { ColumnDefinition } from '../types/common';
import './TransferPage.css';

const TransferPage: React.FC = () => {
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCompanyContextReady, setIsCompanyContextReady] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
    });
    const [notification, setNotification] = useState<{
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
        visible: boolean;
    }>({ type: 'info', message: '', visible: false });

    // Form state
    const [formData, setFormData] = useState({
        sourceAccountId: '',
        destinationAccountId: '',
        amount: '',
        transferDate: new Date().toISOString().split('T')[0],
        description: '',
        referenceNumber: '',
    });

    // Inicializar contexto da empresa
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

    useEffect(() => {
        if (isCompanyContextReady) {
            loadData();
            loadBankAccounts();
        }
    }, [isCompanyContextReady, pagination.page, pagination.size]);

    const loadData = async () => {
        try {
            setLoading(true);
            const result = await transferService.findAll({
                page: pagination.page,
                size: pagination.size,
            });
            setTransfers(result.content);
            setPagination(prev => ({
                ...prev,
                totalElements: result.totalElements,
                totalPages: result.totalPages,
            }));
        } catch (error) {
            console.error('Erro ao carregar transferências:', error);
            showNotification('error', 'Erro ao carregar transferências');
        } finally {
            setLoading(false);
        }
    };

    const loadBankAccounts = async () => {
        try {
            const accounts = await bankAccountService.findActiveAccounts();
            setBankAccounts(accounts);
        } catch (error) {
            console.error('Erro ao carregar contas bancárias:', error);
        }
    };

    const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
        setNotification({ type, message, visible: true });
    };

    const handleCreate = () => {
        setSelectedTransfer(null);
        setFormData({
            sourceAccountId: '',
            destinationAccountId: '',
            amount: '',
            transferDate: new Date().toISOString().split('T')[0],
            description: '',
            referenceNumber: '',
        });
        setIsFormOpen(true);
    };

    const handleView = (transfer: Transfer) => {
        setSelectedTransfer(transfer);
        setFormData({
            sourceAccountId: transfer.sourceAccountId.toString(),
            destinationAccountId: transfer.destinationAccountId.toString(),
            amount: transfer.amount.toString(),
            transferDate: transfer.transferDate,
            description: transfer.description || '',
            referenceNumber: transfer.referenceNumber || '',
        });
        setIsFormOpen(true);
    };

    const handleCancel = async (transfer: Transfer) => {
        if (!window.confirm(`Deseja realmente cancelar esta transferência?`)) {
            return;
        }

        try {
            await transferService.cancel(transfer.id);
            showNotification('success', 'Transferência cancelada com sucesso');
            loadData();
        } catch (error) {
            console.error('Erro ao cancelar transferência:', error);
            showNotification('error', 'Erro ao cancelar transferência');
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedTransfer) {
            showNotification('warning', 'Transferências não podem ser editadas');
            return;
        }

        try {
            await transferService.create({
                sourceAccountId: Number(formData.sourceAccountId),
                destinationAccountId: Number(formData.destinationAccountId),
                amount: Number(formData.amount),
                transferDate: formData.transferDate,
                description: formData.description || undefined,
                referenceNumber: formData.referenceNumber || undefined,
            });
            showNotification('success', 'Transferência criada com sucesso');
            setIsFormOpen(false);
            loadData();
        } catch (error: any) {
            console.error('Erro ao criar transferência:', error);
            showNotification('error', error.message || 'Erro ao criar transferência');
        }
    };

    const columns: ColumnDefinition<Transfer>[] = [
        {
            key: 'transferDate',
            header: 'Data',
            render: (value) => formatDate(value as string),
            width: '100px',
        },
        {
            key: 'sourceAccountName',
            header: 'Conta Origem',
        },
        {
            key: 'destinationAccountName',
            header: 'Conta Destino',
        },
        {
            key: 'amount',
            header: 'Valor',
            render: (value) => formatCurrency(value as number),
            align: 'right',
            width: '120px',
        },
        {
            key: 'description',
            header: 'Descrição',
        },
        {
            key: 'referenceNumber',
            header: 'Referência',
            width: '120px',
        },
    ];

    const actions = [
        {
            label: 'Visualizar',
            icon: '👁️',
            onClick: handleView,
        },
        {
            label: 'Cancelar',
            icon: '🗑️',
            onClick: handleCancel,
            variant: 'danger' as const,
        },
    ];

    if (!isCompanyContextReady) {
        return <div>Carregando...</div>;
    }

    return (
        <div className="transfer-page">
            <div className="page-header">
                <h1>🔄 Transferências Bancárias</h1>
                <button className="btn-primary" onClick={handleCreate}>
                    + Nova Transferência
                </button>
            </div>

            <DataTable
                data={transfers}
                columns={columns}
                actions={actions}
                loading={loading}
                pagination={pagination}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                emptyMessage="Nenhuma transferência encontrada"
            />

            <FormModal
                isOpen={isFormOpen}
                title={selectedTransfer ? 'Visualizar Transferência' : 'Nova Transferência'}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                loading={false}
                size="medium"
            >
                <form onSubmit={handleFormSubmit} className="transfer-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="sourceAccountId">Conta Origem *</label>
                            <select
                                id="sourceAccountId"
                                value={formData.sourceAccountId}
                                onChange={(e) => setFormData({ ...formData, sourceAccountId: e.target.value })}
                                required
                                disabled={!!selectedTransfer}
                            >
                                <option value="">Selecione...</option>
                                {bankAccounts.map(account => (
                                    <option key={account.id} value={account.id}>
                                        {account.bankName} - {account.accountNumber}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="destinationAccountId">Conta Destino *</label>
                            <select
                                id="destinationAccountId"
                                value={formData.destinationAccountId}
                                onChange={(e) => setFormData({ ...formData, destinationAccountId: e.target.value })}
                                required
                                disabled={!!selectedTransfer}
                            >
                                <option value="">Selecione...</option>
                                {bankAccounts.map(account => (
                                    <option key={account.id} value={account.id}>
                                        {account.bankName} - {account.accountNumber}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="amount">Valor *</label>
                            <input
                                type="number"
                                id="amount"
                                step="0.01"
                                min="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                                disabled={!!selectedTransfer}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="transferDate">Data *</label>
                            <input
                                type="date"
                                id="transferDate"
                                value={formData.transferDate}
                                onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                                required
                                disabled={!!selectedTransfer}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Descrição</label>
                        <input
                            type="text"
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            disabled={!!selectedTransfer}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="referenceNumber">Referência</label>
                        <input
                            type="text"
                            id="referenceNumber"
                            value={formData.referenceNumber}
                            onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                            disabled={!!selectedTransfer}
                        />
                    </div>

                    {!selectedTransfer && (
                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn-primary">
                                Criar Transferência
                            </button>
                        </div>
                    )}
                </form>
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

export default TransferPage;
