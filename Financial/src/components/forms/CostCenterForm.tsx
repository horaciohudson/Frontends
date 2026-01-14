import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { CostCenterDTO, CreateCostCenterDTO } from '../../types/costCenter';
import { costCenterService } from '../../services/costCenterService';
import './CostCenterForm.css';

interface CostCenterFormProps {
  initialData?: CostCenterDTO | null;
  parentCostCenter?: CostCenterDTO | null;
  selectedCompanyId: string;
  onSubmit: (data: CreateCostCenterDTO) => Promise<void>;
}

export interface CostCenterFormRef {
  submit: () => Promise<void>;
}

const CostCenterForm = forwardRef<CostCenterFormRef, CostCenterFormProps>(({
  initialData,
  parentCostCenter,
  selectedCompanyId,
  onSubmit,
}, ref) => {
  console.log('🔍 CostCenterForm - Componente renderizado');
  console.log('🔍 CostCenterForm - Props:', { initialData, parentCostCenter, selectedCompanyId });
  const [formData, setFormData] = useState<Partial<CreateCostCenterDTO>>({
    companyId: selectedCompanyId,
    costCenterCode: '',
    costCenterName: '',
    parentCostCenterId: parentCostCenter?.id,
    description: '',
    isActive: true,
  });
  
  console.log('🔍 CostCenterForm - FormData inicial:', {
    selectedCompanyId,
    formDataCompanyId: selectedCompanyId,
    parentCostCenter
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [availableCostCenters, setAvailableCostCenters] = useState<CostCenterDTO[]>([]);

  useEffect(() => {
    console.log('🔍 CostCenterForm - useEffect executado');
    console.log('🔍 CostCenterForm - initialData:', initialData);
    console.log('🔍 CostCenterForm - parentCostCenter:', parentCostCenter);
    
    if (initialData) {
      console.log('🔍 CostCenterForm - Configurando para edição');
      setFormData({
        costCenterCode: initialData.costCenterCode,
        costCenterName: initialData.costCenterName,
        parentCostCenterId: initialData.parentCostCenterId,
        description: initialData.description,
        isActive: initialData.isActive,
      });
    } else if (parentCostCenter) {
      console.log('🔍 CostCenterForm - Configurando com parent:', parentCostCenter.id);
      setFormData(prev => ({
        ...prev,
        parentCostCenterId: parentCostCenter.id,
        costCenterCode: parentCostCenter.costCenterCode + '.',
      }));
    } else {
      console.log('🔍 CostCenterForm - Configurando sem parent (root)');
    }
  }, [initialData, parentCostCenter]);

  // Carregar centros de custo disponíveis para seleção como pai
  useEffect(() => {
    const loadAvailableCostCenters = async () => {
      try {
        const costCenters = await costCenterService.findAll({ isActive: true });
        // Filtrar o próprio item se estiver editando
        const filtered = initialData 
          ? costCenters.filter(cc => cc.id !== initialData.id)
          : costCenters;
        setAvailableCostCenters(filtered);
      } catch (error) {
        console.error('Erro ao carregar centros de custo:', error);
      }
    };

    if (selectedCompanyId) {
      loadAvailableCostCenters();
    }
  }, [selectedCompanyId, initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.costCenterCode?.trim()) {
      newErrors.costCenterCode = 'Código é obrigatório';
    } else if (formData.costCenterCode.length > 20) {
      newErrors.costCenterCode = 'Código deve ter no máximo 20 caracteres';
    } else {
      // Verificar se já existe um centro de custo com este código
      const existingCostCenter = availableCostCenters.find(cc => 
        cc.costCenterCode.toLowerCase() === formData.costCenterCode.toLowerCase() &&
        (!initialData || cc.id !== initialData.id) // Excluir o próprio item se estiver editando
      );
      if (existingCostCenter) {
        newErrors.costCenterCode = `Já existe um centro de custo com o código "${formData.costCenterCode}"`;
      }
    }

    if (!formData.costCenterName?.trim()) {
      newErrors.costCenterName = 'Nome é obrigatório';
    } else if (formData.costCenterName.length > 100) {
      newErrors.costCenterName = 'Nome deve ter no máximo 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CreateCostCenterDTO, value: unknown) => {
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
    console.log('🔍 CostCenterForm - handleSubmit iniciado');
    console.log('🔍 CostCenterForm - formData:', formData);

    if (!validateForm()) {
      console.log('❌ CostCenterForm - Validação falhou');
      return;
    }

    // Garantir que companyId está definido
    const finalFormData = {
      ...formData,
      companyId: formData.companyId || selectedCompanyId
    };

    console.log('✅ CostCenterForm - Validação passou, enviando dados...');
    console.log('🔍 CostCenterForm - Dados finais:', finalFormData);

    try {
      setLoading(true);
      console.log('🔍 CostCenterForm - Chamando onSubmit com:', finalFormData);
      await onSubmit(finalFormData as CreateCostCenterDTO);
      console.log('✅ CostCenterForm - onSubmit concluído com sucesso');
    } catch (error) {
      console.error('❌ CostCenterForm - Erro ao salvar:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit
  }));

  return (
    <div className="cost-center-form">
      {parentCostCenter && (
        <div className="parent-info">
          <span className="parent-label">Centro de custo pai:</span>
          <span className="parent-value">
            {parentCostCenter.costCenterCode} - {parentCostCenter.costCenterName}
          </span>
        </div>
      )}

      <div className="form-section">
        <h3>Informações Básicas</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="parentCostCenter">Centro de Custo Pai</label>
            <select
              id="parentCostCenter"
              value={formData.parentCostCenterId || ''}
              onChange={(e) => handleChange('parentCostCenterId', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Selecione um centro de custo pai (opcional)</option>
              {availableCostCenters.map(cc => (
                <option key={cc.id} value={cc.id}>
                  {cc.costCenterCode} - {cc.costCenterName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row two-columns">
          <div className="form-group">
            <label htmlFor="costCenterCode">Código *</label>
            <input
              id="costCenterCode"
              type="text"
              value={formData.costCenterCode || ''}
              onChange={(e) => handleChange('costCenterCode', e.target.value.toUpperCase())}
              className={errors.costCenterCode ? 'error' : ''}
              placeholder="Ex: CC001"
            />
            {errors.costCenterCode && <span className="error-message">{errors.costCenterCode}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="costCenterName">Nome *</label>
            <input
              id="costCenterName"
              type="text"
              value={formData.costCenterName || ''}
              onChange={(e) => handleChange('costCenterName', e.target.value)}
              className={errors.costCenterName ? 'error' : ''}
              placeholder="Nome do centro de custo"
            />
            {errors.costCenterName && <span className="error-message">{errors.costCenterName}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrição do centro de custo..."
              rows={3}
            />
          </div>
        </div>
      </div>


    </div>
  );
});

CostCenterForm.displayName = 'CostCenterForm';

export default CostCenterForm;
