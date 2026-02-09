import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { CreateCompanyDTO, Company } from '../../services/companyService';
import { authService } from '../../services/authService';
import { formatCNPJ, getCNPJErrorMessage } from '../../utils/cnpjValidation';
import './CompanyForm.css';

interface CompanyFormProps {
    initialData?: Company | null;
    onSubmit: (data: CreateCompanyDTO) => Promise<void>;
}

export interface CompanyFormRef {
    submit: () => Promise<void>;
}

const CompanyForm = forwardRef<CompanyFormRef, CompanyFormProps>(({
    initialData,
    onSubmit,
}, ref) => {
    const user = authService.getUser();
    const tenantId = user?.tenantId || '';

    const [formData, setFormData] = useState<Partial<CreateCompanyDTO>>({
        corporateName: '',
        tradeName: '',
        cnpj: '',
        stateRegistration: '',
        municipalRegistration: '',
        phone: '',
        mobile: '',
        email: '',
        whatsapp: '',
        issRate: 0,
        funruralRate: 0,
        manager: '',
        factory: false,
        supplierFlag: false,
        customerFlag: false,
        transporterFlag: false,
        isActive: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                corporateName: initialData.corporateName,
                tradeName: initialData.tradeName,
                cnpj: initialData.cnpj,
                stateRegistration: initialData.stateRegistration,
                municipalRegistration: initialData.municipalRegistration,
                phone: initialData.phone,
                mobile: initialData.mobile,
                email: initialData.email,
                whatsapp: initialData.whatsapp,
                issRate: initialData.issRate,
                funruralRate: initialData.funruralRate,
                manager: initialData.manager,
                factory: initialData.factory,
                supplierFlag: initialData.supplierFlag,
                customerFlag: initialData.customerFlag,
                transporterFlag: initialData.transporterFlag,
                isActive: initialData.isActive,
            });
        }
    }, [initialData]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.corporateName?.trim()) {
            newErrors.corporateName = 'Razão social é obrigatória';
        } else if (formData.corporateName.length > 200) {
            newErrors.corporateName = 'Razão social deve ter no máximo 200 caracteres';
        }

        if (formData.tradeName && formData.tradeName.length > 200) {
            newErrors.tradeName = 'Nome fantasia deve ter no máximo 200 caracteres';
        }

        if (formData.cnpj) {
            const cnpjError = getCNPJErrorMessage(formData.cnpj);
            if (cnpjError) {
                newErrors.cnpj = cnpjError;
            }
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email deve ser válido';
        }

        if (formData.issRate !== undefined && (formData.issRate < 0 || formData.issRate > 100)) {
            newErrors.issRate = 'Taxa ISS deve estar entre 0 e 100';
        }

        if (formData.funruralRate !== undefined && (formData.funruralRate < 0 || formData.funruralRate > 100)) {
            newErrors.funruralRate = 'Taxa Funrural deve estar entre 0 e 100';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: keyof CreateCompanyDTO, value: unknown) => {
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
            const dataToSubmit = {
                ...formData,
                tenantId
            } as CreateCompanyDTO;
            await onSubmit(dataToSubmit);
        } catch (error) {
            console.error('Erro ao salvar:', error);
            throw error;
        }
    };


    useImperativeHandle(ref, () => ({
        submit: handleSubmit
    }));

    return (
        <div className="company-form">
            <div className="form-section">
                <h3>Informações Básicas</h3>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="corporateName">Razão Social *</label>
                        <input
                            id="corporateName"
                            type="text"
                            value={formData.corporateName || ''}
                            onChange={(e) => handleChange('corporateName', e.target.value)}
                            className={errors.corporateName ? 'error' : ''}
                            placeholder="Ex: Empresa de Produção LTDA"
                        />
                        {errors.corporateName && <span className="error-message">{errors.corporateName}</span>}
                    </div>
                </div>

                <div className="form-row two-columns">
                    <div className="form-group">
                        <label htmlFor="tradeName">Nome Fantasia</label>
                        <input
                            id="tradeName"
                            type="text"
                            value={formData.tradeName || ''}
                            onChange={(e) => handleChange('tradeName', e.target.value)}
                            className={errors.tradeName ? 'error' : ''}
                            placeholder="Ex: Produção Industrial"
                        />
                        {errors.tradeName && <span className="error-message">{errors.tradeName}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="cnpj">CNPJ</label>
                        <input
                            id="cnpj"
                            type="text"
                            value={formData.cnpj || ''}
                            onChange={(e) => handleChange('cnpj', formatCNPJ(e.target.value))}
                            className={errors.cnpj ? 'error' : ''}
                            placeholder="XX.XXX.XXX/XXXX-XX"
                            maxLength={18}
                        />
                        {errors.cnpj && <span className="error-message">{errors.cnpj}</span>}
                    </div>
                </div>

                <div className="form-row two-columns">
                    <div className="form-group">
                        <label htmlFor="stateRegistration">Inscrição Estadual</label>
                        <input
                            id="stateRegistration"
                            type="text"
                            value={formData.stateRegistration || ''}
                            onChange={(e) => handleChange('stateRegistration', e.target.value)}
                            placeholder="Ex: 123.456.789.012"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="municipalRegistration">Inscrição Municipal</label>
                        <input
                            id="municipalRegistration"
                            type="text"
                            value={formData.municipalRegistration || ''}
                            onChange={(e) => handleChange('municipalRegistration', e.target.value)}
                            placeholder="Ex: 12345678"
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3>Contatos</h3>

                <div className="form-row two-columns">
                    <div className="form-group">
                        <label htmlFor="phone">Telefone</label>
                        <input
                            id="phone"
                            type="text"
                            value={formData.phone || ''}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            placeholder="(11) 1234-5678"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="mobile">Celular</label>
                        <input
                            id="mobile"
                            type="text"
                            value={formData.mobile || ''}
                            onChange={(e) => handleChange('mobile', e.target.value)}
                            placeholder="(11) 91234-5678"
                        />
                    </div>
                </div>

                <div className="form-row two-columns">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className={errors.email ? 'error' : ''}
                            placeholder="contato@empresa.com"
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="whatsapp">WhatsApp</label>
                        <input
                            id="whatsapp"
                            type="text"
                            value={formData.whatsapp || ''}
                            onChange={(e) => handleChange('whatsapp', e.target.value)}
                            placeholder="(11) 91234-5678"
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3>Configurações Fiscais</h3>

                <div className="form-row three-columns">
                    <div className="form-group">
                        <label htmlFor="issRate">Taxa ISS (%)</label>
                        <input
                            id="issRate"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={formData.issRate || 0}
                            onChange={(e) => handleChange('issRate', parseFloat(e.target.value) || 0)}
                            className={errors.issRate ? 'error' : ''}
                        />
                        {errors.issRate && <span className="error-message">{errors.issRate}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="funruralRate">Taxa Funrural (%)</label>
                        <input
                            id="funruralRate"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={formData.funruralRate || 0}
                            onChange={(e) => handleChange('funruralRate', parseFloat(e.target.value) || 0)}
                            className={errors.funruralRate ? 'error' : ''}
                        />
                        {errors.funruralRate && <span className="error-message">{errors.funruralRate}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="manager">Gerente</label>
                        <input
                            id="manager"
                            type="text"
                            value={formData.manager || ''}
                            onChange={(e) => handleChange('manager', e.target.value)}
                            placeholder="Nome do gerente"
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3>Configurações</h3>

                <div className="form-row four-columns">
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.factory || false}
                                onChange={(e) => handleChange('factory', e.target.checked)}
                            />
                            <span>É Fábrica</span>
                        </label>
                    </div>

                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.supplierFlag || false}
                                onChange={(e) => handleChange('supplierFlag', e.target.checked)}
                            />
                            <span>É Fornecedor</span>
                        </label>
                    </div>

                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.customerFlag || false}
                                onChange={(e) => handleChange('customerFlag', e.target.checked)}
                            />
                            <span>É Cliente</span>
                        </label>
                    </div>

                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.transporterFlag || false}
                                onChange={(e) => handleChange('transporterFlag', e.target.checked)}
                            />
                            <span>É Transportadora</span>
                        </label>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.isActive !== false}
                                onChange={(e) => handleChange('isActive', e.target.checked)}
                            />
                            <span>Empresa Ativa</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
});

CompanyForm.displayName = 'CompanyForm';

export default CompanyForm;