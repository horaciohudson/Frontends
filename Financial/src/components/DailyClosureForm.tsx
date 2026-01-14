import React, { useState, useEffect } from 'react';
import { dailyClosureService } from '../services/dailyClosureService';
import { bankAccountService } from '../services/bankAccountService';
import type { DailyClosureDTO, CreateDailyClosureDTO, UpdateDailyClosureDTO, ClosureScope } from '../types/dailyClosure';
import type { BankAccount } from '../types/BankAccount';
import './DailyClosureForm.css';

interface DailyClosureFormProps {
    closure?: DailyClosureDTO | null;
    onClose: () => void;
    onSuccess: () => void;
}

const DailyClosureForm: React.FC<DailyClosureFormProps> = ({ closure, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [formData, setFormData] = useState({
        closureDate: closure?.closureDate || new Date().toISOString().split('T')[0],
        closureScope: (closure?.closureScope || 'DAILY') as ClosureScope,
        bankAccountId: closure?.bankAccountId || '',
        openingBalance: closure?.openingBalance?.toString() || '',
        totalInflows: closure?.totalInflows?.toString() || '',
        totalOutflows: closure?.totalOutflows?.toString() || '',
        notes: closure?.notes || '',
        discrepancyNotes: closure?.discrepancyNotes || '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadBankAccounts();
    }, []);

    const loadBankAccounts = async () => {
        try {
            const response = await bankAccountService.findAll();
            setBankAccounts(response.content || []);
        } catch (error) {
            console.error('Erro ao carregar contas bancárias:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpar erro do campo ao digitar
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.closureDate) {
            newErrors.closureDate = 'Data é obrigatória';
        }

        if (!formData.closureScope) {
            newErrors.closureScope = 'Escopo é obrigatório';
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
            if (closure) {
                // Editar
                const updateData: UpdateDailyClosureDTO = {
                    openingBalance: formData.openingBalance ? parseFloat(formData.openingBalance) : undefined,
                    totalInflows: formData.totalInflows ? parseFloat(formData.totalInflows) : undefined,
                    totalOutflows: formData.totalOutflows ? parseFloat(formData.totalOutflows) : undefined,
                    notes: formData.notes || undefined,
                    discrepancyNotes: formData.discrepancyNotes || undefined,
                };
                await dailyClosureService.update(closure.id, updateData);
            } else {
                // Criar
                const createData: CreateDailyClosureDTO = {
                    closureDate: formData.closureDate,
                    closureScope: formData.closureScope,
                    bankAccountId: formData.bankAccountId ? Number(formData.bankAccountId) : undefined,
                    openingBalance: formData.openingBalance ? parseFloat(formData.openingBalance) : undefined,
                    totalInflows: formData.totalInflows ? parseFloat(formData.totalInflows) : undefined,
                    totalOutflows: formData.totalOutflows ? parseFloat(formData.totalOutflows) : undefined,
                    notes: formData.notes || undefined,
                };
                await dailyClosureService.create(createData);
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Erro ao salvar fechamento:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Erro ao salvar fechamento';
            setErrors({ submit: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const isEditing = !!closure;
    const canEdit = !closure || closure.canBeModified;

    return (
        <div className="daily-closure-form">
            <h2>{isEditing ? 'Editar Fechamento' : 'Novo Fechamento'}</h2>

            {!canEdit && (
                <div className="alert alert-warning">
                    ⚠️ Este fechamento não pode ser editado pois está {closure?.closureStatus === 'CLOSED' ? 'fechado' : 'bloqueado'}.
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="closureDate">
                            Data do Fechamento <span className="required">*</span>
                        </label>
                        <input
                            type="date"
                            id="closureDate"
                            name="closureDate"
                            value={formData.closureDate}
                            onChange={handleChange}
                            disabled={isEditing}
                            required
                        />
                        {errors.closureDate && <span className="error">{errors.closureDate}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="closureScope">
                            Escopo <span className="required">*</span>
                        </label>
                        <select
                            id="closureScope"
                            name="closureScope"
                            value={formData.closureScope}
                            onChange={handleChange}
                            disabled={isEditing}
                            required
                        >
                            <option value="DAILY">Diário</option>
                            <option value="MONTHLY">Mensal</option>
                        </select>
                        {errors.closureScope && <span className="error">{errors.closureScope}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="bankAccountId">Conta Bancária</label>
                    <select
                        id="bankAccountId"
                        name="bankAccountId"
                        value={formData.bankAccountId}
                        onChange={handleChange}
                        disabled={isEditing}
                    >
                        <option value="">Fechamento Geral (Todas as contas)</option>
                        {bankAccounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.accountName} - {account.bankName}
                            </option>
                        ))}
                    </select>
                    <small className="form-hint">
                        Deixe em branco para criar um fechamento geral de todas as contas
                    </small>
                </div>

                <div className="form-section">
                    <h3>Saldos</h3>
                    <p className="form-hint">
                        {isEditing
                            ? 'Você pode ajustar os saldos manualmente se necessário'
                            : 'Os saldos serão calculados automaticamente. Preencha apenas se desejar valores específicos.'}
                    </p>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="openingBalance">Saldo de Abertura</label>
                            <input
                                type="number"
                                id="openingBalance"
                                name="openingBalance"
                                value={formData.openingBalance}
                                onChange={handleChange}
                                step="0.01"
                                placeholder="Será calculado automaticamente"
                                disabled={!canEdit}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="totalInflows">Total de Entradas</label>
                            <input
                                type="number"
                                id="totalInflows"
                                name="totalInflows"
                                value={formData.totalInflows}
                                onChange={handleChange}
                                step="0.01"
                                placeholder="Será calculado automaticamente"
                                disabled={!canEdit}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="totalOutflows">Total de Saídas</label>
                            <input
                                type="number"
                                id="totalOutflows"
                                name="totalOutflows"
                                value={formData.totalOutflows}
                                onChange={handleChange}
                                step="0.01"
                                placeholder="Será calculado automaticamente"
                                disabled={!canEdit}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="notes">Observações</label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Observações sobre o fechamento"
                        disabled={!canEdit}
                    />
                </div>

                {isEditing && (
                    <div className="form-group">
                        <label htmlFor="discrepancyNotes">Notas de Discrepância</label>
                        <textarea
                            id="discrepancyNotes"
                            name="discrepancyNotes"
                            value={formData.discrepancyNotes}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Registre aqui qualquer discrepância encontrada"
                            disabled={!canEdit}
                        />
                    </div>
                )}

                {errors.submit && (
                    <div className="alert alert-error">
                        ❌ {errors.submit}
                    </div>
                )}

                <div className="form-actions">
                    <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
                        Cancelar
                    </button>
                    {canEdit && (
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Fechamento'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default DailyClosureForm;
