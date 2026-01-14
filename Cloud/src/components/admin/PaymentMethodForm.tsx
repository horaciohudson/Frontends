import { useState, useEffect } from 'react';
import api from '../../services/api';
import './PaymentMethodForm.css';

interface PaymentMethodFormProps {
    paymentMethodId?: number;
    onSuccess: () => void;
    onCancel: () => void;
}

interface FormData {
    companyId: string;
    methodCode: string;
    methodName: string;
    methodType: string;
    defaultInstallments: number;
    maxInstallments: number;
    minInstallmentValue: string;
    feePercentage: string;
    feeFixed: string;
    isActive: boolean;
    displayOrder: number;
    settings: string;
}

function PaymentMethodForm({ paymentMethodId, onSuccess, onCancel }: PaymentMethodFormProps) {
    const [formData, setFormData] = useState<FormData>({
        companyId: '',
        methodCode: '',
        methodName: '',
        methodType: 'CASH',
        defaultInstallments: 1,
        maxInstallments: 1,
        minInstallmentValue: '',
        feePercentage: '0.00',
        feeFixed: '0.00',
        isActive: true,
        displayOrder: 0,
        settings: ''
    });

    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCompanies();
        if (paymentMethodId) {
            loadPaymentMethod();
        }
    }, [paymentMethodId]);

    const loadCompanies = async () => {
        try {
            const response = await api.get('/companies');
            setCompanies(response.data || []);
            if (!paymentMethodId && response.data && response.data.length > 0) {
                setFormData(prev => ({ ...prev, companyId: response.data[0].id }));
            }
        } catch (err: any) {
            console.error('Error loading companies:', err);
            setError('Erro ao carregar empresas');
        }
    };

    const loadPaymentMethod = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/payment-methods/${paymentMethodId}`);
            const data = response.data.data;

            setFormData({
                companyId: data.companyId,
                methodCode: data.methodCode,
                methodName: data.methodName,
                methodType: data.methodType,
                defaultInstallments: data.defaultInstallments,
                maxInstallments: data.maxInstallments,
                minInstallmentValue: data.minInstallmentValue?.toString() || '',
                feePercentage: data.feePercentage?.toString() || '0.00',
                feeFixed: data.feeFixed?.toString() || '0.00',
                isActive: data.isActive,
                displayOrder: data.displayOrder,
                settings: data.settings || ''
            });
        } catch (err: any) {
            console.error('Error loading payment method:', err);
            setError(err.response?.data?.message || 'Erro ao carregar método de pagamento');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                minInstallmentValue: formData.minInstallmentValue ? parseFloat(formData.minInstallmentValue) : null,
                feePercentage: parseFloat(formData.feePercentage),
                feeFixed: parseFloat(formData.feeFixed),
                createdBy: 'admin', // TODO: Get from auth context
                updatedBy: 'admin'
            };

            if (paymentMethodId) {
                await api.put(`/payment-methods/${paymentMethodId}`, payload);
            } else {
                await api.post('/payment-methods', payload);
            }

            onSuccess();
        } catch (err: any) {
            console.error('Error saving payment method:', err);
            setError(err.response?.data?.message || 'Erro ao salvar método de pagamento');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const methodTypes = [
        { value: 'CASH', label: '💵 Dinheiro' },
        { value: 'CREDIT_CARD', label: '💳 Cartão de Crédito' },
        { value: 'DEBIT_CARD', label: '💳 Cartão de Débito' },
        { value: 'BANK_TRANSFER', label: '🏦 Transferência Bancária' },
        { value: 'PIX', label: '📱 PIX' },
        { value: 'BOLETO', label: '📄 Boleto' },
        { value: 'OTHER', label: '🔹 Outro' }
    ];

    return (
        <div className="payment-method-form">
            <div className="form-header">
                <h2>{paymentMethodId ? '✏️ Editar Método de Pagamento' : '➕ Novo Método de Pagamento'}</h2>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    {/* Empresa */}
                    <div className="form-group full-width">
                        <label htmlFor="companyId">
                            Empresa <span className="required">*</span>
                        </label>
                        <select
                            id="companyId"
                            name="companyId"
                            value={formData.companyId}
                            onChange={handleChange}
                            required
                            disabled={!!paymentMethodId}
                        >
                            <option value="">Selecione uma empresa</option>
                            {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.corporateName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Código do Método */}
                    <div className="form-group">
                        <label htmlFor="methodCode">
                            Código <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="methodCode"
                            name="methodCode"
                            value={formData.methodCode}
                            onChange={handleChange}
                            placeholder="Ex: PIX_01, CASH_01"
                            maxLength={20}
                            required
                        />
                        <small>Código único para identificação (ex: PIX_01)</small>
                    </div>

                    {/* Nome do Método */}
                    <div className="form-group">
                        <label htmlFor="methodName">
                            Nome <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="methodName"
                            name="methodName"
                            value={formData.methodName}
                            onChange={handleChange}
                            placeholder="Ex: PIX, Dinheiro"
                            maxLength={50}
                            required
                        />
                        <small>Nome amigável para exibição</small>
                    </div>

                    {/* Tipo do Método */}
                    <div className="form-group full-width">
                        <label htmlFor="methodType">
                            Tipo <span className="required">*</span>
                        </label>
                        <select
                            id="methodType"
                            name="methodType"
                            value={formData.methodType}
                            onChange={handleChange}
                            required
                        >
                            {methodTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Parcelamento Padrão */}
                    <div className="form-group">
                        <label htmlFor="defaultInstallments">
                            Parcelas Padrão <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="defaultInstallments"
                            name="defaultInstallments"
                            value={formData.defaultInstallments}
                            onChange={handleChange}
                            min="1"
                            max="24"
                            required
                        />
                        <small>Número de parcelas padrão (1-24)</small>
                    </div>

                    {/* Parcelamento Máximo */}
                    <div className="form-group">
                        <label htmlFor="maxInstallments">
                            Parcelas Máximas <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="maxInstallments"
                            name="maxInstallments"
                            value={formData.maxInstallments}
                            onChange={handleChange}
                            min="1"
                            max="24"
                            required
                        />
                        <small>Número máximo de parcelas (1-24)</small>
                    </div>

                    {/* Valor Mínimo da Parcela */}
                    <div className="form-group">
                        <label htmlFor="minInstallmentValue">
                            Valor Mínimo da Parcela
                        </label>
                        <input
                            type="number"
                            id="minInstallmentValue"
                            name="minInstallmentValue"
                            value={formData.minInstallmentValue}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                        />
                        <small>Valor mínimo permitido por parcela (R$)</small>
                    </div>

                    {/* Taxa Percentual */}
                    <div className="form-group">
                        <label htmlFor="feePercentage">
                            Taxa Percentual (%)
                        </label>
                        <input
                            type="number"
                            id="feePercentage"
                            name="feePercentage"
                            value={formData.feePercentage}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="0.00"
                        />
                        <small>Taxa percentual sobre o valor (0-100%)</small>
                    </div>

                    {/* Taxa Fixa */}
                    <div className="form-group">
                        <label htmlFor="feeFixed">
                            Taxa Fixa (R$)
                        </label>
                        <input
                            type="number"
                            id="feeFixed"
                            name="feeFixed"
                            value={formData.feeFixed}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                        />
                        <small>Taxa fixa em reais (R$)</small>
                    </div>

                    {/* Ordem de Exibição */}
                    <div className="form-group">
                        <label htmlFor="displayOrder">
                            Ordem de Exibição
                        </label>
                        <input
                            type="number"
                            id="displayOrder"
                            name="displayOrder"
                            value={formData.displayOrder}
                            onChange={handleChange}
                            min="0"
                        />
                        <small>Ordem de exibição (menor aparece primeiro)</small>
                    </div>

                    {/* Configurações Adicionais */}
                    <div className="form-group full-width">
                        <label htmlFor="settings">
                            Configurações Adicionais (JSON)
                        </label>
                        <textarea
                            id="settings"
                            name="settings"
                            value={formData.settings}
                            onChange={handleChange}
                            rows={3}
                            placeholder='{"chave": "valor"}'
                        />
                        <small>Configurações extras em formato JSON (opcional)</small>
                    </div>

                    {/* Ativo */}
                    <div className="form-group checkbox-group full-width">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                            />
                            <span>Método ativo</span>
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={onCancel} className="btn-cancel" disabled={loading}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Salvando...' : paymentMethodId ? 'Atualizar' : 'Criar'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PaymentMethodForm;
