import React from 'react';
import type { ProductionProductDTO } from '../../types/productionProduct';
import { UnitTypeLabels } from '../../types/productionProduct';
import './ProductGrid.css';

interface ProductGridProps {
    products: ProductionProductDTO[];
    loading: boolean;
    onEdit: (product: ProductionProductDTO) => void;
    onDelete: (productId: string) => void;
    onToggleActive: (product: ProductionProductDTO) => void;
    selectedCompanyId: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
    products,
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
                    Selecione uma empresa para visualizar os produtos
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando produtos...</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="empty-state">
                <p className="empty-message">
                    Nenhum produto cadastrado. Clique em "Novo Produto" para começar.
                </p>
            </div>
        );
    }

    return (
        <div className="products-grid">
            {products.map((product) => (
                <div key={product.id} className={`product-card ${!product.isActive ? 'inactive' : ''}`}>
                    <div className="product-card-header">
                        <h3 className="product-name">{product.description}</h3>
                        <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                            {product.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                    </div>

                    <div className="product-details">
                        {product.sku && (
                            <div className="product-detail-item">
                                <span className="detail-label">SKU:</span>
                                <span className="detail-value">{product.sku}</span>
                            </div>
                        )}
                        {product.barcode && (
                            <div className="product-detail-item">
                                <span className="detail-label">Código de Barras:</span>
                                <span className="detail-value">{product.barcode}</span>
                            </div>
                        )}
                        {product.size && (
                            <div className="product-detail-item">
                                <span className="detail-label">Tamanho:</span>
                                <span className="detail-value">{product.size}</span>
                            </div>
                        )}
                        {product.color && (
                            <div className="product-detail-item">
                                <span className="detail-label">Cor:</span>
                                <span className="detail-value">{product.color}</span>
                            </div>
                        )}
                        <div className="product-detail-item">
                            <span className="detail-label">Unidade:</span>
                            <span className="detail-value">{UnitTypeLabels[product.unitType]}</span>
                        </div>
                    </div>

                    {product.notes && (
                        <div className="product-notes">
                            <p>{product.notes}</p>
                        </div>
                    )}

                    <div className="product-actions">
                        <button
                            onClick={() => onEdit(product)}
                            className="btn-icon btn-edit"
                            title="Editar"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={() => onToggleActive(product)}
                            className="btn-icon btn-toggle"
                            title={product.isActive ? 'Desativar' : 'Ativar'}
                        >
                            {product.isActive ? '🔒' : '🔓'}
                        </button>
                        <button
                            onClick={() => onDelete(product.id)}
                            className="btn-icon btn-delete"
                            title="Excluir"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductGrid;