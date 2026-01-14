import { useState, useEffect } from 'react';
import { sizesAPI } from '../../services/api';
import type { Size } from '../../types/size';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import './SizeList.css';

interface SizeListProps {
    onEdit?: (sizeId: number) => void;
    onCreateNew?: () => void;
}

function SizeList({ onEdit, onCreateNew }: SizeListProps) {
    const { showNotification } = useNotification();
    const [sizes, setSizes] = useState<Size[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadSizes();
    }, []);

    const loadSizes = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await sizesAPI.getAll();
            setSizes(response.data.data || []);
        } catch (err: any) {
            console.error('Error loading sizes:', err);
            setError('Erro ao carregar tamanhos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (sizeId: number, sizeName: string) => {
        if (!window.confirm(`Tem certeza que deseja desativar o tamanho "${sizeName}"?`)) {
            return;
        }

        try {
            await sizesAPI.delete(sizeId);
            showNotification('success', 'Tamanho desativado com sucesso!');
            loadSizes();
        } catch (err: any) {
            console.error('Error deleting size:', err);
            const errorMsg = err.response?.data?.message || 'Erro ao desativar tamanho';
            showNotification('error', errorMsg);
        }
    };

    const handleToggleActive = async (sizeId: number) => {
        try {
            await sizesAPI.toggleActive(sizeId);
            showNotification('success', 'Status atualizado com sucesso!');
            loadSizes();
        } catch (err: any) {
            console.error('Error toggling size:', err);
            showNotification('error', 'Erro ao atualizar status');
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="admin-size-list">
            <div className="list-header">
                <div>
                    <h2>📏 Gerenciar Tamanhos</h2>
                    <p className="list-subtitle">
                        {sizes.length} tamanho{sizes.length !== 1 ? 's' : ''} cadastrado{sizes.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button className="btn-primary" onClick={onCreateNew}>
                    ➕ Novo Tamanho
                </button>
            </div>

            {error && <ErrorMessage message={error} onClose={() => setError('')} />}

            {sizes.length === 0 ? (
                <div className="empty-state">
                    <p>📭 Nenhum tamanho cadastrado</p>
                    <button className="btn-primary" onClick={onCreateNew}>
                        Criar primeiro tamanho
                    </button>
                </div>
            ) : (
                <div className="sizes-table-container">
                    <table className="sizes-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Descrição</th>
                                <th>Ordem</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sizes.map((size) => (
                                <tr key={size.id} className={!size.active ? 'inactive-row' : ''}>
                                    <td className="size-name-cell">
                                        <strong>{size.sizeName}</strong>
                                    </td>
                                    <td>{size.description || '-'}</td>
                                    <td>{size.displayOrder}</td>
                                    <td>
                                        <span className={`status-badge ${size.active ? 'active' : 'inactive'}`}>
                                            {size.active ? '✓ Ativo' : '✗ Inativo'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn-icon btn-edit"
                                            onClick={() => onEdit?.(size.id)}
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className={`btn-icon ${size.active ? 'btn-toggle' : 'btn-activate'}`}
                                            onClick={() => handleToggleActive(size.id)}
                                            title={size.active ? 'Desativar' : 'Ativar'}
                                        >
                                            {size.active ? '🔒' : '🔓'}
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

export default SizeList;
