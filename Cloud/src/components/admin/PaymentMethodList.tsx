import { useState, useEffect } from 'react';
import { paymentMethodsAPI, companiesAPI } from '../../services/api';
import './PaymentMethodList.css';

interface PaymentMethod {
    id: number;
    companyId: string;
    companyName: string;
    methodCode: string;
    methodName: string;
    methodType: string;
    defaultInstallments: number;
    maxInstallments: number;
    minInstallmentValue: number;
    feePercentage: number;
    feeFixed: number;
    isActive: boolean;
    displayOrder: number;
    hasFee: boolean;
    allowsInstallments: boolean;
    displayName: string;
}

interface Company {
    id: string;
    corporateName: string;
    tradeName: string;
}

interface PaymentMethodListProps {
    onEdit: (id: number) => void;
    onCreateNew: () => void;
}

function PaymentMethodList({ onEdit, onCreateNew }: PaymentMethodListProps) {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCompanies();
    }, []);

    useEffect(() => {
        if (selectedCompanyId) {
            loadPaymentMethods();
        }
    }, [selectedCompanyId]);

    const loadCompanies = async () => {
        try {
            const response = await companiesAPI.getAll();
            const companiesData = Array.isArray(response.data) ? response.data : [];
            setCompanies(companiesData);
            
            // Auto-select first company if only one exists
            if (companiesData.length === 1) {
                setSelectedCompanyId(companiesData[0].id);
            }
        } catch (err: any) {
            console.error('Error loading companies:', err);
            setError('Erro ao carregar empresas');
        } finally {
            setLoading(false);
        }
    };

    const loadPaymentMethods = async () => {
        if (!selectedCompanyId) return;
        
        try {
            setLoading(true);
            setError(null);
            const response = await paymentMethodsAPI.getByCompany(selectedCompanyId);
            const methods = response.data.data || response.data || [];
            setPaymentMethods(methods);
        } catch (err: any) {
            console.error('Error loading payment methods:', err);
            setError(err.response?.data?.message || 'Erro ao carregar métodos de pagamento');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id: number) => {
        try {
            await paymentMethodsAPI.toggleActive(id);
            loadPaymentMethods();
        } catch (err: any) {
            console.error('Error toggling payment method:', err);
            alert(err.response?.data?.message || 'Erro ao alterar status do método de pagamento');
        }
    };

    const handleDelete = async (id: number, methodName: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir o método "${methodName}"?`)) {
            return;
        }

        try {
            await paymentMethodsAPI.delete(id);
            loadPaymentMethods();
        } catch (err: any) {
            console.error('Error deleting payment method:', err);
            alert(err.response?.data?.message || 'Erro ao excluir método de pagamento');
        }
    };

    const getMethodTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            CASH: '💵 Dinheiro',
            CREDIT_CARD: '💳 Cartão de Crédito',
            DEBIT_CARD: '💳 Cartão de Débito',
            BANK_TRANSFER: '🏦 Transferência',
            PIX: '📱 PIX',
            BOLETO: '📄 Boleto',
            OTHER: '🔹 Outro'
        };
        return labels[type] || type;
    };

    const getMethodTypeIcon = (type: string) => {
        const icons: Record<string, string> = {
            CASH: '💵',
            CREDIT_CARD: '💳',
            DEBIT_CARD: '💳',
            BANK_TRANSFER: '🏦',
            PIX: '📱',
            BOLETO: '📄',
            OTHER: '🔹'
        };
        return icons[type] || '🔹';
    };

    if (loading) {
        return <div className="loading">Carregando...</div>;
    }

    if (error) {
        return (
            <div className="payment-method-list">
                <div className="list-header">
                    <h2>💳 Métodos de Pagamento</h2>
                </div>
                <div className="error-message">
                    <p>{error}</p>
                    <button className="btn-secondary" onClick={companies.length > 0 ? loadPaymentMethods : loadCompanies}>
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-method-list">
            <div className="list-header">
                <div className="header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <h2>💳 Métodos de Pagamento</h2>
                    {selectedCompanyId && (
                        <button className="btn-primary" onClick={onCreateNew}>
                            + Novo Método
                        </button>
                    )}
                </div>
                
                {companies.length > 1 && (
                    <div className="company-selector">
                        <label htmlFor="companySelect">Empresa:</label>
                        <select
                            id="companySelect"
                            value={selectedCompanyId}
                            onChange={(e) => setSelectedCompanyId(e.target.value)}
                            className="company-select"
                        >
                            <option value="">Selecione uma empresa</option>
                            {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.tradeName || company.corporateName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                
                {selectedCompanyId && (
                    <p className="header-description">
                        Configure os métodos de pagamento disponíveis para os clientes
                    </p>
                )}
            </div>

            {!selectedCompanyId ? (
                <div className="empty-state">
                    <p>🏢 Selecione uma empresa para gerenciar os métodos de pagamento</p>
                    {companies.length === 0 && (
                        <p>Primeiro cadastre uma empresa no sistema</p>
                    )}
                </div>
            ) : paymentMethods.length === 0 ? (
                <div className="empty-state">
                    <p>📭 Nenhum método de pagamento cadastrado para esta empresa</p>
                    <button className="btn-secondary" onClick={onCreateNew}>
                        Cadastrar Primeiro Método
                    </button>
                </div>
            ) : (
                <div className="payment-methods-grid">
                    {paymentMethods.map((method) => (
                        <div key={method.id} className={`payment-method-card ${!method.isActive ? 'inactive' : ''}`}>
                            <div className="card-header">
                                <div className="method-icon">
                                    {getMethodTypeIcon(method.methodType)}
                                </div>
                                <div className="method-info">
                                    <h3>{method.methodName}</h3>
                                    <span className="method-code">{method.methodCode}</span>
                                </div>
                                <div className="status-badge">
                                    {method.isActive ? (
                                        <span className="badge badge-active">✓ Ativo</span>
                                    ) : (
                                        <span className="badge badge-inactive">✗ Inativo</span>
                                    )}
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="method-type">
                                    <strong>Tipo:</strong> {getMethodTypeLabel(method.methodType)}
                                </div>

                                {method.allowsInstallments && (
                                    <div className="installments-info">
                                        <strong>Parcelamento:</strong> até {method.maxInstallments}x
                                        {method.minInstallmentValue > 0 && (
                                            <span className="min-value">
                                                {' '}(mín. R$ {method.minInstallmentValue.toFixed(2)})
                                            </span>
                                        )}
                                    </div>
                                )}

                                {method.hasFee && (
                                    <div className="fees-info">
                                        <strong>Taxas:</strong>
                                        {method.feePercentage > 0 && (
                                            <span> {method.feePercentage}%</span>
                                        )}
                                        {method.feeFixed > 0 && (
                                            <span> + R$ {method.feeFixed.toFixed(2)}</span>
                                        )}
                                    </div>
                                )}

                                <div className="display-order">
                                    <strong>Ordem:</strong> {method.displayOrder}
                                </div>
                            </div>

                            <div className="card-actions">
                                <button
                                    className="btn-icon btn-edit"
                                    onClick={() => onEdit(method.id)}
                                    title="Editar"
                                >
                                    ✏️
                                </button>
                                <button
                                    className={`btn-icon ${method.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                                    onClick={() => handleToggleActive(method.id)}
                                    title={method.isActive ? 'Desativar' : 'Ativar'}
                                >
                                    {method.isActive ? '🔴' : '🟢'}
                                </button>
                                <button
                                    className="btn-icon btn-delete"
                                    onClick={() => handleDelete(method.id, method.methodName)}
                                    title="Excluir"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PaymentMethodList;
