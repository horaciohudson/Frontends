import { useState, useEffect } from 'react';
import { sizesAPI } from '../../services/api';
import type { SizeRequest } from '../../types/size';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../common/LoadingSpinner';
import './SizeForm.css';

interface SizeFormProps {
    sizeId?: number;
    onSuccess: () => void;
    onCancel: () => void;
}

interface SizeFormData {
    sizeName: string;
    description: string;
    displayOrder: number;
    active: boolean;
}

function SizeForm({ sizeId, onSuccess, onCancel }: SizeFormProps) {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(!!sizeId);

    const [formData, setFormData] = useState<SizeFormData>({
        sizeName: '',
        description: '',
        displayOrder: 0,
        active: true
    });

    useEffect(() => {
        if (sizeId) {
            loadSize();
        }
    }, [sizeId]);

    const loadSize = async () => {
        if (!sizeId) return;

        try {
            setLoadingData(true);
            const response = await sizesAPI.getById(sizeId);
            const size = response.data.data;

            setFormData({
                sizeName: size.sizeName || '',
                description: size.description || '',
                displayOrder: size.displayOrder || 0,
                active: size.active !== undefined ? size.active : true
            });
        } catch (err) {
            console.error('Error loading size:', err);
            showNotification('error', 'Erro ao carregar tamanho');
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

        if (!formData.sizeName.trim()) {
            showNotification('error', 'Nome do tamanho é obrigatório');
            return;
        }

        try {
            setLoading(true);

            const payload: SizeRequest = {
                sizeName: formData.sizeName,
                description: formData.description || undefined,
                displayOrder: formData.displayOrder,
                active: formData.active
            };

            if (sizeId) {
                await sizesAPI.update(sizeId, payload);
                showNotification('success', 'Tamanho atualizado com sucesso!');
            } else {
                await sizesAPI.create(payload);
                showNotification('success', 'Tamanho criado com sucesso!');
            }

            onSuccess();
        } catch (err: any) {
            console.error('Error saving size:', err);
            const errorMsg = err.response?.data?.message || 'Erro ao salvar tamanho';
            showNotification('error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="size-form-container">
            <div className="form-header">
                <h2>{sizeId ? '✏️ Editar Tamanho' : '➕ Novo Tamanho'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="size-form">
                <div className="form-section">
                    <div className="form-group">
                        <label htmlFor="sizeName">Nome do Tamanho *</label>
                        <input
                            type="text"
                            id="sizeName"
                            name="sizeName"
                            value={formData.sizeName}
                            onChange={handleChange}
                            required
                            placeholder="Ex: P, M, G, GG, 36, 38, 40"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Descrição</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Descrição opcional do tamanho..."
                        />
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
                            <small className="form-hint">Ordem em que o tamanho será exibido</small>
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
                        {loading ? 'Salvando...' : sizeId ? 'Atualizar Tamanho' : 'Criar Tamanho'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SizeForm;
