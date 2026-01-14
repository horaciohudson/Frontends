import React, { useState, useEffect } from 'react';
import type { TaxDTO, CreateTaxDTO, TaxCategory } from '../../types/tax';
import { TAX_CATEGORY_LABELS } from '../../types/tax';
import './TaxForm.css';

interface TaxFormProps {
  initialData?: TaxDTO | null;
  onSubmit: (data: CreateTaxDTO) => Promise<void>;
}

const TAX_CATEGORIES: TaxCategory[] = ['FEDERAL', 'STATE', 'MUNICIPAL', 'OTHER'];

const TaxForm: React.FC<TaxFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Partial<CreateTaxDTO>>({
    taxCode: '',
    taxName: '',
    defaultRate: 0,
    taxCategory: 'FEDERAL',
    description: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        taxCode: initialData.taxCode,
        taxName: initialData.taxName,
        defaultRate: initialData.defaultRate,
        taxCategory: initialData.taxCategory,
        description: initialData.description,
        isActive: initialData.isActive,
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.taxCode?.trim()) {
      newErrors.taxCode = 'Código é obrigatório';
    } else if (formData.taxCode.length > 20) {
      newErrors.taxCode = 'Código deve ter no máximo 20 caracteres';
    }

    if (!formData.taxName?.trim()) {
      newErrors.taxName = 'Nome é obrigatório';
    } else if (formData.taxName.length > 100) {
      newErrors.taxName = 'Nome deve ter no máximo 100 caracteres';
    }

    if (formData.defaultRate === undefined || formData.defaultRate < 0) {
      newErrors.defaultRate = 'Alíquota deve ser maior ou igual a zero';
    } else if (formData.defaultRate > 100) {
      newErrors.defaultRate = 'Alíquota deve ser no máximo 100%';
    }

    if (!formData.taxCategory) {
      newErrors.taxCategory = 'Categoria de imposto é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CreateTaxDTO, value: unknown) => {
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

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData as CreateTaxDTO);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="tax-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Informações do Imposto</h3>

        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="taxCode">Código *</label>
            <input
              id="taxCode"
              type="text"
              value={formData.taxCode || ''}
              onChange={(e) => handleChange('taxCode', e.target.value.toUpperCase())}
              className={errors.taxCode ? 'error' : ''}
              placeholder="Ex: ICMS"
            />
            {errors.taxCode && <span className="error-message">{errors.taxCode}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="taxName">Nome *</label>
            <input
              id="taxName"
              type="text"
              value={formData.taxName || ''}
              onChange={(e) => handleChange('taxName', e.target.value)}
              className={errors.taxName ? 'error' : ''}
              placeholder="Nome do imposto"
            />
            {errors.taxName && <span className="error-message">{errors.taxName}</span>}
          </div>
        </div>

        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="defaultRate">Alíquota (%) *</label>
            <input
              id="defaultRate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.defaultRate || ''}
              onChange={(e) => handleChange('defaultRate', parseFloat(e.target.value) || 0)}
              className={errors.defaultRate ? 'error' : ''}
              placeholder="0.00"
            />
            {errors.defaultRate && <span className="error-message">{errors.defaultRate}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="taxCategory">Categoria *</label>
            <select
              id="taxCategory"
              value={formData.taxCategory || 'FEDERAL'}
              onChange={(e) => handleChange('taxCategory', e.target.value as TaxCategory)}
              className={errors.taxCategory ? 'error' : ''}
            >
              {TAX_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {TAX_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
            {errors.taxCategory && <span className="error-message">{errors.taxCategory}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrição do imposto..."
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

export default TaxForm;
