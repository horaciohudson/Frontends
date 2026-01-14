import { useState, useEffect } from 'react';
import { stockAPI, productsAPI } from '../../services/api';
import type { Stock, StockFormData } from '../../types/stock';
import './StockForm.css';

interface StockFormProps {
    stockId?: number;
    onSuccess: () => void;
    onCancel: () => void;
}

function StockForm({ stockId, onSuccess, onCancel }: StockFormProps) {
    const [formData, setFormData] = useState<StockFormData>({
        productId: 0,
        quantity: 0,
        minQuantity: 0,
        maxQuantity: undefined,
        location: '',
    });
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProducts();
        if (stockId) {
            loadStock();
        }
    }, [stockId]);

    const loadProducts = async () => {
        try {
            console.log('Loading products...');
            const response = await productsAPI.getAll(0, 1000);
            console.log('Products API full response:', response);
            console.log('Products API data:', response.data);
            console.log('Products API data.data:', response.data.data);
            
            const productsList = response.data.data?.content || [];
            console.log('Products list extracted:', productsList);
            console.log('Number of products:', productsList.length);
            
            if (productsList.length === 0) {
                console.warn('No products found in the response');
            }
            
            setProducts(productsList);
        } catch (err) {
            console.error('Error loading products:', err);
            console.error('Error details:', err.response?.data);
        }
    };

    const loadStock = async () => {
        if (!stockId) return;

        try {
            setLoading(true);
            const response = await stockAPI.getById(stockId);
            const stock: Stock = response.data;
            
            setFormData({
                productId: stock.productId,
                quantity: stock.quantity,
                minQuantity: stock.minQuantity,
                maxQuantity: stock.maxQuantity,
                location: stock.location || '',
            });
        } catch (err) {
            console.error('Error loading stock:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            
            if (stockId) {
                await stockAPI.update(stockId, formData);
            } else {
                await stockAPI.create(formData);
            }
            
            onSuccess();
        } catch (err: any) {
            console.error('Error saving stock:', err);
            alert(err.response?.data?.message || 'Erro ao salvar estoque');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="stock-form">
            <div className="form-header">
                <h2>{stockId ? '✏️ Editar Estoque' : '➕ Novo Item de Estoque'}</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="productId">Produto *</label>
                    <select
                        id="productId"
                        name="productId"
                        value={formData.productId}
                        onChange={handleChange}
                        required
                        disabled={!!stockId}
                    >
                        <option value="">Selecione um produto... ({products.length} produtos disponíveis)</option>
                        {products.map(product => (
                            <option key={product.id} value={product.id}>
                                {product.name} (ID: {product.id})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="quantity">Quantidade *</label>
                        <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            min="0"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="minQuantity">Quantidade Mínima *</label>
                        <input
                            type="number"
                            id="minQuantity"
                            name="minQuantity"
                            value={formData.minQuantity}
                            onChange={handleChange}
                            min="0"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="maxQuantity">Quantidade Máxima</label>
                        <input
                            type="number"
                            id="maxQuantity"
                            name="maxQuantity"
                            value={formData.maxQuantity || ''}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="location">Localização</label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Ex: Prateleira A1, Depósito 2"
                    />
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Salvando...' : stockId ? 'Atualizar' : 'Criar'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default StockForm;
