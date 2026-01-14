import React, { useState, useEffect } from 'react';
import type { TaxTransaction, CreateTaxTransactionDTO } from '../../services/taxTransactionService';
import { taxService } from '../../services/taxService';
import type { TaxDTO } from '../../types/tax';
import './TaxTransactionForm.css';

interface TaxTransactionFormProps {
    initialData?: TaxTransaction | null;
    onSubmit: (data: CreateTaxTransactionDTO) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

const TaxTransactionForm: React.FC<TaxTransactionFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    loading = false,
}) => {
    const [taxTypes, setTaxTypes] = useState<TaxDTO[]>([]);
    const [formData, setFormData] = useState<CreateTaxTransactionDTO>({
        taxTypeId: initialData?.taxTypeId || 0,
        taxRate: initialData?.taxRate || 0,
        taxAmount: initialData?.taxAmount || 0,
        baseAmount: initialData?.baseAmount || 0,
        competenceDate: initialData?.competenceDate || '',
        dueDate: initialData?.dueDate || '',
        documentNumber: initialData?.documentNumber || '',
        notes: initialData?.notes || '',
        currency: initialData?.currency || 'BRL',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadTaxTypes();
    }, []);

    const loadTaxTypes = async () => {
        try {
            const types = await taxService.findAll();
            setTaxTypes(types);
        } catch (error) {
            console.error('Erro ao carregar tipos de impostos:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name.includes('Date') ? value :
                (name === 'taxRate' || name === 'taxAmount' || name === 'baseAmount') ?
                    (value === '' ? 0 : parseFloat(value)) : value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Auto-calculate tax amount when base amount or rate changes
    useEffect(() => {
        if (formData.baseAmount && formData.taxRate) {
            const calculated = (formData.baseAmount * formData.taxRate) / 100;
            setFormData(prev => ({ ...prev, taxAmount: parseFloat(calculated.toFixed(2)) }));
        }
    }, [formData.baseAmount, formData.taxRate]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.taxTypeId) {
            newErrors.taxTypeId = 'Tipo de imposto é obrigatório';
        }
        if (formData.taxRate <= 0) {
            newErrors.taxRate = 'Alíquota deve ser maior que zero';
        }
        if (formData.taxAmount <= 0) {
            newErrors.taxAmount = 'Valor do imposto deve ser maior que zero';
        }
        if (!formData.competenceDate) {
            newErrors.competenceDate = 'Data de competência é obrigatória';
        }
        if (!formData.dueDate) {
            newErrors.dueDate = 'Data de vencimento é obrigatória';
        }
        if (formData.competenceDate && formData.dueDate && formData.dueDate < formData.competenceDate) {
            newErrors.dueDate = 'Data de vencimento deve ser posterior à competência';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            await onSubmit(formData);
        } catch (error: any) {
            console.error('Erro ao salvar:', error);
        }
    };

    return (
        <form className="tax-transaction-form" onSubmit={handleSubmit}>
            <div className="form-header">
                <h2>{initialData ? 'Editar Imposto' : 'Novo Lançamento de Imposto'}</h2>
            </div>

            <div className="form-body">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="taxTypeId">
                            Tipo de Imposto <span className="required">*</span>
                        </label>
                        <select
                            id="taxTypeId"
                            name="taxTypeId"
                            value={formData.taxTypeId}
                            onChange={handleChange}
                            className={errors.taxTypeId ? 'error' : ''}
                            disabled={loading}
                        >
                            <option value="">Selecione...</option>
                            {taxTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.taxCode} - {type.taxName}
                                </option>
                            ))}
                        </select>
                        {errors.taxTypeId && <span className="error-message">{errors.taxTypeId}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="documentNumber">Número do Documento</label>
                        <input
                            type="text"
                            id="documentNumber"
                            name="documentNumber"
                            value={formData.documentNumber}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="Ex: NF-123456"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="baseAmount">Valor Base (R$)</label>
                        <input
                            type="number"
                            id="baseAmount"
                            name="baseAmount"
                            value={formData.baseAmount || ''}
                            onChange={handleChange}
                            disabled={loading}
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="taxRate">
                            Alíquota (%) <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="taxRate"
                            name="taxRate"
                            value={formData.taxRate || ''}
                            onChange={handleChange}
                            className={errors.taxRate ? 'error' : ''}
                            disabled={loading}
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="0.00"
                        />
                        {errors.taxRate && <span className="error-message">{errors.taxRate}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="taxAmount">
                            Valor do Imposto (R$) <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="taxAmount"
                            name="taxAmount"
                            value={formData.taxAmount || ''}
                            onChange={handleChange}
                            className={errors.taxAmount ? 'error' : ''}
                            disabled={loading}
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                        />
                        {errors.taxAmount && <span className="error-message">{errors.taxAmount}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="competenceDate">
                            Data de Competência <span className="required">*</span>
                        </label>
                        <input
                            type="date"
                            id="competenceDate"
                            name="competenceDate"
                            value={formData.competenceDate}
                            onChange={handleChange}
                            className={errors.competenceDate ? 'error' : ''}
                            disabled={loading}
                        />
                        {errors.competenceDate && <span className="error-message">{errors.competenceDate}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="dueDate">
                            Data de Vencimento <span className="required">*</span>
                        </label>
                        <input
                            type="date"
                            id="dueDate"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            className={errors.dueDate ? 'error' : ''}
                            disabled={loading}
                        />
                        {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group full-width">
                        <label htmlFor="notes">Observações</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            disabled={loading}
                            rows={3}
                            placeholder="Informações adicionais sobre este imposto..."
                        />
                    </div>
                </div>
            </div>

            <div className="form-footer">
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
                    {loading ? 'Salvando...' : initialData ? 'Atualizar' : 'Criar Lançamento'}
                </button>
            </div>
        </form>
    );
};

export default TaxTransactionForm;
