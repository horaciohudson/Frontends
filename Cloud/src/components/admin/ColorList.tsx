import { useState, useEffect } from 'react';
import { colorsAPI } from '../../services/api';
import type { Color } from '../../types/color';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import './ColorList.css';

interface ColorListProps {
    onEdit?: (colorId: number) => void;
    onCreateNew?: () => void;
}

function ColorList({ onEdit, onCreateNew }: ColorListProps) {
    const { showNotification } = useNotification();
    const [colors, setColors] = useState<Color[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadColors();
    }, []);

    const loadColors = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await colorsAPI.getAll();
            setColors(response.data.data || []);
        } catch (err: any) {
            console.error('Error loading colors:', err);
            setError('Erro ao carregar cores');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (colorId: number, colorName: string) => {
        if (!window.confirm(`Tem certeza que deseja desativar a cor "${colorName}"?`)) {
            return;
        }

        try {
            await colorsAPI.delete(colorId);
            showNotification('success', 'Cor desativada com sucesso!');
            loadColors();
        } catch (err: any) {
            console.error('Error deleting color:', err);
            const errorMsg = err.response?.data?.message || 'Erro ao desativar cor';
            showNotification('error', errorMsg);
        }
    };

    const handleToggleActive = async (colorId: number) => {
        try {
            await colorsAPI.toggleActive(colorId);
            showNotification('success', 'Status atualizado com sucesso!');
            loadColors();
        } catch (err: any) {
            console.error('Error toggling color:', err);
            showNotification('error', 'Erro ao atualizar status');
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="admin-color-list">
            <div className="list-header">
                <div>
                    <h2>🎨 Gerenciar Cores</h2>
                    <p className="list-subtitle">
                        {colors.length} cor{colors.length !== 1 ? 'es' : ''} cadastrada{colors.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button className="btn-primary" onClick={onCreateNew}>
                    ➕ Nova Cor
                </button>
            </div>

            {error && <ErrorMessage message={error} onClose={() => setError('')} />}

            {colors.length === 0 ? (
                <div className="empty-state">
                    <p>📭 Nenhuma cor cadastrada</p>
                    <button className="btn-primary" onClick={onCreateNew}>
                        Criar primeira cor
                    </button>
                </div>
            ) : (
                <div className="colors-table-container">
                    <table className="colors-table">
                        <thead>
                            <tr>
                                <th>Cor</th>
                                <th>Nome</th>
                                <th>Código Hex</th>
                                <th>Tamanho</th>
                                <th>Ordem</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {colors.map((color) => (
                                <tr key={color.id} className={!color.active ? 'inactive-row' : ''}>
                                    <td>
                                        <div
                                            className="color-preview"
                                            style={{ backgroundColor: color.hexCode || '#ccc' }}
                                            title={color.hexCode || 'Sem cor'}
                                        />
                                    </td>
                                    <td className="color-name-cell">
                                        <strong>{color.colorName}</strong>
                                    </td>
                                    <td>
                                        <code className="hex-code">{color.hexCode || '-'}</code>
                                    </td>
                                    <td>
                                        {color.sizeName ? (
                                            <span className="size-tag">{color.sizeName}</span>
                                        ) : (
                                            <span className="global-tag">Global</span>
                                        )}
                                    </td>
                                    <td>{color.displayOrder}</td>
                                    <td>
                                        <span className={`status-badge ${color.active ? 'active' : 'inactive'}`}>
                                            {color.active ? '✓ Ativo' : '✗ Inativo'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn-icon btn-edit"
                                            onClick={() => onEdit?.(color.id)}
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className={`btn-icon ${color.active ? 'btn-toggle' : 'btn-activate'}`}
                                            onClick={() => handleToggleActive(color.id)}
                                            title={color.active ? 'Desativar' : 'Ativar'}
                                        >
                                            {color.active ? '🔒' : '🔓'}
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

export default ColorList;
