import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { FinancialCategoryDTO, CreateFinancialCategoryDTO } from '../../types/financialCategory';
import { validateFinancialCategory } from '../../utils/validation';
import './FinancialCategoryForm.css';

export interface FinancialCategoryFormRef {
  submit: () => Promise<void>;
}

interface FinancialCategoryFormProps {
  initialData?: FinancialCategoryDTO | null;
  parentCategory?: FinancialCategoryDTO | null;
  onSubmit: (data: CreateFinancialCategoryDTO) => Promise<void>;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#475569', '#1e293b',
];

const PRESET_ICONS = [
  '📁', '💰', '💳', '🏦', '📊', '📈', '📉', '💵', '💸', '🛒',
  '🏠', '🚗', '✈️', '🍔', '⚡', '📱', '💻', '🎓', '🏥', '🎭',
];

const FinancialCategoryForm = forwardRef<FinancialCategoryFormRef, FinancialCategoryFormProps>(({
  initialData,
  parentCategory,
  onSubmit,
}, ref) => {
  const [formData, setFormData] = useState<Partial<CreateFinancialCategoryDTO>>({
    categoryCode: '',
    categoryName: '',
    parentCategoryId: parentCategory?.id,
    description: '',
    color: '#8b5cf6',
    icon: '📁',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        categoryCode: initialData.categoryCode,
        categoryName: initialData.categoryName,
        parentCategoryId: initialData.parentCategoryId,
        description: initialData.description,
        color: initialData.color || '#8b5cf6',
        icon: initialData.icon || '📁',
        isActive: initialData.isActive,
      });
    } else if (parentCategory) {
      setFormData(prev => ({
        ...prev,
        parentCategoryId: parentCategory.id,
        categoryCode: parentCategory.categoryCode + '.',
      }));
    }
  }, [initialData, parentCategory]);

  const handleChange = (field: keyof CreateFinancialCategoryDTO, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    const validation = validateFinancialCategory(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData as CreateFinancialCategoryDTO);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit
  }));

  return (
    <div className="financial-category-form">
      {parentCategory && (
        <div className="parent-info">
          <span className="parent-label">Categoria pai:</span>
          <span className="parent-value">{parentCategory.categoryCode} - {parentCategory.categoryName}</span>
        </div>
      )}

      <div className="form-section">
        <h3>Informações Básicas</h3>
        
        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="categoryCode">Código *</label>
            <input
              id="categoryCode"
              type="text"
              value={formData.categoryCode || ''}
              onChange={(e) => handleChange('categoryCode', e.target.value.toUpperCase())}
              className={errors.categoryCode ? 'error' : ''}
              placeholder="Ex: DESP.ADM"
            />
            {errors.categoryCode && <span className="error-message">{errors.categoryCode}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="categoryName">Nome *</label>
            <input
              id="categoryName"
              type="text"
              value={formData.categoryName || ''}
              onChange={(e) => handleChange('categoryName', e.target.value)}
              className={errors.categoryName ? 'error' : ''}
              placeholder="Nome da categoria"
            />
            {errors.categoryName && <span className="error-message">{errors.categoryName}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrição da categoria..."
              rows={2}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Aparência</h3>
        
        <div className="form-row two-columns">
          <div className="form-group">
            <label>Cor</label>
            <div className="color-picker">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleChange('color', color)}
                />
              ))}
            </div>
            {errors.color && <span className="error-message">{errors.color}</span>}
          </div>
          <div className="form-group">
            <label>Ícone</label>
            <div className="icon-picker">
              {PRESET_ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                  onClick={() => handleChange('icon', icon)}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
});

FinancialCategoryForm.displayName = 'FinancialCategoryForm';

export default FinancialCategoryForm;
