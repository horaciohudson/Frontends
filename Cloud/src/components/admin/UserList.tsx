import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import './UserList.css';

interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    isVerified: boolean;
    roles: string[];
    createdAt: string;
}

interface UserListProps {
    onEdit?: (id: number) => void;
    onCreateNew?: () => void;
}

function UserList({ onEdit, onCreateNew }: UserListProps) {
    const { showNotification } = useNotification();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await usersAPI.getAll();
            // Backend returns List<UserDTO> directly, not paginated
            const data = response.data;
            setUsers(data || []);
        } catch (err: any) {
            console.error('Error loading users:', err);
            setError('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id: number) => {
        try {
            await usersAPI.toggleActive(id);
            showNotification('success', 'Status do usuário atualizado!');
            loadUsers();
        } catch (err: any) {
            console.error('Error toggling user status:', err);
            showNotification('error', 'Erro ao atualizar status do usuário');
        }
    };

    const handleDelete = async (id: number, username: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir o usuário "${username}"?`)) {
            return;
        }

        try {
            await usersAPI.delete(id);
            showNotification('success', 'Usuário excluído com sucesso!');
            loadUsers();
        } catch (err: any) {
            console.error('Error deleting user:', err);
            const errorMsg = err.response?.data?.message || 'Erro ao excluir usuário';
            showNotification('error', errorMsg);
        }
    };

    const getRoleBadge = (roles: string[]) => {
        if (roles.includes('ROLE_ADMIN')) {
            return <span className="role-badge role-admin">Admin</span>;
        } else if (roles.includes('ROLE_SELLER')) {
            return <span className="role-badge role-seller">Vendedor</span>;
        } else if (roles.includes('ROLE_REVENDA')) {
            return <span className="role-badge role-revenda">Revenda</span>;
        } else {
            return <span className="role-badge role-customer">Cliente</span>;
        }
    };

    if (loading && users.length === 0) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="admin-user-list">
            <div className="list-header">
                <div>
                    <h2>👥 Gerenciar Usuários</h2>
                    <p className="list-subtitle">
                        {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button className="btn-primary" onClick={onCreateNew}>
                    ➕ Novo Usuário
                </button>
            </div>

            {error && <ErrorMessage message={error} onClose={() => setError('')} />}

            {loading ? (
                <LoadingSpinner />
            ) : users.length === 0 ? (
                <div className="empty-state">
                    <p>📭 Nenhum usuário encontrado</p>
                </div>
            ) : (
                <>
                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>Username</th>
                                    <th>Perfil</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>#{user.id}</td>
                                        <td className="user-name-cell">
                                            <strong>{user.firstName} {user.lastName}</strong>
                                            {user.isVerified && <span className="verified-badge">✓</span>}
                                        </td>
                                        <td>{user.email}</td>
                                        <td>@{user.username}</td>
                                        <td>{getRoleBadge(user.roles)}</td>
                                        <td>
                                            <button
                                                className={`status-toggle ${user.isActive ? 'active' : 'inactive'}`}
                                                onClick={() => handleToggleActive(user.id)}
                                                title={user.isActive ? 'Desativar' : 'Ativar'}
                                            >
                                                {user.isActive ? '✓ Ativo' : '✕ Inativo'}
                                            </button>
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                className="btn-icon btn-edit"
                                                onClick={() => onEdit?.(user.id)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-icon btn-delete"
                                                onClick={() => handleDelete(user.id, user.username)}
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
                </>
            )}
        </div>
    );
}

export default UserList;
