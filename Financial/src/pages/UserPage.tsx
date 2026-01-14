import React, { useState, useEffect } from 'react';
import type { User } from '../types/User';
import { UserStatus } from '../types/User';
import { userService, type PaginatedResponse } from '../services/userService';
import DataTable from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import UserForm from '../components/forms/user/UserForm';
import '../styles/pages/UserPage.css';

const UserPage: React.FC = () => {
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

  const columns = [
    {
      key: 'fullName',
      header: 'Nome Completo',
    },
    {
      key: 'username',
      header: 'Username',
    },
    {
      key: 'email',
      header: 'E-mail',
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, user: User) => getStatusBadge(user.status),
    },
    {
      key: 'systemAdmin',
      header: 'Admin Sistema',
      render: (_: any, user: User) => (
        <span className={`admin-badge ${user.systemAdmin ? 'admin-yes' : 'admin-no'}`}>
          {user.systemAdmin ? 'Sim' : 'Não'}
        </span>
      ),
    },
    {
      key: 'lastLoginAt',
      header: 'Último Login',
      render: (_: any, user: User) => 
        user.lastLoginAt 
          ? new Date(user.lastLoginAt).toLocaleString('pt-BR')
          : 'Nunca',
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (_: any, user: User) => (
        <div className="action-buttons">
          <Button
            variant="secondary"
            size="small"
            onClick={() => handleEditUser(user)}
          >
            Editar
          </Button>
          {user.status === UserStatus.BLOCKED ? (
            <Button
              variant="success"
              size="small"
              onClick={() => handleUnblockUser(user)}
            >
              Desbloquear
            </Button>
          ) : (
            <Button
              variant="danger"
              size="small"
              onClick={() => handleBlockUser(user)}
            >
              Bloquear
            </Button>
          )}
          <Button
            variant="danger"
            size="small"
            onClick={() => handleDeleteUser(user)}
          >
            Excluir
          </Button>
        </div>
      ),
    },
  ];

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
        <Button variant="primary" onClick={handleCreateUser}>
          Novo Usuário
        </Button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="page-content">
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default UserPage;