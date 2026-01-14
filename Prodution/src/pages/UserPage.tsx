import { useState, useEffect } from 'react';
import type { User } from '../types/user';
import { UserStatus } from '../types/user';
import { userService, type PaginatedResponse } from '../services/userService';
import UserForm from '../components/forms/UserForm';
import './UserPage.css';

const UserPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response: PaginatedResponse<User> = await userService.getAllUsers();
            setUsers(response.content);
            setError(null);
        } catch (err) {
            setError('Erro ao carregar usuários');
            console.error('Erro ao carregar usuários:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = () => {
        setEditingUser(null);
        setShowForm(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setShowForm(true);
    };

    const handleDeleteUser = async (user: User) => {
        if (window.confirm(`Tem certeza que deseja remover o usuário "${user.fullName}"?`)) {
            try {
                await userService.deleteUser(user.id);
                await loadUsers();
            } catch (err) {
                setError('Erro ao remover usuário');
                console.error('Erro ao remover usuário:', err);
            }
        }
    };

    const handleBlockUser = async (user: User) => {
        if (window.confirm(`Tem certeza que deseja bloquear o usuário "${user.fullName}"?`)) {
            try {
                await userService.blockUser(user.id);
                await loadUsers();
            } catch (err) {
                setError('Erro ao bloquear usuário');
                console.error('Erro ao bloquear usuário:', err);
            }
        }
    };

    const handleUnblockUser = async (user: User) => {
        if (window.confirm(`Tem certeza que deseja desbloquear o usuário "${user.fullName}"?`)) {
            try {
                await userService.unblockUser(user.id);
                await loadUsers();
            } catch (err) {
                setError('Erro ao desbloquear usuário');
                console.error('Erro ao desbloquear usuário:', err);
            }
        }
    };

    const handleFormSubmit = async () => {
        setShowForm(false);
        await loadUsers();
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingUser(null);
    };

    const getStatusBadge = (status: UserStatus) => {
        const statusClasses = {
            [UserStatus.ACTIVE]: 'status-active',
            [UserStatus.INACTIVE]: 'status-inactive',
            [UserStatus.BLOCKED]: 'status-blocked',
        };

        const statusLabels = {
            [UserStatus.ACTIVE]: 'Ativo',
            [UserStatus.INACTIVE]: 'Inativo',
            [UserStatus.BLOCKED]: 'Bloqueado',
        };

        return (
            <span className={`status-badge ${statusClasses[status]}`}>
                {statusLabels[status]}
            </span>
        );
    };

    if (showForm) {
        return (
            <UserForm
                user={editingUser}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
            />
        );
    }

    return (
        <div className="user-page">
            <div className="page-header">
                <h1>Gerenciamento de Usuários</h1>
                <button className="btn-primary" onClick={handleCreateUser}>
                    + Novo Usuário
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <span>Carregando usuários...</span>
                </div>
            ) : users.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">👥</span>
                    <p>Nenhum usuário encontrado</p>
                    <button className="btn-secondary" onClick={handleCreateUser}>
                        Criar primeiro usuário
                    </button>
                </div>
            ) : (
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Nome Completo</th>
                                <th>Username</th>
                                <th>E-mail</th>
                                <th>Status</th>
                                <th>Admin Sistema</th>
                                <th>Último Login</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.fullName}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email || '-'}</td>
                                    <td>{getStatusBadge(user.status)}</td>
                                    <td>
                                        <span className={`admin-badge ${user.systemAdmin ? 'admin-yes' : 'admin-no'}`}>
                                            {user.systemAdmin ? 'Sim' : 'Não'}
                                        </span>
                                    </td>
                                    <td>
                                        {user.lastLoginAt
                                            ? new Date(user.lastLoginAt).toLocaleString('pt-BR')
                                            : 'Nunca'}
                                    </td>
                                    <td className="actions-cell">
                                        <div className="actions-buttons">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEditUser(user)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            {user.status === UserStatus.BLOCKED ? (
                                                <button
                                                    className="btn-success"
                                                    onClick={() => handleUnblockUser(user)}
                                                    title="Desbloquear"
                                                >
                                                    🔓
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn-deactivate"
                                                    onClick={() => handleBlockUser(user)}
                                                    title="Bloquear"
                                                >
                                                    🔒
                                                </button>
                                            )}
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDeleteUser(user)}
                                                title="Excluir"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserPage;
