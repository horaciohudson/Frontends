import React, { useState, useEffect } from 'react';
import type { LedgerEntryDTO, LedgerEntryFormData } from '../../types/ledgerEntry';
import type { LedgerAccountSelectOption } from '../../types/ledgerAccount';
import type { CostCenterSelectOption } from '../../types/costCenter';
import { ledgerAccountService } from '../../services/ledgerAccountService';
import { costCenterService } from '../../services/costCenterService';
import { formatCurrency, parseCurrency } from '../../utils/formatting';
import './LedgerEntryForm.css';

interface LedgerEntryFormProps {
  initialData?: LedgerEntryDTO | null;
  onSubmit: (data: LedgerEntryFormData) => Promise<void>;
}

const LedgerEntryForm: React.FC<LedgerEntryFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Partial<LedgerEntryFormData>>({
    entryDate: new Date().toISOString().split('T')[0],
    description: '',
    debitAccountId: '',
    creditAccountId: '',
    amount: 0,
    costCenterId: '',
    notes: '',
  });

  const [amountDisplay, setAmountDisplay] = useState('');
  const [accounts, setAccounts] = useState<LedgerAccountSelectOption[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenterSelectOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    if (initialData) {
      // Nota: edição de lançamentos duplos não está implementada nesta versão
      // Por enquanto, o formulário é apenas para criação
      setFormData({
        entryDate: initialData.entryDate,
        description: initialData.description,
        debitAccountId: '',
        creditAccountId: '',
        amount: initialData.amount,
        costCenterId: initialData.costCenterId || '',
        notes: initialData.notes || '',
      });
      setAmountDisplay(formatCurrency(initialData.amount));
    }
  }, [initialData]);

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      const [accountsData, costCentersData] = await Promise.all([
        ledgerAccountService.findActiveAccounts(),
        costCenterService.findAll({ isActive: true }),
      ]);

      // Filtrar apenas contas analíticas (que aceitam lançamentos)
      const analyticalAccounts = accountsData.filter((acc: any) => acc.acceptsEntries);
      const accountTree = ledgerAccountService.buildTree(analyticalAccounts);
      setAccounts(ledgerAccountService.flattenTree(accountTree));


      // Cost centers já vêm em formato de lista, apenas criar opções
      const ccOptions: CostCenterSelectOption[] = costCentersData.map(cc => ({
        value: String(cc.id),
        label: `${cc.costCenterCode} - ${cc.costCenterName}`,
        level: cc.level || 1,
        disabled: false,
      }));
      setCostCenters(ccOptions);
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.entryDate) {
      newErrors.entryDate = 'Data é obrigatória';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.debitAccountId) {
      newErrors.debitAccountId = 'Conta de débito é obrigatória';
    }

    if (!formData.creditAccountId) {
      newErrors.creditAccountId = 'Conta de crédito é obrigatória';
    }

    if (formData.debitAccountId === formData.creditAccountId) {
      newErrors.creditAccountId = 'Conta de crédito deve ser diferente da conta de débito';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof LedgerEntryFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmountDisplay(value);
    const numericValue = parseCurrency(value);
    handleChange('amount', numericValue);
  };

  const handleAmountBlur = () => {
    if (formData.amount) {
      setAmountDisplay(formatCurrency(formData.amount));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData as LedgerEntryFormData);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingOptions) {
    return <div className="form-loading">Carregando opções...</div>;
  }

  return (
    <form className="ledger-entry-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Informações do Lançamento</h3>

        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="entryDate">Data *</label>
            <input
              id="entryDate"
              type="date"
              value={formData.entryDate || ''}
              onChange={(e) => handleChange('entryDate', e.target.value)}
              className={errors.entryDate ? 'error' : ''}
            />
            {errors.entryDate && <span className="error-message">{errors.entryDate}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="amount">Valor *</label>
            <input
              id="amount"
              type="text"
              value={amountDisplay}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              className={errors.amount ? 'error' : ''}
              placeholder="R$ 0,00"
            />
            {errors.amount && <span className="error-message">{errors.amount}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="description">Descrição *</label>
            <input
              id="description"
              type="text"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className={errors.description ? 'error' : ''}
              placeholder="Descrição do lançamento"
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Contas Contábeis</h3>

        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="debitAccountId">Conta de Débito *</label>
            <select
              id="debitAccountId"
              value={formData.debitAccountId || ''}
              onChange={(e) => handleChange('debitAccountId', e.target.value)}
              className={errors.debitAccountId ? 'error' : ''}
            >
              <option value="">Selecione...</option>
              {accounts.map(acc => (
                <option key={acc.value} value={acc.value} disabled={acc.disabled}>
                  {acc.label}
                </option>
              ))}
            </select>
            {errors.debitAccountId && <span className="error-message">{errors.debitAccountId}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="creditAccountId">Conta de Crédito *</label>
            <select
              id="creditAccountId"
              value={formData.creditAccountId || ''}
              onChange={(e) => handleChange('creditAccountId', e.target.value)}
              className={errors.creditAccountId ? 'error' : ''}
            >
              <option value="">Selecione...</option>
              {accounts.map(acc => (
                <option key={acc.value} value={acc.value} disabled={acc.disabled}>
                  {acc.label}
                </option>
              ))}
            </select>
            {errors.creditAccountId && <span className="error-message">{errors.creditAccountId}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="costCenterId">Centro de Custo</label>
            <select
              id="costCenterId"
              value={formData.costCenterId || ''}
              onChange={(e) => handleChange('costCenterId', e.target.value)}
            >
              <option value="">Nenhum</option>
              {costCenters.map(cc => (
                <option key={cc.value} value={cc.value} disabled={cc.disabled}>
                  {cc.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Observações</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="notes">Notas</label>
            <textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Salvando...' : (initialData ? 'Atualizar' : 'Criar')}
        </button>
      </div>
    </form>
  );
};

export default LedgerEntryForm;
