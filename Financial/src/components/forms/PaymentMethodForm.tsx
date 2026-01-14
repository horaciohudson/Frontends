import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { PaymentMethodDTO, CreatePaymentMethodDTO } from '../../types/paymentMethod';
import { PAYMENT_METHOD_TYPES } from '../../types/paymentMethod';
import { authService } from '../../services/authService';
import { companyService, type Company } from '../../services/companyService';
import './PaymentMethodForm.css';

interface PaymentMethodFormProps {
  initialData?: PaymentMethodDTO | null;
  selectedCompanyId: string;
  onSubmit: (data: CreatePaymentMethodDTO) => Promise<void>;
}

export interface PaymentMethodFormRef {
  submit: () => Promise<void>;
}

const PaymentMethodForm = forwardRef<PaymentMethodFormRef, PaymentMethodFormProps>(({
  initialData,
  selectedCompanyId,
  onSubmit,
}, ref) => {
  console.log('🔍 PaymentMethodForm - Componente renderizado');
  console.log('🔍 PaymentMethodForm - Props:', { initialData, selectedCompanyId });

  const [formData, setFormData] = useState<Partial<CreatePaymentMethodDTO>>({
    companyId: selectedCompanyId,
    methodCode: '',
    methodName: '',
    methodType: '',
    description: '',
    defaultInstallments: 1,
    maxInstallments: 1,
    hasFee: false,
    feePercentage: 0,
    isActive: true,
  });

  const [companies, setCompanies] = useState<Company[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // Obter informações do tenant do usuário logado
  const currentUser = authService.getUser();
  const tenantCode = currentUser?.tenantCode || '';

  // Carregar empresas
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        console.log('🔍 PaymentMethodForm - Iniciando carregamento de empresas...');
        setLoadingCompanies(true);
        const data = await companyService.getAllCompanies();
        console.log('✅ PaymentMethodForm - Empresas carregadas:', data);
        console.log('✅ PaymentMethodForm - Total de empresas:', data.content?.length || 0);
        setCompanies(data.content || []);
      } catch (error) {
        console.error('❌ PaymentMethodForm - Erro ao carregar empresas:', error);
      } finally {
        setLoadingCompanies(false);
        console.log('🔍 PaymentMethodForm - Carregamento de empresas finalizado');
      }
    };

    loadCompanies();
  }, []);

  useEffect(() => {
    console.log('🔍 PaymentMethodForm - useEffect executado');
    console.log('🔍 PaymentMethodForm - initialData:', initialData);

    if (initialData) {
      console.log('🔍 PaymentMethodForm - Configurando para edição');
      setFormData({
        companyId: selectedCompanyId,
        methodCode: initialData.methodCode,
        methodName: initialData.methodName,
        methodType: initialData.methodType || '',
        description: initialData.description || '',
        defaultInstallments: initialData.defaultInstallments,
        maxInstallments: initialData.maxInstallments,
        hasFee: initialData.hasFee,
        feePercentage: initialData.feePercentage,
        isActive: initialData.isActive,
      });
    }
  }, [initialData, selectedCompanyId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyId) {
      newErrors.companyId = 'Empresa é obrigatória';
    }

    if (!formData.methodCode?.trim()) {
      newErrors.methodCode = 'Código é obrigatório';
    } else if (formData.methodCode.length > 20) {
      newErrors.methodCode = 'Código deve ter no máximo 20 caracteres';
    }

    if (!formData.methodName?.trim()) {
      newErrors.methodName = 'Nome é obrigatório';
    } else if (formData.methodName.length > 100) {
      newErrors.methodName = 'Nome deve ter no máximo 100 caracteres';
    }

    if (formData.description && formData.description.length > 255) {
      newErrors.description = 'Descrição deve ter no máximo 255 caracteres';
    }

    if (formData.defaultInstallments && (formData.defaultInstallments < 1 || formData.defaultInstallments > 999)) {
      newErrors.defaultInstallments = 'Parcelas padrão deve estar entre 1 e 999';
    }

    if (formData.maxInstallments && (formData.maxInstallments < 1 || formData.maxInstallments > 999)) {
      newErrors.maxInstallments = 'Máximo de parcelas deve estar entre 1 e 999';
    }

    if (formData.defaultInstallments && formData.maxInstallments &&
      formData.defaultInstallments > formData.maxInstallments) {
      newErrors.defaultInstallments = 'Parcelas padrão não pode ser maior que o máximo';
    }

    if (formData.feePercentage && (formData.feePercentage < 0 || formData.feePercentage > 100)) {
      newErrors.feePercentage = 'Percentual de taxa deve estar entre 0 e 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CreatePaymentMethodDTO, value: unknown) => {
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
    console.log('🔍 PaymentMethodForm - handleSubmit iniciado');
    console.log('🔍 PaymentMethodForm - formData:', formData);

    if (!validateForm()) {
      console.log('❌ PaymentMethodForm - Validação falhou');
      return;
    }

    console.log('✅ PaymentMethodForm - Validação passou, enviando dados...');

    try {
      console.log('🔍 PaymentMethodForm - Chamando onSubmit com:', formData);
      await onSubmit(formData as CreatePaymentMethodDTO);
      console.log('✅ PaymentMethodForm - onSubmit concluído com sucesso');
    } catch (error) {
      console.error('❌ PaymentMethodForm - Erro ao salvar:', error);
      throw error;
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit
  }));

  return (
    <div className="payment-method-form">
      {/* Identificação */}
      <div className="form-section">
        <h3>Identificação do Método</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="companyId">Empresa *</label>
            <select
              id="companyId"
              value={formData.companyId || ''}
              onChange={(e) => handleChange('companyId', e.target.value)}
              className={errors.companyId ? 'error' : ''}
              disabled={loadingCompanies}
            >
              <option value="">Selecione uma empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.corporateName}
                </option>
              ))}
            </select>
            {errors.companyId && <span className="error-message">{errors.companyId}</span>}
          </div>
        </div>
        <div className="form-row three-columns">
          <div className="form-group">
            <label htmlFor="methodCode">Código *</label>
            <input
              id="methodCode"
              type="text"
              value={formData.methodCode || ''}
              onChange={(e) => handleChange('methodCode', e.target.value.toUpperCase())}
              className={errors.methodCode ? 'error' : ''}
              placeholder="Ex: PIX"
            />
            {errors.methodCode && <span className="error-message">{errors.methodCode}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="methodType">Tipo</label>
            <select
              id="methodType"
              value={formData.methodType || ''}
              onChange={(e) => handleChange('methodType', e.target.value)}
            >
              <option value="">Selecione um tipo</option>
              {PAYMENT_METHOD_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="tenantCode">Sistema Cliente</label>
            <input
              id="tenantCode"
              type="text"
              value={tenantCode}
              readOnly
              className="readonly-field"
              placeholder="Código do sistema cliente"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="methodName">Nome *</label>
            <input
              id="methodName"
              type="text"
              value={formData.methodName || ''}
              onChange={(e) => handleChange('methodName', e.target.value)}
              className={errors.methodName ? 'error' : ''}
              placeholder="Nome do método de pagamento"
            />
            {errors.methodName && <span className="error-message">{errors.methodName}</span>}
          </div>
        </div>
      </div>

      {/* Configurações de Parcelas */}
      <div className="form-section">
        <h3>Configurações de Parcelas</h3>
        <div className="form-row four-columns">
          <div className="form-group">
            <label htmlFor="defaultInstallments">Parcelas Padrão *</label>
            <input
              id="defaultInstallments"
              type="number"
              min="1"
              max="999"
              value={formData.defaultInstallments || 1}
              onChange={(e) => handleChange('defaultInstallments', parseInt(e.target.value) || 1)}
              className={errors.defaultInstallments ? 'error' : ''}
            />
            {errors.defaultInstallments && <span className="error-message">{errors.defaultInstallments}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="maxInstallments">Máximo de Parcelas *</label>
            <input
              id="maxInstallments"
              type="number"
              min="1"
              max="999"
              value={formData.maxInstallments || 1}
              onChange={(e) => handleChange('maxInstallments', parseInt(e.target.value) || 1)}
              className={errors.maxInstallments ? 'error' : ''}
            />
            {errors.maxInstallments && <span className="error-message">{errors.maxInstallments}</span>}
          </div>
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.hasFee || false}
                onChange={(e) => handleChange('hasFee', e.target.checked)}
              />
              <span className="checkbox-text">Possui taxa</span>
            </label>
          </div>
          {formData.hasFee && (
            <div className="form-group">
              <label htmlFor="feePercentage">Taxa (%)</label>
              <input
                id="feePercentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.feePercentage || 0}
                onChange={(e) => handleChange('feePercentage', parseFloat(e.target.value) || 0)}
                className={errors.feePercentage ? 'error' : ''}
                placeholder="0.00"
              />
              {errors.feePercentage && <span className="error-message">{errors.feePercentage}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Descrição */}
      <div className="form-section">
        <h3>Descrição</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className={errors.description ? 'error' : ''}
              placeholder="Descrição do método de pagamento..."
              rows={3}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>
        </div>
      </div>
    </div>
  );
});

PaymentMethodForm.displayName = 'PaymentMethodForm';

export default PaymentMethodForm;