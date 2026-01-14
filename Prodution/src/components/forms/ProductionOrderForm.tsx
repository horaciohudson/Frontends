import React, { useState, useEffect } from 'react';
import { productionOrderService } from '../../services/productionOrderService';
import { authService } from '../../services/authService';
import { productionProductService } from '../../services/productionProductService';
import type { ProductionProductDTO } from '../../types/productionProduct';
import type { PriorityLevelType } from '../../types/productionOrder';
import { PriorityLevel } from '../../types/productionOrder';
import './ProductionOrderForm.css';

interface ProductionOrderFormProps {
    companyId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const ProductionOrderForm: React.FC<ProductionOrderFormProps> = ({ companyId, onSuccess, onCancel }) => {
    const [products, setProducts] = useState<ProductionProductDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        productId: '',
        quantityPlanned: 1,
        priority: PriorityLevel.MEDIUM as PriorityLevelType,
        startDate: new Date().toISOString().split('T')[0],
        deadline: '',
        notes: ''
    });

    useEffect(() => {
        loadProducts();
    }, [companyId]);

    const loadProducts = async () => {
        try {
            const data = await productionProductService.findAll(companyId);
            setProducts(data);
        } catch (err: any) {
            console.error('Erro ao carregar produtos:', err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const user = authService.getUser();
            if (!user?.tenantId) throw new Error('Tenant não encontrado');

            await productionOrderService.create({
                ...formData,
                companyId,
                tenantId: user.tenantId,
                quantityPlanned: Number(formData.quantityPlanned)
            });
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Erro ao criar ordem de produção');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-overlay">
            <div className="form-container">
                <div className="form-header">
                    <h2>Nova Ordem de Produção</h2>
                    <button className="btn-close" onClick={onCancel}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-error">{error}</div>}

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Código da Ordem</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                required
                                placeholder="Ex: OP-2023-001"
                            />
                        </div>

                        <div className="form-group">
                            <label>Produto</label>
                            <select
                                name="productId"
                                value={formData.productId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selecione um produto</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>
                                        {product.description} ({product.sku})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Quantidade Planejada</label>
                            <input
                                type="number"
                                name="quantityPlanned"
                                value={formData.quantityPlanned}
                                onChange={handleChange}
                                required
                                min="0.0001"
                                step="0.0001"
                            />
                        </div>

                        <div className="form-group">
                            <label>Prioridade</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                required
                            >
                                <option value={PriorityLevel.LOW}>Baixa</option>
                                <option value={PriorityLevel.MEDIUM}>Média</option>
                                <option value={PriorityLevel.HIGH}>Alta</option>
                                <option value={PriorityLevel.URGENT}>Urgente</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Data de Início</label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Prazo de Entrega</label>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Observações</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Informações adicionais sobre a ordem..."
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Salvando...' : 'Criar Ordem'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductionOrderForm;
