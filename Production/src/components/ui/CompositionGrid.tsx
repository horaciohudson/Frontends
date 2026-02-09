import React from 'react';
import type { CompositionWithDetails } from '../../types/composition';
import './CompositionGrid.css';

interface CompositionGridProps {
    compositions: CompositionWithDetails[];
    loading: boolean;
    onEdit: (composition: CompositionWithDetails) => void;
    onDelete: (compositionId: string) => void;
    onToggleActive: (composition: CompositionWithDetails) => void;
    onApprove: (composition: CompositionWithDetails) => void;
    onRowDoubleClick: (composition: CompositionWithDetails) => void;
    selectedCompanyId: string;
    selectedCompositionId?: string;
}

const CompositionGrid: React.FC<CompositionGridProps> = ({
    compositions,
    loading,
    onEdit,
    onDelete,
    onToggleActive,
    onApprove,
    onRowDoubleClick,
    selectedCompanyId,
    selectedCompositionId
}) => {
    if (!selectedCompanyId) {
        return (
            <div className="empty-state">
                <p className="empty-message">
                    Selecione uma empresa para visualizar as composições
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando composições...</p>
            </div>
        );
    }

    if (compositions.length === 0) {
        return (
            <div className="empty-state">
                <p className="empty-message">
                    Nenhuma composição cadastrada. Clique em "Nova Composição" para começar.
                </p>
            </div>
        );
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const formatCurrency = (value?: number) => {
        if (value === undefined || value === null) return '-';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const getStatusBadge = (composition: CompositionWithDetails) => {
        if (!composition.isActive) {
            return <span className="status-badge inactive">Inativo</span>;
        }
        if (composition.approvedBy) {
            return <span className="status-badge approved">Aprovado</span>;
        }
        return <span className="status-badge pending">Pendente</span>;
    };

    const getEffectiveBadge = (composition: CompositionWithDetails) => {
        const today = new Date();
        const effectiveDate = composition.effectiveDate ? new Date(composition.effectiveDate) : null;
        const expirationDate = composition.expirationDate ? new Date(composition.expirationDate) : null;

        if (effectiveDate && today < effectiveDate) {
            return <span className="effective-badge future">Futuro</span>;
        }
        if (expirationDate && today > expirationDate) {
            return <span className="effective-badge expired">Expirado</span>;
        }
        return <span className="effective-badge current">Vigente</span>;
    };

    return (
        <div className="compositions-table">
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Produto</th>
                        <th>Versão</th>
                        <th>Vigência</th>
                        <th>Vencimento</th>
                        <th>Itens</th>
                        <th>Custo Total</th>
                        <th>Status</th>
                        <th>Vigente</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {compositions.map(composition => (
                        <tr
                            key={composition.id}
                            className={selectedCompositionId === composition.id ? 'selected' : ''}
                            onDoubleClick={() => onRowDoubleClick(composition)}
                            style={{ cursor: 'pointer' }}
                        >
                            <td className="name-cell">{composition.name}</td>
                            <td className="product-cell">{composition.productName || '-'}</td>
                            <td className="version-cell">v{composition.version}</td>
                            <td className="date-cell">{formatDate(composition.effectiveDate)}</td>
                            <td className="date-cell">{formatDate(composition.expirationDate)}</td>
                            <td className="items-cell">{composition.itemsCount || 0}</td>
                            <td className="currency-cell">{formatCurrency(composition.totalCost)}</td>
                            <td>{getStatusBadge(composition)}</td>
                            <td>{getEffectiveBadge(composition)}</td>
                            <td className="actions">
                                <button
                                    className="btn-icon btn-edit"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(composition);
                                    }}
                                    title="Editar"
                                >
                                    ✏️
                                </button>
                                {!composition.approvedBy && (
                                    <button
                                        className="btn-icon btn-approve"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onApprove(composition);
                                        }}
                                        title="Aprovar"
                                    >
                                        ✅
                                    </button>
                                )}
                                <button
                                    className="btn-icon btn-toggle"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleActive(composition);
                                    }}
                                    title={composition.isActive ? 'Desativar' : 'Ativar'}
                                >
                                    {composition.isActive ? '🔒' : '🔓'}
                                </button>
                                <button
                                    className="btn-icon btn-delete"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(composition.id);
                                    }}
                                    title="Excluir"
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

export default CompositionGrid;