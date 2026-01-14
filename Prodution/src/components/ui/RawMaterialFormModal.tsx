import React, { useEffect } from 'react';
import type { RawMaterialDTO, CreateRawMaterialDTO, UpdateRawMaterialDTO } from '../../types/rawMaterial';
import RawMaterialForm from '../forms/RawMaterialForm';
import './RawMaterialFormModal.css';

interface RawMaterialFormModalProps {
    isOpen: boolean;
    material?: RawMaterialDTO;
    companyId: string;
    onSubmit: (data: CreateRawMaterialDTO | UpdateRawMaterialDTO) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

const RawMaterialFormModal: React.FC<RawMaterialFormModalProps> = ({
    isOpen,
    material,
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
                        {material ? 'Editar Matéria-Prima' : 'Nova Matéria-Prima'}
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
                    <RawMaterialForm
                        material={material}
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

export default RawMaterialFormModal;