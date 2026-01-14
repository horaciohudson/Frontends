import { useState, useEffect } from 'react';
import { categoriesAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../common/LoadingSpinner';
import './CategoryForm.css';

interface Category {
    id: number;
    name: string;
}

interface CategoryFormProps {
    categoryId?: number;
    onSuccess: () => void;
    onCancel: () => void;
}

interface CategoryFormData {
    name: string;
    description: string;
    parentId: number | null;
}

function CategoryForm({ categoryId, onSuccess, onCancel }: CategoryFormProps) {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(!!categoryId);
    const [categories, setCategories] = useState<Category[]>([]);

    const [formData, setFormData] = useState<CategoryFormData>({
        name: '',
        description: '',
        parentId: null
    });

    useEffect(() => {
        loadCategories();
        if (categoryId) {
            loadCategory();
        }
    }, [categoryId]);

    const loadCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            const allCategories = response.data.data || [];
            // Filter out current category to prevent self-reference
            const filteredCategories = categoryId
                ? allCategories.filter((cat: Category) => cat.id !== categoryId)
                : allCategories;
            setCategories(filteredCategories);
        } catch (err) {
            console.error('Error loading categories:', err);
            showNotification('error', 'Erro ao carregar categorias');
        }
    };

    const loadCategory = async () => {
        if (!categoryId) return;

        try {
            setLoadingData(true);
            const response = await categoriesAPI.getById(categoryId);
            const category = response.data.data;

            setFormData({
                name: category.name || '',
                description: category.description || '',
                parentId: category.parentId || null
            });
        } catch (err) {
            console.error('Error loading category:', err);
            showNotification('error', 'Erro ao carregar categoria');
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'parentId') {
            setFormData(prev => ({
                ...prev,
                [name]: value ? parseInt(value) : null
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            showNotification('error', 'Nome da categoria é obrigatório');
            return;
        }

        try {
            setLoading(true);

            const payload = {
                ...formData,
                parentId: formData.parentId || undefined
            };

            if (categoryId) {
                await categoriesAPI.update(categoryId, payload);
                showNotification('success', 'Categoria atualizada com sucesso!');
            } else {
                await categoriesAPI.create(payload);
                showNotification('success', 'Categoria criada com sucesso!');
            }

            onSuccess();
        } catch (err: any) {
            console.error('Error saving category:', err);
            const errorMsg = err.response?.data?.message || 'Erro ao salvar categoria';
            showNotification('error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="category-form-container">
            <div className="form-header">
                <h2>{categoryId ? '✏️ Editar Categoria' : '➕ Nova Categoria'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="category-form">
                <div className="form-section">
                    <div className="form-group">
                        <label htmlFor="name">Nome da Categoria *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Ex: Camisetas, Calças, Acessórios"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Descrição</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Descrição da categoria..."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="parentId">Categoria Pai (opcional)</label>
                        <select
                            id="parentId"
                            name="parentId"
                            value={formData.parentId || ''}
                            onChange={handleChange}
                        >
                            <option key="empty" value="">Nenhuma (Categoria Raiz)</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <small className="form-hint">
                            Selecione uma categoria pai para criar uma subcategoria
                        </small>
                    </div>
                </div>

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
                        {loading ? 'Salvando...' : categoryId ? 'Atualizar Categoria' : 'Criar Categoria'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CategoryForm;
