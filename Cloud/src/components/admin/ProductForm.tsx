import { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI, uploadAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ImageUploadDragDrop from '../common/ImageUploadDragDrop';
import './ProductForm.css';

interface Category {
    id: number;
    name: string;
}


interface ProductFormProps {
    productId?: number;
    onSuccess: () => void;
    onCancel: () => void;
}

interface ProductFormData {
    name: string;
    description: string;
    brand: string;
    model: string;
    sku: string;
    barcode: string;
    categoryId: number | string;
    costPrice: number;
    sellingPrice: number;
    promotionalPrice: number;
    stockQuantity: number;
    minStockLevel: number;
    maxStockLevel: number;
    weight: number;
    dimensions: string;
    color: string;
    size: string;
    material: string;
    featured: boolean;
    status: string;
}

function ProductForm({ productId, onSuccess, onCancel }: ProductFormProps) {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(!!productId);
    const [categories, setCategories] = useState<Category[]>([]);

    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        brand: '',
        model: '',
        sku: '',
        barcode: '',
        categoryId: '',
        costPrice: 0,
        sellingPrice: 0,
        promotionalPrice: 0,
        stockQuantity: 0,
        minStockLevel: 5,
        maxStockLevel: 100,
        weight: 0,
        dimensions: '',
        color: '',
        size: '',
        material: '',
        featured: false,
        status: 'AVAILABLE'
    });

    // Múltiplas imagens
    interface ImageItem {
        imageUrl: string;
        imageName: string;
        isPrimary: boolean;
        sortOrder: number;
        altText: string;
    }

    const [images, setImages] = useState<ImageItem[]>([]);
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    console.log('ProductForm rendered with productId:', productId);

    useEffect(() => {
        console.log('useEffect triggered with productId:', productId);
        loadCategories();
        if (productId) {
            console.log('Calling loadProduct for productId:', productId);
            loadProduct();
        } else {
            // Reset form for new product
            setFormData({
                name: '',
                description: '',
                brand: '',
                model: '',
                sku: '',
                barcode: '',
                categoryId: '',
                costPrice: 0,
                sellingPrice: 0,
                promotionalPrice: 0,
                stockQuantity: 0,
                minStockLevel: 5,
                maxStockLevel: 100,
                weight: 0,
                dimensions: '',
                color: '',
                size: '',
                material: '',
                featured: false,
                status: 'AVAILABLE'
            });
            setImages([]);
            setCurrentImageUrl('');
            setUploading(false);
        }
    }, [productId]);

    const loadCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            setCategories(response.data.data || []);
        } catch (err) {
            console.error('Error loading categories:', err);
            showNotification('error', 'Erro ao carregar categorias');
        }
    };

    const loadProduct = async () => {
        if (!productId) return;

        console.log('Loading product with ID:', productId);

        try {
            setLoadingData(true);
            const response = await productsAPI.getById(productId);
            const product = response.data.data;

            console.log('Product loaded:', product);

            // Handle dimensions - convert object to string if needed
            let dimensionsStr = '';
            if (product.dimensions) {
                if (typeof product.dimensions === 'string') {
                    dimensionsStr = product.dimensions;
                } else if (typeof product.dimensions === 'object') {
                    const { length, width, height } = product.dimensions;
                    dimensionsStr = `${length || 0}x${width || 0}x${height || 0}`;
                }
            }

            setFormData({
                name: product.name || '',
                description: product.description || '',
                brand: product.brand || '',
                model: product.model || '',
                sku: product.sku || '',
                barcode: product.barcode || '',
                categoryId: product.categoryId || 0,
                costPrice: product.costPrice || 0,
                sellingPrice: product.sellingPrice || 0,
                promotionalPrice: product.promotionalPrice || 0,
                stockQuantity: product.stockQuantity || 0,
                minStockLevel: product.minStockQuantity || 5,
                maxStockLevel: product.maxStockLevel || 100,
                weight: product.weightKg || 0,
                dimensions: dimensionsStr,
                color: product.color || '',
                size: product.size || '',
                material: product.material || '',
                featured: product.featured || false,
                status: product.status || 'AVAILABLE'
            });

            // Load images
            if (product.images && Array.isArray(product.images)) {
                const loadedImages: ImageItem[] = product.images.map((img: any, index: number) => ({
                    imageUrl: img.imageUrl || '',
                    imageName: img.imageName || '',
                    isPrimary: img.isPrimary || false,
                    sortOrder: img.sortOrder !== undefined ? img.sortOrder : index,
                    altText: img.altText || formData.name
                }));
                setImages(loadedImages);
            } else {
                setImages([]);
            }
        } catch (err) {
            console.error('Error loading product:', err);
            showNotification('error', 'Erro ao carregar produto');
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check limit
        if (images.length >= 5) {
            showNotification('error', 'Máximo de 5 imagens por produto');
            return;
        }

        try {
            setUploading(true);
            const response = await uploadAPI.upload(file);
            const relativeUrl = response.data.data;
            const baseUrl = '';
            const fullUrl = baseUrl + relativeUrl;

            // Add to images array
            const newImage: ImageItem = {
                imageUrl: fullUrl,
                imageName: relativeUrl.split('/').pop() || file.name,
                isPrimary: images.length === 0, // First image is primary
                sortOrder: images.length,
                altText: formData.name || 'Produto'
            };

            setImages([...images, newImage]);
            setCurrentImageUrl('');
            showNotification('success', 'Imagem carregada com sucesso!');
        } catch (err) {
            console.error('Error uploading file:', err);
            showNotification('error', 'Erro ao fazer upload da imagem');
        } finally {
            setUploading(false);
        }
    };

    // Handle drag & drop images
    const handleImagesSelected = async (files: File[]) => {
        const totalImages = images.length + files.length;
        if (totalImages > 5) {
            showNotification('error', `Máximo de 5 imagens. Você tem ${images.length}, tentando adicionar ${files.length}.`);
            return;
        }

        try {
            setUploading(true);
            const baseUrl = '';
            const newImages: ImageItem[] = [];

            for (const file of files) {
                const response = await uploadAPI.upload(file);
                const relativeUrl = response.data.data;
                const fullUrl = baseUrl + relativeUrl;

                newImages.push({
                    imageUrl: fullUrl,
                    imageName: relativeUrl.split('/').pop() || file.name,
                    isPrimary: images.length + newImages.length === 0,
                    sortOrder: images.length + newImages.length,
                    altText: formData.name || 'Produto'
                });
            }

            setImages([...images, ...newImages]);
            showNotification('success', `${newImages.length} imagem(ns) carregada(s) com sucesso!`);
        } catch (err) {
            console.error('Error uploading files:', err);
            showNotification('error', 'Erro ao fazer upload das imagens');
        } finally {
            setUploading(false);
        }
    };

    // Add image from URL
    const handleAddImageFromUrl = () => {
        if (!currentImageUrl.trim()) {
            showNotification('error', 'Digite uma URL válida');
            return;
        }

        if (images.length >= 5) {
            showNotification('error', 'Máximo de 5 imagens por produto');
            return;
        }

        const newImage: ImageItem = {
            imageUrl: currentImageUrl.trim(),
            imageName: currentImageUrl.split('/').pop() || 'image.jpg',
            isPrimary: images.length === 0,
            sortOrder: images.length,
            altText: formData.name || 'Produto'
        };

        setImages([...images, newImage]);
        setCurrentImageUrl('');
        showNotification('success', 'Imagem adicionada!');
    };

    // Remove image
    const handleRemoveImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);

        // Reajustar sortOrder
        const reorderedImages = newImages.map((img, i) => ({
            ...img,
            sortOrder: i,
            isPrimary: i === 0 ? true : img.isPrimary // Se remover a primeira, a próxima vira primary
        }));

        setImages(reorderedImages);
    };

    // Set primary image
    const handleSetPrimary = (index: number) => {
        const newImages = images.map((img, i) => ({
            ...img,
            isPrimary: i === index
        }));
        setImages(newImages);
    };

    // Move image up/down
    const handleMoveImage = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === images.length - 1) return;

        const newImages = [...images];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];

        // Reajustar sortOrder
        const reorderedImages = newImages.map((img, i) => ({
            ...img,
            sortOrder: i
        }));

        setImages(reorderedImages);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            showNotification('error', 'Nome do produto é obrigatório');
            return;
        }

        if (!formData.categoryId || formData.categoryId === '' || formData.categoryId === 0) {
            showNotification('error', 'Categoria é obrigatória');
            return;
        }

        if (formData.sellingPrice <= 0) {
            showNotification('error', 'Preço de venda deve ser maior que zero');
            return;
        }

        try {
            setLoading(true);

            // Prepare data for API
            const dataToSend: any = {
                name: formData.name,
                description: formData.description || undefined,
                brand: formData.brand || undefined,
                model: formData.model || undefined,
                sku: formData.sku || undefined,
                barcode: formData.barcode || undefined,
                categoryId: typeof formData.categoryId === 'string'
                    ? parseInt(formData.categoryId, 10)
                    : formData.categoryId,
                sellingPrice: formData.sellingPrice,
                status: formData.status,
                featured: formData.featured,
                color: formData.color || undefined,
                size: formData.size || undefined,
                material: formData.material || undefined
            };

            // Add optional numeric fields only if > 0
            if (formData.costPrice > 0) {
                dataToSend.costPrice = formData.costPrice;
            }

            if (formData.promotionalPrice > 0) {
                dataToSend.promotionalPrice = formData.promotionalPrice;
            }

            if (formData.stockQuantity > 0) {
                dataToSend.stockQuantity = formData.stockQuantity;
            }

            if (formData.minStockLevel > 0) {
                dataToSend.minStockLevel = formData.minStockLevel;
            }

            if (formData.maxStockLevel > 0) {
                dataToSend.maxStockLevel = formData.maxStockLevel;
            }

            if (formData.weight > 0) {
                dataToSend.weight = formData.weight;
            }

            // Validate categoryId conversion
            if (!dataToSend.categoryId || isNaN(dataToSend.categoryId)) {
                showNotification('error', 'Categoria inválida');
                setLoading(false);
                return;
            }

            // Handle dimensions field
            if (formData.dimensions && formData.dimensions.trim() !== '') {
                const parts = formData.dimensions.split('x').map(p => p.trim());
                if (parts.length >= 2) {
                    dataToSend.dimensions = {
                        length: parseFloat(parts[0]) || 0,
                        width: parseFloat(parts[1]) || 0,
                        height: parts.length > 2 ? parseFloat(parts[2]) || 0 : 0
                    };
                }
            }


            // Add images
            if (images.length > 0) {
                console.log('Adding images to product:', images.length);
                dataToSend.images = images.map(img => ({
                    imageUrl: img.imageUrl,
                    imageName: img.imageName,
                    isPrimary: img.isPrimary,
                    sortOrder: img.sortOrder,
                    altText: img.altText || formData.name
                }));
                console.log('Images array:', dataToSend.images);
            } else {
                console.log('No images provided');
            }

            console.log('Data being sent to API:', JSON.stringify(dataToSend, null, 2));

            if (productId) {
                await productsAPI.update(productId, dataToSend);
                showNotification('success', 'Produto atualizado com sucesso!');
            } else {
                await productsAPI.create(dataToSend);
                showNotification('success', 'Produto criado com sucesso!');
            }

            onSuccess();
        } catch (err: any) {
            console.error('Error saving product:', err);
            const errorMsg = err.response?.data?.message || 'Erro ao salvar produto';
            showNotification('error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="product-form-container">
            <div className="form-header">
                <h2>{productId ? '✏️ Editar Produto' : '➕ Novo Produto'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
                <div className="form-section">
                    <h3>📝 Informações Básicas</h3>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label htmlFor="name">Nome do Produto *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Ex: Camiseta Básica Algodão"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="description">Descrição</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Descrição detalhada do produto..."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="brand">Marca</label>
                            <input
                                type="text"
                                id="brand"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                placeholder="Ex: Nike"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="model">Modelo</label>
                            <input
                                type="text"
                                id="model"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                placeholder="Ex: Slim Fit"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="categoryId">Categoria *</label>
                            <select
                                id="categoryId"
                                name="categoryId"
                                value={formData.categoryId || ''}
                                onChange={handleChange}
                                required
                            >
                                <option key="empty" value="">Selecione...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="AVAILABLE">Disponível</option>
                                <option value="OUT_OF_STOCK">Sem Estoque</option>
                                <option value="PENDING_APPROVAL">Pendente</option>
                                <option value="INACTIVE">Inativo</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>🏷️ Códigos e Identificação</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="sku">SKU</label>
                            <input
                                type="text"
                                id="sku"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                placeholder="Ex: CAM-BAS-001"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="barcode">Código de Barras</label>
                            <input
                                type="text"
                                id="barcode"
                                name="barcode"
                                value={formData.barcode}
                                onChange={handleChange}
                                placeholder="Ex: 7891234567890"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>💰 Preços</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="costPrice">Preço de Custo (R$)</label>
                            <input
                                type="number"
                                id="costPrice"
                                name="costPrice"
                                value={formData.costPrice}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="sellingPrice">Preço de Venda (R$) *</label>
                            <input
                                type="number"
                                id="sellingPrice"
                                name="sellingPrice"
                                value={formData.sellingPrice}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                required
                                placeholder="0.00"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="promotionalPrice">Preço Promocional (R$)</label>
                            <input
                                type="number"
                                id="promotionalPrice"
                                name="promotionalPrice"
                                value={formData.promotionalPrice}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>📦 Estoque</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="stockQuantity">Quantidade em Estoque</label>
                            <input
                                type="number"
                                id="stockQuantity"
                                name="stockQuantity"
                                value={formData.stockQuantity}
                                onChange={handleChange}
                                min="0"
                                placeholder="0"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="minStockLevel">Estoque Mínimo</label>
                            <input
                                type="number"
                                id="minStockLevel"
                                name="minStockLevel"
                                value={formData.minStockLevel}
                                onChange={handleChange}
                                min="0"
                                placeholder="5"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="maxStockLevel">Estoque Máximo</label>
                            <input
                                type="number"
                                id="maxStockLevel"
                                name="maxStockLevel"
                                value={formData.maxStockLevel}
                                onChange={handleChange}
                                min="0"
                                placeholder="100"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>📏 Características</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="color">Cor</label>
                            <input
                                type="text"
                                id="color"
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                                placeholder="Ex: Azul Marinho"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="size">Tamanho</label>
                            <input
                                type="text"
                                id="size"
                                name="size"
                                value={formData.size}
                                onChange={handleChange}
                                placeholder="Ex: M, G, 42"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="material">Material</label>
                            <input
                                type="text"
                                id="material"
                                name="material"
                                value={formData.material}
                                onChange={handleChange}
                                placeholder="Ex: 100% Algodão"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="weight">Peso (kg)</label>
                            <input
                                type="number"
                                id="weight"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                step="0.001"
                                min="0"
                                placeholder="0.000"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="dimensions">Dimensões (LxAxP cm)</label>
                            <input
                                type="text"
                                id="dimensions"
                                name="dimensions"
                                value={formData.dimensions}
                                onChange={handleChange}
                                placeholder="Ex: 30x40x5"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="imageUrl">🖼️ Imagens do Produto</label>

                            {/* Drag & Drop Upload */}
                            <ImageUploadDragDrop
                                onImagesSelected={handleImagesSelected}
                                maxFiles={5 - images.length}
                                maxSizeMB={5}
                            />

                            {/* URL Input */}
                            <div className="image-url-section" style={{ marginTop: '1rem' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                                    Ou adicione por URL:
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        id="imageUrl"
                                        value={currentImageUrl}
                                        onChange={(e) => setCurrentImageUrl(e.target.value)}
                                        placeholder="Cole a URL da imagem"
                                        className="image-url-input"
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        className="btn-add-url"
                                        onClick={handleAddImageFromUrl}
                                        disabled={images.length >= 5 || !currentImageUrl.trim()}
                                        style={{
                                            padding: '0.6rem 1rem',
                                            background: '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: images.length >= 5 || !currentImageUrl.trim() ? 'not-allowed' : 'pointer',
                                            opacity: images.length >= 5 || !currentImageUrl.trim() ? 0.6 : 1,
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        ➕ Adicionar
                                    </button>
                                </div>
                            </div>

                            {/* Images Grid */}
                            {images.length > 0 && (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    background: '#f5f5f5',
                                    borderRadius: '6px',
                                    border: '1px solid #e0e0e0'
                                }}>
                                    <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block' }}>
                                        Imagens Adicionadas ({images.length}/5):
                                    </label>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                        gap: '0.75rem'
                                    }}>
                                        {images.map((img, index) => (
                                            <div key={index} style={{
                                                position: 'relative',
                                                border: '2px solid #ddd',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                background: 'white',
                                                transition: 'all 0.2s ease'
                                            }}>
                                                <img
                                                    src={img.imageUrl}
                                                    alt={img.altText}
                                                    style={{
                                                        width: '100%',
                                                        height: '120px',
                                                        objectFit: 'cover',
                                                        display: 'block'
                                                    }}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120"%3E%3Crect fill="%23f88" width="120" height="120"/%3E%3Ctext fill="%23fff" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EErro%3C/text%3E%3C/svg%3E';
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '5px',
                                                        right: '5px',
                                                        background: 'rgba(255, 0, 0, 0.8)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '25px',
                                                        height: '25px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: 0
                                                    }}
                                                    title="Remover"
                                                >
                                                    ×
                                                </button>
                                                {img.isPrimary && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '5px',
                                                        left: '5px',
                                                        background: 'rgba(0, 123, 255, 0.8)',
                                                        color: 'white',
                                                        padding: '2px 6px',
                                                        borderRadius: '3px',
                                                        fontSize: '10px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        PRINCIPAL
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Old Preview - Hidden */}
                            {images.length > 0 && false && (
                                <div className="image-preview-section">
                                    <label>Visualização:</label>
                                    <div className="preview-box">
                                        <img src={images[0].imageUrl} alt="Preview do produto" onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f88" width="200" height="200"/%3E%3Ctext fill="%23fff" font-family="sans-serif" font-size="16" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EErro%3C/text%3E%3C/svg%3E';
                                        }} />
                                        <button
                                            type="button"
                                            className="btn-remove-preview"
                                            onClick={() => handleRemoveImage(0)}
                                            title="Remover imagem"
                                        >
                                            🗑️ Remover
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>⭐ Destaque</h3>
                    <div className="form-checkbox">
                        <input
                            type="checkbox"
                            id="featured"
                            name="featured"
                            checked={formData.featured}
                            onChange={handleChange}
                        />
                        <label htmlFor="featured">Produto em destaque na página inicial</label>
                    </div>
                </div>

                {/* Variant Grid removed - now accessible via dedicated page (📊 Grid button in product list) */}

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
                        {loading ? 'Salvando...' : productId ? 'Atualizar Produto' : 'Criar Produto'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProductForm;
