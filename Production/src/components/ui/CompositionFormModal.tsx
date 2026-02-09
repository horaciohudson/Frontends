import React, { useEffect } from 'react';
import type { CompositionDTO, CreateCompositionDTO, UpdateCompositionDTO } from '../../types/composition';
import CompositionForm from '../forms/CompositionForm';
import './CompositionFormModal.css';

interface CompositionFormModalProps {
    isOpen: boolean;
    composition?: CompositionDTO;
    companyId: string;
    onSubmit: (data: CreateCompositionDTO | UpdateCompositionDTO) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

const CompositionFormModal: React.FC<CompositionFormModalProps> = ({
    isOpen,
    composition,
    companyId,
    onSubmit,
    onCancel,
    loading = false
}) => {
    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onCancel();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onCancel]);

    if (!isOpen) {
        return null;
    }

    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onCancel();
        }
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-container">
                <div className="modal-header">
                    <h2 className="modal-title">
                        {composition ? 'Editar Composição' : 'Nova Composição'}
                    </h2>
                    <button
                        className="modal-close-button"
                        onClick={onCancel}
                        title="Fechar (ESC)"
                    >
                        ✕
                    </button>
                </div>
                
                <div className="modal-content">
                    <CompositionForm
                        composition={composition}
                        companyId={companyId}
                        onSubmit={onSubmit}
                        onCancel={onCancel}
                        isLoading={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default CompositionFormModal;