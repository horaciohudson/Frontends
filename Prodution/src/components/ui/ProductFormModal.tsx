import React, { useEffect } from 'react';
import type { ProductionProductDTO, CreateProductionProductDTO, UpdateProductionProductDTO } from '../../types/productionProduct';
import ProductionProductForm from '../forms/ProductionProductForm';
import './ProductFormModal.css';

interface ProductFormModalProps {
    isOpen: boolean;
    product?: ProductionProductDTO;
    companyId: string;
    onSubmit: (data: CreateProductionProductDTO | UpdateProductionProductDTO) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
    isOpen,
    product,
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
                        {product ? 'Editar Produto de Produção' : 'Novo Produto de Produção'}
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
                    <ProductionProductForm
                        product={product}
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

export default ProductFormModal;