import React, { useState } from 'react';
import type { AccountsReceivableDTO, ProcessReceiptDTO } from '../../types/accountsReceivable';
import { MoneyInput } from '../ui';
import { formatCurrency } from '../../utils/formatting';
import './ReceiptForm.css';

interface ReceiptFormProps {
  accountReceivable: AccountsReceivableDTO | null;
  onSubmit: (data: ProcessReceiptDTO) => Promise<void>;
}

const ReceiptForm: React.FC<ReceiptFormProps> = ({
  accountReceivable,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Partial<ProcessReceiptDTO>>({
    receiptAmount: accountReceivable?.remainingAmount || 0,
    receiptDate: new Date().toISOString().split('T')[0],
    bankAccountId: 0,
    receiptMethod: 'PIX',
    receiptNotes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof ProcessReceiptDTO, value: unknown) => {
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

    if (!formData.receiptAmount || formData.receiptAmount <= 0) {
      newErrors.receiptAmount = 'Valor do recebimento deve ser maior que zero';
    }

    if (accountReceivable && formData.receiptAmount && formData.receiptAmount > accountReceivable.remainingAmount) {
      newErrors.receiptAmount = 'Valor não pode ser maior que o saldo a receber';
    }

    if (!formData.receiptDate) {
      newErrors.receiptDate = 'Data do recebimento é obrigatória';
    }

    // Conta bancária é obrigatória apenas se o método não for Dinheiro
    if (!formData.bankAccountId && formData.receiptMethod !== 'CASH') {
      newErrors.bankAccountId = 'Conta bancária é obrigatória';
    }

    if (!formData.receiptMethod) {
      newErrors.receiptMethod = 'Método de recebimento é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      await onSubmit(formData as ProcessReceiptDTO);
    } catch (error) {
      console.error('Erro ao processar recebimento:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!accountReceivable) return null;

  return (
    <form className="receipt-form" onSubmit={handleSubmit}>
      <div className="receipt-summary">
        <div className="summary-item">
          <span className="label">Descrição:</span>
          <span className="value">{accountReceivable.receivableDescription}</span>
        </div>
        <div className="summary-item">
          <span className="label">Cliente:</span>
          <span className="value">{accountReceivable.customerName}</span>
        </div>
        <div className="summary-item">
          <span className="label">Valor Original:</span>
          <span className="value">{formatCurrency(accountReceivable.originalAmount)}</span>
        </div>
        <div className="summary-item highlight">
          <span className="label">Saldo a Receber:</span>
          <span className="value">{formatCurrency(accountReceivable.remainingAmount)}</span>
        </div>
      </div>

      <div className="form-section">
        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="receiptAmount">Valor Recebido *</label>
            <MoneyInput
              value={formData.receiptAmount || 0}
              onChange={(value) => handleChange('receiptAmount', value)}
              error={errors.receiptAmount}
            />
          </div>
          <div className="form-group">
            <label htmlFor="receiptDate">Data do Recebimento *</label>
            <input
              id="receiptDate"
              type="date"
              value={formData.receiptDate || ''}
              onChange={(e) => handleChange('receiptDate', e.target.value)}
              className={errors.receiptDate ? 'error' : ''}
            />
            {errors.receiptDate && <span className="error-message">{errors.receiptDate}</span>}
          </div>
        </div>

        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="receiptMethod">Método de Recebimento *</label>
            <select
              id="receiptMethod"
              value={formData.receiptMethod || ''}
              onChange={(e) => handleChange('receiptMethod', e.target.value)}
              className={errors.receiptMethod ? 'error' : ''}
            >
              <option value="">Selecione...</option>
              <option value="CASH">Dinheiro</option>
              <option value="PIX">PIX</option>
              <option value="BOLETO">Boleto</option>
              <option value="CREDIT_CARD">Cartão de Crédito</option>
              <option value="DEBIT_CARD">Cartão de Débito</option>
              <option value="TRANSFER">Transferência</option>
              <option value="CHECK">Cheque</option>
              <option value="OTHER">Outro</option>
            </select>
            {errors.receiptMethod && <span className="error-message">{errors.receiptMethod}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="bankAccountId">
              Conta Bancária {formData.receiptMethod !== 'CASH' && '*'}
            </label>
            <select
              id="bankAccountId"
              value={formData.bankAccountId || ''}
              onChange={(e) => handleChange('bankAccountId', Number(e.target.value))}
              className={errors.bankAccountId ? 'error' : ''}
              disabled={formData.receiptMethod === 'CASH'}
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
            <label htmlFor="receiptNotes">Observações</label>
            <textarea
              id="receiptNotes"
              value={formData.receiptNotes || ''}
              onChange={(e) => handleChange('receiptNotes', e.target.value)}
              placeholder="Observações sobre o recebimento..."
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Processando...' : 'Confirmar Recebimento'}
        </button>
      </div>
    </form>
  );
};

export default ReceiptForm;
