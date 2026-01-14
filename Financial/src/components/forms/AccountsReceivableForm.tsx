import React, { useState, useEffect } from 'react';
import type { AccountsReceivableDTO, CreateAccountsReceivableDTO } from '../../types/accountsReceivable';
import { ReceivableStatus, ReceivableType, Priority } from '../../types/enums';
import { MoneyInput, ComboBox } from '../ui';
import type { ComboBoxOption } from '../ui/ComboBox';
import { validateAccountsReceivable } from '../../utils/validation';
import { customerService, type CustomerDTO } from '../../services/customerService';
import { categoryService, type CategoryDTO } from '../../services/categoryService';
import { costCenterService, type CostCenterDTO } from '../../services/costCenterService';
import './AccountsReceivableForm.css';

interface AccountsReceivableFormProps {
  initialData?: AccountsReceivableDTO | null;
  onSubmit: (data: CreateAccountsReceivableDTO) => Promise<void>;
  onCancel?: () => void;
}

const AccountsReceivableForm: React.FC<AccountsReceivableFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<any>({
    receivableDescription: '',
    receivableCode: '',
    customerId: '',
    customerName: '',
    categoryId: '',
    categoryName: '',
    category: '', // Para compatibilidade com ComboBox
    costCenterId: '',
    costCenterName: '',
    costCenter: '', // Para compatibilidade com ComboBox
    originalAmount: 0,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    competenceDate: new Date().toISOString().split('T')[0],
    receiptStatus: ReceivableStatus.PENDING,
    receiptType: ReceivableType.SINGLE,
    priorityLevel: Priority.MEDIUM,
    companyId: sessionStorage.getItem('selectedCompanyId') || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Estados para os dados dos comboboxes
  const [customers, setCustomers] = useState<CustomerDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenterDTO[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingCostCenters, setLoadingCostCenters] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    if (initialData) {
      setFormData({
        receivableDescription: initialData.receivableDescription,
        documentNumber: initialData.documentNumber,
        invoiceNumber: initialData.invoiceNumber,
        receivableCode: initialData.receivableCode,
        customerId: initialData.customerId,
        customerName: initialData.customerName,
        categoryId: initialData.categoryId,
        categoryName: initialData.categoryName || initialData.category, // AccountsReceivableDTO usa 'category' como string
        category: initialData.categoryName || initialData.category || '',
        costCenterId: initialData.costCenterId,
        costCenterName: initialData.costCenterName || initialData.costCenter, // AccountsReceivableDTO usa 'costCenter' como string
        costCenter: initialData.costCenterName || initialData.costCenter || '',
        originalAmount: initialData.originalAmount,
        discountAmount: initialData.discountAmount,
        interestAmount: initialData.interestAmount,
        fineAmount: initialData.fineAmount,
        issueDate: initialData.issueDate,
        dueDate: initialData.dueDate,
        competenceDate: initialData.competenceDate,
        receiptStatus: initialData.receiptStatus,
        receiptType: initialData.receiptType,
        priorityLevel: initialData.priorityLevel,
        notes: initialData.notes,
        companyId: initialData.companyId || sessionStorage.getItem('selectedCompanyId') || '',
      });
    }
  }, [initialData]);

  // Carregar dados dos comboboxes
  useEffect(() => {
    const loadComboBoxData = async () => {
      // Carregar clientes
      setLoadingCustomers(true);
      try {
        console.log('🔍 Iniciando busca de clientes...');
        const customersData = await customerService.findAll();
        console.log('✅ Clientes retornados:', customersData);
        setCustomers(customersData);
      } catch (error) {
        console.error('❌ Erro ao carregar clientes:', error);
        setCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }

      // Carregar categorias
      setLoadingCategories(true);
      try {
        console.log('🔍 Iniciando busca de categorias...');
        const categoriesData = await categoryService.findAll();
        console.log('✅ Categorias retornadas:', categoriesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('❌ Erro ao carregar categorias:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }

      // Carregar centros de custo
      setLoadingCostCenters(true);
      try {
        console.log('🔍 Iniciando busca de centros de custo...');
        const costCentersData = await costCenterService.findAll();
        console.log('✅ Centros de custo retornados:', costCentersData);
        setCostCenters(costCentersData);
      } catch (error) {
        console.error('❌ Erro ao carregar centros de custo:', error);
        setCostCenters([]);
      } finally {
        setLoadingCostCenters(false);
      }
    };

    loadComboBoxData();
  }, []);

  const handleChange = (field: keyof CreateAccountsReceivableDTO, value: unknown) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handlers para ComboBoxes (seguindo padrão do AccountsPayableForm)
  const handleCustomerChange = (customerId: string | number) => {
    const selectedCustomer = customers.find(c => c.id === String(customerId));
    if (selectedCustomer) {
      setFormData((prev: any) => ({
        ...prev,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.customerName,
      }));
      // Limpar erros relacionados ao cliente
      if (errors.customerId || errors.customerName) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.customerId;
          delete newErrors.customerName;
          return newErrors;
        });
      }
    } else {
      setFormData((prev: any) => ({
        ...prev,
        customerId: '',
        customerName: '',
      }));
    }
  };

  const handleCategoryChange = (val: string | number) => {
    const value = String(val);
    const selectedCategory = categories.find(c => c.categoryName === value);
    if (selectedCategory) {
      setFormData((prev: any) => ({
        ...prev,
        categoryId: selectedCategory.categoryId,
        categoryName: selectedCategory.categoryName,
        category: selectedCategory.categoryName,
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        categoryId: '',
        categoryName: value,
        category: value,
      }));
    }
  };

  const handleCostCenterChange = (val: string | number) => {
    const value = String(val);
    const selectedCostCenter = costCenters.find(c => c.costCenterName === value);
    if (selectedCostCenter) {
      setFormData((prev: any) => ({
        ...prev,
        costCenterId: selectedCostCenter.id,
        costCenterName: selectedCostCenter.costCenterName,
        costCenter: selectedCostCenter.costCenterName,
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        costCenterId: '',
        costCenterName: value,
        costCenter: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Garantir que temos IDs se tivermos nomes (recuperação de falhas - padrão AccountsPayableForm)
    const dataToSubmit = { ...formData };

    if (!dataToSubmit.customerId && dataToSubmit.customerName) {
      const customer = customers.find(c => c.customerName === dataToSubmit.customerName);
      if (customer) {
        dataToSubmit.customerId = customer.id;
      }
    }

    if (!dataToSubmit.categoryId && dataToSubmit.category) {
      const cat = categories.find(c => c.categoryName === dataToSubmit.category);
      if (cat) {
        dataToSubmit.categoryId = cat.categoryId;
        dataToSubmit.categoryName = cat.categoryName;
      }
    }

    if (!dataToSubmit.costCenterId && dataToSubmit.costCenter) {
      const cc = costCenters.find(c => c.costCenterName === dataToSubmit.costCenter);
      if (cc) {
        dataToSubmit.costCenterId = cc.id;
        dataToSubmit.costCenterName = cc.costCenterName;
      }
    }

    const validation = validateAccountsReceivable(dataToSubmit);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setLoading(true);
      await onSubmit(dataToSubmit as CreateAccountsReceivableDTO);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  // Preparar opções para os ComboBoxes (seguindo padrão do AccountsPayableForm)
  const customerOptions: ComboBoxOption[] = customers.map(customer => ({
    value: customer.id, // Usar ID como value (igual ao Supplier no AccountsPayable)
    label: `${customer.customerCode} - ${customer.customerName}`,
  }));

  const categoryOptions: ComboBoxOption[] = categories.map(category => ({
    value: category.categoryName, // Usar nome como value
    label: `${category.categoryCode} - ${category.categoryName}`,
  }));

  const costCenterOptions: ComboBoxOption[] = costCenters.map(costCenter => ({
    value: costCenter.costCenterName, // Usar nome como value para compatibilidade
    label: `${costCenter.costCenterCode} - ${costCenter.costCenterName}`
  }));

  // Logs de debug (padrão AccountsPayableForm)
  console.log('🔍 Opções dos comboboxes:', {
    customers: customerOptions.length,
    categories: categoryOptions.length,
    costCenters: costCenterOptions.length
  });

  console.log('🔍 Estados de loading:', {
    loadingCustomers,
    loadingCategories,
    loadingCostCenters
  });

  console.log('🔍 Dados carregados:', {
    customers: customers.length,
    categories: categories.length,
    costCenters: costCenters.length
  });

  return (
    <form className="accounts-receivable-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Informações Básicas</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="receivableDescription">Descrição *</label>
            <input
              id="receivableDescription"
              type="text"
              value={formData.receivableDescription || ''}
              onChange={(e) => handleChange('receivableDescription', e.target.value)}
              className={errors.receivableDescription ? 'error' : ''}
              placeholder="Descrição da conta"
            />
            {errors.receivableDescription && <span className="error-message">{errors.receivableDescription}</span>}
          </div>
        </div>

        <div className="form-row two-columns">
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
          <div className="form-group">
            <label htmlFor="invoiceNumber">Nº Nota Fiscal</label>
            <input
              id="invoiceNumber"
              type="text"
              value={formData.invoiceNumber || ''}
              onChange={(e) => handleChange('invoiceNumber', e.target.value)}
              placeholder="Número da NF"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Cliente</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="customer">Cliente *</label>
            <ComboBox
              id="customer"
              value={formData.customerId || ''}
              onChange={handleCustomerChange}
              options={customerOptions}
              placeholder="Selecione um cliente"
              loading={loadingCustomers}
              error={errors.customerName}
            />
            {errors.customerName && <span className="error-message">{errors.customerName}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Valores</h3>

        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="originalAmount">Valor Original *</label>
            <MoneyInput
              value={formData.originalAmount || 0}
              onChange={(value) => handleChange('originalAmount', value)}
              error={errors.originalAmount}
            />
          </div>
          <div className="form-group">
            <label htmlFor="discountAmount">Desconto</label>
            <MoneyInput
              value={formData.discountAmount || 0}
              onChange={(value) => handleChange('discountAmount', value)}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Datas</h3>

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
            <label htmlFor="dueDate">Data de Vencimento *</label>
            <input
              id="dueDate"
              type="date"
              value={formData.dueDate || ''}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className={errors.dueDate ? 'error' : ''}
            />
            {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="competenceDate">Data de Competência *</label>
            <input
              id="competenceDate"
              type="date"
              value={formData.competenceDate || ''}
              onChange={(e) => handleChange('competenceDate', e.target.value)}
              className={errors.competenceDate ? 'error' : ''}
            />
            {errors.competenceDate && <span className="error-message">{errors.competenceDate}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Classificação</h3>

        <div className="form-row three-columns">
          <div className="form-group">
            <label htmlFor="priorityLevel">Prioridade</label>
            <select
              id="priorityLevel"
              value={formData.priorityLevel || Priority.MEDIUM}
              onChange={(e) => handleChange('priorityLevel', e.target.value)}
            >
              <option value={Priority.LOW}>Baixa</option>
              <option value={Priority.MEDIUM}>Média</option>
              <option value={Priority.HIGH}>Alta</option>
              <option value={Priority.URGENT}>Urgente</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="category">Categoria</label>
            <ComboBox
              id="category"
              value={formData.category || ''}
              onChange={handleCategoryChange}
              options={categoryOptions}
              placeholder="Selecione uma categoria..."
              loading={loadingCategories}
            />
          </div>
          <div className="form-group">
            <label htmlFor="costCenter">Centro de Custo</label>
            <ComboBox
              id="costCenter"
              value={formData.costCenter || ''}
              onChange={handleCostCenterChange}
              options={costCenterOptions}
              placeholder="Selecione um centro de custo..."
              loading={loadingCostCenters}
            />
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
        {onCancel && (
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Salvando...' : (initialData ? 'Atualizar' : 'Criar')}
        </button>
      </div>
    </form>
  );
};

export default AccountsReceivableForm;
