import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import api from '../services/api';
import './WholesaleSettings.css';

interface Wholesaler {
    id: number;
    companyName: string;  // Backend retorna companyName, não corporateName
    tradeName?: string;
    cnpj: string;
    stateRegistration?: string;
    municipalRegistration?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    status: string;
    approvedAt?: string;
    rejectionReason?: string;
}

function WholesaleSettings() {
    const { hasRole, isAuthenticated, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [wholesaler, setWholesaler] = useState<Wholesaler | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState<Partial<Wholesaler>>({});

    // Redirect if not a wholesaler
    if (!isAuthenticated || !hasRole('REVENDA')) {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        loadWholesaler();
    }, [user]);

    const loadWholesaler = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('🔍 Loading wholesaler for user:', user?.id);
            const response = await api.get(`/wholesalers/user/${user?.id}`);
            console.log('✅ Wholesaler loaded:', response.data);
            setWholesaler(response.data);
            setFormData(response.data);
        } catch (err: any) {
            console.error('❌ Error loading wholesaler:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            if (err.response?.status === 404) {
                setError('Você ainda não possui um cadastro de atacadista. Por favor, complete seu cadastro primeiro.');
            } else {
                setError('Erro ao carregar dados do atacadista: ' + (err.response?.data?.message || err.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof Wholesaler, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');

            await api.put(`/wholesalers/${wholesaler?.id}`, formData);

            setSuccess('Dados atualizados com sucesso!');
            setEditMode(false);
            loadWholesaler();
        } catch (err: any) {
            console.error('Error saving wholesaler:', err);
            setError('Erro ao salvar dados. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(wholesaler || {});
        setEditMode(false);
        setError('');
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            PENDING: { label: 'Pendente', className: 'status-pending' },
            APPROVED: { label: 'Aprovado', className: 'status-approved' },
            REJECTED: { label: 'Rejeitado', className: 'status-rejected' },
            SUSPENDED: { label: 'Suspenso', className: 'status-suspended' }
        };
        const badge = badges[status as keyof typeof badges] || { label: status, className: '' };
        return <span className={`status-badge ${badge.className}`}>{badge.label}</span>;
    };

    const formatCNPJ = (cnpj: string | undefined) => {
        if (!cnpj) return '-';
        return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    };

    const formatPhone = (phone: string | undefined) => {
        if (!phone) return '-';
        return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    };

    return (
        <div className="wholesale-settings">
            <div className="container">
                <div className="settings-header">
                    <div className="breadcrumb">
                        <Link to="/wholesale">Central do Atacadista</Link>
                        <span> / </span>
                        <span>Configurações</span>
                    </div>
                    <h1>⚙️ Configurações</h1>
                    <p className="subtitle">Gerencie seus dados cadastrais</p>
                </div>

                {loading && (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Carregando configurações...</p>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                        {error.includes('cadastro de atacadista') && (
                            <Link to="/wholesale/register" className="btn-register">
                                Completar Cadastro
                            </Link>
                        )}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        <p>{success}</p>
                    </div>
                )}

                {!loading && wholesaler && (
                    <>
                        <div className="settings-section">
                            <div className="section-header">
                                <h2>Status do Cadastro</h2>
                            </div>
                            <div className="section-content">
                                <div className="status-info">
                                    <div className="info-row">
                                        <span className="label">Status Atual:</span>
                                        {getStatusBadge(wholesaler.status)}
                                    </div>
                                    {wholesaler.approvedAt && (
                                        <div className="info-row">
                                            <span className="label">Aprovado em:</span>
                                            <span className="value">
                                                {new Date(wholesaler.approvedAt).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    )}
                                    {wholesaler.rejectionReason && (
                                        <div className="rejection-info">
                                            <strong>Motivo da Rejeição:</strong>
                                            <p>{wholesaler.rejectionReason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="settings-section">
                            <div className="section-header">
                                <h2>Dados da Empresa</h2>
                                {!editMode && (
                                    <button onClick={() => setEditMode(true)} className="btn-edit">
                                        ✏️ Editar
                                    </button>
                                )}
                            </div>
                            <div className="section-content">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Razão Social *</label>
                                        {editMode ? (
                                            <input
                                                type="text"
                                                value={formData.companyName || ''}
                                                onChange={(e) => handleInputChange('companyName', e.target.value)}
                                                className="form-input"
                                            />
                                        ) : (
                                            <div className="form-value">{wholesaler.companyName || '-'}</div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Nome Fantasia</label>
                                        {editMode ? (
                                            <input
                                                type="text"
                                                value={formData.tradeName || ''}
                                                onChange={(e) => handleInputChange('tradeName', e.target.value)}
                                                className="form-input"
                                            />
                                        ) : (
                                            <div className="form-value">{wholesaler.tradeName || '-'}</div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>CNPJ *</label>
                                        <div className="form-value">{formatCNPJ(wholesaler.cnpj)}</div>
                                        <small className="form-hint">O CNPJ não pode ser alterado</small>
                                    </div>

                                    <div className="form-group">
                                        <label>Inscrição Estadual</label>
                                        {editMode ? (
                                            <input
                                                type="text"
                                                value={formData.stateRegistration || ''}
                                                onChange={(e) => handleInputChange('stateRegistration', e.target.value)}
                                                className="form-input"
                                            />
                                        ) : (
                                            <div className="form-value">{wholesaler.stateRegistration || '-'}</div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Inscrição Municipal</label>
                                        {editMode ? (
                                            <input
                                                type="text"
                                                value={formData.municipalRegistration || ''}
                                                onChange={(e) => handleInputChange('municipalRegistration', e.target.value)}
                                                className="form-input"
                                            />
                                        ) : (
                                            <div className="form-value">{wholesaler.municipalRegistration || '-'}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="settings-section">
                            <div className="section-header">
                                <h2>Dados de Contato</h2>
                            </div>
                            <div className="section-content">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Nome do Contato</label>
                                        {editMode ? (
                                            <input
                                                type="text"
                                                value={formData.contactName || ''}
                                                onChange={(e) => handleInputChange('contactName', e.target.value)}
                                                className="form-input"
                                            />
                                        ) : (
                                            <div className="form-value">{wholesaler.contactName || '-'}</div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>E-mail de Contato</label>
                                        {editMode ? (
                                            <input
                                                type="email"
                                                value={formData.contactEmail || ''}
                                                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                                                className="form-input"
                                            />
                                        ) : (
                                            <div className="form-value">{wholesaler.contactEmail || '-'}</div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Telefone de Contato</label>
                                        {editMode ? (
                                            <input
                                                type="tel"
                                                value={formData.contactPhone || ''}
                                                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                                                className="form-input"
                                            />
                                        ) : (
                                            <div className="form-value">{formatPhone(wholesaler.contactPhone || '')}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {editMode && (
                            <div className="form-actions">
                                <button onClick={handleCancel} className="btn-cancel" disabled={saving}>
                                    Cancelar
                                </button>
                                <button onClick={handleSave} className="btn-save" disabled={saving}>
                                    {saving ? 'Salvando...' : '💾 Salvar Alterações'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default WholesaleSettings;
