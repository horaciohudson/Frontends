import React, { useState, useEffect } from 'react';
import type { InvoiceDTO, CreateInvoiceDTO, InvoiceItemDTO, InvoiceType } from '../../types/invoice';
import { INVOICE_TYPE_LABELS } from '../../types/invoice';
import type { TaxSelectOption } from '../../types/tax';
import { taxService } from '../../services/taxService';
import { formatCurrency } from '../../utils/formatting';
import { companyService } from '../../services/companyService';
import type { Company } from '../../services/companyService';
import './InvoiceForm.css';

interface InvoiceFormProps {
  initialData?: InvoiceDTO | null;
  onSubmit: (data: CreateInvoiceDTO) => Promise<void>;
}

const INVOICE_TYPES: InvoiceType[] = ['INPUT', 'OUTPUT'];

const emptyItem: InvoiceItemDTO = {
  description: '',
  quantity: 1,
  unitPrice: 0,
  totalPrice: 0,
};

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Partial<CreateInvoiceDTO>>({
    invoiceNumber: '',
    series: '1',
    invoiceType: 'OUTPUT',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    items: [{ ...emptyItem }],
    notes: '',
  });

  const [taxes, setTaxes] = useState<TaxSelectOption[]>([]);
  const [partners, setPartners] = useState<Company[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    loadPartners();
  }, [formData.invoiceType]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        invoiceNumber: initialData.invoiceNumber,
        series: initialData.series,
        invoiceType: initialData.invoiceType,
        issueDate: initialData.issueDate,
        dueDate: initialData.dueDate,
        customerId: initialData.customerId,
        supplierId: initialData.supplierId,
        items: initialData.items || [{ ...emptyItem }],
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      const taxOptions = await taxService.getSelectOptions();
      setTaxes(taxOptions);
    } catch (error) {
      console.error('Erro ao carregar opções de impostos:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadPartners = async () => {
    try {
      if (formData.invoiceType === 'INPUT') {
        const suppliers = await companyService.getSuppliersSimple();
        setPartners(suppliers);
      } else {
        const customers = await companyService.getCustomersSimple();
        setPartners(customers);
      }
    } catch (error) {
      console.error('Erro ao carregar parceiros (clientes/fornecedores):', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.invoiceNumber?.trim()) {
      newErrors.invoiceNumber = 'Número é obrigatório';
    }

    if (!formData.series?.trim()) {
      newErrors.series = 'Série é obrigatória';
    }

    if (!formData.issueDate) {
      newErrors.issueDate = 'Data de emissão é obrigatória';
    }

    if (!formData.items || formData.items.length === 0) {
      newErrors.items = 'Adicione pelo menos um item';
    } else {
      const hasInvalidItem = formData.items.some(
        item => !item.description || item.quantity <= 0 || item.unitPrice <= 0
      );
      if (hasInvalidItem) {
        newErrors.items = 'Preencha todos os campos dos itens corretamente';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CreateInvoiceDTO, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItemDTO, value: unknown) => {
    const items = [...(formData.items || [])];
    items[index] = { ...items[index], [field]: value };

    // Recalcular total do item
    if (field === 'quantity' || field === 'unitPrice') {
      items[index].totalPrice = items[index].quantity * items[index].unitPrice;

      // Recalcular taxAmount se houver taxa de imposto
      if (items[index].taxRate) {
        items[index].taxAmount = items[index].totalPrice * (items[index].taxRate / 100);
      }
    }

    handleChange('items', items);
  };

  const addItem = () => {
    const items = [...(formData.items || []), { ...emptyItem }];
    handleChange('items', items);
  };

  const removeItem = (index: number) => {
    const items = (formData.items || []).filter((_, i) => i !== index);
    handleChange('items', items.length > 0 ? items : [{ ...emptyItem }]);
  };

  const calculateTotals = () => {
    const items = formData.items || [];
    let subtotal = 0;
    let taxAmount = 0;

    items.forEach(item => {
      subtotal += item.totalPrice || 0;
      taxAmount += item.taxAmount || 0;
    });

    return { subtotal, taxAmount, total: subtotal + taxAmount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData as CreateInvoiceDTO);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  if (loadingOptions) {
    return <div className="form-loading">Carregando opções...</div>;
  }

  return (
    <form className="invoice-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Dados da Nota Fiscal</h3>

        <div className="form-row three-columns">
          <div className="form-group">
            <label htmlFor="invoiceNumber">Número *</label>
            <input
              id="invoiceNumber"
              type="text"
              value={formData.invoiceNumber || ''}
              onChange={(e) => handleChange('invoiceNumber', e.target.value)}
              className={errors.invoiceNumber ? 'error' : ''}
              placeholder="000001"
            />
            {errors.invoiceNumber && <span className="error-message">{errors.invoiceNumber}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="series">Série *</label>
            <input
              id="series"
              type="text"
              value={formData.series || ''}
              onChange={(e) => handleChange('series', e.target.value)}
              className={errors.series ? 'error' : ''}
              placeholder="1"
            />
            {errors.series && <span className="error-message">{errors.series}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="invoiceType">Tipo *</label>
            <select
              id="invoiceType"
              value={formData.invoiceType || 'OUTPUT'}
              onChange={(e) => handleChange('invoiceType', e.target.value as InvoiceType)}
            >
              {INVOICE_TYPES.map(type => (
                <option key={type} value={type}>
                  {INVOICE_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row three-columns">
          <div className="form-group">
            <label htmlFor="issueDate">Data de Emissão *</label>
            <input
              id="issueDate"
              type="date"
              value={formData.issueDate || ''}
              onChange={(e) => handleChange('issueDate', e.target.value)}
              className={errors.issueDate ? 'error' : ''}
            />
            {errors.issueDate && <span className="error-message">{errors.issueDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Data de Vencimento</label>
            <input
              id="dueDate"
              type="date"
              value={formData.dueDate || ''}
              onChange={(e) => handleChange('dueDate', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="partner">
              {formData.invoiceType === 'INPUT' ? 'Fornecedor' : 'Cliente'} *
            </label>
            <select
              id="partner"
              value={formData.invoiceType === 'INPUT' ? (formData.supplierId || '') : (formData.customerId || '')}
              onChange={(e) => {
                const partnerId = e.target.value;
                const partner = partners.find(p => p.id === partnerId);

                if (formData.invoiceType === 'INPUT') {
                  setFormData(prev => ({
                    ...prev,
                    supplierId: partnerId,
                    supplierName: partner?.corporateName,
                    customerId: undefined,
                    customerName: undefined
                  }));
                } else {
                  setFormData(prev => ({
                    ...prev,
                    customerId: partnerId,
                    customerName: partner?.corporateName,
                    supplierId: undefined,
                    supplierName: undefined
                  }));
                }
              }}
              className={errors.items ? 'error' : ''}
            >
              <option value="">Selecione...</option>
              {partners.map(p => (
                <option key={p.id} value={p.id}>
                  {p.corporateName} {p.cnpj ? `- ${p.cnpj}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h3>Itens</h3>
          <button type="button" className="btn-add-item" onClick={addItem}>
            + Adicionar Item
          </button>
        </div>

        {errors.items && <span className="error-message">{errors.items}</span>}

        <div className="items-list">
          {(formData.items || []).map((item, index) => (
            <div key={index} className="item-row">
              <div className="item-fields">
                <div className="form-group description">
                  <label>Descrição</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Descrição do item"
                  />
                </div>
                <div className="form-group quantity">
                  <label>Qtd</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="form-group unit-price">
                  <label>Preço Unit.</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice || ''}
                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group tax">
                  <label>Imposto</label>
                  <select
                    value={item.taxId || ''}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      const newItems = [...(formData.items || [])];
                      const currentItem = newItems[index];

                      if (selectedValue) {
                        const tax = taxes.find(t => t.value === selectedValue);
                        if (tax) {
                          const totalPrice = currentItem.totalPrice || 0;
                          const taxAmount = totalPrice * (tax.rate / 100);

                          newItems[index] = {
                            ...currentItem,
                            taxId: selectedValue,
                            taxRate: tax.rate,
                            taxName: tax.label,
                            taxAmount: taxAmount
                          };
                        }
                      } else {
                        newItems[index] = {
                          ...currentItem,
                          taxId: undefined,
                          taxRate: 0,
                          taxName: undefined,
                          taxAmount: 0
                        };
                      }

                      handleChange('items', newItems);
                    }}
                  >
                    <option value="">Nenhum</option>
                    {taxes.map(tax => (
                      <option key={tax.value} value={tax.value}>
                        {tax.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group total">
                  <label>Total</label>
                  <span className="total-value">{formatCurrency(item.totalPrice)}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-remove-item"
                onClick={() => removeItem(index)}
                disabled={(formData.items || []).length <= 1}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="form-section totals-section">
        <div className="totals-row">
          <span>Subtotal:</span>
          <span>{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="totals-row">
          <span>Impostos:</span>
          <span>{formatCurrency(totals.taxAmount)}</span>
        </div>
        <div className="totals-row total">
          <span>Total:</span>
          <span>{formatCurrency(totals.total)}</span>
        </div>
      </div>

      <div className="form-section">
        <h3>Observações</h3>
        <div className="form-row">
          <div className="form-group">
            <textarea
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

export default InvoiceForm;
