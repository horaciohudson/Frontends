import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { wholesalersAPI } from '../services/api';
import './WholesalerRegistration.css';

interface WholesalerFormData {
    cnpj: string;
    stateRegistration: string;
    companyName: string;
    tradeName: string;
    commercialPhone: string;
    commercialEmail: string;
    commercialContact: string;
    financialPhone: string;
    financialEmail: string;
    financialContact: string;
    legalRepName: string;
    legalRepCpf: string;
}

interface ExistingWholesaler {
    id: number;
    status: string;
    companyName: string;
    cnpj: string;
    rejectionReason?: string;
}

function WholesalerRegistration() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [checkingExisting, setCheckingExisting] = useState(false);
    const [existingWholesaler, setExistingWholesaler] = useState<ExistingWholesaler | null>(null);
    const [hasChecked, setHasChecked] = useState(false);
    const [formData, setFormData] = useState<WholesalerFormData>({
        cnpj: '',
        stateRegistration: '',
        companyName: '',
        tradeName: '',
        commercialPhone: '',
        commercialEmail: '',
        commercialContact: '',
        financialPhone: '',
        financialEmail: '',
        financialContact: '',
        legalRepName: '',
        legalRepCpf: ''
    });

    // Check if user already has a wholesaler registration
    useEffect(() => {
        const checkExistingRegistration = async () => {
            if (!isAuthenticated || !user?.id || hasChecked) {
                return;
            }

            try {
                setCheckingExisting(true);
                const response = await wholesalersAPI.getByUserId(user.id);
                setExistingWholesaler(response.data);
            } catch (error: any) {
                // 404 means no existing registration, which is fine
                if (error.response?.status !== 404) {
                    console.error('Error checking existing registration:', error);
                }
            } finally {
                setCheckingExisting(false);
                setHasChecked(true);
            }
        };

        checkExistingRegistration();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, isAuthenticated]);

    // Pre-fill form data for incomplete registrations
    useEffect(() => {
        if (existingWholesaler?.cnpj === '00000000000000' && formData.cnpj === '') {
            setFormData({
                cnpj: '',
                stateRegistration: '',
                companyName: existingWholesaler.companyName || '',
                tradeName: '',
                commercialPhone: '',
                commercialEmail: '',
                commercialContact: '',
                financialPhone: '',
                financialEmail: '',
                financialContact: '',
                legalRepName: '',
                legalRepCpf: ''
            });
        }
    }, [existingWholesaler, formData.cnpj]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatCNPJ = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .slice(0, 18);
    };

    const formatCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{3})(\d)/, '$1.$2')
            .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1-$2')
            .slice(0, 14);
    };

    const formatPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4,5})(\d{4})$/, '$1-$2')
            .slice(0, 15);
    };

    const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCNPJ(e.target.value);
        setFormData(prev => ({ ...prev, cnpj: formatted }));
    };

    const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCPF(e.target.value);
        setFormData(prev => ({ ...prev, legalRepCpf: formatted }));
    };

    const handlePhoneChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setFormData(prev => ({ ...prev, [field]: formatted }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.id) {
            alert('Erro: Usuário não identificado. Faça login novamente.');
            return;
        }

        // Validações básicas
        if (!formData.cnpj || !formData.companyName || !formData.legalRepName || !formData.legalRepCpf) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        try {
            setLoading(true);

            await wholesalersAPI.create(formData, user.id);

            alert('✅ Cadastro enviado com sucesso!\n\nSeu cadastro está em análise. Você receberá uma notificação quando for aprovado pelo administrador.');

            navigate('/wholesale/catalog');

        } catch (error: any) {
            console.error('Error creating wholesaler:', error);
            const errorMessage = error.response?.data?.message || error.response?.data || 'Erro ao enviar cadastro. Tente novamente.';
            alert(`Erro ao enviar cadastro:\n${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="wholesaler-registration">
                <div className="container">
                    <div className="auth-required">
                        <h2>🔒 Autenticação Necessária</h2>
                        <p>Você precisa estar logado para se cadastrar como revendedor.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/login')}>
                            Fazer Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (checkingExisting) {
        return (
            <div className="wholesaler-registration">
                <div className="container">
                    <div className="loading-state">
                        <p>⏳ Verificando cadastro...</p>
                    </div>
                </div>
            </div>
        );
    }


    // If user already has a registration, show status instead of form
    if (existingWholesaler) {
        // Se o cadastro está com CNPJ placeholder (00000000000000), permitir completar
        const isIncompletRegistration = existingWholesaler.cnpj === '00000000000000';

        if (isIncompletRegistration) {
            // Continuar mostrando o formulário para completar o cadastro
        } else {
            // Cadastro completo - mostrar apenas o status
            const getStatusInfo = (status: string) => {
                switch (status) {
                    case 'PENDING':
                        return {
                            icon: '⏳',
                            title: 'Cadastro em Análise',
                            message: 'Seu cadastro está sendo analisado pelo administrador. Você receberá uma notificação quando for aprovado.',
                            color: '#f59e0b'
                        };
                    case 'APPROVED':
                        return {
                            icon: '✅',
                            title: 'Cadastro Aprovado',
                            message: 'Parabéns! Seu cadastro foi aprovado. Você já pode fazer pedidos.',
                            color: '#10b981'
                        };
                    case 'REJECTED':
                        return {
                            icon: '❌',
                            title: 'Cadastro Rejeitado',
                            message: existingWholesaler.rejectionReason || 'Seu cadastro foi rejeitado. Entre em contato com o administrador para mais informações.',
                            color: '#ef4444'
                        };
                    case 'SUSPENDED':
                        return {
                            icon: '⚠️',
                            title: 'Cadastro Suspenso',
                            message: existingWholesaler.rejectionReason || 'Seu cadastro foi suspenso. Entre em contato com o administrador.',
                            color: '#f59e0b'
                        };
                    default:
                        return {
                            icon: 'ℹ️',
                            title: 'Status do Cadastro',
                            message: 'Status: ' + status,
                            color: '#6b7280'
                        };
                }
            };

            const statusInfo = getStatusInfo(existingWholesaler.status);

            return (
                <div className="wholesaler-registration">
                    <div className="container">
                        <div className="existing-registration" style={{ borderColor: statusInfo.color }}>
                            <div className="status-icon" style={{ color: statusInfo.color }}>
                                {statusInfo.icon}
                            </div>
                            <h2>{statusInfo.title}</h2>
                            <div className="company-info">
                                <p><strong>Empresa:</strong> {existingWholesaler.companyName}</p>
                                <p><strong>CNPJ:</strong> {existingWholesaler.cnpj}</p>
                            </div>
                            <p className="status-message">{statusInfo.message}</p>
                            <div className="actions">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate('/wholesale/catalog')}
                                >
                                    Voltar ao Catálogo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    return (
        <div className="wholesaler-registration">
            <div className="container">
                <div className="registration-header">
                    <h1>📋 Cadastro de Revendedor</h1>
                    <p className="subtitle">Preencha os dados da sua empresa para se tornar um revendedor</p>
                </div>

                <form onSubmit={handleSubmit} className="registration-form">
                    {/* Dados da Empresa */}
                    <div className="form-section">
                        <h2>🏢 Dados da Empresa</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="cnpj">CNPJ *</label>
                                <input
                                    type="text"
                                    id="cnpj"
                                    name="cnpj"
                                    value={formData.cnpj}
                                    onChange={handleCNPJChange}
                                    placeholder="00.000.000/0000-00"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="stateRegistration">Inscrição Estadual</label>
                                <input
                                    type="text"
                                    id="stateRegistration"
                                    name="stateRegistration"
                                    value={formData.stateRegistration}
                                    onChange={handleChange}
                                    placeholder="ISENTO ou número"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="companyName">Razão Social *</label>
                                <input
                                    type="text"
                                    id="companyName"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    placeholder="Nome completo da empresa"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="tradeName">Nome Fantasia</label>
                                <input
                                    type="text"
                                    id="tradeName"
                                    name="tradeName"
                                    value={formData.tradeName}
                                    onChange={handleChange}
                                    placeholder="Nome comercial"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contato Comercial */}
                    <div className="form-section">
                        <h2>📞 Contato Comercial</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="commercialContact">Nome do Contato</label>
                                <input
                                    type="text"
                                    id="commercialContact"
                                    name="commercialContact"
                                    value={formData.commercialContact}
                                    onChange={handleChange}
                                    placeholder="Nome completo"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="commercialPhone">Telefone</label>
                                <input
                                    type="text"
                                    id="commercialPhone"
                                    name="commercialPhone"
                                    value={formData.commercialPhone}
                                    onChange={handlePhoneChange('commercialPhone')}
                                    placeholder="(00) 00000-0000"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="commercialEmail">E-mail</label>
                                <input
                                    type="email"
                                    id="commercialEmail"
                                    name="commercialEmail"
                                    value={formData.commercialEmail}
                                    onChange={handleChange}
                                    placeholder="comercial@empresa.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contato Financeiro */}
                    <div className="form-section">
                        <h2>💰 Contato Financeiro</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="financialContact">Nome do Contato</label>
                                <input
                                    type="text"
                                    id="financialContact"
                                    name="financialContact"
                                    value={formData.financialContact}
                                    onChange={handleChange}
                                    placeholder="Nome completo"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="financialPhone">Telefone</label>
                                <input
                                    type="text"
                                    id="financialPhone"
                                    name="financialPhone"
                                    value={formData.financialPhone}
                                    onChange={handlePhoneChange('financialPhone')}
                                    placeholder="(00) 00000-0000"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="financialEmail">E-mail</label>
                                <input
                                    type="email"
                                    id="financialEmail"
                                    name="financialEmail"
                                    value={formData.financialEmail}
                                    onChange={handleChange}
                                    placeholder="financeiro@empresa.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Responsável Legal */}
                    <div className="form-section">
                        <h2>👤 Responsável Legal</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="legalRepName">Nome Completo *</label>
                                <input
                                    type="text"
                                    id="legalRepName"
                                    name="legalRepName"
                                    value={formData.legalRepName}
                                    onChange={handleChange}
                                    placeholder="Nome completo do responsável"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="legalRepCpf">CPF *</label>
                                <input
                                    type="text"
                                    id="legalRepCpf"
                                    name="legalRepCpf"
                                    value={formData.legalRepCpf}
                                    onChange={handleCPFChange}
                                    placeholder="000.000.000-00"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/wholesale/catalog')}
                            disabled={loading}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                        >
                            {loading ? '⏳ Enviando...' : '✓ Enviar Cadastro'}
                        </button>
                    </div>

                    <div className="form-note">
                        <p>* Campos obrigatórios</p>
                        <p>📌 Seu cadastro será analisado pelo administrador. Você receberá uma notificação quando for aprovado.</p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default WholesalerRegistration;
