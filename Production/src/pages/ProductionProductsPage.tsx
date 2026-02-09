import React, { useState, useEffect } from 'react';
import { productionProductService } from '../services/productionProductService';
import { companyService, type Company } from '../services/companyService';
import type { ProductionProductDTO, CreateProductionProductDTO, UpdateProductionProductDTO } from '../types/productionProduct';
import ProductGrid from '../components/ui/ProductGrid';
import ProductFormModal from '../components/ui/ProductFormModal';
import FilterControls from '../components/ui/FilterControls';
import ErrorBoundary from '../components/ErrorBoundary';
import './ProductionProductsPage.css';

const ProductionProductsPage: React.FC = () => {
    const [products, setProducts] = useState<ProductionProductDTO[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductionProductDTO | undefined>();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

    // Global error handler for unhandled promise rejections
    useEffect(() => {
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            console.error('🚨 [UNHANDLED PROMISE] Unhandled promise rejection:', {
                reason: event.reason,
                promise: event.promise,
                timestamp: new Date().toISOString()
            });
        };

        const handleError = (event: ErrorEvent) => {
            console.error('🚨 [GLOBAL ERROR] Global error caught:', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                timestamp: new Date().toISOString()
            });
        };

        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        window.addEventListener('error', handleError);

        return () => {
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
            window.removeEventListener('error', handleError);
        };
    }, []);

    // Carregar empresas
    useEffect(() => {
        const loadCompanies = async () => {
            console.log('🏢 [COMPANIES] Starting to load companies');
            try {
                const data = await companyService.getAllCompanies();
                console.log('🏢 [COMPANIES] Companies loaded:', data);
                setCompanies(data.content || []);

                // Recupera empresa selecionada do sessionStorage ou seleciona a primeira
                const savedCompanyId = sessionStorage.getItem('selectedCompanyId');
                console.log('🏢 [COMPANIES] Saved company ID from session:', savedCompanyId);
                
                if (savedCompanyId && data.content.some((c: Company) => c.id === savedCompanyId)) {
                    console.log('🏢 [COMPANIES] Using saved company ID:', savedCompanyId);
                    setSelectedCompanyId(savedCompanyId);
                } else if (data.content.length > 0) {
                    const firstCompanyId = data.content[0].id;
                    console.log('🏢 [COMPANIES] Using first company ID:', firstCompanyId);
                    setSelectedCompanyId(firstCompanyId);
                    sessionStorage.setItem('selectedCompanyId', firstCompanyId);
                } else {
                    console.log('🏢 [COMPANIES] No companies available');
                }
            } catch (error) {
                console.error('🏢 [COMPANIES] Error loading companies:', error);
                setError('Erro ao carregar empresas');
            }
        };

        loadCompanies();
    }, []);

    useEffect(() => {
        if (selectedCompanyId) {
            loadProducts();
        }
    }, [selectedCompanyId]);

    // Debug: Monitor showForm state changes
    useEffect(() => {
        console.log('🔄 [STATE CHANGE] showForm changed to:', showForm);
        console.log('🔄 [STATE CHANGE] editingProduct is:', editingProduct);
        console.log('🔄 [STATE CHANGE] selectedCompanyId is:', selectedCompanyId);
        
        if (showForm) {
            console.log('📋 [FORM STATE] Form is now visible');
            if (editingProduct) {
                console.log('📋 [FORM STATE] Form is in EDIT mode for product:', editingProduct.id);
            } else {
                console.log('📋 [FORM STATE] Form is in CREATE mode');
            }
        } else {
            console.log('📋 [FORM STATE] Form is now hidden');
        }
    }, [showForm, editingProduct, selectedCompanyId]);

    const loadProducts = async () => {
        if (!selectedCompanyId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');
            const data = await productionProductService.findAll(selectedCompanyId);
            setProducts(data);
        } catch (err) {
            setError('Erro ao carregar produtos. Verifique se o backend está rodando.');
            console.error('Erro ao carregar produtos:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        console.log('🔍 [DEBUG] handleCreate called');
        console.log('🔍 [DEBUG] selectedCompanyId:', selectedCompanyId);
        console.log('🔍 [DEBUG] Current showForm state:', showForm);
        console.log('🔍 [DEBUG] Current editingProduct state:', editingProduct);
        
        try {
            // Enhanced company validation
            if (!selectedCompanyId || selectedCompanyId.trim() === '') {
                console.log('❌ [VALIDATION] No company selected or empty company ID');
                const errorMsg = 'Por favor, selecione uma empresa antes de criar um novo produto.';
                setError(errorMsg);
                alert(errorMsg);
                return;
            }

            // Validate that the selected company exists in the companies list
            const selectedCompany = companies.find(c => c.id === selectedCompanyId);
            if (!selectedCompany) {
                console.log('❌ [VALIDATION] Selected company not found in companies list');
                const errorMsg = 'A empresa selecionada não é válida. Por favor, selecione uma empresa válida.';
                setError(errorMsg);
                alert(errorMsg);
                return;
            }

            console.log('✅ [VALIDATION] Company validation passed for:', selectedCompany.corporateName);
            
            // Clear any previous errors
            setError('');
            
            // Initialize form state for new product creation
            console.log('🔄 [FORM INIT] Initializing form for new product creation');
            console.log('🔄 [FORM INIT] Clearing editingProduct (was:', editingProduct, ')');
            setEditingProduct(undefined);
            
            console.log('🔄 [FORM INIT] Opening form (showForm: false -> true)');
            setShowForm(true);
            
            // Log the initial form values that will be used
            const initialFormValues = {
                companyId: selectedCompanyId,
                description: '',
                sku: '',
                barcode: '',
                size: '',
                color: '',
                unitType: 'UN',
                imageUrl: '',
                notes: '',
                isActive: true
            };
            console.log('📝 [FORM INIT] Initial form values will be:', initialFormValues);
            
            console.log('✅ [SUCCESS] handleCreate completed successfully');
        } catch (error: any) {
            console.error('💥 [ERROR] Exception in handleCreate:', error);
            console.error('💥 [ERROR] Stack trace:', error?.stack);
            setError('Erro interno ao abrir o formulário. Verifique o console para mais detalhes.');
        }
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const companyId = e.target.value;
        console.log('🏢 [COMPANY] Company selection changed to:', companyId);
        console.log('🏢 [COMPANY] Previous selectedCompanyId:', selectedCompanyId);
        
        setSelectedCompanyId(companyId);
        sessionStorage.setItem('selectedCompanyId', companyId);
        
        console.log('🏢 [COMPANY] Company change completed, stored in session');
    };

    const handleEdit = (product: ProductionProductDTO) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
            return;
        }

        try {
            await productionProductService.delete(id, selectedCompanyId);
            await loadProducts();
            alert('Produto excluído com sucesso!');
        } catch (err) {
            alert('Erro ao excluir produto');
            console.error('Erro ao excluir produto:', err);
        }
    };

    const handleToggleActive = async (product: ProductionProductDTO) => {
        try {
            await productionProductService.toggleActive(product.id, !product.isActive);
            await loadProducts();
        } catch (err) {
            alert('Erro ao alterar status do produto');
            console.error('Erro ao alterar status:', err);
        }
    };

    const handleSubmit = async (data: CreateProductionProductDTO | UpdateProductionProductDTO) => {
        console.log('📝 [SUBMIT] handleSubmit called with data:', data);
        console.log('📝 [SUBMIT] editingProduct:', editingProduct);
        console.log('📝 [SUBMIT] selectedCompanyId:', selectedCompanyId);
        
        try {
            if (editingProduct) {
                console.log('📝 [SUBMIT] Updating existing product:', editingProduct.id);
                await productionProductService.update(editingProduct.id, data as UpdateProductionProductDTO, selectedCompanyId);
                console.log('✅ [SUBMIT] Product updated successfully');
                alert('Produto atualizado com sucesso!');
            } else {
                console.log('📝 [SUBMIT] Creating new product');
                const result = await productionProductService.create(data as CreateProductionProductDTO);
                console.log('✅ [SUBMIT] Product created successfully:', result);
                alert('Produto criado com sucesso!');
            }
            
            console.log('🔄 [SUBMIT] Closing form and refreshing products');
            setShowForm(false);
            setEditingProduct(undefined);
            await loadProducts();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erro ao salvar produto';
            console.error('💥 [SUBMIT] Error saving product:', err);
            console.error('💥 [SUBMIT] Error details:', {
                message: errorMessage,
                status: err.response?.status,
                data: err.response?.data
            });
            alert(errorMessage);
        }
    };

    const handleCancel = () => {
        console.log('❌ [CANCEL] handleCancel called');
        console.log('❌ [CANCEL] Current showForm state:', showForm);
        console.log('❌ [CANCEL] Current editingProduct:', editingProduct);
        
        setShowForm(false);
        setEditingProduct(undefined);
        
        console.log('❌ [CANCEL] Form closed and state reset');
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch =
            product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            filterActive === 'all' ||
            (filterActive === 'active' && product.isActive) ||
            (filterActive === 'inactive' && !product.isActive);

        return matchesSearch && matchesFilter;
    });

    const productCounts = {
        total: products.length,
        active: products.filter(p => p.isActive).length,
        inactive: products.filter(p => !p.isActive).length
    };

    return (
        <ErrorBoundary>
            <div className="production-products-page">
                <div className="page-header">
                    <h1 className="page-title">🏷️ Produtos de Produção</h1>
                    <button 
                        onClick={() => {
                            console.log('🖱️ [CLICK] Novo Produto button clicked');
                            console.log('🖱️ [CLICK] Button disabled state:', !selectedCompanyId);
                            console.log('🖱️ [CLICK] selectedCompanyId value:', selectedCompanyId);
                            handleCreate();
                        }} 
                        className={`btn btn-primary ${!selectedCompanyId ? 'btn-disabled' : ''}`}
                        disabled={!selectedCompanyId}
                        title={!selectedCompanyId ? 'Selecione uma empresa primeiro' : 'Criar novo produto'}
                    >
                        + Novo Produto
                    </button>
                </div>

                <div className="page-filters">
                    <div className="form-group">
                        <label htmlFor="company-select">Empresa:</label>
                        <select
                            id="company-select"
                            value={selectedCompanyId}
                            onChange={handleCompanyChange}
                            className={`form-input ${!selectedCompanyId ? 'form-input-warning' : ''}`}
                        >
                            <option value="">Selecione uma empresa</option>
                            {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.corporateName}
                                </option>
                            ))}
                        </select>
                        {!selectedCompanyId && (
                            <div className="form-warning">
                                ⚠️ Selecione uma empresa para habilitar a criação de produtos
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <FilterControls
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filterActive={filterActive}
                    onFilterChange={setFilterActive}
                    productCounts={productCounts}
                />

                <ProductGrid
                    products={filteredProducts}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                    selectedCompanyId={selectedCompanyId}
                />

                <ProductFormModal
                    isOpen={showForm}
                    product={editingProduct}
                    companyId={selectedCompanyId}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={loading}
                />
            </div>
        </ErrorBoundary>
    );
};

export default ProductionProductsPage;
