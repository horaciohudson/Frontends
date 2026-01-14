import React, { useEffect } from 'react';
import CompanyForm from '../forms/company/CompanyForm';
import type { Company } from '../../services/companyService';
import './CompanyFormModal.css';

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

interface CompanyFormModalProps {
    isOpen: boolean;
    company?: Company;
    onSubmit: (data: CompanyFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
    error?: string | null;
}

const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
    isOpen,
    company,
    onSubmit,
    onCancel,
    loading = false,
    error = null
}) => {
    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onCancel();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onCancel]);

    if (!isOpen) {
        return null;
    }

    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onCancel();
        }
    };

    const initialData = company ? {
        corporateName: company.corporateName,
        tradeName: company.tradeName || '',
        cnpj: company.cnpj || '',
        stateRegistration: company.stateRegistration || '',
        municipalRegistration: company.municipalRegistration || '',
        phone: company.phone || '',
        mobile: company.mobile || '',
        email: company.email || '',
        whatsapp: company.whatsapp || '',
        issRate: company.issRate ?? null,
        funruralRate: company.funruralRate ?? null,
        manager: company.manager || '',
        factory: company.factory ?? false,
        supplierFlag: company.supplierFlag ?? false,
        customerFlag: company.customerFlag ?? false,
        transporterFlag: company.transporterFlag ?? false,
        isActive: company.isActive ?? true,
    } : undefined;

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-container">
                <div className="modal-header">
                    <h2 className="modal-title">
                        {company ? 'Editar Empresa' : 'Nova Empresa'}
                    </h2>
                    <button
                        className="modal-close-button"
                        onClick={onCancel}
                        title="Fechar (ESC)"
                    >
                        ✕
                    </button>
                </div>
                
                <div className="modal-content">
                    <CompanyForm
                        initialData={initialData}
                        onSubmit={onSubmit}
                        onCancel={onCancel}
                        loading={loading}
                        isEditing={!!company}
                        error={error}
                    />
                </div>
            </div>
        </div>
    );
};

export default CompanyFormModal;