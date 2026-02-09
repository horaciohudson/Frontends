import React, { useState, useEffect } from 'react';
import { rawMaterialMovementService } from '../../services/rawMaterialMovementService';
import { rawMaterialService } from '../../services/rawMaterialService';
import { authService } from '../../services/authService';
import type { CreateRawMaterialMovementRequest, StockMovementType, MovementOrigin, RawMaterialMovement } from '../../types/rawMaterialStock';
import type { RawMaterialDTO } from '../../types/rawMaterial';
import './RawMaterialMovementForm.css';

interface RawMaterialMovementFormProps {
    companyId: string;
    movement?: RawMaterialMovement;
    onSuccess: () => void;
    onCancel: () => void;
}

const RawMaterialMovementForm: React.FC<RawMaterialMovementFormProps> = ({
    companyId,
    movement,
    onSuccess,
    onCancel
}) => {
    const [loading, setLoading] = useState(false);
    const [rawMaterials, setRawMaterials] = useState<RawMaterialDTO[]>([]);

    const [formData, setFormData] = useState({
        rawMaterialId: movement?.rawMaterialId || '',
        movementType: movement?.movementType || '' as StockMovementType | '',
        movementOrigin: movement?.movementOrigin || '' as MovementOrigin | '',
        documentNumber: movement?.documentNumber || '',
        movementDate: movement?.movementDate ? movement.movementDate.split('T')[0] : new Date().toISOString().split('T')[0],
        quantity: movement?.quantity?.toString() || '',
        unitCost: movement?.unitCost?.toString() || '',
        totalCost: movement?.totalCost?.toString() || '',
        notes: movement?.notes || ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadRawMaterials();
    }, []);

    const loadRawMaterials = async () => {
        try {
            const data = await rawMaterialService.findAllByCompany(companyId, true);
            setRawMaterials(data);
        } catch (error) {
            console.error('Erro ao carregar matérias-primas:', error);
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.rawMaterialId) {
            newErrors.rawMaterialId = 'Matéria-prima é obrigatória';
        }

        if (!formData.movementType) {
            newErrors.movementType = 'Tipo de movimento é obrigatório';
        }

        if (!formData.movementOrigin) {
            newErrors.movementOrigin = 'Origem do movimento é obrigatória';
        }

        if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
            newErrors.quantity = 'Quantidade deve ser maior que zero';
        }

        if (!formData.movementDate) {
            newErrors.movementDate = 'Data do movimento é obrigatória';
        }

        if (formData.unitCost && parseFloat(formData.unitCost) < 0) {
            newErrors.unitCost = 'Custo unitário não pode ser negativo';
        }

        if (formData.totalCost && parseFloat(formData.totalCost) < 0) {
            newErrors.totalCost = 'Custo total não pode ser negativo';
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

            const createData = {
                companyId,
                rawMaterialId: formData.rawMaterialId,
                movementType: formData.movementType as StockMovementType,
                movementOrigin: formData.movementOrigin as MovementOrigin,
                documentNumber: formData.documentNumber || undefined,
                movementDate: formData.movementDate + 'T00:00:00.000Z', // Adicionar horário para OffsetDateTime
                quantity: parseFloat(formData.quantity),
                unitCost: formData.unitCost ? parseFloat(formData.unitCost) : undefined,
                totalCost: formData.totalCost ? parseFloat(formData.totalCost) : undefined,
                notes: formData.notes || undefined,
                tenantId: user.tenantId
            } as CreateRawMaterialMovementRequest;

            if (movement) {
                await rawMaterialMovementService.update(movement.id, createData);
            } else {
                await rawMaterialMovementService.create(createData);
            }
            onSuccess();
        } catch (error: any) {
            alert(error.message || 'Erro ao salvar movimentação');
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

    return (
        <div className="raw-material-movement-form-overlay">
            <div className="raw-material-movement-form-container">
                <h2>{movement ? 'Editar Movimentação de Estoque' : 'Nova Movimentação de Estoque'}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Matéria-Prima *</label>
                            <select
                                value={formData.rawMaterialId}
                                onChange={(e) => handleChange('rawMaterialId', e.target.value)}
                                className={errors.rawMaterialId ? 'error' : ''}
                            >
                                <option value="">Selecione...</option>
                                {rawMaterials.map(material => (
                                    <option key={material.id} value={material.id}>
                                        {material.name}
                                    </option>
                                ))}
                            </select>
                            {errors.rawMaterialId && <span className="error-message">{errors.rawMaterialId}</span>}
                        </div>

                        <div className="form-group">
                            <label>Tipo de Movimento *</label>
                            <select
                                value={formData.movementType}
                                onChange={(e) => handleChange('movementType', e.target.value)}
                                className={errors.movementType ? 'error' : ''}
                            >
                                <option value="">Selecione...</option>
                                <option value="IN">Entrada</option>
                                <option value="OUT">Saída</option>
                            </select>
                            {errors.movementType && <span className="error-message">{errors.movementType}</span>}
                        </div>

                        <div className="form-group">
                            <label>Origem do Movimento *</label>
                            <select
                                value={formData.movementOrigin}
                                onChange={(e) => handleChange('movementOrigin', e.target.value)}
                                className={errors.movementOrigin ? 'error' : ''}
                            >
                                <option value="">Selecione...</option>
                                <option value="PURCHASE">Compra</option>
                                <option value="PRODUCTION">Produção</option>
                                <option value="ADJUSTMENT">Ajuste</option>
                                <option value="RETURN">Devolução</option>
                                <option value="TRANSFER">Transferência</option>
                            </select>
                            {errors.movementOrigin && <span className="error-message">{errors.movementOrigin}</span>}
                        </div>

                        <div className="form-group">
                            <label>Número do Documento</label>
                            <input
                                type="text"
                                value={formData.documentNumber}
                                onChange={(e) => handleChange('documentNumber', e.target.value)}
                                placeholder="Ex: NF-001, REQ-123"
                                maxLength={100}
                            />
                        </div>

                        <div className="form-group">
                            <label>Data do Movimento *</label>
                            <input
                                type="date"
                                value={formData.movementDate}
                                onChange={(e) => handleChange('movementDate', e.target.value)}
                                className={errors.movementDate ? 'error' : ''}
                            />
                            {errors.movementDate && <span className="error-message">{errors.movementDate}</span>}
                        </div>

                        <div className="form-group">
                            <label>Quantidade *</label>
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
                            <label>Custo Total</label>
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
                                placeholder="Observações sobre a movimentação..."
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onCancel} className="btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Salvando...' : (movement ? 'Atualizar' : 'Salvar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RawMaterialMovementForm;