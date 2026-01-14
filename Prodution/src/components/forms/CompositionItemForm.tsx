import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { compositionItemService } from '../../services/compositionItemService';
import { authService } from '../../services/authService';
import type {
    CompositionItemWithDetails,
    CreateCompositionItemDTO,
    UpdateCompositionItemDTO,
    CompositionItemType,
    ItemOption
} from '../../types/composition';
import { CompositionItemTypeLabels } from '../../types/composition';
import { UnitTypeLabels } from '../../types/rawMaterial';
import './CompositionItemForm.css';

interface CompositionItemFormProps {
    item?: CompositionItemWithDetails;
    compositionId: string;
    companyId: string;
    onSubmit: (data: CreateCompositionItemDTO | UpdateCompositionItemDTO) => Promise<void>;
    onCancel: () => void;
}

const validationSchema = Yup.object({
    itemType: Yup.string()
        .required('Tipo de item é obrigatório')
        .oneOf(['RAW_MATERIAL', 'SERVICE'], 'Tipo inválido'),
    referenceId: Yup.string()
        .required('Selecione um item'),
    quantity: Yup.number()
        .required('Quantidade é obrigatória')
        .min(0.0001, 'Quantidade deve ser maior que zero'),
    lossPercentage: Yup.number()
        .min(0, 'Perda não pode ser negativa')
        .max(100, 'Perda não pode ser maior que 100%')
        .nullable(),
    unitCost: Yup.number()
        .min(0, 'Custo não pode ser negativo')
        .nullable()
});

const CompositionItemForm: React.FC<CompositionItemFormProps> = ({
    item,
    compositionId,
    companyId,
    onSubmit,
    onCancel
}) => {
    const [itemOptions, setItemOptions] = useState<ItemOption[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [selectedItemType, setSelectedItemType] = useState<CompositionItemType>(
        item?.itemType || 'RAW_MATERIAL'
    );
    const [calculatedTotal, setCalculatedTotal] = useState<number>(0);

    const user = authService.getUser();

    // Carregar opções de itens quando o tipo mudar
    useEffect(() => {
        loadItemOptions(selectedItemType);
    }, [selectedItemType]);

    const loadItemOptions = async (itemType: CompositionItemType) => {
        try {
            setLoadingOptions(true);
            const options = await compositionItemService.findItemsForSelection(companyId, itemType);
            setItemOptions(options);
        } catch (error) {
            console.error('Erro ao carregar opções:', error);
            setItemOptions([]);
        } finally {
            setLoadingOptions(false);
        }
    };

    const handleItemTypeChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
        setFieldValue: any
    ) => {
        const newType = e.target.value as CompositionItemType;
        setSelectedItemType(newType);
        setFieldValue('itemType', newType);
        setFieldValue('referenceId', '');
        setFieldValue('unitType', '');
        setFieldValue('unitCost', '');
    };

    const handleItemSelection = async (
        e: React.ChangeEvent<HTMLSelectElement>,
        setFieldValue: any
    ) => {
        const itemId = e.target.value;
        setFieldValue('referenceId', itemId);

        if (itemId) {
            // Buscar detalhes do item selecionado
            const selectedOption = itemOptions.find(opt => opt.id === itemId);
            if (selectedOption) {
                setFieldValue('unitType', selectedOption.unitType);
                setFieldValue('unitCost', selectedOption.unitCost || 0);
            }
        }
    };

    const calculateTotal = (quantity: number, unitCost: number, lossPercentage: number) => {
        const total = compositionItemService.calculateItemCost(quantity, unitCost, lossPercentage);
        setCalculatedTotal(total);
        return total;
    };

    const initialValues: CreateCompositionItemDTO = {
        tenantId: user?.tenantId || '',
        companyId,
        compositionId,
        itemType: item?.itemType || 'RAW_MATERIAL',
        referenceId: item?.referenceId || '',
        sequence: item?.sequence,
        unitType: item?.unitType || 'UN',
        quantity: item?.quantity || 0,
        lossPercentage: item?.lossPercentage || 0,
        unitCost: item?.unitCost || 0,
        isOptional: item?.isOptional || false,
        notes: item?.notes || ''
    };

    return (
        <div className="composition-item-form-container">
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting, setFieldError }) => {
                    try {
                        // Verificar item duplicado
                        const isDuplicate = await compositionItemService.checkDuplicateItem(
                            compositionId,
                            values.itemType,
                            values.referenceId,
                            item?.id
                        );

                        if (isDuplicate) {
                            setFieldError('referenceId', 'Este item já foi adicionado à composição');
                            return;
                        }

                        // Se não tem sequência, buscar a próxima
                        if (!values.sequence) {
                            values.sequence = await compositionItemService.getNextSequence(compositionId);
                        }

                        await onSubmit(values);
                    } catch (error: any) {
                        const errorMessage = error.response?.data?.message || 'Erro ao salvar item';
                        alert(errorMessage);
                    } finally {
                        setSubmitting(false);
                    }
                }}
                enableReinitialize
            >
                {({ isSubmitting, values, setFieldValue }) => {
                    // Recalcular total quando valores mudarem
                    useEffect(() => {
                        if (values.quantity && values.unitCost) {
                            calculateTotal(
                                values.quantity,
                                values.unitCost,
                                values.lossPercentage || 0
                            );
                        }
                    }, [values.quantity, values.unitCost, values.lossPercentage]);

                    return (
                        <Form className="composition-item-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="itemType" className="form-label">
                                        Tipo de Item <span className="required">*</span>
                                    </label>
                                    <Field
                                        as="select"
                                        id="itemType"
                                        name="itemType"
                                        className="form-input"
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                            handleItemTypeChange(e, setFieldValue)
                                        }
                                        disabled={!!item}
                                    >
                                        {Object.entries(CompositionItemTypeLabels).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="itemType" component="div" className="form-error" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="referenceId" className="form-label">
                                        {selectedItemType === 'RAW_MATERIAL' ? 'Matéria-Prima' : 'Serviço'}{' '}
                                        <span className="required">*</span>
                                    </label>
                                    <Field
                                        as="select"
                                        id="referenceId"
                                        name="referenceId"
                                        className="form-input"
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                            handleItemSelection(e, setFieldValue)
                                        }
                                        disabled={!!item}
                                    >
                                        <option value="">Selecione...</option>
                                        {loadingOptions ? (
                                            <option value="">Carregando...</option>
                                        ) : (
                                            itemOptions.map((option) => (
                                                <option key={option.id} value={option.id}>
                                                    {option.code ? `${option.code} - ${option.name}` : option.name}
                                                </option>
                                            ))
                                        )}
                                    </Field>
                                    <ErrorMessage name="referenceId" component="div" className="form-error" />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="quantity" className="form-label">
                                        Quantidade <span className="required">*</span>
                                    </label>
                                    <Field
                                        type="number"
                                        id="quantity"
                                        name="quantity"
                                        className="form-input"
                                        step="0.0001"
                                        min="0"
                                        placeholder="0.0000"
                                    />
                                    <ErrorMessage name="quantity" component="div" className="form-error" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="unitType" className="form-label">
                                        Unidade
                                    </label>
                                    <Field
                                        as="select"
                                        id="unitType"
                                        name="unitType"
                                        className="form-input"
                                        disabled
                                    >
                                        {Object.entries(UnitTypeLabels).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </Field>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="unitCost" className="form-label">
                                        Custo Unitário (R$)
                                    </label>
                                    <Field
                                        type="number"
                                        id="unitCost"
                                        name="unitCost"
                                        className="form-input"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                    />
                                    <ErrorMessage name="unitCost" component="div" className="form-error" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="lossPercentage" className="form-label">
                                        Perda (%)
                                    </label>
                                    <Field
                                        type="number"
                                        id="lossPercentage"
                                        name="lossPercentage"
                                        className="form-input"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        placeholder="0.00"
                                    />
                                    <ErrorMessage name="lossPercentage" component="div" className="form-error" />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Custo Total (R$)</label>
                                    <div className="calculated-value">
                                        R$ {calculatedTotal.toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <Field
                                            type="checkbox"
                                            name="isOptional"
                                            className="form-checkbox"
                                        />
                                        <span>Item Opcional</span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="notes" className="form-label">Observações</label>
                                    <Field
                                        as="textarea"
                                        id="notes"
                                        name="notes"
                                        className="form-input form-textarea"
                                        rows={3}
                                        placeholder="Observações sobre este item..."
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="btn btn-secondary"
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Salvando...' : item ? 'Atualizar' : 'Adicionar'}
                                </button>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
};

export default CompositionItemForm;
