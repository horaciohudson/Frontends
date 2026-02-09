import React, { useState } from 'react';
import './LoginForm.css';

interface LoginFormData {
    username: string;
    password: string;
    tenantCode: string;
}

interface LoginFormProps {
    onLogin: (credentials: LoginFormData) => Promise<void>;
    isLoading?: boolean;
    error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoading = false, error }) => {
    const [formData, setFormData] = useState<LoginFormData>({
        username: '',
        password: '',
        tenantCode: ''
    });

    const [validationErrors, setValidationErrors] = useState<Partial<LoginFormData>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear validation error when user starts typing
        if (validationErrors[name as keyof LoginFormData]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Partial<LoginFormData> = {};

        if (!formData.username.trim()) {
            errors.username = 'Nome de usuário é obrigatório';
        }

        if (!formData.password.trim()) {
            errors.password = 'Senha é obrigatória';
        }

        if (!formData.tenantCode.trim()) {
            errors.tenantCode = 'Código do sistema cliente é obrigatório';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await onLogin(formData);
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Sistema de Produção Integrado</h1>
                    <p>Faça login para acessar o sistema</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="tenantCode">Código do Sistema Cliente</label>
                        <input
                            type="text"
                            id="tenantCode"
                            name="tenantCode"
                            value={formData.tenantCode}
                            onChange={handleInputChange}
                            className={validationErrors.tenantCode ? 'error' : ''}
                            placeholder="Ex: SIGEVE"
                            disabled={isLoading}
                        />
                        {validationErrors.tenantCode && (
                            <span className="field-error">{validationErrors.tenantCode}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Nome de Usuário</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className={validationErrors.username ? 'error' : ''}
                            placeholder="Digite seu nome de usuário"
                            disabled={isLoading}
                        />
                        {validationErrors.username && (
                            <span className="field-error">{validationErrors.username}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={validationErrors.password ? 'error' : ''}
                            placeholder="Digite sua senha"
                            disabled={isLoading}
                        />
                        {validationErrors.password && (
                            <span className="field-error">{validationErrors.password}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Sistema de Produção Integrado v1.0</p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
