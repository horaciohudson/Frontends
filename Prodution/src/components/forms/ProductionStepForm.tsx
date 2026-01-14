import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { ProductionStepDTO, CreateProductionStepDTO } from '../../types/productionStep';
import { authService } from '../../services/authService';
import './ProductionStepForm.css';

interface ProductionStepFormProps {
    initialData?: ProductionStepDTO | null;
    selectedCompanyId: string;
    onSubmit: (data: CreateProductionStepDTO) => Promise<void>;
}

export interface ProductionStepFormRef {
    submit: () => Promise<void>;
}

const ProductionStepForm = forwardRef<ProductionStepFormRef, ProductionStepFormProps>(({
    initialData,
    selectedCompanyId,
    onSubmit,
}, ref) => {
    const user = authService.getUser();
    const tenantId = user?.tenantId || '';

    const [formData, setFormData] = useState<Partial<CreateProductionStepDTO>>({
        tenantId,
        companyId: selectedCompanyId,
        name: '',
        description: '',
        sequence: 1,
        estimatedTime: 0,
        costCenterId: undefined,
        isOutsourced: false,
        requiresApproval: false,
        isActive: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                tenantId,
                companyId: selectedCompanyId,
                name: initialData.name,
                description: initialData.description,
                sequence: initialData.sequence,
                estimatedTime: initialData.estimatedTime,
                costCenterId: initialData.costCenterId,
                isOutsourced: initialData.isOutsourced,
                requiresApproval: initialData.requiresApproval,
                isActive: initialData.isActive,
            });
        } else {
            setFormData(prev => ({
                ...prev,
                tenantId,
                companyId: selectedCompanyId
            }));
        }
    }, [initialData, selectedCompanyId, tenantId]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name?.trim()) {
            newErrors.name = 'Nome é obrigatório';
        } else if (formData.name.length > 200) {
            newErrors.name = 'Nome deve ter no máximo 200 caracteres';
        }

        if (formData.sequence !== undefined && formData.sequence < 1) {
            newErrors.sequence = 'Sequência deve ser maior que zero';
        }

        if (formData.estimatedTime !== undefined && formData.estimatedTime < 0) {
            newErrors.estimatedTime = 'Tempo estimado não pode ser negativo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: keyof CreateProductionStepDTO, value: unknown) => {
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
        if (!validateForm()) {
            return;
        }

        try {
            await onSubmit(formData as CreateProductionStepDTO);
        } catch (error) {
            console.error('Erro ao salvar:', error);
            throw error;
        }
    };

    useImperativeHandle(ref, () => ({
        submit: handleSubmit
    }));

    return (
        <div className="production-step-form">
            <div className="form-section">
                <h3>Informações Básicas</h3>

                <div className="form-row two-columns">
                    <div className="form-group">
                        <label htmlFor="name">Nome *</label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className={errors.name ? 'error' : ''}
                            placeholder="Nome da etapa"
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="sequence">Sequência</label>
                        <input
                            id="sequence"
                            type="number"
                            min="1"
                            value={formData.sequence || 1}
                            onChange={(e) => handleChange('sequence', parseInt(e.target.value) || 1)}
                            className={errors.sequence ? 'error' : ''}
                        />
                        {errors.sequence && <span className="error-message">{errors.sequence}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="description">Descrição</label>
                        <textarea
                            id="description"
                            value={formData.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Descrição da etapa..."
                            rows={3}
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3>Configurações</h3>

                <div className="form-row three-columns">
                    <div className="form-group">
                        <label htmlFor="estimatedTime">Tempo Estimado (minutos)</label>
                        <input
                            id="estimatedTime"
                            type="number"
                            min="0"
                            value={formData.estimatedTime || 0}
                            onChange={(e) => handleChange('estimatedTime', parseInt(e.target.value) || 0)}
                            className={errors.estimatedTime ? 'error' : ''}
                        />
                        {errors.estimatedTime && <span className="error-message">{errors.estimatedTime}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="isOutsourced">Terceirizada</label>
                        <select
                            id="isOutsourced"
                            value={formData.isOutsourced ? 'true' : 'false'}
                            onChange={(e) => handleChange('isOutsourced', e.target.value === 'true')}
                        >
                            <option value="false">Não</option>
                            <option value="true">Sim</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="requiresApproval">Requer Aprovação</label>
                        <select
                            id="requiresApproval"
                            value={formData.requiresApproval ? 'true' : 'false'}
                            onChange={(e) => handleChange('requiresApproval', e.target.value === 'true')}
                        >
                            <option value="false">Não</option>
                            <option value="true">Sim</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
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
                </div>
            </div>
        </div>
    );
});

ProductionStepForm.displayName = 'ProductionStepForm';

export default ProductionStepForm;
