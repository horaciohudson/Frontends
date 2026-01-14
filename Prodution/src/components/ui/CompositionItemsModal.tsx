import React, { useState, useEffect } from 'react';
import { compositionItemService } from '../../services/compositionItemService';
import type {
    CompositionDTO,
    CompositionItemWithDetails,
    CreateCompositionItemDTO,
    UpdateCompositionItemDTO,
    CompositionCostSummary
} from '../../types/composition';
import CompositionItemsList from './CompositionItemsList';
import CompositionItemForm from '../forms/CompositionItemForm';
import './CompositionItemsModal.css';

interface CompositionItemsModalProps {
    isOpen: boolean;
    composition: CompositionDTO | null;
    companyId: string;
    onClose: () => void;
}

const CompositionItemsModal: React.FC<CompositionItemsModalProps> = ({
    isOpen,
    composition,
    companyId,
    onClose
}) => {
    const [items, setItems] = useState<CompositionItemWithDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<CompositionItemWithDetails | undefined>();
    const [costSummary, setCostSummary] = useState<CompositionCostSummary | null>(null);

    useEffect(() => {
        if (composition) {
            loadItems();
        }
    }, [composition]);

    const loadItems = async () => {
        if (!composition) return;

        try {
            setLoading(true);
            setError('');
            const data = await compositionItemService.findByComposition(composition.id);
            setItems(data);

            // Calcular resumo de custos
            const summary = await compositionItemService.calculateCompositionCosts(composition.id, companyId);
            setCostSummary(summary);
        } catch (err) {
            console.error('Erro ao carregar itens:', err);
            setError('Erro ao carregar itens da composição');
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setEditingItem(undefined);
        setShowForm(true);
    };

    const handleEditItem = (item: CompositionItemWithDetails) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este item?')) {
            return;
        }

        try {
            await compositionItemService.delete(itemId, companyId);
            await loadItems();
        } catch (err) {
            console.error('Erro ao excluir item:', err);
            alert('Erro ao excluir item');
        }
    };

    const handleMoveUp = async (itemId: string) => {
        try {
            await compositionItemService.moveUp(itemId, companyId);
            await loadItems();
        } catch (err) {
            console.error('Erro ao mover item:', err);
            alert('Erro ao reordenar item');
        }
    };

    const handleMoveDown = async (itemId: string) => {
        try {
            await compositionItemService.moveDown(itemId, companyId);
            await loadItems();
        } catch (err) {
            console.error('Erro ao mover item:', err);
            alert('Erro ao reordenar item');
        }
    };

    const handleSubmitItem = async (data: CreateCompositionItemDTO | UpdateCompositionItemDTO) => {
        try {
            if (editingItem) {
                await compositionItemService.update(editingItem.id, data as UpdateCompositionItemDTO, companyId);
            } else {
                await compositionItemService.create(data as CreateCompositionItemDTO);
            }

            setShowForm(false);
            setEditingItem(undefined);
            await loadItems();
        } catch (err: any) {
            console.error('Erro ao salvar item:', err);
            throw err; // Propagar erro para o formulário tratar
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingItem(undefined);
    };

    if (!composition) {
        return null;
    }

    const content = (
        <div className={`modal-container composition-items-modal ${!isOpen ? 'inline-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <h2>📋 Itens da Composição</h2>
                {isOpen && <button className="modal-close" onClick={onClose}>×</button>}
            </div>

            <div className="modal-subheader">
                <div className="composition-info">
                    <strong>{composition.name}</strong>
                    <span className="composition-version">v{composition.version}</span>
                </div>
            </div>

            <div className="modal-body">
                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {/* Resumo de Custos */}
                {costSummary && (
                    <div className="cost-summary">
                        <div className="cost-summary-item">
                            <span className="cost-label">Total de Itens:</span>
                            <span className="cost-value">{costSummary.totalItems}</span>
                        </div>
                        <div className="cost-summary-item">
                            <span className="cost-label">Custo Total:</span>
                            <span className="cost-value cost-total">
                                R$ {costSummary.totalCost.toFixed(2)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Botão Adicionar Item */}
                {!showForm && (
                    <div className="items-actions">
                        <button
                            className="btn btn-primary"
                            onClick={handleAddItem}
                        >
                            + Adicionar Item
                        </button>
                    </div>
                )}

                {/* Formulário de Item */}
                {showForm && composition && (
                    <div className="item-form-section">
                        <h3>{editingItem ? 'Editar Item' : 'Novo Item'}</h3>
                        <CompositionItemForm
                            item={editingItem}
                            compositionId={composition.id}
                            companyId={companyId}
                            onSubmit={handleSubmitItem}
                            onCancel={handleCancelForm}
                        />
                    </div>
                )}

                {/* Lista de Itens */}
                <div className="items-list-section">
                    <CompositionItemsList
                        items={items}
                        loading={loading}
                        onEdit={handleEditItem}
                        onDelete={handleDeleteItem}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                    />
                </div>
            </div>

            {isOpen && (
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Fechar
                    </button>
                </div>
            )}
        </div>
    );

    // Se isOpen for false, renderizar sem overlay (modo inline)
    if (!isOpen) {
        return content;
    }

    // Modo modal com overlay
    return (
        <div className="modal-overlay" onClick={onClose}>
            {content}
        </div>
    );
};

export default CompositionItemsModal;
