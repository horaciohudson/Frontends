import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import type { CompositionDTO, CreateCompositionDTO, UpdateCompositionDTO } from '../../types/composition';
import type { ProductionProductDTO } from '../../types/productionProduct';
import { authService } from '../../services/authService';
import { productionProductService } from '../../services/productionProductService';
import './CompositionForm.css';

interface CompositionFormProps {
    composition?: CompositionDTO;
    companyId: string;
    onSubmit: (data: CreateCompositionDTO | UpdateCompositionDTO) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

const validationSchema = Yup.object({
    name: Yup.string()
        .required('Nome é obrigatório')
        .max(200, 'Nome deve ter no máximo 200 caracteres'),
    productionProductId: Yup.string()
        .required('Produto é obrigatório'),
    version: Yup.number()
        .min(1, 'Versão deve ser maior que zero')
        .integer('Versão deve ser um número inteiro')
        .required('Versão é obrigatória'),
    effectiveDate: Yup.date()
        .nullable(),
    expirationDate: Yup.date()
        .nullable()
        .when('effectiveDate', (effectiveDate, schema) => {
            if (effectiveDate && effectiveDate[0]) {
                return schema.min(effectiveDate[0], 'Data de vencimento deve ser posterior à data de vigência');
            }
            return schema;
        }),
    notes: Yup.string()
        .max(1000, 'Observações devem ter no máximo 1000 caracteres')
});

const CompositionForm: React.FC<CompositionFormProps> = ({
    composition,
    companyId,
    onSubmit,
    onCancel,
    isLoading = false
}) => {
    const [products, setProducts] = useState<ProductionProductDTO[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    const user = authService.getUser();
    
    const initialValues: CreateCompositionDTO = {
        tenantId: user?.tenantId || '',
        companyId,
        productionProductId: composition?.productionProductId || '',
        name: composition?.name || '',
        version: composition?.version || 1,
        effectiveDate: composition?.effectiveDate || '',
        expirationDate: composition?.expirationDate || '',
        isActive: composition?.isActive ?? true,
        notes: composition?.notes || ''
    };

    // Carregar produtos da empresa
    useEffect(() => {
        const loadProducts = async () => {
            if (!companyId) return;
            
            try {
                setLoadingProducts(true);
                const data = await productionProductService.findAll(companyId);
                setProducts(data.filter(p => p.isActive));
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);
            } finally {
                setLoadingProducts(false);
            }
        };

        loadProducts();
    }, [companyId]);

    return (
        <div className="composition-form-container">
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
                {({ isSubmitting }) => (
                    <Form className="composition-form">
                        <div className="form-section">
                            <h3 className="form-section-title">Informações Básicas</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name" className="form-label">
                                        Nome da Composição <span className="required">*</span>
                                    </label>
                                    <Field
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="form-input"
                                        placeholder="Ex: Camiseta Básica - BOM v1"
                                    />
                                    <ErrorMessage name="name" component="div" className="form-error" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="version" className="form-label">
                                        Versão <span className="required">*</span>
                                    </label>
                                    <Field
                                        type="number"
                                        id="version"
                                        name="version"
                                        className="form-input"
                                        min="1"
                                        step="1"
                                    />
                                    <ErrorMessage name="version" component="div" className="form-error" />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="productionProductId" className="form-label">
                                        Produto <span className="required">*</span>
                                    </label>
                                    <Field as="select" id="productionProductId" name="productionProductId" className="form-input">
                                        <option value="">Selecione um produto</option>
                                        {loadingProducts ? (
                                            <option value="">Carregando produtos...</option>
                                        ) : (
                                            products.map((product) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.description}
                                                </option>
                                            ))
                                        )}
                                    </Field>
                                    <ErrorMessage name="productionProductId" component="div" className="form-error" />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="form-section-title">Vigência</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="effectiveDate" className="form-label">Data de Vigência</label>
                                    <Field
                                        type="date"
                                        id="effectiveDate"
                                        name="effectiveDate"
                                        className="form-input"
                                    />
                                    <ErrorMessage name="effectiveDate" component="div" className="form-error" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="expirationDate" className="form-label">Data de Vencimento</label>
                                    <Field
                                        type="date"
                                        id="expirationDate"
                                        name="expirationDate"
                                        className="form-input"
                                    />
                                    <ErrorMessage name="expirationDate" component="div" className="form-error" />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="form-section-title">Observações</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="notes" className="form-label">Observações</label>
                                    <Field
                                        as="textarea"
                                        id="notes"
                                        name="notes"
                                        className="form-input form-textarea"
                                        rows={4}
                                        placeholder="Observações sobre a composição..."
                                    />
                                    <ErrorMessage name="notes" component="div" className="form-error" />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <Field
                                            type="checkbox"
                                            name="isActive"
                                            className="form-checkbox"
                                        />
                                        <span>Composição Ativa</span>
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
                                {isSubmitting || isLoading ? 'Salvando...' : composition ? 'Atualizar' : 'Criar'}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default CompositionForm;