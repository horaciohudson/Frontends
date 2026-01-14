import { useState, useEffect } from 'react';
import { colorsAPI, sizesAPI } from '../../services/api';
import type { ColorRequest } from '../../types/color';
import type { Size } from '../../types/size';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../common/LoadingSpinner';
import './ColorForm.css';

interface ColorFormProps {
    colorId?: number;
    onSuccess: () => void;
    onCancel: () => void;
}

interface ColorFormData {
    colorName: string;
    hexCode: string;
    sizeId: string;
    displayOrder: number;
    active: boolean;
}

function ColorForm({ colorId, onSuccess, onCancel }: ColorFormProps) {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(!!colorId);
    const [sizes, setSizes] = useState<Size[]>([]);

    const [formData, setFormData] = useState<ColorFormData>({
        colorName: '',
        hexCode: '#000000',
        sizeId: '',
        displayOrder: 0,
        active: true
    });

    useEffect(() => {
        loadSizes();
        if (colorId) {
            loadColor();
        }
    }, [colorId]);

    const loadSizes = async () => {
        try {
            const response = await sizesAPI.getAll();
            setSizes(response.data.data || []);
        } catch (err) {
            console.error('Error loading sizes:', err);
            showNotification('error', 'Erro ao carregar tamanhos');
        }
    };

    const loadColor = async () => {
        if (!colorId) return;

        try {
            setLoadingData(true);
            const response = await colorsAPI.getById(colorId);
            const color = response.data.data;

            setFormData({
                colorName: color.colorName || '',
                hexCode: color.hexCode || '#000000',
                sizeId: color.sizeId || '',
                displayOrder: color.displayOrder || 0,
                active: color.active !== undefined ? color.active : true
            });
        } catch (err) {
            console.error('Error loading color:', err);
            showNotification('error', 'Erro ao carregar cor');
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'displayOrder') {
            setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.colorName.trim()) {
            showNotification('error', 'Nome da cor é obrigatório');
            return;
        }

        try {
            setLoading(true);

            const payload: ColorRequest = {
                colorName: formData.colorName,
                hexCode: formData.hexCode || undefined,
                sizeId: formData.sizeId || undefined,
                displayOrder: formData.displayOrder,
                active: formData.active
            };

            if (colorId) {
                await colorsAPI.update(colorId, payload);
                showNotification('success', 'Cor atualizada com sucesso!');
            } else {
                await colorsAPI.create(payload);
                showNotification('success', 'Cor criada com sucesso!');
            }

            onSuccess();
        } catch (err: any) {
            console.error('Error saving color:', err);
            const errorMsg = err.response?.data?.message || 'Erro ao salvar cor';
            showNotification('error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="color-form-container">
            <div className="form-header">
                <h2>{colorId ? '✏️ Editar Cor' : '➕ Nova Cor'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="color-form">
                <div className="form-section">
                    <div className="form-group">
                        <label htmlFor="colorName">Nome da Cor *</label>
                        <input
                            type="text"
                            id="colorName"
                            name="colorName"
                            value={formData.colorName}
                            onChange={handleChange}
                            required
                            placeholder="Ex: Vermelho, Azul, Preto"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="hexCode">Código Hexadecimal</label>
                            <div className="color-input-group">
                                <input
                                    type="color"
                                    id="hexCode"
                                    name="hexCode"
                                    value={formData.hexCode}
                                    onChange={handleChange}
                                    className="color-picker"
                                />
                                <input
                                    type="text"
                                    name="hexCode"
                                    value={formData.hexCode}
                                    onChange={handleChange}
                                    placeholder="#000000"
                                    pattern="^#[0-9A-Fa-f]{6}$"
                                    className="hex-input"
                                />
                            </div>
                            <small className="form-hint">Selecione ou digite o código da cor</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="sizeId">Tamanho (opcional)</label>
                            <select
                                id="sizeId"
                                name="sizeId"
                                value={formData.sizeId}
                                onChange={handleChange}
                            >
                                <option value="">Global (todos os tamanhos)</option>
                                {sizes.map(size => (
                                    <option key={size.id} value={size.id}>
                                        {size.sizeName}
                                    </option>
                                ))}
                            </select>
                            <small className="form-hint">Vincular cor a um tamanho específico</small>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="displayOrder">Ordem de Exibição</label>
                            <input
                                type="number"
                                id="displayOrder"
                                name="displayOrder"
                                value={formData.displayOrder}
                                onChange={handleChange}
                                min="0"
                            />
                            <small className="form-hint">Ordem em que a cor será exibida</small>
                        </div>

                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={formData.active}
                                    onChange={handleChange}
                                />
                                <span>Ativo</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : colorId ? 'Atualizar Cor' : 'Criar Cor'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ColorForm;
