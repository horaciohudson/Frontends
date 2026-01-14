import { useState } from 'react';
import { wholesalersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './WholesalerDetail.css';

interface Wholesaler {
    id: number;
    wholesalerUuid: string;
    cnpj: string;
    stateRegistration?: string;
    companyName: string;
    tradeName: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    commercialEmail: string;
    commercialPhone?: string;
    commercialContact?: string;
    financialEmail?: string;
    financialPhone?: string;
    financialContact?: string;
    legalRepName: string;
    legalRepCpf: string;
    createdAt: string;
    approvedAt?: string;
    rejectionReason?: string;
}

interface WholesalerDetailProps {
    wholesaler: Wholesaler;
    onClose: () => void;
    onUpdate: () => void;
}

function WholesalerDetail({ wholesaler, onClose, onUpdate }: WholesalerDetailProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [showSuspendForm, setShowSuspendForm] = useState(false);
    const [reason, setReason] = useState('');

    const handleApprove = async () => {
        if (!user?.id) {
            alert('Erro: Usuário não identificado');
            return;
        }

        if (!confirm(`Aprovar o cadastro de ${wholesaler.companyName}?`)) {
            return;
        }

        try {
            setLoading(true);
            await wholesalersAPI.approve(wholesaler.id, user.id);
            alert('✅ Revendedor aprovado com sucesso!');
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error('Error approving wholesaler:', error);
            alert(`Erro ao aprovar: ${error.response?.data || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!reason.trim()) {
            alert('Por favor, informe o motivo da rejeição');
            return;
        }

        try {
            setLoading(true);
            await wholesalersAPI.reject(wholesaler.id, reason);
            alert('❌ Cadastro rejeitado.');
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error('Error rejecting wholesaler:', error);
            alert(`Erro ao rejeitar: ${error.response?.data || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = async () => {
        if (!reason.trim()) {
            alert('Por favor, informe o motivo da suspensão');
            return;
        }

        try {
            setLoading(true);
            await wholesalersAPI.suspend(wholesaler.id, reason);
            alert('⚠️ Revendedor suspenso.');
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error('Error suspending wholesaler:', error);
            alert(`Erro ao suspender: ${error.response?.data || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReactivate = async () => {
        if (!confirm(`Reativar o cadastro de ${wholesaler.companyName}?`)) {
            return;
        }

        try {
            setLoading(true);
            await wholesalersAPI.reactivate(wholesaler.id);
            alert('✅ Revendedor reativado com sucesso!');
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error('Error reactivating wholesaler:', error);
            alert(`Erro ao reativar: ${error.response?.data || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const formatCNPJ = (cnpj: string) => {
        if (cnpj === '00000000000000') return 'Não informado';
        return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    };

    const formatCPF = (cpf: string) => {
        if (cpf === '00000000000') return 'Não informado';
        return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { label: string; className: string }> = {
            PENDING: { label: '⏳ Pendente', className: 'status-pending' },
            APPROVED: { label: '✅ Aprovado', className: 'status-approved' },
            REJECTED: { label: '❌ Rejeitado', className: 'status-rejected' },
            SUSPENDED: { label: '⚠️ Suspenso', className: 'status-suspended' }
        };

        const badge = badges[status] || { label: status, className: '' };
        return <span className={`status-badge ${badge.className}`}>{badge.label}</span>;
    };

    return (
        <div className="wholesaler-detail-overlay">
            <div className="wholesaler-detail">
                <div className="detail-header">
                    <h2>📋 Detalhes do Revendedor</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="detail-content">
                    {/* Status */}
                    <div className="info-section">
                        <h3>Status</h3>
                        <div className="status-info">
                            {getStatusBadge(wholesaler.status)}
                            {wholesaler.rejectionReason && (
                                <div className="rejection-reason">
                                    <strong>Motivo:</strong> {wholesaler.rejectionReason}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dados da Empresa */}
                    <div className="info-section">
                        <h3>🏢 Dados da Empresa</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>CNPJ:</label>
                                <span>{formatCNPJ(wholesaler.cnpj)}</span>
                            </div>
                            <div className="info-item">
                                <label>Inscrição Estadual:</label>
                                <span>{wholesaler.stateRegistration || 'Não informado'}</span>
                            </div>
                            <div className="info-item">
                                <label>Razão Social:</label>
                                <span>{wholesaler.companyName}</span>
                            </div>
                            <div className="info-item">
                                <label>Nome Fantasia:</label>
                                <span>{wholesaler.tradeName || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contato Comercial */}
                    <div className="info-section">
                        <h3>📞 Contato Comercial</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Nome:</label>
                                <span>{wholesaler.commercialContact || '-'}</span>
                            </div>
                            <div className="info-item">
                                <label>E-mail:</label>
                                <span>{wholesaler.commercialEmail}</span>
                            </div>
                            <div className="info-item">
                                <label>Telefone:</label>
                                <span>{wholesaler.commercialPhone || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contato Financeiro */}
                    <div className="info-section">
                        <h3>💰 Contato Financeiro</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Nome:</label>
                                <span>{wholesaler.financialContact || '-'}</span>
                            </div>
                            <div className="info-item">
                                <label>E-mail:</label>
                                <span>{wholesaler.financialEmail || '-'}</span>
                            </div>
                            <div className="info-item">
                                <label>Telefone:</label>
                                <span>{wholesaler.financialPhone || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Responsável Legal */}
                    <div className="info-section">
                        <h3>👤 Responsável Legal</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Nome:</label>
                                <span>{wholesaler.legalRepName}</span>
                            </div>
                            <div className="info-item">
                                <label>CPF:</label>
                                <span>{formatCPF(wholesaler.legalRepCpf)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Datas */}
                    <div className="info-section">
                        <h3>📅 Informações de Cadastro</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Data de Cadastro:</label>
                                <span>{formatDate(wholesaler.createdAt)}</span>
                            </div>
                            {wholesaler.approvedAt && (
                                <div className="info-item">
                                    <label>Data de Aprovação:</label>
                                    <span>{formatDate(wholesaler.approvedAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="detail-actions">
                    {wholesaler.status === 'PENDING' && (
                        <>
                            <button
                                className="btn btn-approve"
                                onClick={handleApprove}
                                disabled={loading}
                            >
                                ✅ Aprovar
                            </button>
                            <button
                                className="btn btn-reject"
                                onClick={() => setShowRejectForm(true)}
                                disabled={loading}
                            >
                                ❌ Rejeitar
                            </button>
                        </>
                    )}

                    {wholesaler.status === 'APPROVED' && (
                        <button
                            className="btn btn-suspend"
                            onClick={() => setShowSuspendForm(true)}
                            disabled={loading}
                        >
                            ⚠️ Suspender
                        </button>
                    )}

                    {wholesaler.status === 'SUSPENDED' && (
                        <button
                            className="btn btn-approve"
                            onClick={handleReactivate}
                            disabled={loading}
                        >
                            ✅ Reativar
                        </button>
                    )}

                    <button className="btn btn-cancel" onClick={onClose}>
                        Fechar
                    </button>
                </div>

                {/* Reject Form */}
                {showRejectForm && (
                    <div className="reason-form">
                        <h4>Motivo da Rejeição</h4>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Informe o motivo da rejeição..."
                            rows={4}
                        />
                        <div className="form-actions">
                            <button
                                className="btn btn-reject"
                                onClick={handleReject}
                                disabled={loading || !reason.trim()}
                            >
                                Confirmar Rejeição
                            </button>
                            <button
                                className="btn btn-cancel"
                                onClick={() => {
                                    setShowRejectForm(false);
                                    setReason('');
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Suspend Form */}
                {showSuspendForm && (
                    <div className="reason-form">
                        <h4>Motivo da Suspensão</h4>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Informe o motivo da suspensão..."
                            rows={4}
                        />
                        <div className="form-actions">
                            <button
                                className="btn btn-suspend"
                                onClick={handleSuspend}
                                disabled={loading || !reason.trim()}
                            >
                                Confirmar Suspensão
                            </button>
                            <button
                                className="btn btn-cancel"
                                onClick={() => {
                                    setShowSuspendForm(false);
                                    setReason('');
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WholesalerDetail;
