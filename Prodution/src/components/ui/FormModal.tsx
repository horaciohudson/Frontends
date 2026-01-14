import React, { useEffect } from 'react';
import './FormModal.css';

interface FormModalProps {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    size?: 'small' | 'medium' | 'large';
    className?: string;
    showFooter?: boolean;
    onSubmit?: () => void;
    loading?: boolean;
    submitText?: string;
    cancelText?: string;
}

const FormModal: React.FC<FormModalProps> = ({
    isOpen,
    title,
    onClose,
    children,
    size = 'medium',
    className = '',
    showFooter = false,
    onSubmit,
    loading = false,
    submitText = 'Salvar',
    cancelText = 'Cancelar'
}) => {
    // Fechar com ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Prevenir scroll do body quando modal está aberto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className={`modal-container modal-${size} ${className}`}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        aria-label="Fechar"
                    >
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    {children}
                </div>

                {showFooter && (
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="modal-btn cancel"
                            onClick={onClose}
                            disabled={loading}
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            className="modal-btn submit"
                            onClick={onSubmit}
                            disabled={loading}
                        >
                            {loading && <div className="btn-spinner"></div>}
                            {loading ? 'Salvando...' : submitText}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FormModal;
