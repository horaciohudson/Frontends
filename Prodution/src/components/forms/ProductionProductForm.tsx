import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import type { ProductionProductDTO, CreateProductionProductDTO, UpdateProductionProductDTO } from '../../types/productionProduct';
import { UnitType, UnitTypeLabels } from '../../types/productionProduct';
import { authService } from '../../services/authService';
import './ProductionProductForm.css';

interface ProductionProductFormProps {
    product?: ProductionProductDTO;
    companyId: string;
    onSubmit: (data: CreateProductionProductDTO | UpdateProductionProductDTO) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

const validationSchema = Yup.object({
    tenantId: Yup.string()
        .required('Tenant ID é obrigatório'),
    companyId: Yup.string()
        .required('Company ID é obrigatório'),
    description: Yup.string()
        .required('Descrição é obrigatória')
        .max(500, 'Descrição deve ter no máximo 500 caracteres'),
    sku: Yup.string()
        .max(50, 'SKU deve ter no máximo 50 caracteres'),
    barcode: Yup.string()
        .max(50, 'Código de barras deve ter no máximo 50 caracteres'),
    size: Yup.string()
        .max(50, 'Tamanho deve ter no máximo 50 caracteres'),
    color: Yup.string()
        .max(50, 'Cor deve ter no máximo 50 caracteres'),
    unitType: Yup.string()
        .required('Unidade de medida é obrigatória')
        .oneOf(Object.values(UnitType), 'Unidade de medida inválida'),
    imageUrl: Yup.string()
        .url('URL inválida')
        .max(500, 'URL deve ter no máximo 500 caracteres'),
    notes: Yup.string()
});

const ProductionProductForm: React.FC<ProductionProductFormProps> = ({
    product,
    companyId,
    onSubmit,
    onCancel,
    isLoading = false
}) => {
    console.log('📝 [FORM COMPONENT] ProductionProductForm rendered with props:', {
        product: product ? `${product.description} (${product.id})` : 'undefined (new product)',
        companyId,
        isLoading,
        hasOnSubmit: typeof onSubmit === 'function',
        hasOnCancel: typeof onCancel === 'function'
    });

    const user = authService.getUser();
    
    // Garantir que o tenantId está presente
    if (!user?.tenantId) {
        console.error('🚨 [FORM] User or tenantId not found:', user);
        throw new Error('Usuário não autenticado');
    }
    
    console.log('🔍 [FORM] User tenantId:', user.tenantId);
    console.log('🔍 [FORM] CompanyId:', companyId);
    
    const initialValues: CreateProductionProductDTO = {
        tenantId: user.tenantId, // Garantir que não seja undefined
        companyId,
        description: product?.description || '',
        sku: product?.sku || '',
        barcode: product?.barcode || '',
        size: product?.size || '',
        color: product?.color || '',
        unitType: product?.unitType || UnitType.UN,
        imageUrl: product?.imageUrl || '',
        notes: product?.notes || '',
        isActive: product?.isActive ?? true
    };

    console.log('📝 [FORM COMPONENT] Initial form values:', initialValues);

    return (
        <div className="production-product-form-container">
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    console.log('📝 [FORMIK] Form values on submit:', values);
                    try {
                        await onSubmit(values);
                    } finally {
                        setSubmitting(false);
                    }
                }}
                enableReinitialize
            >
                {({ isSubmitting }) => (
                    <Form className="production-product-form">
                        {/* Campos ocultos para IDs */}
                        <Field type="hidden" name="tenantId" />
                        <Field type="hidden" name="companyId" />
                        
                        <div className="form-section">
                            <h3 className="form-section-title">Informações Básicas</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="description" className="form-label">
                                        Descrição <span className="required">*</span>
                                    </label>
                                    <Field
                                        type="text"
                                        id="description"
                                        name="description"
                                        className="form-input"
                                        placeholder="Ex: Camiseta Básica"
                                    />
                                    <ErrorMessage name="description" component="div" className="form-error" />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="sku" className="form-label">SKU</label>
                                    <Field
                                        type="text"
                                        id="sku"
                                        name="sku"
                                        className="form-input"
                                        placeholder="Ex: CAM-BAS-001"
                                    />
                                    <ErrorMessage name="sku" component="div" className="form-error" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="barcode" className="form-label">Código de Barras</label>
                                    <Field
                                        type="text"
                                        id="barcode"
                                        name="barcode"
                                        className="form-input"
                                        placeholder="Ex: 7891234567890"
                                    />
                                    <ErrorMessage name="barcode" component="div" className="form-error" />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="form-section-title">Características</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="size" className="form-label">Tamanho</label>
                                    <Field
                                        type="text"
                                        id="size"
                                        name="size"
                                        className="form-input"
                                        placeholder="Ex: M, G, GG"
                                    />
                                    <ErrorMessage name="size" component="div" className="form-error" />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="color" className="form-label">Cor</label>
                                    <Field
                                        type="text"
                                        id="color"
                                        name="color"
                                        className="form-input"
                                        placeholder="Ex: Azul, Vermelho"
                                    />
                                    <ErrorMessage name="color" component="div" className="form-error" />
                                </div>

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
                            <h3 className="form-section-title">Informações Adicionais</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="imageUrl" className="form-label">URL da Imagem</label>
                                    <Field
                                        type="text"
                                        id="imageUrl"
                                        name="imageUrl"
                                        className="form-input"
                                        placeholder="https://exemplo.com/imagem.jpg"
                                    />
                                    <ErrorMessage name="imageUrl" component="div" className="form-error" />
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
                                        rows={4}
                                        placeholder="Observações sobre o produto..."
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
                                        <span>Produto Ativo</span>
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
                                {isSubmitting || isLoading ? 'Salvando...' : product ? 'Atualizar' : 'Criar'}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default ProductionProductForm;
