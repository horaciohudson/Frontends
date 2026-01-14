import { useState, useEffect } from 'react';
import { productsAPI } from '../../services/api';
import './LowStockAlert.css';

interface Product {
    id: number;
    name: string;
    sku: string;
    stockQuantity: number;
    minStockQuantity: number;
    sellingPrice: number;
}

interface LowStockAlertProps {
    onNavigateToProduct?: (productId: number) => void;
}

function LowStockAlert({ onNavigateToProduct }: LowStockAlertProps) {
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        loadLowStockProducts();
    }, []);

    const loadLowStockProducts = async () => {
        try {
            setLoading(true);
            // Buscar todos os produtos (ou uma quantidade grande)
            const response = await productsAPI.getAll(0, 100);
            const allProducts = response.data.data?.content || [];
            
            // Filtrar produtos com estoque baixo
            const lowStock = allProducts.filter((product: Product) => 
                product.stockQuantity <= product.minStockQuantity && product.stockQuantity >= 0
            );
            
            // Ordenar por criticidade (menor estoque primeiro)
            lowStock.sort((a: Product, b: Product) => a.stockQuantity - b.stockQuantity);
            
            setLowStockProducts(lowStock);
        } catch (err) {
            console.error('Error loading low stock products:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (product: Product) => {
        if (product.stockQuantity === 0) {
            return { label: 'SEM ESTOQUE', className: 'critical' };
        } else if (product.stockQuantity <= product.minStockQuantity / 2) {
            return { label: 'CRÍTICO', className: 'critical' };
        } else {
            return { label: 'BAIXO', className: 'warning' };
        }
    };

    if (loading) {
        return (
            <div className="low-stock-alert">
                <div className="alert-header">
                    <h3>⚠️ Alertas de Estoque</h3>
                </div>
                <div className="alert-loading">Carregando...</div>
            </div>
        );
    }

    if (lowStockProducts.length === 0) {
        return (
            <div className="low-stock-alert success">
                <div className="alert-header">
                    <h3>✅ Estoque Saudável</h3>
                </div>
                <div className="alert-success">
                    Todos os produtos estão com estoque adequado!
                </div>
            </div>
        );
    }

    return (
        <div className="low-stock-alert">
            <div className="alert-header" onClick={() => setExpanded(!expanded)}>
                <div className="header-left">
                    <h3>⚠️ Alertas de Estoque</h3>
                    <span className="alert-count">{lowStockProducts.length} produto(s)</span>
                </div>
                <button className="toggle-btn">
                    {expanded ? '▼' : '▶'}
                </button>
            </div>

            {expanded && (
                <div className="alert-content">
                    <div className="alert-list">
                        {lowStockProducts.map(product => {
                            const status = getStockStatus(product);
                            return (
                                <div 
                                    key={product.id} 
                                    className="alert-item"
                                    onClick={() => onNavigateToProduct?.(product.id)}
                                >
                                    <div className="item-info">
                                        <div className="item-header">
                                            <span className="item-name">{product.name}</span>
                                            <span className={`stock-badge ${status.className}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                        <div className="item-details">
                                            <span className="item-sku">SKU: {product.sku}</span>
                                            <span className="item-stock">
                                                Estoque: <strong>{product.stockQuantity}</strong> / Mínimo: {product.minStockQuantity}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="item-action">
                                        <span className="action-icon">→</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LowStockAlert;
