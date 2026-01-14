import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { TenantDTO, CreateTenantDTO, UpdateTenantDTO, TenantStatus } from '../../types/tenant';
import { TenantStatusLabels } from '../../types/tenant';
import './TenantForm.css';

export interface TenantFormRef {
    submit: () => Promise<void>;
}

interface TenantFormProps {
    initialData?: TenantDTO | null;
    onSubmit: (data: CreateTenantDTO | UpdateTenantDTO) => Promise<void>;
}

const TenantForm = forwardRef<TenantFormRef, TenantFormProps>(
    ({ initialData, onSubmit }, ref) => {
        const [formData, setFormData] = useState({
            code: '',
            name: '',
            status: 'ACTIVE' as TenantStatus
        });

        const [errors, setErrors] = useState<Record<string, string>>({});

        useEffect(() => {
            if (initialData) {
                setFormData({
                    code: initialData.code,
                    name: initialData.name,
                    status: initialData.status
                });
            }
        }, [initialData]);

        const validateForm = (): boolean => {
            const newErrors: Record<string, string> = {};

            if (!initialData && !formData.code.trim()) {
                newErrors.code = 'Código é obrigatório';
            }

            if (!formData.name.trim()) {
                newErrors.name = 'Nome é obrigatório';
            }

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        const handleSubmit = async () => {
            if (!validateForm()) {
                throw new Error('Preencha todos os campos obrigatórios');
            }

            if (initialData) {
                // Update - apenas name e status
                await onSubmit({
                    name: formData.name,
                    status: formData.status
                });
            } else {
                // Create - code, name e status
                await onSubmit({
                    code: formData.code,
                    name: formData.name,
                    status: formData.status
                });
            }
        };

        useImperativeHandle(ref, () => ({
            submit: handleSubmit
        }));

        const handleChange = (field: string, value: any) => {
            setFormData(prev => ({ ...prev, [field]: value }));
            if (errors[field]) {
                setErrors(prev => ({ ...prev, [field]: '' }));
            }
        };

        return (
            <div className="tenant-form">
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
                            maxLength={20}
                            disabled={!!initialData}
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
                            maxLength={100}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            value={formData.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                        >
                            <option value="ACTIVE">{TenantStatusLabels.ACTIVE}</option>
                            <option value="INACTIVE">{TenantStatusLabels.INACTIVE}</option>
                        </select>
                    </div>
                </div>
            </div>
        );
    }
);

TenantForm.displayName = 'TenantForm';

export default TenantForm;
