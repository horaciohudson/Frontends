import React, { useState, useEffect } from 'react';
import '../../../styles/forms/CompanyForm.css';

interface CompanyFormData {
    corporateName: string;
    tradeName: string;
    cnpj: string;
    stateRegistration: string;
    municipalRegistration: string;
    phone: string;
    mobile: string;
    email: string;
    whatsapp: string;
    issRate: number | null;
    funruralRate: number | null;
    manager: string;
    factory: boolean;
    supplierFlag: boolean;
    customerFlag: boolean;
    transporterFlag: boolean;
    isActive: boolean;
}

interface CompanyFormProps {
    initialData?: Partial<CompanyFormData>;
    onSubmit: (data: CompanyFormData) => void;
    onCancel: () => void;
    loading?: boolean;
    isEditing?: boolean;
    error?: string | null;
}

const CompanyForm: React.FC<CompanyFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    loading = false,
    isEditing = false,
    error = null
}) => {
    const [formData, setFormData] = useState<CompanyFormData>({
        corporateName: initialData?.corporateName || '',
        tradeName: initialData?.tradeName || '',
        cnpj: initialData?.cnpj || '',
        stateRegistration: initialData?.stateRegistration || '',
        municipalRegistration: initialData?.municipalRegistration || '',
        phone: initialData?.phone || '',
        mobile: initialData?.mobile || '',
        email: initialData?.email || '',
        whatsapp: initialData?.whatsapp || '',
        issRate: initialData?.issRate ?? null,
        funruralRate: initialData?.funruralRate ?? null,
        manager: initialData?.manager || '',
        factory: initialData?.factory ?? false,
        supplierFlag: initialData?.supplierFlag ?? false,
        customerFlag: initialData?.customerFlag ?? false,
        transporterFlag: initialData?.transporterFlag ?? false,
        isActive: initialData?.isActive ?? true,
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                corporateName: initialData.corporateName || '',
                tradeName: initialData.tradeName || '',
                cnpj: initialData.cnpj || '',
                stateRegistration: initialData.stateRegistration || '',
                municipalRegistration: initialData.municipalRegistration || '',
                phone: initialData.phone || '',
                mobile: initialData.mobile || '',
                email: initialData.email || '',
                whatsapp: initialData.whatsapp || '',
                issRate: initialData.issRate ?? null,
                funruralRate: initialData.funruralRate ?? null,
                manager: initialData.manager || '',
                factory: initialData.factory ?? false,
                supplierFlag: initialData.supplierFlag ?? false,
                customerFlag: initialData.customerFlag ?? false,
                transporterFlag: initialData.transporterFlag ?? false,
                isActive: initialData.isActive ?? true,
            });
        }
    }, [initialData]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.corporateName.trim()) {
            newErrors.corporateName = 'Razão social é obrigatória';
        } else if (formData.corporateName.length < 3) {
            newErrors.corporateName = 'Razão social deve ter pelo menos 3 caracteres';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email deve ser válido';
        }

        if (formData.issRate !== null && (formData.issRate < 0 || formData.issRate > 100)) {
            newErrors.issRate = 'Taxa ISS deve estar entre 0 e 100';
        }

        if (formData.funruralRate !== null && (formData.funruralRate < 0 || formData.funruralRate > 100)) {
            newErrors.funruralRate = 'Taxa Funrural deve estar entre 0 e 100';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else if (type === 'number') {
            setFormData(prev => ({
                ...prev,
                [name]: value === '' ? null : parseFloat(value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Limpar erro do campo quando o usuário começar a digitar
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <div className="company-form-container">
            <div className="company-form-header">
                <h2>{isEditing ? 'Editar Empresa' : 'Nova Empresa'}</h2>
            </div>

            {error && (
                <div className="company-form-error">
                    <span>❌ {error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="company-form">
                {/* Seção: Identificação */}
                <div className="company-form-section">
                    <h3>📋 Identificação</h3>
                    <div className="form-row form-row-2">
                        <div className="form-group">
                            <label htmlFor="corporateName">Razão Social *</label>
                            <input
                                type="text"
                                id="corporateName"
                                name="corporateName"
                                value={formData.corporateName}
                                onChange={handleInputChange}
                                disabled={loading}
                                className={errors.corporateName ? 'error' : ''}
                                placeholder="Razão social da empresa"
                            />
                            {errors.corporateName && <span className="error-message">{errors.corporateName}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="tradeName">Nome Fantasia</label>
                            <input
                                type="text"
                                id="tradeName"
                                name="tradeName"
                                value={formData.tradeName}
                                onChange={handleInputChange}
                                disabled={loading}
                                placeholder="Nome fantasia"
                            />
                        </div>
                    </div>

                    <div className="form-row form-row-3">
                        <div className="form-group">
                            <label htmlFor="cnpj">CNPJ</label>
                            <input
                                type="text"
                                id="cnpj"
                                name="cnpj"
                                value={formData.cnpj}
                                onChange={handleInputChange}
                                disabled={loading}
                                placeholder="00.000.000/0000-00"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="stateRegistration">Inscrição Estadual</label>
                            <input
                                type="text"
                                id="stateRegistration"
                                name="stateRegistration"
                                value={formData.stateRegistration}
                                onChange={handleInputChange}
                                disabled={loading}
                                placeholder="Inscrição estadual"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="municipalRegistration">Inscrição Municipal</label>
                            <input
                                type="text"
                                id="municipalRegistration"
                                name="municipalRegistration"
                                value={formData.municipalRegistration}
                                onChange={handleInputChange}
                                disabled={loading}
                                placeholder="Inscrição municipal"
                            />
                        </div>
                    </div>
                </div>

                {/* Seção: Contato */}
                <div className="company-form-section">
                    <h3>📞 Contato</h3>
                    <div className="form-row form-row-4">
                        <div className="form-group">
                            <label htmlFor="phone">Telefone</label>
                            <input
                                type="text"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                disabled={loading}
                                placeholder="(00) 0000-0000"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="mobile">Celular</label>
                            <input
                                type="text"
                                id="mobile"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleInputChange}
                                disabled={loading}
                                placeholder="(00) 00000-0000"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="whatsapp">WhatsApp</label>
                            <input
                                type="text"
                                id="whatsapp"
                                name="whatsapp"
                                value={formData.whatsapp}
                                onChange={handleInputChange}
                                disabled={loading}
                                placeholder="(00) 00000-0000"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={loading}
                                className={errors.email ? 'error' : ''}
                                placeholder="email@empresa.com"
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>
                    </div>
                </div>

                {/* Seção: Configurações Fiscais */}
                <div className="company-form-section">
                    <h3>📊 Configurações Fiscais</h3>
                    <div className="form-row form-row-3">
                        <div className="form-group">
                            <label htmlFor="issRate">Taxa ISS (%)</label>
                            <input
                                type="number"
                                id="issRate"
                                name="issRate"
                                value={formData.issRate ?? ''}
                                onChange={handleInputChange}
                                disabled={loading}
                                className={errors.issRate ? 'error' : ''}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                max="100"
                            />
                            {errors.issRate && <span className="error-message">{errors.issRate}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="funruralRate">Taxa Funrural (%)</label>
                            <input
                                type="number"
                                id="funruralRate"
                                name="funruralRate"
                                value={formData.funruralRate ?? ''}
                                onChange={handleInputChange}
                                disabled={loading}
                                className={errors.funruralRate ? 'error' : ''}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                max="100"
                            />
                            {errors.funruralRate && <span className="error-message">{errors.funruralRate}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="manager">Gerente</label>
                            <input
                                type="text"
                                id="manager"
                                name="manager"
                                value={formData.manager}
                                onChange={handleInputChange}
                                disabled={loading}
                                placeholder="Nome do gerente"
                            />
                        </div>
                    </div>
                </div>

                {/* Seção: Classificação */}
                <div className="company-form-section">
                    <h3>🏷️ Classificação</h3>
                    <div className="checkbox-group">
                        <div className="checkbox-item">
                            <input
                                type="checkbox"
                                id="supplierFlag"
                                name="supplierFlag"
                                checked={formData.supplierFlag}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                            <label htmlFor="supplierFlag">Fornecedor</label>
                        </div>

                        <div className="checkbox-item">
                            <input
                                type="checkbox"
                                id="customerFlag"
                                name="customerFlag"
                                checked={formData.customerFlag}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                            <label htmlFor="customerFlag">Cliente</label>
                        </div>

                        <div className="checkbox-item">
                            <input
                                type="checkbox"
                                id="transporterFlag"
                                name="transporterFlag"
                                checked={formData.transporterFlag}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                            <label htmlFor="transporterFlag">Transportadora</label>
                        </div>

                        <div className="checkbox-item">
                            <input
                                type="checkbox"
                                id="factory"
                                name="factory"
                                checked={formData.factory}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                            <label htmlFor="factory">Fábrica</label>
                        </div>

                        <div className="checkbox-item">
                            <input
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                            <label htmlFor="isActive">Ativo</label>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="btn-cancel"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-submit"
                    >
                        {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CompanyForm;
