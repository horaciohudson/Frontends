import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import type { RawMaterialDTO, CreateRawMaterialDTO, UpdateRawMaterialDTO } from '../../types/rawMaterial';
import { UnitType, UnitTypeLabels } from '../../types/rawMaterial';
import { authService } from '../../services/authService';
import './RawMaterialForm.css';

interface RawMaterialFormProps {
    material?: RawMaterialDTO;
    companyId: string;
    onSubmit: (data: CreateRawMaterialDTO | UpdateRawMaterialDTO) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

const validationSchema = Yup.object({
    code: Yup.string()
        .required('Código é obrigatório')
        .max(50, 'Código deve ter no máximo 50 caracteres'),
    name: Yup.string()
        .required('Nome é obrigatório')
        .max(200, 'Nome deve ter no máximo 200 caracteres'),
    unitType: Yup.string()
        .required('Unidade de medida é obrigatória')
        .oneOf(Object.values(UnitType), 'Unidade de medida inválida'),
    averageCost: Yup.number()
        .min(0, 'Custo médio deve ser maior ou igual a zero')
        .nullable(),
    lastPurchasePrice: Yup.number()
        .min(0, 'Preço da última compra deve ser maior ou igual a zero')
        .nullable(),
    minStock: Yup.number()
        .min(0, 'Estoque mínimo deve ser maior ou igual a zero')
        .nullable(),
    maxStock: Yup.number()
        .min(0, 'Estoque máximo deve ser maior ou igual a zero')
        .nullable(),
    reorderPoint: Yup.number()
        .min(0, 'Ponto de reposição deve ser maior ou igual a zero')
        .nullable(),
    leadTimeDays: Yup.number()
        .min(0, 'Lead time deve ser maior ou igual a zero')
        .integer('Lead time deve ser um número inteiro')
        .nullable()
});

const RawMaterialForm: React.FC<RawMaterialFormProps> = ({
    material,
    companyId,
    onSubmit,
    onCancel,
    isLoading = false
}) => {
    const user = authService.getUser();
    const initialValues: CreateRawMaterialDTO = {
        tenantId: user?.tenantId || '',
        companyId,
        code: material?.code || '',
        name: material?.name || '',
        unitType: material?.unitType || UnitType.UN,
        supplierId: material?.supplierId || undefined,
        averageCost: material?.averageCost || undefined,
        lastPurchasePrice: material?.lastPurchasePrice || undefined,
        stockControl: material?.stockControl ?? true,
        minStock: material?.minStock || undefined,
        maxStock: material?.maxStock || undefined,
        reorderPoint: material?.reorderPoint || undefined,
        leadTimeDays: material?.leadTimeDays || undefined,
        categoryId: material?.categoryId || undefined,
        isActive: material?.isActive ?? true
    };

    return (
        <div className="raw-material-form-container">
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    try {
                        await onSubmit(values);
                    } finally {
                        setSubmitting(false);
                    }
                }}
                enableReinitialize
            >
                {({ isSubmitting, values }) => (
                    <Form className="raw-material-form">
                        <div className="form-section">
                            <h3 className="form-section-title">Informações Básicas</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="code" className="form-label">
                                        Código <span className="required">*</span>
                                    </label>
                                    <Field
                                        type="text"
                                        id="code"
                                        name="code"
                                        className="form-input"
                                        placeholder="Ex: MP001"
                                    />
                                    <ErrorMessage name="code" component="div" className="form-error" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="name" className="form-label">
                                        Nome <span className="required">*</span>
                                    </label>
                                    <Field
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="form-input"
                                        placeholder="Ex: Algodão Branco"
                                    />
                                    <ErrorMessage name="name" component="div" className="form-error" />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="unitType" className="form-label">
                                        Unidade de Medida <span className="required">*</span>
                                    </label>
                                    <Field as="select" id="unitType" name="unitType" className="form-input">
                                        {Object.entries(UnitTypeLabels).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="unitType" component="div" className="form-error" />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="form-section-title">Custos</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="averageCost" className="form-label">Custo Médio (R$)</label>
                                    <Field
                                        type="number"
                                        id="averageCost"
                                        name="averageCost"
                                        className="form-input"
                                        placeholder="0,00"
                                        step="0.01"
                                        min="0"
                                    />
                                    <ErrorMessage name="averageCost" component="div" className="form-error" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="lastPurchasePrice" className="form-label">Última Compra (R$)</label>
                                    <Field
                                        type="number"
                                        id="lastPurchasePrice"
                                        name="lastPurchasePrice"
                                        className="form-input"
                                        placeholder="0,00"
                                        step="0.01"
                                        min="0"
                                    />
                                    <ErrorMessage name="lastPurchasePrice" component="div" className="form-error" />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="form-section-title">Controle de Estoque</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <Field
                                            type="checkbox"
                                            name="stockControl"
                                            className="form-checkbox"
                                        />
                                        <span>Controlar Estoque</span>
                                    </label>
                                </div>
                            </div>

                            {values.stockControl && (
                                <>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="minStock" className="form-label">Estoque Mínimo</label>
                                            <Field
                                                type="number"
                                                id="minStock"
                                                name="minStock"
                                                className="form-input"
                                                placeholder="0,00"
                                                step="0.01"
                                                min="0"
                                            />
                                            <ErrorMessage name="minStock" component="div" className="form-error" />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="maxStock" className="form-label">Estoque Máximo</label>
                                            <Field
                                                type="number"
                                                id="maxStock"
                                                name="maxStock"
                                                className="form-input"
                                                placeholder="0,00"
                                                step="0.01"
                                                min="0"
                                            />
                                            <ErrorMessage name="maxStock" component="div" className="form-error" />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="reorderPoint" className="form-label">Ponto de Reposição</label>
                                            <Field
                                                type="number"
                                                id="reorderPoint"
                                                name="reorderPoint"
                                                className="form-input"
                                                placeholder="0,00"
                                                step="0.01"
                                                min="0"
                                            />
                                            <ErrorMessage name="reorderPoint" component="div" className="form-error" />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="leadTimeDays" className="form-label">Lead Time (dias)</label>
                                            <Field
                                                type="number"
                                                id="leadTimeDays"
                                                name="leadTimeDays"
                                                className="form-input"
                                                placeholder="0"
                                                min="0"
                                            />
                                            <ErrorMessage name="leadTimeDays" component="div" className="form-error" />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="form-section">
                            <h3 className="form-section-title">Status</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <Field
                                            type="checkbox"
                                            name="isActive"
                                            className="form-checkbox"
                                        />
                                        <span>Matéria-Prima Ativa</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="btn btn-secondary"
                                disabled={isSubmitting || isLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting || isLoading}
                            >
                                {isSubmitting || isLoading ? 'Salvando...' : material ? 'Atualizar' : 'Criar'}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default RawMaterialForm;