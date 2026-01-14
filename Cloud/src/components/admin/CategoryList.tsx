import { useState, useEffect } from 'react';
import { categoriesAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import './CategoryList.css';

interface Category {
    id: number;
    name: string;
    description?: string;
    parentId?: number;
    parentName?: string;
}

interface CategoryListProps {
    onEdit?: (categoryId: number) => void;
    onCreateNew?: () => void;
}

function CategoryList({ onEdit, onCreateNew }: CategoryListProps) {
    const { showNotification } = useNotification();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await categoriesAPI.getAll();
            setCategories(response.data.data || []);
        } catch (err: any) {
            console.error('Error loading categories:', err);
            setError('Erro ao carregar categorias');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (categoryId: number, categoryName: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"?`)) {
            return;
        }

        try {
            await categoriesAPI.delete(categoryId);
            showNotification('success', 'Categoria excluída com sucesso!');
            loadCategories();
        } catch (err: any) {
            console.error('Error deleting category:', err);
            const errorMsg = err.response?.data?.message || 'Erro ao excluir categoria';
            showNotification('error', errorMsg);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="admin-category-list">
            <div className="list-header">
                <div>
                    <h2>📂 Gerenciar Categorias</h2>
                    <p className="list-subtitle">
                        {categories.length} categoria{categories.length !== 1 ? 's' : ''} cadastrada{categories.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button className="btn-primary" onClick={onCreateNew}>
                    ➕ Nova Categoria
                </button>
            </div>

            {error && <ErrorMessage message={error} onClose={() => setError('')} />}

            {categories.length === 0 ? (
                <div className="empty-state">
                    <p>📭 Nenhuma categoria cadastrada</p>
                    <button className="btn-primary" onClick={onCreateNew}>
                        Criar primeira categoria
                    </button>
                </div>
            ) : (
                <div className="categories-table-container">
                    <table className="categories-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Descrição</th>
                                <th>Categoria Pai</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.id}>
                                    <td>#{category.id}</td>
                                    <td className="category-name-cell">
                                        <strong>{category.name}</strong>
                                    </td>
                                    <td>{category.description || '-'}</td>
                                    <td>
                                        {category.parentName ? (
                                            <span className="parent-tag">{category.parentName}</span>
                                        ) : (
                                            <span className="root-tag">Categoria Raiz</span>
                                        )}
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn-icon btn-edit"
                                            onClick={() => onEdit?.(category.id)}
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn-icon btn-delete"
                                            onClick={() => handleDelete(category.id, category.name)}
                                            title="Excluir"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default CategoryList;
