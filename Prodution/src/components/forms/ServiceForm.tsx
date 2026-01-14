import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { ServiceDTO, CreateServiceDTO } from '../../types/service';
import { authService } from '../../services/authService';
import './ServiceForm.css';

export interface ServiceFormRef {
    submit: () => Promise<void>;
}

interface ServiceFormProps {
    initialData?: ServiceDTO | null;
    selectedCompanyId: string;
    onSubmit: (data: CreateServiceDTO) => Promise<void>;
}

const ServiceForm = forwardRef<ServiceFormRef, ServiceFormProps>(
    ({ initialData, selectedCompanyId, onSubmit }, ref) => {
        const user = authService.getUser();
        const tenantId = user?.tenantId || '';

        const [formData, setFormData] = useState<CreateServiceDTO>({
            tenantId,
            companyId: selectedCompanyId,
            code: '',
            name: '',
            description: '',
            unitPrice: undefined,
            costCenterId: undefined,
            isActive: true,
            notes: ''
        });

        const [errors, setErrors] = useState<Record<string, string>>({});

        useEffect(() => {
            if (initialData) {
                setFormData({
                    tenantId,
                    companyId: initialData.companyId,
                    code: initialData.code,
                    name: initialData.name,
                    description: initialData.description || '',
                    unitPrice: initialData.unitPrice,
                    costCenterId: initialData.costCenterId,
                    isActive: initialData.isActive,
                    notes: initialData.notes || ''
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

            if (!formData.code.trim()) {
                newErrors.code = 'Código é obrigatório';
            }

            if (!formData.name.trim()) {
                newErrors.name = 'Nome é obrigatório';
            }

            if (formData.unitPrice !== undefined && formData.unitPrice < 0) {
                newErrors.unitPrice = 'Preço unitário não pode ser negativo';
            }

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        const handleSubmit = async () => {
            if (!validateForm()) {
                throw new Error('Preencha todos os campos obrigatórios');
            }

            await onSubmit(formData);
        };

        useImperativeHandle(ref, () => ({
            submit: handleSubmit
        }));

        const handleChange = (field: keyof CreateServiceDTO, value: any) => {
            setFormData(prev => ({ ...prev, [field]: value }));
            if (errors[field]) {
                setErrors(prev => ({ ...prev, [field]: '' }));
            }
        };

        return (
            <div className="service-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="code">
                            Código <span className="required">*</span>
                        </label>
                        <input
                            id="code"
                            type="text"
                            value={formData.code}
                            onChange={(e) => handleChange('code', e.target.value)}
                            className={errors.code ? 'error' : ''}
                            maxLength={50}
                        />
                        {errors.code && <span className="error-message">{errors.code}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="name">
                            Nome <span className="required">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className={errors.name ? 'error' : ''}
                            maxLength={200}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="description">Descrição</label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={3}
                            maxLength={500}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="unitPrice">Preço Unitário</label>
                        <input
                            id="unitPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.unitPrice || ''}
                            onChange={(e) => handleChange('unitPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                            className={errors.unitPrice ? 'error' : ''}
                        />
                        {errors.unitPrice && <span className="error-message">{errors.unitPrice}</span>}
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

                    <div className="form-group full-width">
                        <label htmlFor="notes">Observações</label>
                        <textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>
            </div>
        );
    }
);

ServiceForm.displayName = 'ServiceForm';

export default ServiceForm;
