import React, { useState, useEffect } from 'react';
import type { AccountsPayableDTO, CreateAccountsPayableDTO } from '../../types/accountsPayable';
import { PaymentStatus, PaymentType } from '../../types/enums';
import { MoneyInput, ComboBox } from '../ui';
import type { ComboBoxOption } from '../ui/ComboBox';
import { validateAccountsPayable } from '../../utils/validation';
import { supplierService, type SupplierDTO } from '../../services/supplierService';
import { categoryService, type CategoryDTO } from '../../services/categoryService';
import { costCenterService, type CostCenterDTO } from '../../services/costCenterService';
import './AccountsPayableForm.css';

interface AccountsPayableFormProps {
  initialData?: AccountsPayableDTO | null;
  onSubmit: (data: CreateAccountsPayableDTO) => Promise<void>;
  onCancel?: () => void; // Novo callback para cancelamento
}

const AccountsPayableForm: React.FC<AccountsPayableFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<any>({
    description: '',
    supplierId: '',
    supplierName: '',
    categoryId: '',
    categoryName: '',
    costCenterId: '',
    costCenterName: '',
    originalAmount: 0,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    competenceDate: new Date().toISOString().split('T')[0],
    paymentStatus: PaymentStatus.PENDING,
    paymentType: PaymentType.SINGLE,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Estados para os dados dos comboboxes
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenterDTO[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingCostCenters, setLoadingCostCenters] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    if (initialData) {
      setFormData({
        description: initialData.payableDescription,
        documentNumber: initialData.documentNumber,
        invoiceNumber: initialData.invoiceNumber,
        supplierId: initialData.supplierId,
        supplierName: initialData.supplierName,
        categoryId: initialData.categoryId,
        categoryName: initialData.categoryName || initialData.category,
        costCenterId: initialData.costCenterId,
        costCenterName: initialData.costCenterName || initialData.costCenter,
        originalAmount: initialData.originalAmount,
        discountAmount: initialData.discountAmount,
        interestAmount: initialData.interestAmount,
        fineAmount: initialData.fineAmount,
        issueDate: initialData.issueDate,
        dueDate: initialData.dueDate,
        competenceDate: initialData.competenceDate,
        paymentStatus: initialData.paymentStatus,
        paymentType: initialData.paymentType,
        category: initialData.categoryName || initialData.category,
        costCenter: initialData.costCenterName || initialData.costCenter,
        notes: initialData.notes,
      });
    }
  }, [initialData]);

  // Carregar dados dos comboboxes
  useEffect(() => {
    const loadComboBoxData = async () => {
      // Carregar fornecedores
      setLoadingSuppliers(true);
      try {
        console.log('🔍 Iniciando busca de fornecedores...');
        const suppliersData = await supplierService.findSuppliers();
        console.log('✅ Fornecedores retornados:', suppliersData);
        setSuppliers(suppliersData);
      } catch (error) {
        console.error('❌ Erro ao carregar fornecedores:', error);
        setSuppliers([]);
      } finally {
        setLoadingSuppliers(false);
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


  const handleChange = (field: string, value: unknown) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    // Limpa erro do campo quando alterado
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

    // Garantir que temos IDs se tivermos nomes (recuperação de falhas)
    const dataToSubmit = { ...formData };

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

    // Validação
    const validation = validateAccountsPayable(dataToSubmit);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setLoading(true);
      await onSubmit(dataToSubmit as CreateAccountsPayableDTO);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      // Aqui você pode adicionar tratamento de erro específico se necessário
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Handler para mudança de fornecedor
  const handleSupplierChange = (supplierId: string | number) => {
    const selectedSupplier = suppliers.find(s => s.id === String(supplierId));
    if (selectedSupplier) {
      setFormData((prev: any) => ({
        ...prev,
        supplierId: selectedSupplier.id, // UUID para referência interna
        supplierName: selectedSupplier.tradeName || selectedSupplier.corporateName,
        supplierDocument: selectedSupplier.cnpj,
        supplierEmail: selectedSupplier.email,
        supplierPhone: selectedSupplier.phone
      }));
      // Limpar erros relacionados ao fornecedor
      if (errors.supplierId || errors.supplierName) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.supplierId;
          delete newErrors.supplierName;
          return newErrors;
        });
      }
    } else {
      setFormData((prev: any) => ({
        ...prev,
        supplierId: '',
        supplierName: '',
        supplierDocument: '',
        supplierEmail: '',
        supplierPhone: ''
      }));
    }
  };

  // Handler para mudança de categoria
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

  // Handler para mudança de centro de custo
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

  // Preparar opções dos comboboxes
  const supplierOptions: ComboBoxOption[] = suppliers.map((supplier) => {
    const name = supplier.tradeName || supplier.corporateName;
    const cnpj = supplier.cnpj || 'S/CNPJ';
    // Adicionar ID para garantir unicidade se houver nomes duplicados
    const label = `${cnpj} - ${name} (${supplier.id.substring(0, 8)})`;

    return {
      value: supplier.id,
      label: label
    };
  });

  const categoryOptions: ComboBoxOption[] = categories.map(category => ({
    value: category.categoryName,
    label: `${category.categoryCode} - ${category.categoryName}`
  }));

  const costCenterOptions: ComboBoxOption[] = costCenters.map(costCenter => ({
    value: costCenter.costCenterName,
    label: `${costCenter.costCenterCode} - ${costCenter.costCenterName}`
  }));

  console.log('🔍 Opções dos comboboxes:', {
    suppliers: supplierOptions.length,
    categories: categoryOptions.length,
    costCenters: costCenterOptions.length
  });

  console.log('🔍 Estados de loading:', {
    loadingSuppliers,
    loadingCategories,
    loadingCostCenters
  });

  console.log('🔍 Dados carregados:', {
    suppliers: suppliers.length,
    categories: categories.length,
    costCenters: costCenters.length
  });

  // Log das opções geradas para debug
  console.log('🔍 Opções de categorias geradas:', categoryOptions.length);
  console.log('🔍 Opções de centros de custo geradas:', costCenterOptions.length);

  return (
    <form className="accounts-payable-form" onSubmit={handleSubmit}>


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
              placeholder="Descrição da conta"
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
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
        <h3>Fornecedor</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="supplier">Fornecedor *</label>
            <ComboBox
              id="supplier"
              value={formData.supplierId || ''}
              onChange={handleSupplierChange}
              options={supplierOptions}
              placeholder="Selecione um fornecedor..."
              required
              loading={loadingSuppliers}
              error={errors.supplierId || errors.supplierName}
            />
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

        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="interestAmount">Juros</label>
            <MoneyInput
              value={formData.interestAmount || 0}
              onChange={(value) => handleChange('interestAmount', value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="fineAmount">Multa</label>
            <MoneyInput
              value={formData.fineAmount || 0}
              onChange={(value) => handleChange('fineAmount', value)}
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

        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="category">Categoria</label>
            <ComboBox
              id="category"
              value={formData.category || ''} // Usar nome para compatibilidade
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
              value={formData.costCenter || ''} // Usar nome para compatibilidade
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
          <button
            type="button"
            className="btn-cancel"
            onClick={handleCancel}
            disabled={loading}
          >
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

export default AccountsPayableForm;
