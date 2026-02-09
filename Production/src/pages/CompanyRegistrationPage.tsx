import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyForm from '../components/forms/CompanyForm';
import ErrorBoundary from '../components/ErrorBoundary';
import { companyService, type CreateCompanyDTO } from '../services/companyService';
import './CompanyRegistrationPage.css';

const CompanyRegistrationPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string>('');

    console.log('🏢 [COMPANY PAGE] CompanyRegistrationPage rendered');

    const handleSubmit = async (data: CreateCompanyDTO) => {
        console.log('🏢 [COMPANY PAGE] handleSubmit called with data:', data);
        
        try {
            setLoading(true);
            setError('');
            setSuccess(false);

            console.log('🏢 [COMPANY PAGE] Creating company via service...');
            const result = await companyService.createCompany(data);
            
            console.log('✅ [COMPANY PAGE] Company created successfully:', result);
            setSuccess(true);
            
            // Show success message for 2 seconds, then navigate back
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
            
        } catch (err: any) {
            console.error('💥 [COMPANY PAGE] Error creating company:', err);
            
            const errorMessage = err.response?.data?.message || 
                               err.message || 
                               'Erro ao criar empresa. Tente novamente.';
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        console.log('❌ [COMPANY PAGE] handleCancel called');
        navigate('/dashboard');
    };

    if (success) {
        return (
            <ErrorBoundary>
                <div className="company-registration-page">
                    <div className="success-container">
                        <div className="success-icon">✅</div>
                        <h2 className="success-title">Empresa criada com sucesso!</h2>
                        <p className="success-message">
                            A empresa foi cadastrada no sistema. Redirecionando...
                        </p>
                    </div>
                </div>
            </ErrorBoundary>
        );
    }

    return (
        <ErrorBoundary>
            <div className="company-registration-page">
                <div className="page-header">
                    <div className="breadcrumb">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="breadcrumb-link"
                        >
                            📊 Dashboard
                        </button>
                        <span className="breadcrumb-separator">›</span>
                        <span className="breadcrumb-current">Cadastro de Empresa</span>
                    </div>
                    
                    <h1 className="page-title">🏢 Cadastro de Empresa</h1>
                    
                    <p className="page-description">
                        Cadastre uma nova empresa no sistema. Todos os campos marcados com * são obrigatórios.
                    </p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <span className="alert-icon">⚠️</span>
                        <div className="alert-content">
                            <strong>Erro ao criar empresa:</strong>
                            <p>{error}</p>
                        </div>
                        <button 
                            onClick={() => setError('')}
                            className="alert-close"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <CompanyForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={loading}
                />
            </div>
        </ErrorBoundary>
    );
};

export default CompanyRegistrationPage;