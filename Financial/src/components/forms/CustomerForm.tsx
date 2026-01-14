import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { CustomerDTO, CreateCustomerDTO } from '../../types/customer';
import { CUSTOMER_TYPES } from '../../types/customer';
import { authService } from '../../services/authService';
import './CustomerForm.css';

interface CustomerFormProps {
  initialData?: CustomerDTO | null;
  selectedCompanyId: string;
  onSubmit: (data: CreateCustomerDTO) => Promise<void>;
}

export interface CustomerFormRef {
  submit: () => Promise<void>;
}

const CustomerForm = forwardRef<CustomerFormRef, CustomerFormProps>(({
  initialData,
  selectedCompanyId,
  onSubmit,
}, ref) => {
  console.log('🔍 CustomerForm - Componente renderizado');
  console.log('🔍 CustomerForm - Props:', { initialData, selectedCompanyId });

  const [formData, setFormData] = useState<Partial<CreateCustomerDTO>>({
    companyId: selectedCompanyId,
    customerCode: '',
    customerName: '',
    customerType: '',
    cpfCnpj: '',
    email: '',
    phone: '',
    creditLimit: 0,
    paymentTermDays: 30,
    notes: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Obter informações do tenant do usuário logado
  const currentUser = authService.getUser();
  const tenantCode = currentUser?.tenantCode || '';

  useEffect(() => {
    console.log('🔍 CustomerForm - useEffect executado');
    console.log('🔍 CustomerForm - initialData:', initialData);
    console.log('🔍 CustomerForm - selectedCompanyId:', selectedCompanyId);

    if (initialData) {
      console.log('🔍 CustomerForm - Configurando para edição');
      setFormData({
        companyId: selectedCompanyId,
        customerCode: initialData.customerCode,
        customerName: initialData.customerName,
        customerType: initialData.customerType || '',
        cpfCnpj: initialData.cpfCnpj || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        creditLimit: initialData.creditLimit || 0,
        paymentTermDays: initialData.paymentTermDays || 30,
        notes: initialData.notes || '',
        isActive: initialData.isActive,
      });
    } else {
      // Garantir que o companyId seja sempre definido
      setFormData(prev => ({
        ...prev,
        companyId: selectedCompanyId
      }));
    }
  }, [initialData, selectedCompanyId]);

  const validateForm = (): boolean => {
    console.log('🔍 CustomerForm - Iniciando validação com dados:', formData);
    const newErrors: Record<string, string> = {};

    if (!formData.customerCode?.trim()) {
      newErrors.customerCode = 'Código é obrigatório';
      console.log('❌ CustomerForm - Erro: Código é obrigatório');
    } else if (formData.customerCode.length > 50) {
      newErrors.customerCode = 'Código deve ter no máximo 50 caracteres';
      console.log('❌ CustomerForm - Erro: Código muito longo');
    }

    if (!formData.customerName?.trim()) {
      newErrors.customerName = 'Nome é obrigatório';
      console.log('❌ CustomerForm - Erro: Nome é obrigatório');
    } else if (formData.customerName.length > 150) {
      newErrors.customerName = 'Nome deve ter no máximo 150 caracteres';
      console.log('❌ CustomerForm - Erro: Nome muito longo');
    }

    if (!formData.customerType?.trim()) {
      newErrors.customerType = 'Tipo é obrigatório';
      console.log('❌ CustomerForm - Erro: Tipo é obrigatório');
    }
    // Validação de CPF/CNPJ com feedback detalhado
    if (formData.cpfCnpj && formData.cpfCnpj.trim()) {
      const cpfCnpjClean = formData.cpfCnpj.replace(/[^\d]/g, '');

      if (cpfCnpjClean.length === 0) {
        newErrors.cpfCnpj = 'CPF/CNPJ deve conter apenas números';
        console.log('❌ CustomerForm - Erro: CPF/CNPJ sem números');
      } else if (cpfCnpjClean.length < 11) {
        newErrors.cpfCnpj = `CPF/CNPJ incompleto (${cpfCnpjClean.length} dígitos). CPF precisa de 11 dígitos ou CNPJ de 14 dígitos`;
        console.log('❌ CustomerForm - Erro: CPF/CNPJ muito curto:', cpfCnpjClean.length);
      } else if (cpfCnpjClean.length > 11 && cpfCnpjClean.length < 14) {
        newErrors.cpfCnpj = `CPF/CNPJ incompleto (${cpfCnpjClean.length} dígitos). CPF precisa de 11 dígitos ou CNPJ de 14 dígitos`;
        console.log('❌ CustomerForm - Erro: CPF/CNPJ com tamanho inválido:', cpfCnpjClean.length);
      } else if (cpfCnpjClean.length > 14) {
        newErrors.cpfCnpj = `CPF/CNPJ muito longo (${cpfCnpjClean.length} dígitos). Máximo: CPF com 11 dígitos ou CNPJ com 14 dígitos`;
        console.log('❌ CustomerForm - Erro: CPF/CNPJ muito longo:', cpfCnpjClean.length);
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email deve ser válido';
      console.log('❌ CustomerForm - Erro: Email inválido');
    }

    if (formData.creditLimit && formData.creditLimit < 0) {
      newErrors.creditLimit = 'Limite de crédito deve ser maior ou igual a zero';
      console.log('❌ CustomerForm - Erro: Limite de crédito negativo');
    }

    if (formData.paymentTermDays && (formData.paymentTermDays < 1 || formData.paymentTermDays > 999)) {
      newErrors.paymentTermDays = 'Prazo de pagamento deve estar entre 1 e 999 dias';
      console.log('❌ CustomerForm - Erro: Prazo de pagamento inválido');
    }

    if (!formData.companyId?.trim()) {
      newErrors.companyId = 'Company ID é obrigatório';
      console.log('❌ CustomerForm - Erro: Company ID é obrigatório');
    }

    console.log('🔍 CustomerForm - Erros encontrados:', newErrors);
    console.log('🔍 CustomerForm - Validação passou:', Object.keys(newErrors).length === 0);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CreateCustomerDTO, value: unknown) => {
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
    console.log('🔍 CustomerForm - handleSubmit iniciado');
    console.log('🔍 CustomerForm - formData:', formData);

    if (!validateForm()) {
      console.log('❌ CustomerForm - Validação falhou');
      return;
    }

    console.log('✅ CustomerForm - Validação passou, enviando dados...');

    try {
      console.log('🔍 CustomerForm - Chamando onSubmit com:', formData);
      await onSubmit(formData as CreateCustomerDTO);
      console.log('✅ CustomerForm - onSubmit concluído com sucesso');
    } catch (error) {
      console.error('❌ CustomerForm - Erro ao salvar:', error);
      throw error;
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit
  }));

  return (
    <div className="customer-form">
      {/* Dados Básicos */}
      <div className="form-section">
        <h3>Identificação Financeira</h3>
        <div className="form-row three-columns">
          <div className="form-group">
            <label htmlFor="customerCode">Código *</label>
            <input
              id="customerCode"
              type="text"
              value={formData.customerCode || ''}
              onChange={(e) => handleChange('customerCode', e.target.value.toUpperCase())}
              className={errors.customerCode ? 'error' : ''}
              placeholder="Ex: CLI001"
            />
            {errors.customerCode && <span className="error-message">{errors.customerCode}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="customerType">Tipo *</label>
            <select
              id="customerType"
              value={formData.customerType || ''}
              onChange={(e) => handleChange('customerType', e.target.value)}
              className={errors.customerType ? 'error' : ''}
            >
              <option value="">Selecione um tipo</option>
              {CUSTOMER_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.customerType && <span className="error-message">{errors.customerType}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="cpfCnpj">CPF/CNPJ</label>
            <input
              id="cpfCnpj"
              type="text"
              value={formData.cpfCnpj || ''}
              onChange={(e) => handleChange('cpfCnpj', e.target.value)}
              className={errors.cpfCnpj ? 'error' : ''}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
            />
            {errors.cpfCnpj && <span className="error-message">{errors.cpfCnpj}</span>}
          </div>
        </div>

        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="customerName">Nome *</label>
            <input
              id="customerName"
              type="text"
              value={formData.customerName || ''}
              onChange={(e) => handleChange('customerName', e.target.value)}
              className={errors.customerName ? 'error' : ''}
              placeholder="Nome do cliente"
            />
            {errors.customerName && <span className="error-message">{errors.customerName}</span>}
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
      </div>

      {/* Contato Básico */}
      <div className="form-section">
        <h3>Contato Básico</h3>
        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? 'error' : ''}
              placeholder="email@exemplo.com"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="phone">Telefone</label>
            <input
              id="phone"
              type="text"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(00) 0000-0000"
            />
          </div>
        </div>
      </div>

      {/* Configurações Financeiras */}
      <div className="form-section">
        <h3>Configurações Financeiras</h3>
        <div className="form-row four-columns">
          <div className="form-group">
            <label htmlFor="creditLimit">Limite de Crédito (R$)</label>
            <input
              id="creditLimit"
              type="number"
              min="0"
              step="0.01"
              value={formData.creditLimit || 0}
              onChange={(e) => handleChange('creditLimit', parseFloat(e.target.value) || 0)}
              className={errors.creditLimit ? 'error' : ''}
              placeholder="0.00"
            />
            {errors.creditLimit && <span className="error-message">{errors.creditLimit}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="paymentTermDays">Prazo de Pagamento (dias)</label>
            <input
              id="paymentTermDays"
              type="number"
              min="1"
              max="999"
              value={formData.paymentTermDays || 30}
              onChange={(e) => handleChange('paymentTermDays', parseInt(e.target.value) || 30)}
              className={errors.paymentTermDays ? 'error' : ''}
            />
            {errors.paymentTermDays && <span className="error-message">{errors.paymentTermDays}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="isActive">Status</label>
            <select
              id="isActive"
              value={formData.isActive ? 'true' : 'false'}
              onChange={(e) => handleChange('isActive', e.target.value === 'true')}
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
          <div className="form-group">
            {/* Espaço reservado para futuras configurações */}
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="form-section">
        <h3>Observações</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="notes">Observações</label>
            <textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Observações sobre o cliente..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

CustomerForm.displayName = 'CustomerForm';

export default CustomerForm;