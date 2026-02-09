import React, { useState, useEffect } from 'react';
import { productionClosureService } from '../../services/productionClosureService';
import { productionOrderService } from '../../services/productionOrderService';
import { authService } from '../../services/authService';
import type { CreateProductionClosureRequest } from '../../types/productionClosure';
import type { ProductionOrder } from '../../types/productionOrder';
import './ProductionClosureForm.css';

interface ProductionClosureFormProps {
    companyId: string;
    closureId?: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const ProductionClosureForm: React.FC<ProductionClosureFormProps> = ({
    companyId,
    closureId,
    onSuccess,
    onCancel
}) => {
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<ProductionOrder[]>([]);

    const [formData, setFormData] = useState({
        productionOrderId: '',
        totalCost: '',
        totalMaterial: '0',
        totalService: '0',
        totalLabor: '0',
        totalIndirect: '0',
        closureDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadOrders();
        if (closureId) {
            loadClosure();
        }
    }, [closureId]);

    const loadOrders = async () => {
        try {
            const data = await productionOrderService.getAllByCompany(companyId);
            // Filtrar apenas ordens que ainda não têm fechamento
            const ordersWithoutClosure = [];
            for (const order of data) {
                const existingClosure = await productionClosureService.getByProductionOrder(order.id);
                if (!existingClosure) {
                    ordersWithoutClosure.push(order);
                }
            }
            setOrders(ordersWithoutClosure);
        } catch (error) {
            console.error('Erro ao carregar ordens:', error);
        }
    };

    const loadClosure = async () => {
        if (!closureId) return;

        try {
            // Como não temos endpoint de busca por ID, vamos buscar por ordem
            // Este é um placeholder - você pode implementar o endpoint se necessário
            console.log('Carregando fechamento:', closureId);
        } catch (error) {
            console.error('Erro ao carregar fechamento:', error);
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.productionOrderId) {
            newErrors.productionOrderId = 'Ordem de produção é obrigatória';
        }

        if (!formData.totalCost || parseFloat(formData.totalCost) <= 0) {
            newErrors.totalCost = 'Custo total deve ser maior que zero';
        }

        if (!formData.closureDate) {
            newErrors.closureDate = 'Data de fechamento é obrigatória';
        }

        // Validar se a soma dos custos parciais não excede o custo total
        const totalCost = parseFloat(formData.totalCost) || 0;
        const totalMaterial = parseFloat(formData.totalMaterial) || 0;
        const totalService = parseFloat(formData.totalService) || 0;
        const totalLabor = parseFloat(formData.totalLabor) || 0;
        const totalIndirect = parseFloat(formData.totalIndirect) || 0;
        
        const sumPartialCosts = totalMaterial + totalService + totalLabor + totalIndirect;
        if (sumPartialCosts > totalCost) {
            newErrors.totalCost = 'A soma dos custos parciais não pode exceder o custo total';
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

            if (closureId) {
                // Implementar update se necessário
                console.log('Update não implementado ainda');
            } else {
                const createData = {
                    companyId,
                    productionOrderId: formData.productionOrderId,
                    totalCost: parseFloat(formData.totalCost),
                    totalMaterial: parseFloat(formData.totalMaterial) || 0,
                    totalService: parseFloat(formData.totalService) || 0,
                    totalLabor: parseFloat(formData.totalLabor) || 0,
                    totalIndirect: parseFloat(formData.totalIndirect) || 0,
                    closureDate: formData.closureDate,
                    notes: formData.notes || undefined,
                    tenantId: user.tenantId
                } as CreateProductionClosureRequest;

                await productionClosureService.create(createData);
            }

            onSuccess();
        } catch (error: any) {
            alert(error.message || 'Erro ao salvar fechamento');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const calculateRemainingCost = () => {
        const totalCost = parseFloat(formData.totalCost) || 0;
        const totalMaterial = parseFloat(formData.totalMaterial) || 0;
        const totalService = parseFloat(formData.totalService) || 0;
        const totalLabor = parseFloat(formData.totalLabor) || 0;
        const totalIndirect = parseFloat(formData.totalIndirect) || 0;
        
        return totalCost - (totalMaterial + totalService + totalLabor + totalIndirect);
    };

    return (
        <div className="production-closure-form-overlay">
            <div className="production-closure-form-container">
                <h2>{closureId ? 'Editar Fechamento' : 'Novo Fechamento de Produção'}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Ordem de Produção *</label>
                            <select
                                value={formData.productionOrderId}
                                onChange={(e) => handleChange('productionOrderId', e.target.value)}
                                disabled={!!closureId}
                                className={errors.productionOrderId ? 'error' : ''}
                            >
                                <option value="">Selecione...</option>
                                {orders.map(order => (
                                    <option key={order.id} value={order.id}>
                                        {order.code} - {order.productName}
                                    </option>
                                ))}
                            </select>
                            {errors.productionOrderId && <span className="error-message">{errors.productionOrderId}</span>}
                        </div>

                        <div className="form-group">
                            <label>Data de Fechamento *</label>
                            <input
                                type="date"
                                value={formData.closureDate}
                                onChange={(e) => handleChange('closureDate', e.target.value)}
                                className={errors.closureDate ? 'error' : ''}
                            />
                            {errors.closureDate && <span className="error-message">{errors.closureDate}</span>}
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

                        <div className="cost-breakdown">
                            <h3>Detalhamento de Custos</h3>
                            
                            <div className="form-group">
                                <label>Custo de Material</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.totalMaterial}
                                    onChange={(e) => handleChange('totalMaterial', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="form-group">
                                <label>Custo de Serviço</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.totalService}
                                    onChange={(e) => handleChange('totalService', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="form-group">
                                <label>Custo de Mão de Obra</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.totalLabor}
                                    onChange={(e) => handleChange('totalLabor', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="form-group">
                                <label>Custos Indiretos</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.totalIndirect}
                                    onChange={(e) => handleChange('totalIndirect', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="cost-summary">
                                <div className="remaining-cost">
                                    <strong>Custo Restante: R$ {calculateRemainingCost().toFixed(2)}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label>Observações</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                rows={4}
                                placeholder="Observações sobre o fechamento..."
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onCancel} className="btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductionClosureForm;