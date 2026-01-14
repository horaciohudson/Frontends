import React, { useState } from 'react';
import type { AccountsPayableDTO, ProcessPaymentDTO } from '../../types/accountsPayable';
import { MoneyInput } from '../ui';
import { formatCurrency } from '../../utils/formatting';
import './PaymentForm.css';

interface PaymentFormProps {
  accountPayable: AccountsPayableDTO | null;
  onSubmit: (data: ProcessPaymentDTO) => Promise<void>;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  accountPayable,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Partial<ProcessPaymentDTO>>({
    paymentAmount: accountPayable?.remainingAmount || 0,
    paymentDate: new Date().toISOString().split('T')[0],
    bankAccountId: 0,
    paymentMethod: 'PIX',
    paymentNotes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof ProcessPaymentDTO, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.paymentAmount || formData.paymentAmount <= 0) {
      newErrors.paymentAmount = 'Valor do pagamento deve ser maior que zero';
    }

    if (accountPayable && formData.paymentAmount && formData.paymentAmount > accountPayable.remainingAmount) {
      newErrors.paymentAmount = 'Valor não pode ser maior que o saldo devedor';
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Data do pagamento é obrigatória';
    }

    // Conta bancária é obrigatória apenas se o método não for Dinheiro
    if (!formData.bankAccountId && formData.paymentMethod !== 'CASH') {
      newErrors.bankAccountId = 'Conta bancária é obrigatória';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Método de pagamento é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      await onSubmit(formData as ProcessPaymentDTO);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!accountPayable) return null;

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      <div className="payment-summary">
        <div className="summary-item">
          <span className="label">Descrição:</span>
          <span className="value">{accountPayable.description}</span>
        </div>
        <div className="summary-item">
          <span className="label">Fornecedor:</span>
          <span className="value">{accountPayable.supplierName}</span>
        </div>
        <div className="summary-item">
          <span className="label">Valor Original:</span>
          <span className="value">{formatCurrency(accountPayable.originalAmount)}</span>
        </div>
        <div className="summary-item highlight">
          <span className="label">Saldo Devedor:</span>
          <span className="value">{formatCurrency(accountPayable.remainingAmount)}</span>
        </div>
      </div>

      <div className="form-section">
        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="paymentAmount">Valor do Pagamento *</label>
            <MoneyInput
              value={formData.paymentAmount || 0}
              onChange={(value) => handleChange('paymentAmount', value)}
              error={errors.paymentAmount}
            />
          </div>
          <div className="form-group">
            <label htmlFor="paymentDate">Data do Pagamento *</label>
            <input
              id="paymentDate"
              type="date"
              value={formData.paymentDate || ''}
              onChange={(e) => handleChange('paymentDate', e.target.value)}
              className={errors.paymentDate ? 'error' : ''}
            />
            {errors.paymentDate && <span className="error-message">{errors.paymentDate}</span>}
          </div>
        </div>

        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="paymentMethod">Método de Pagamento *</label>
            <select
              id="paymentMethod"
              value={formData.paymentMethod || ''}
              onChange={(e) => handleChange('paymentMethod', e.target.value)}
              className={errors.paymentMethod ? 'error' : ''}
            >
              <option value="">Selecione...</option>
              <option value="CASH">Dinheiro</option>
              <option value="PIX">PIX</option>
              <option value="TRANSFER">Transferência</option>
              <option value="CREDIT_CARD">Cartão de Crédito</option>
              <option value="DEBIT_CARD">Cartão de Débito</option>
              <option value="BOLETO">Boleto</option>
              <option value="CHECK">Cheque</option>
              <option value="OTHER">Outro</option>
            </select>
            {errors.paymentMethod && <span className="error-message">{errors.paymentMethod}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="bankAccountId">
              Conta Bancária {formData.paymentMethod !== 'CASH' && '*'}
            </label>
            <select
              id="bankAccountId"
              value={formData.bankAccountId || ''}
              onChange={(e) => handleChange('bankAccountId', Number(e.target.value))}
              className={errors.bankAccountId ? 'error' : ''}
              disabled={formData.paymentMethod === 'CASH'}
            >
              <option value="">Selecione...</option>
              <option value="1">Conta Principal - Banco do Brasil</option>
              <option value="2">Conta Secundária - Itaú</option>
            </select>
            {errors.bankAccountId && <span className="error-message">{errors.bankAccountId}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="paymentNotes">Observações</label>
            <textarea
              id="paymentNotes"
              value={formData.paymentNotes || ''}
              onChange={(e) => handleChange('paymentNotes', e.target.value)}
              placeholder="Observações sobre o pagamento..."
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Processando...' : 'Confirmar Pagamento'}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
