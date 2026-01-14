import React, { useState, useEffect } from 'react';
import { priceTablesAPI } from '../../services/api';
import type { PriceTable, PriceTableFormData } from '../../types/priceTable';
import './PriceTableForm.css';

interface PriceTableFormProps {
    table?: PriceTable | null;
    onSave?: () => void;
    onCancel?: () => void;
}

const PriceTableForm: React.FC<PriceTableFormProps> = ({ table, onSave, onCancel }) => {
    const [formData, setFormData] = useState<PriceTableFormData>({
        name: '',
        description: '',
        defaultDiscountPercentage: 0,
        validFrom: '',
        validUntil: '',
        active: false,
        isDefault: false,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (table) {
            setFormData({
                name: table.name,
                description: table.description || '',
                defaultDiscountPercentage: table.defaultDiscountPercentage || 0,
                validFrom: table.validFrom ? table.validFrom.split('T')[0] : '',
                validUntil: table.validUntil ? table.validUntil.split('T')[0] : '',
                active: table.active,
                isDefault: table.isDefault,
            });
        }
    }, [table]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.name.trim()) {
            setError('Nome é obrigatório');
            return;
        }

        if (formData.defaultDiscountPercentage && (formData.defaultDiscountPercentage < 0 || formData.defaultDiscountPercentage > 100)) {
            setError('Desconto deve estar entre 0 e 100%');
            return;
        }

        try {
            setSaving(true);

            if (table?.id) {
                // Update
                await priceTablesAPI.update(table.id, formData);
                alert('Tabela atualizada com sucesso!');
            } else {
                // Create
                await priceTablesAPI.create(formData);
                alert('Tabela criada com sucesso!');
            }

            onSave?.();
        } catch (err: any) {
            console.error('Error saving price table:', err);
            setError(err.response?.data?.message || 'Erro ao salvar tabela');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="price-table-form">
            <div className="form-header">
                <h2>{table?.id ? '✏️ Editar Tabela de Preço' : '➕ Nova Tabela de Preço'}</h2>
            </div>

            {error && (
                <div className="form-error">
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>Informações Básicas</h3>

                    <div className="form-group">
                        <label htmlFor="name">Nome da Tabela *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ex: Natal 2024, Atacado Padrão"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Descrição</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Descrição opcional da tabela"
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="defaultDiscountPercentage">Desconto Padrão (%)</label>
                        <input
                            type="number"
                            id="defaultDiscountPercentage"
                            name="defaultDiscountPercentage"
                            value={formData.defaultDiscountPercentage}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="0.00"
                        />
                        <small>Desconto aplicado automaticamente aos produtos importados</small>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Período de Vigência</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="validFrom">Válido De</label>
                            <input
                                type="date"
                                id="validFrom"
                                name="validFrom"
                                value={formData.validFrom}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="validUntil">Válido Até</label>
                            <input
                                type="date"
                                id="validUntil"
                                name="validUntil"
                                value={formData.validUntil}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Configurações</h3>

                    <div className="form-group-checkbox">
                        <label>
                            <input
                                type="checkbox"
                                name="active"
                                checked={formData.active}
                                onChange={handleChange}
                            />
                            <span>Tabela Ativa</span>
                        </label>
                        <small>Apenas uma tabela pode estar ativa por vez</small>
                    </div>

                    <div className="form-group-checkbox">
                        <label>
                            <input
                                type="checkbox"
                                name="isDefault"
                                checked={formData.isDefault}
                                onChange={handleChange}
                            />
                            <span>Tabela Padrão</span>
                        </label>
                        <small>Tabela usada por padrão para novos pedidos</small>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={onCancel}
                        disabled={saving}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn-save"
                        disabled={saving}
                    >
                        {saving ? 'Salvando...' : (table?.id ? 'Atualizar' : 'Criar Tabela')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PriceTableForm;
