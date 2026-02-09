import React from 'react';
import type { RawMaterialDTO } from '../../types/rawMaterial';
import { UnitTypeLabels } from '../../types/rawMaterial';
import './RawMaterialGrid.css';

interface RawMaterialGridProps {
    materials: RawMaterialDTO[];
    loading: boolean;
    onEdit: (material: RawMaterialDTO) => void;
    onDelete: (materialId: string) => void;
    onToggleActive: (material: RawMaterialDTO) => void;
    selectedCompanyId: string;
}

const RawMaterialGrid: React.FC<RawMaterialGridProps> = ({
    materials,
    loading,
    onEdit,
    onDelete,
    onToggleActive,
    selectedCompanyId
}) => {
    if (!selectedCompanyId) {
        return (
            <div className="empty-state">
                <p className="empty-message">
                    Selecione uma empresa para visualizar as matérias-primas
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando matérias-primas...</p>
            </div>
        );
    }

    if (materials.length === 0) {
        return (
            <div className="empty-state">
                <p className="empty-message">
                    Nenhuma matéria-prima cadastrada. Clique em "Nova Matéria-Prima" para começar.
                </p>
            </div>
        );
    }

    const formatCurrency = (value?: number) => {
        if (value === undefined || value === null) return '-';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatNumber = (value?: number) => {
        if (value === undefined || value === null) return '-';
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(value);
    };

    const getStatusBadge = (isActive: boolean) => {
        return (
            <span className={`status-badge ${isActive ? 'status-active' : 'status-inactive'}`}>
                {isActive ? 'Ativo' : 'Inativo'}
            </span>
        );
    };

    const getStockControlBadge = (stockControl: boolean) => {
        return (
            <span className={`stock-control-badge ${stockControl ? 'controlled' : 'not-controlled'}`}>
                {stockControl ? 'Sim' : 'Não'}
            </span>
        );
    };

    return (
        <div className="materials-table">
            <table>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nome</th>
                        <th>Unidade</th>
                        <th>Custo Médio</th>
                        <th>Última Compra</th>
                        <th>Controle Estoque</th>
                        <th>Est. Mín.</th>
                        <th>Ponto Repos.</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {materials.map(material => (
                        <tr key={material.id}>
                            <td className="code-cell">{material.code}</td>
                            <td className="name-cell">{material.name}</td>
                            <td>{UnitTypeLabels[material.unitType]}</td>
                            <td className="currency-cell">{formatCurrency(material.averageCost)}</td>
                            <td className="currency-cell">{formatCurrency(material.lastPurchasePrice)}</td>
                            <td>{getStockControlBadge(material.stockControl)}</td>
                            <td className="number-cell">{formatNumber(material.minStock)}</td>
                            <td className="number-cell">{formatNumber(material.reorderPoint)}</td>
                            <td>{getStatusBadge(material.isActive)}</td>
                            <td className="actions">
                                <button
                                    className="btn-icon btn-edit"
                                    onClick={() => onEdit(material)}
                                    title="Editar"
                                >
                                    ✏️
                                </button>
                                <button
                                    className="btn-icon btn-toggle"
                                    onClick={() => onToggleActive(material)}
                                    title={material.isActive ? 'Desativar' : 'Ativar'}
                                >
                                    {material.isActive ? '🔒' : '🔓'}
                                </button>
                                <button
                                    className="btn-icon btn-delete"
                                    onClick={() => onDelete(material.id)}
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

export default RawMaterialGrid;