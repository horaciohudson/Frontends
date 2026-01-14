import React, { useState, useEffect } from 'react';
import type { CashFlowDTO, CreateCashFlowDTO } from '../../types/cashFlow';
import { CashFlowType, CashFlowStatus, PaymentMethod } from '../../types/enums';
import { MoneyInput } from '../ui';
import { validateCashFlow } from '../../utils/validation';
import { categoryService } from '../../services/categoryService';
import { costCenterService } from '../../services/costCenterService';
import './CashFlowForm.css';

interface CashFlowFormProps {
  initialData?: CashFlowDTO | null;
  onSubmit: (data: CreateCashFlowDTO) => Promise<void>;
}

const CashFlowForm: React.FC<CashFlowFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Partial<CreateCashFlowDTO>>({
    flowDate: new Date().toISOString().split('T')[0],
    flowType: CashFlowType.OUTFLOW,
    amount: 0,
    description: '',
    flowStatus: CashFlowStatus.PENDING,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [costCenters, setCostCenters] = useState<Array<{ id: number; name: string }>>([]);

  // Load categories and cost centers
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [categoriesData, costCentersData] = await Promise.all([
          categoryService.findAll(),
          costCenterService.findAll({ companyId: sessionStorage.getItem('selectedCompanyId') || '' })
        ]);
        setCategories(categoriesData.map((c: any) => ({ id: c.categoryId, name: c.categoryName })));
        setCostCenters(costCentersData.map((cc: any) => ({ id: cc.id, name: cc.costCenterName })));
      } catch (error) {
        console.error('Erro ao carregar opções:', error);
      }
    };
    loadOptions();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        flowDate: initialData.flowDate,
        flowType: initialData.flowType,
        amount: initialData.amount,
        description: initialData.description,
        bankAccountId: initialData.bankAccountId,
        financialCategoryId: initialData.financialCategoryId,
        costCenterId: initialData.costCenterId,
        flowStatus: initialData.flowStatus,
        dueDate: initialData.dueDate,
        paymentMethod: initialData.paymentMethod,
        documentNumber: initialData.documentNumber,
        beneficiaryName: initialData.beneficiaryName,
        notes: initialData.notes,
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof CreateCashFlowDTO, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateCashFlow(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData as CreateCashFlowDTO);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="cash-flow-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Tipo de Lançamento</h3>

        <div className="flow-type-selector">
          <button
            type="button"
            className={`type-btn inflow ${formData.flowType === CashFlowType.INFLOW ? 'active' : ''}`}
            onClick={() => handleChange('flowType', CashFlowType.INFLOW)}
          >
            📈 Entrada
          </button>
          <button
            type="button"
            className={`type-btn outflow ${formData.flowType === CashFlowType.OUTFLOW ? 'active' : ''}`}
            onClick={() => handleChange('flowType', CashFlowType.OUTFLOW)}
          >
            📉 Saída
          </button>
        </div>
      </div>

      <div className="form-section">
        <h3>Informações Básicas</h3>

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

        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="amount">Valor *</label>
            <MoneyInput
              value={formData.amount || 0}
              onChange={(value) => handleChange('amount', value)}
              error={errors.amount}
            />
          </div>
          <div className="form-group">
            <label htmlFor="flowDate">Data *</label>
            <input
              id="flowDate"
              type="date"
              value={formData.flowDate || ''}
              onChange={(e) => handleChange('flowDate', e.target.value)}
              className={errors.flowDate ? 'error' : ''}
            />
            {errors.flowDate && <span className="error-message">{errors.flowDate}</span>}
          </div>
        </div>

        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="beneficiaryName">Beneficiário</label>
            <input
              id="beneficiaryName"
              type="text"
              value={formData.beneficiaryName || ''}
              onChange={(e) => handleChange('beneficiaryName', e.target.value)}
              placeholder="Nome do beneficiário"
            />
          </div>
          <div className="form-group">
            <label htmlFor="documentNumber">Nº Documento</label>
            <input
              id="documentNumber"
              type="text"
              value={formData.documentNumber || ''}
              onChange={(e) => handleChange('documentNumber', e.target.value)}
              placeholder="Número do documento"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Categorização</h3>

        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="categoryId">Categoria Financeira *</label>
            <select
              id="categoryId"
              value={formData.categoryId || ''}
              onChange={(e) => {
                const categoryId = e.target.value ? Number(e.target.value) : undefined;
                const category = categories.find(c => c.id === categoryId)?.name || '';
                handleChange('categoryId', categoryId);
                handleChange('category', category);
              }}
              className={errors.category ? 'error' : ''}
            >
              <option value="">Selecione...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="costCenterId">Centro de Custo</label>
            <select
              id="costCenterId"
              value={formData.costCenterId || ''}
              onChange={(e) => handleChange('costCenterId', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Selecione...</option>
              {costCenters.map(cc => (
                <option key={cc.id} value={cc.id}>{cc.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>


      <div className="form-section">
        <h3>Pagamento</h3>

        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="paymentMethod">Método de Pagamento</label>
            <select
              id="paymentMethod"
              value={formData.paymentMethod || ''}
              onChange={(e) => handleChange('paymentMethod', e.target.value || undefined)}
            >
              <option value="">Selecione...</option>
              <option value={PaymentMethod.PIX}>PIX</option>
              <option value={PaymentMethod.TRANSFER}>Transferência</option>
              <option value={PaymentMethod.BOLETO}>Boleto</option>
              <option value={PaymentMethod.CREDIT_CARD}>Cartão de Crédito</option>
              <option value={PaymentMethod.DEBIT_CARD}>Cartão de Débito</option>
              <option value={PaymentMethod.CASH}>Dinheiro</option>
              <option value={PaymentMethod.CHECK}>Cheque</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="dueDate">Data de Vencimento</label>
            <input
              id="dueDate"
              type="date"
              value={formData.dueDate || ''}
              onChange={(e) => handleChange('dueDate', e.target.value || undefined)}
            />
          </div>
        </div>

        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="bankAccountId">Conta Bancária</label>
            <select
              id="bankAccountId"
              value={formData.bankAccountId || ''}
              onChange={(e) => handleChange('bankAccountId', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Selecione...</option>
              <option value="1">Conta Principal - Banco do Brasil</option>
              <option value="2">Conta Secundária - Itaú</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="flowStatus">Status</label>
            <select
              id="flowStatus"
              value={formData.flowStatus || CashFlowStatus.PENDING}
              onChange={(e) => handleChange('flowStatus', e.target.value)}
            >
              <option value={CashFlowStatus.PENDING}>Pendente</option>
              <option value={CashFlowStatus.PAID}>Pago</option>
              <option value={CashFlowStatus.PARTIAL}>Parcial</option>
              <option value={CashFlowStatus.CANCELLED}>Cancelado</option>
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

export default CashFlowForm;
