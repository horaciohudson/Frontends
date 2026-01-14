import React from 'react';
import type { Company } from '../../services/companyService';
import './CompanyGrid.css';

interface CompanyGridProps {
    companies: Company[];
    loading: boolean;
    onEdit: (company: Company) => void;
    onDelete: (company: Company) => void;
    onSelect: (company: Company) => void;
}

const CompanyGrid: React.FC<CompanyGridProps> = ({
    companies,
    loading,
    onEdit,
    onDelete,
    onSelect
}) => {
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando empresas...</p>
            </div>
        );
    }

    if (companies.length === 0) {
        return (
            <div className="empty-state">
                <p className="empty-message">
                    Nenhuma empresa cadastrada. Clique em "Nova Empresa" para começar.
                </p>
            </div>
        );
    }

    const getStatusBadge = (isActive: boolean | undefined) => {
        const active = isActive ?? true;
        return (
            <span className={`status-badge ${active ? 'status-active' : 'status-inactive'}`}>
                {active ? 'Ativo' : 'Inativo'}
            </span>
        );
    };

    const getTypeBadges = (company: Company) => {
        const badges = [];
        if (company.supplierFlag) badges.push(<span key="supplier" className="type-badge supplier">Fornecedor</span>);
        if (company.customerFlag) badges.push(<span key="customer" className="type-badge customer">Cliente</span>);
        if (company.transporterFlag) badges.push(<span key="transporter" className="type-badge transporter">Transportadora</span>);
        if (company.factory) badges.push(<span key="factory" className="type-badge factory">Fábrica</span>);
        return badges.length > 0 ? <div className="type-badges">{badges}</div> : '-';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="company-table">
            <table>
                <thead>
                    <tr>
                        <th>Razão Social</th>
                        <th>Nome Fantasia</th>
                        <th>CNPJ</th>
                        <th>Tipo</th>
                        <th>Status</th>
                        <th>Criado em</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {companies.map(company => (
                        <tr key={company.id}>
                            <td>{company.corporateName}</td>
                            <td>{company.tradeName || '-'}</td>
                            <td>{company.cnpj || '-'}</td>
                            <td>{getTypeBadges(company)}</td>
                            <td>{getStatusBadge(company.isActive)}</td>
                            <td>{formatDate(company.createdAt)}</td>
                            <td className="actions">
                                <button
                                    className="btn-select"
                                    onClick={() => onSelect(company)}
                                    disabled={loading}
                                    title="Selecionar empresa"
                                >
                                    ✅
                                </button>
                                <button
                                    className="btn-edit"
                                    onClick={() => onEdit(company)}
                                    disabled={loading}
                                    title="Editar empresa"
                                >
                                    ✏️
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => onDelete(company)}
                                    disabled={loading}
                                    title="Excluir empresa"
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CompanyGrid;