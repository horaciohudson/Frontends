import React, { useState, useEffect } from 'react';
import { productionExecutionService } from '../../services/productionExecutionService';
import { productionOrderService } from '../../services/productionOrderService';
import { productionStepService } from '../../services/productionStepService';
import { authService } from '../../services/authService';
import type { CreateProductionExecutionRequest, UpdateProductionExecutionRequest, QualityStatus } from '../../types/productionExecution';
import type { ProductionOrder } from '../../types/productionOrder';
import type { ProductionStepDTO } from '../../types/productionStep';
import './ProductionExecutionForm.css';

interface ProductionExecutionFormProps {
    companyId: string;
    executionId?: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const ProductionExecutionForm: React.FC<ProductionExecutionFormProps> = ({
    companyId,
    executionId,
    onSuccess,
    onCancel
}) => {
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<ProductionOrder[]>([]);
    const [steps, setSteps] = useState<ProductionStepDTO[]>([]);

    const [formData, setFormData] = useState({
        productionOrderId: '',
        stepId: '',
        startTime: '',
        endTime: '',
        quantityDone: '',
        lossQuantity: '0',
        employeeId: '',
        machineId: '',
        qualityStatus: '' as QualityStatus | '',
        rejectionReason: '',
        notes: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadOrders();
        loadSteps();
        if (executionId) {
            loadExecution();
        }
    }, [executionId]);

    const loadOrders = async () => {
        try {
            const data = await productionOrderService.getAllByCompany(companyId);
            setOrders(data);
        } catch (error) {
            console.error('Erro ao carregar ordens:', error);
        }
    };

    const loadSteps = async () => {
        try {
            const data = await productionStepService.findAll(companyId, true);
            setSteps(data);
        } catch (error) {
            console.error('Erro ao carregar etapas:', error);
        }
    };

    const loadExecution = async () => {
        if (!executionId) return;

        try {
            const execution = await productionExecutionService.getById(executionId);
            setFormData({
                productionOrderId: execution.productionOrderId,
                stepId: execution.stepId,
                startTime: execution.startTime ? new Date(execution.startTime).toISOString().slice(0, 16) : '',
                endTime: execution.endTime ? new Date(execution.endTime).toISOString().slice(0, 16) : '',
                quantityDone: execution.quantityDone.toString(),
                lossQuantity: execution.lossQuantity.toString(),
                employeeId: execution.employeeId || '',
                machineId: execution.machineId || '',
                qualityStatus: execution.qualityStatus || '',
                rejectionReason: execution.rejectionReason || '',
                notes: execution.notes || ''
            });
        } catch (error) {
            console.error('Erro ao carregar execução:', error);
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.productionOrderId) {
            newErrors.productionOrderId = 'Ordem de produção é obrigatória';
        }

        if (!formData.stepId) {
            newErrors.stepId = 'Etapa é obrigatória';
        }

        if (!formData.startTime) {
            newErrors.startTime = 'Hora de início é obrigatória';
        }

        if (!formData.quantityDone || parseFloat(formData.quantityDone) <= 0) {
            newErrors.quantityDone = 'Quantidade realizada deve ser maior que zero';
        }

        if (formData.endTime && formData.startTime) {
            const start = new Date(formData.startTime);
            const end = new Date(formData.endTime);
            if (end < start) {
                newErrors.endTime = 'Hora de término deve ser posterior à hora de início';
            }
        }

        if (formData.qualityStatus === 'REJECTED' && !formData.rejectionReason) {
            newErrors.rejectionReason = 'Motivo de rejeição é obrigatório quando status é Rejeitado';
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

            if (executionId) {
                const updateData: UpdateProductionExecutionRequest = {
                    stepId: formData.stepId,
                    startTime: new Date(formData.startTime).toISOString(),
                    endTime: formData.endTime ? new Date(formData.endTime).toISOString() : undefined,
                    quantityDone: parseFloat(formData.quantityDone),
                    lossQuantity: parseFloat(formData.lossQuantity),
                    qualityStatus: formData.qualityStatus || undefined,
                    rejectionReason: formData.rejectionReason || undefined,
                    notes: formData.notes || undefined
                };

                await productionExecutionService.update(executionId, updateData);
            } else {
                const createData = {
                    companyId,
                    productionOrderId: formData.productionOrderId,
                    stepId: formData.stepId,
                    startTime: new Date(formData.startTime).toISOString(),
                    endTime: formData.endTime ? new Date(formData.endTime).toISOString() : undefined,
                    quantityDone: parseFloat(formData.quantityDone),
                    lossQuantity: parseFloat(formData.lossQuantity),
                    qualityStatus: formData.qualityStatus || undefined,
                    rejectionReason: formData.rejectionReason || undefined,
                    notes: formData.notes || undefined,
                    tenantId: user.tenantId
                } as CreateProductionExecutionRequest;

                await productionExecutionService.create(createData);
            }

            onSuccess();
        } catch (error: any) {
            alert(error.message || 'Erro ao salvar execução');
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

    return (
        <div className="production-execution-form-overlay">
            <div className="production-execution-form-container">
                <h2>{executionId ? 'Editar Execução' : 'Nova Execução de Produção'}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Ordem de Produção *</label>
                            <select
                                value={formData.productionOrderId}
                                onChange={(e) => handleChange('productionOrderId', e.target.value)}
                                disabled={!!executionId}
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
                            <label>Etapa *</label>
                            <select
                                value={formData.stepId}
                                onChange={(e) => handleChange('stepId', e.target.value)}
                                className={errors.stepId ? 'error' : ''}
                            >
                                <option value="">Selecione...</option>
                                {steps.map(step => (
                                    <option key={step.id} value={step.id}>
                                        {step.name}
                                    </option>
                                ))}
                            </select>
                            {errors.stepId && <span className="error-message">{errors.stepId}</span>}
                        </div>

                        <div className="form-group">
                            <label>Hora de Início *</label>
                            <input
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={(e) => handleChange('startTime', e.target.value)}
                                className={errors.startTime ? 'error' : ''}
                            />
                            {errors.startTime && <span className="error-message">{errors.startTime}</span>}
                        </div>

                        <div className="form-group">
                            <label>Hora de Término</label>
                            <input
                                type="datetime-local"
                                value={formData.endTime}
                                onChange={(e) => handleChange('endTime', e.target.value)}
                                className={errors.endTime ? 'error' : ''}
                            />
                            {errors.endTime && <span className="error-message">{errors.endTime}</span>}
                        </div>

                        <div className="form-group">
                            <label>Quantidade Realizada *</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={formData.quantityDone}
                                onChange={(e) => handleChange('quantityDone', e.target.value)}
                                className={errors.quantityDone ? 'error' : ''}
                            />
                            {errors.quantityDone && <span className="error-message">{errors.quantityDone}</span>}
                        </div>

                        <div className="form-group">
                            <label>Quantidade de Perda</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={formData.lossQuantity}
                                onChange={(e) => handleChange('lossQuantity', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Status de Qualidade</label>
                            <select
                                value={formData.qualityStatus}
                                onChange={(e) => handleChange('qualityStatus', e.target.value)}
                            >
                                <option value="">Selecione...</option>
                                <option value="APPROVED">Aprovado</option>
                                <option value="REJECTED">Rejeitado</option>
                                <option value="REWORK">Retrabalho</option>
                            </select>
                        </div>

                        {formData.qualityStatus === 'REJECTED' && (
                            <div className="form-group full-width">
                                <label>Motivo de Rejeição *</label>
                                <textarea
                                    value={formData.rejectionReason}
                                    onChange={(e) => handleChange('rejectionReason', e.target.value)}
                                    className={errors.rejectionReason ? 'error' : ''}
                                    rows={3}
                                />
                                {errors.rejectionReason && <span className="error-message">{errors.rejectionReason}</span>}
                            </div>
                        )}

                        <div className="form-group full-width">
                            <label>Observações</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                rows={3}
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

export default ProductionExecutionForm;
