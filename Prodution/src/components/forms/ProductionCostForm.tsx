import React, { useState, useEffect } from 'react';
import { productionCostService } from '../../services/productionCostService';
import { productionOrderService } from '../../services/productionOrderService';
import { authService } from '../../services/authService';
import type { CreateProductionCostRequest, UpdateProductionCostRequest, ProductionCostType, ProductionCost } from '../../types/productionCost';
import type { ProductionOrder } from '../../types/productionOrder';
import './ProductionCostForm.css';

interface ProductionCostFormProps {
    companyId: string;
    cost?: ProductionCost;
    onSuccess: () => void;
    onCancel: () => void;
}

const ProductionCostForm: React.FC<ProductionCostFormProps> = ({
    companyId,
    cost,
    onSuccess,
    onCancel
}) => {
    const [loading, setLoading] = useState(false);
    const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);

    const [formData, setFormData] = useState({
        productionOrderId: cost?.productionOrderId || '',
        costType: cost?.costType || '' as ProductionCostType | '',
        referenceId: cost?.referenceId || '',
        costDate: cost?.costDate ? cost.costDate.split('T')[0] : new Date().toISOString().split('T')[0],
        quantity: cost?.quantity?.toString() || '',
        unitCost: cost?.unitCost?.toString() || '',
        totalCost: cost?.totalCost?.toString() || '',
        notes: cost?.notes || ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadProductionOrders();
    }, []);

    const loadProductionOrders = async () => {
        try {
            const data = await productionOrderService.getAllByCompany(companyId);
            setProductionOrders(data);
        } catch (error) {
            console.error('Erro ao carregar ordens de produção:', error);
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.productionOrderId) {
            newErrors.productionOrderId = 'Ordem de produção é obrigatória';
        }

        if (!formData.costType) {
            newErrors.costType = 'Tipo de custo é obrigatório';
        }

        if (!formData.totalCost || parseFloat(formData.totalCost) <= 0) {
            newErrors.totalCost = 'Custo total deve ser maior que zero';
        }

        if (!formData.costDate) {
            newErrors.costDate = 'Data do custo é obrigatória';
        }

        if (formData.quantity && parseFloat(formData.quantity) <= 0) {
            newErrors.quantity = 'Quantidade deve ser maior que zero';
        }

        if (formData.unitCost && parseFloat(formData.unitCost) < 0) {
            newErrors.unitCost = 'Custo unitário não pode ser negativo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);

        try {
            const user = authService.getUser();
            if (!user?.tenantId) {
                throw new Error('Usuário não autenticado');
            }

            const requestData = {
                companyId,
                productionOrderId: formData.productionOrderId,
                costType: formData.costType as ProductionCostType,
                referenceId: formData.referenceId || undefined,
                costDate: formData.costDate ? `${formData.costDate}T00:00:00.000Z` : undefined, // Formato OffsetDateTime
                quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
                unitCost: formData.unitCost ? parseFloat(formData.unitCost) : undefined,
                totalCost: parseFloat(formData.totalCost),
                notes: formData.notes || undefined
            };

            if (cost) {
                await productionCostService.update(cost.id, requestData as UpdateProductionCostRequest);
            } else {
                await productionCostService.create(requestData as CreateProductionCostRequest);
            }
            
            onSuccess();
        } catch (error: any) {
            alert(error.message || 'Erro ao salvar custo de produção');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }

        // Calcular custo total automaticamente
        if (field === 'quantity' || field === 'unitCost') {
            const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(formData.quantity) || 0;
            const unitCost = field === 'unitCost' ? parseFloat(value) || 0 : parseFloat(formData.unitCost) || 0;
            
            if (quantity > 0 && unitCost > 0) {
                setFormData(prev => ({ ...prev, totalCost: (quantity * unitCost).toFixed(2) }));
            }
        }
    };

    const getProductionOrderName = (orderId: string) => {
        const order = productionOrders.find(o => o.id === orderId);
        return order ? `${order.id.substring(0, 8)} - ${order.productName}` : orderId;
    };

    return (
        <div className="production-cost-form-overlay">
            <div className="production-cost-form-container">
                <h2>{cost ? 'Editar Custo de Produção' : 'Novo Custo de Produção'}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Ordem de Produção *</label>
                            <select
                                value={formData.productionOrderId}
                                onChange={(e) => handleChange('productionOrderId', e.target.value)}
                                className={errors.productionOrderId ? 'error' : ''}
                                disabled={!!cost} // Não permite alterar ordem em edição
                            >
                                <option value="">Selecione...</option>
                                {productionOrders.map(order => (
                                    <option key={order.id} value={order.id}>
                                        {getProductionOrderName(order.id)}
                                    </option>
                                ))}
                            </select>
                            {errors.productionOrderId && <span className="error-message">{errors.productionOrderId}</span>}
                        </div>

                        <div className="form-group">
                            <label>Tipo de Custo *</label>
                            <select
                                value={formData.costType}
                                onChange={(e) => handleChange('costType', e.target.value)}
                                className={errors.costType ? 'error' : ''}
                            >
                                <option value="">Selecione...</option>
                                <option value="MATERIAL">Material</option>
                                <option value="SERVICE">Serviço</option>
                                <option value="LABOR">Mão de Obra</option>
                                <option value="INDIRECT">Custo Indireto</option>
                            </select>
                            {errors.costType && <span className="error-message">{errors.costType}</span>}
                        </div>

                        <div className="form-group">
                            <label>ID de Referência</label>
                            <input
                                type="text"
                                value={formData.referenceId}
                                onChange={(e) => handleChange('referenceId', e.target.value)}
                                placeholder="ID opcional para referência"
                                maxLength={100}
                            />
                        </div>

                        <div className="form-group">
                            <label>Data do Custo *</label>
                            <input
                                type="date"
                                value={formData.costDate}
                                onChange={(e) => handleChange('costDate', e.target.value)}
                                className={errors.costDate ? 'error' : ''}
                            />
                            {errors.costDate && <span className="error-message">{errors.costDate}</span>}
                        </div>

                        <div className="form-group">
                            <label>Quantidade</label>
                            <input
                                type="number"
                                step="0.0001"
                                min="0"
                                value={formData.quantity}
                                onChange={(e) => handleChange('quantity', e.target.value)}
                                className={errors.quantity ? 'error' : ''}
                                placeholder="0.0000"
                            />
                            {errors.quantity && <span className="error-message">{errors.quantity}</span>}
                        </div>

                        <div className="form-group">
                            <label>Custo Unitário</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.unitCost}
                                onChange={(e) => handleChange('unitCost', e.target.value)}
                                className={errors.unitCost ? 'error' : ''}
                                placeholder="0.00"
                            />
                            {errors.unitCost && <span className="error-message">{errors.unitCost}</span>}
                        </div>

                        <div className="form-group">
                            <label>Custo Total *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.totalCost}
                                onChange={(e) => handleChange('totalCost', e.target.value)}
                                className={errors.totalCost ? 'error' : ''}
                                placeholder="0.00"
                            />
                            {errors.totalCost && <span className="error-message">{errors.totalCost}</span>}
                        </div>

                        <div className="form-group full-width">
                            <label>Observações</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                rows={3}
                                placeholder="Observações sobre o custo..."
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onCancel} className="btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Salvando...' : (cost ? 'Atualizar' : 'Salvar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductionCostForm;