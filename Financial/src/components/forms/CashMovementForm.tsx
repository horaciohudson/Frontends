import React, { useState, useEffect } from 'react';
import type { CashMovementDTO, CreateCashMovementDTO } from '../../types/cashMovement';
import { CashMovementType, CashMovementStatus, PaymentMethod, PaymentMethodLabels } from '../../types/enums';
import { MoneyInput } from '../ui';
import { categoryService } from '../../services/categoryService';
import { costCenterService } from '../../services/costCenterService';
import './CashMovementForm.css';

interface CashMovementFormProps {
    initialData?: CashMovementDTO | null;
    onSubmit: (data: CreateCashMovementDTO) => void;
    onCancel: () => void;
}

export const CashMovementForm: React.FC<CashMovementFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
}) => {
    const [formData, setFormData] = useState<Partial<CreateCashMovementDTO>>({
        movementDate: new Date().toISOString().split('T')[0],
        movementType: CashMovementType.OUTFLOW,
        amount: 0,
        currency: 'BRL',
        movementStatus: CashMovementStatus.PENDING,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
    const [costCenters, setCostCenters] = useState<Array<{ id: number; name: string }>>([]);
    const [bankAccounts, setBankAccounts] = useState<Array<{ id: number; name: string }>>([]);

    // Load options
    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [categoriesData, costCentersData] = await Promise.all([
                    categoryService.findAll(),
                    costCenterService.findAll({ companyId: sessionStorage.getItem('selectedCompanyId') || '' })
                ]);
                setCategories(categoriesData.map((c: any) => ({ id: c.categoryId, name: c.categoryName })));
                setCostCenters(costCentersData.map((cc: any) => ({ id: cc.id, name: cc.costCenterName })));

                // TODO: Load bank accounts when service is available
                setBankAccounts([
                    { id: 1, name: 'Conta Corrente - Banco do Brasil' },
                    { id: 2, name: 'Conta Poupança - Caixa' }
                ]);
            } catch (error) {
                console.error('Erro ao carregar opções:', error);
            }
        };
        loadOptions();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                movementType: initialData.movementType,
                amount: initialData.amount,
                currency: initialData.currency,
                movementDate: initialData.movementDate,
                bankStatementDate: initialData.bankStatementDate,
                bankAccountId: initialData.bankAccountId,
                bankReference: initialData.bankReference,
                categoryId: initialData.categoryId,
                category: initialData.category,
                costCenterId: initialData.costCenterId,
                description: initialData.description,
                paymentMethod: initialData.paymentMethod,
                documentNumber: initialData.documentNumber,
                beneficiaryName: initialData.beneficiaryName,
                movementStatus: initialData.movementStatus,
            });
        }
    }, [initialData]);

    const handleChange = (field: keyof CreateCashMovementDTO, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.movementType) newErrors.movementType = 'Tipo é obrigatório';
        if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Valor deve ser maior que zero';
        if (!formData.movementDate) newErrors.movementDate = 'Data é obrigatória';
        if (!formData.bankAccountId) newErrors.bankAccountId = 'Conta bancária é obrigatória';

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
            await onSubmit(formData as CreateCashMovementDTO);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="cash-movement-form" onSubmit={handleSubmit}>
            <div className="form-section">
                <h3>Informações Básicas</h3>

                <div className="form-row two-columns">
                    <div className="form-group">
                        <label htmlFor="movementType">Tipo de Movimento *</label>
                        <select
                            id="movementType"
                            value={formData.movementType || ''}
                            onChange={(e) => handleChange('movementType', e.target.value)}
                            className={errors.movementType ? 'error' : ''}
                        >
                            <option value={CashMovementType.INFLOW}>Entrada</option>
                            <option value={CashMovementType.OUTFLOW}>Saída</option>
                        </select>
                        {errors.movementType && <span className="error-message">{errors.movementType}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="amount">Valor *</label>
                        <MoneyInput
                            id="amount"
                            value={formData.amount || 0}
                            onChange={(value) => handleChange('amount', value)}
                            className={errors.amount ? 'error' : ''}
                        />
                        {errors.amount && <span className="error-message">{errors.amount}</span>}
                    </div>
                </div>

                <div className="form-row two-columns">
                    <div className="form-group">
                        <label htmlFor="movementDate">Data do Movimento *</label>
                        <input
                            type="date"
                            id="movementDate"
                            value={formData.movementDate || ''}
                            onChange={(e) => handleChange('movementDate', e.target.value)}
                            className={errors.movementDate ? 'error' : ''}
                        />
                        {errors.movementDate && <span className="error-message">{errors.movementDate}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="bankStatementDate">Data no Extrato</label>
                        <input
                            type="date"
                            id="bankStatementDate"
                            value={formData.bankStatementDate || ''}
                            onChange={(e) => handleChange('bankStatementDate', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3>Conta Bancária</h3>

                <div className="form-row two-columns">
                    <div className="form-group">
                        <label htmlFor="bankAccountId">Conta Bancária *</label>
                        <select
                            id="bankAccountId"
                            value={formData.bankAccountId || ''}
                            onChange={(e) => handleChange('bankAccountId', e.target.value ? Number(e.target.value) : undefined)}
                            className={errors.bankAccountId ? 'error' : ''}
                        >
                            <option value="">Selecione...</option>
                            {bankAccounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                        {errors.bankAccountId && <span className="error-message">{errors.bankAccountId}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="bankReference">Referência Bancária</label>
                        <input
                            type="text"
                            id="bankReference"
                            value={formData.bankReference || ''}
                            onChange={(e) => handleChange('bankReference', e.target.value)}
                            placeholder="Código/referência do banco"
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3>Categorização</h3>

                <div className="form-row two-columns">
                    <div className="form-group">
                        <label htmlFor="categoryId">Categoria Financeira</label>
                        <select
                            id="categoryId"
                            value={formData.categoryId || ''}
                            onChange={(e) => {
                                const categoryId = e.target.value ? Number(e.target.value) : undefined;
                                const category = categories.find(c => c.id === categoryId)?.name || '';
                                handleChange('categoryId', categoryId);
                                handleChange('category', category);
                            }}
                        >
                            <option value="">Selecione...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="costCenterId">Centro de Custo</label>
                        <select
                            id="costCenterId"
                            value={formData.costCenterId || ''}
                            onChange={(e) => handleChange('costCenterId', e.target.value ? Number(e.target.value) : undefined)}
                        >
                            <option value="">Selecione...</option>
                            {costCenters.map(cc => (
                                <option key={cc.id} value={cc.id}>{cc.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3>Detalhes</h3>

                <div className="form-row two-columns">
                    <div className="form-group">
                        <label htmlFor="paymentMethod">Método de Pagamento</label>
                        <select
                            id="paymentMethod"
                            value={formData.paymentMethod || ''}
                            onChange={(e) => handleChange('paymentMethod', e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            {Object.entries(PaymentMethodLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="documentNumber">Número do Documento</label>
                        <input
                            type="text"
                            id="documentNumber"
                            value={formData.documentNumber || ''}
                            onChange={(e) => handleChange('documentNumber', e.target.value)}
                            placeholder="Número do comprovante"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="beneficiaryName">Beneficiário/Pagador</label>
                        <input
                            type="text"
                            id="beneficiaryName"
                            value={formData.beneficiaryName || ''}
                            onChange={(e) => handleChange('beneficiaryName', e.target.value)}
                            placeholder="Nome do beneficiário ou pagador"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="description">Descrição</label>
                        <textarea
                            id="description"
                            value={formData.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={3}
                            placeholder="Descrição do movimento"
                        />
                    </div>
                </div>
            </div>

            <div className="form-actions">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>
                    Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Salvando...' : initialData ? 'Atualizar' : 'Salvar'}
                </button>
            </div>
        </form>
    );
};
