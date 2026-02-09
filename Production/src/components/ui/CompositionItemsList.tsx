import React from 'react';
import type { CompositionItemWithDetails } from '../../types/composition';
import { CompositionItemTypeLabels } from '../../types/composition';
import { UnitTypeLabels } from '../../types/rawMaterial';
import './CompositionItemsList.css';

interface CompositionItemsListProps {
    items: CompositionItemWithDetails[];
    loading: boolean;
    onEdit: (item: CompositionItemWithDetails) => void;
    onDelete: (itemId: string) => void;
    onMoveUp: (itemId: string) => void;
    onMoveDown: (itemId: string) => void;
}

const CompositionItemsList: React.FC<CompositionItemsListProps> = ({
    items,
    loading,
    onEdit,
    onDelete,
    onMoveUp,
    onMoveDown
}) => {
    if (loading) {
        return (
            <div className="items-list-loading">
                <div className="spinner"></div>
                <p>Carregando itens...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="items-list-empty">
                <p>📦 Nenhum item adicionado ainda</p>
                <p className="empty-hint">Clique em "Adicionar Item" para começar</p>
            </div>
        );
    }

    // Ordenar por sequência
    const sortedItems = [...items].sort((a, b) => a.sequence - b.sequence);

    return (
        <div className="composition-items-list">
            <table className="items-table">
                <thead>
                    <tr>
                        <th className="col-sequence">#</th>
                        <th className="col-type">Tipo</th>
                        <th className="col-name">Item</th>
                        <th className="col-quantity">Quantidade</th>
                        <th className="col-unit">Unidade</th>
                        <th className="col-cost">Custo Unit.</th>
                        <th className="col-loss">Perda %</th>
                        <th className="col-total">Total</th>
                        <th className="col-actions">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedItems.map((item, index) => (
                        <tr key={item.id} className={item.isOptional ? 'item-optional' : ''}>
                            <td className="col-sequence">{item.sequence}</td>
                            <td className="col-type">
                                <span className={`item-type-badge ${item.itemType.toLowerCase()}`}>
                                    {CompositionItemTypeLabels[item.itemType]}
                                </span>
                            </td>
                            <td className="col-name">
                                <div className="item-name-wrapper">
                                    <strong>{item.itemName || 'N/A'}</strong>
                                    {item.itemCode && (
                                        <span className="item-code">({item.itemCode})</span>
                                    )}
                                    {item.isOptional && (
                                        <span className="optional-badge">Opcional</span>
                                    )}
                                </div>
                            </td>
                            <td className="col-quantity">{item.quantity.toFixed(4)}</td>
                            <td className="col-unit">{UnitTypeLabels[item.unitType]}</td>
                            <td className="col-cost">
                                {item.unitCost ? `R$ ${item.unitCost.toFixed(2)}` : '-'}
                            </td>
                            <td className="col-loss">
                                {item.lossPercentage ? `${item.lossPercentage.toFixed(2)}%` : '-'}
                            </td>
                            <td className="col-total">
                                <strong>
                                    {item.totalCost ? `R$ ${item.totalCost.toFixed(2)}` : '-'}
                                </strong>
                            </td>
                            <td className="col-actions">
                                <div className="item-actions">
                                    <button
                                        className="btn-icon btn-move"
                                        onClick={() => onMoveUp(item.id)}
                                        disabled={index === 0}
                                        title="Mover para cima"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        className="btn-icon btn-move"
                                        onClick={() => onMoveDown(item.id)}
                                        disabled={index === sortedItems.length - 1}
                                        title="Mover para baixo"
                                    >
                                        ↓
                                    </button>
                                    <button
                                        className="btn-icon btn-edit"
                                        onClick={() => onEdit(item)}
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn-icon btn-delete"
                                        onClick={() => onDelete(item.id)}
                                        title="Excluir"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CompositionItemsList;
