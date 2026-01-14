import React, { useState, useEffect } from 'react';
import { permissionsService, type Permission, type UserPermission } from '../services/permissionsService';
import { userService } from '../services/userService';
import { roleService, type Role } from '../services/roleService';
import { authService } from '../services/authService';
import type { User } from '../types/User';
import { Button } from '../components/ui/Button';
import '../styles/pages/PermissionsPage.css';
import '../styles/pages/RoleSelection.css';

interface PermissionModule {
  id: string;
  name: string;
  icon: string;
  permissions: Permission[];
}

const PermissionsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [hasChanges, setHasChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 PermissionsPage - Iniciando carregamento de dados...');
      console.log('🔍 PermissionsPage - URL base da API:', 'http://localhost:8081/api');
      console.log('🔍 PermissionsPage - Token disponível:', !!authService.getToken());
      console.log('🔍 PermissionsPage - Usuário atual:', authService.getUser());

      // Primeiro tenta carregar usuários
      console.log('📋 PermissionsPage - Carregando usuários...');
      const usersResponse = await userService.getAllUsers();
      console.log('✅ PermissionsPage - Usuários carregados:', usersResponse.content.length, 'usuários');
      setUsers(usersResponse.content);

      // Depois tenta carregar permissões
      console.log('🔑 PermissionsPage - Carregando permissões...');
      const permissionsResponse = await permissionsService.getAllPermissions();
      console.log('✅ PermissionsPage - Permissões carregadas:', permissionsResponse.length, 'permissões');
      setPermissions(permissionsResponse);

      // Carregar roles disponíveis
      console.log('👥 PermissionsPage - Carregando roles...');
      const rolesResponse = await roleService.getAllRoles();
      console.log('✅ PermissionsPage - Roles carregadas:', rolesResponse.length, 'roles');
      setRoles(rolesResponse);

      console.log('🎉 PermissionsPage - Todos os dados carregados com sucesso!');

    } catch (err: any) {
      console.error('❌ PermissionsPage - Erro detalhado ao carregar dados:', err);
      console.error('❌ PermissionsPage - Stack trace:', err.stack);

      // Mensagem de erro mais específica
      let errorMessage = 'Erro ao carregar dados iniciais';

      if (err.message?.includes('403')) {
        errorMessage = 'Acesso negado. Faça login para acessar as permissões.';
      } else if (err.message?.includes('401')) {
        errorMessage = 'Sessão expirada. Faça login novamente.';
      } else if (err.message?.includes('500')) {
        errorMessage = 'Erro interno do servidor. Verifique os logs do backend.';
      } else if (err.message?.includes('cancellation_reason')) {
        errorMessage = 'Erro no banco de dados: coluna cancellation_reason não existe. Verifique o schema do banco.';
      } else if (err.message?.includes('localhost')) {
        errorMessage = 'Erro de conexão com o servidor. Verifique se o backend está rodando na porta 8081.';
      } else if (err.message) {
        errorMessage = `Erro: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPermissions = async (userId: string) => {
    try {
      setLoading(true);
      console.log('Carregando permissões para usuário:', userId);
      const userPerms = await permissionsService.getUserPermissions(userId);
      console.log('Permissões carregadas com sucesso:', userPerms);
      setUserPermissions(userPerms);
      setHasChanges(false);
      setError(null);
    } catch (err: any) {
      console.error('Erro detalhado ao carregar permissões do usuário:', err);

      let errorMessage = 'Erro ao carregar permissões do usuário';

      if (err.message?.includes('401') || err.message?.includes('403')) {
        errorMessage = 'Sessão expirada ou acesso negado. Faça login novamente.';
      } else if (err.message?.includes('404')) {
        errorMessage = 'Usuário não encontrado ou não possui permissões.';
      } else if (err.message?.includes('500')) {
        errorMessage = 'Erro interno do servidor. Verifique se o backend está funcionando.';
      } else if (err.message?.includes('localhost')) {
        errorMessage = 'Erro de conexão. Verifique se o backend está rodando na porta 8081.';
      } else if (err.message) {
        errorMessage = `Erro: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (userId: string) => {
    console.log('handleUserSelect chamado com userId:', userId);
    console.log('Lista de usuários disponível:', users);

    const user = users.find(u => u.id === userId);
    console.log('Usuário encontrado:', user);

    if (user) {
      setSelectedUser(user);
      await loadUserPermissions(userId);

      // Carregar roles do usuário selecionado
      if (user.roles) {
        // Converter nomes de roles para IDs
        const userRoleIds = roles
          .filter(role => user.roles?.includes(role.role))
          .map(role => role.id);
        setSelectedRoles(userRoleIds);
      } else {
        setSelectedRoles([]);
      }
    } else {
      console.warn('Usuário não encontrado para ID:', userId);
    }
  };

  const handleRoleChange = (roleId: number, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, roleId]);
    } else {
      setSelectedRoles(prev => prev.filter(id => id !== roleId));
    }
    setHasChanges(true);
  };

  const togglePermission = (permissionId: number) => {
    console.log('togglePermission chamado para:', permissionId);
    console.log('userPermissions atual:', userPermissions);

    const hasPermission = userPermissions.some(up => up.permissionId === permissionId);
    console.log('Usuário já tem permissão?', hasPermission);

    if (hasPermission) {
      console.log('Removendo permissão...');
      setUserPermissions(prev => {
        const newPermissions = prev.filter(up => up.permissionId !== permissionId);
        console.log('Novas permissões após remoção:', newPermissions);
        return newPermissions;
      });
    } else {
      console.log('Adicionando permissão...');
      const newPermission: UserPermission = {
        userId: selectedUser!.id,
        permissionId: permissionId,
        granted: true,
        grantedAt: new Date(),
        grantedBy: 'current-user' // TODO: Get from auth context
      };
      setUserPermissions(prev => {
        const newPermissions = [...prev, newPermission];
        console.log('Novas permissões após adição:', newPermissions);
        return newPermissions;
      });
    }

    setHasChanges(true);
  };

  const savePermissions = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Obter permissões atuais do usuário para comparar
      const currentPermissions = await permissionsService.getUserPermissions(selectedUser.id);

      // Criar lista de permissões que precisam ser processadas
      const permissionsToProcess: UserPermission[] = [];

      // Verificar permissões que foram concedidas (estão em userPermissions mas não em currentPermissions)
      for (const userPerm of userPermissions) {
        const existsInCurrent = currentPermissions.some(cp => cp.permissionId === userPerm.permissionId);
        if (!existsInCurrent) {
          // Buscar dados completos da permissão
          const permission = permissions.find(p => p.id === userPerm.permissionId);
          if (permission) {
            permissionsToProcess.push({
              ...userPerm,
              granted: true
            });
          }
        }
      }

      // Verificar permissões que foram revogadas (estão em currentPermissions mas não em userPermissions)
      for (const currentPerm of currentPermissions) {
        const existsInUser = userPermissions.some(up => up.permissionId === currentPerm.permissionId);
        if (!existsInUser) {
          permissionsToProcess.push({
            ...currentPerm,
            granted: false
          });
        }
      }

      // Processar as mudanças de permissões se houver alguma
      if (permissionsToProcess.length > 0) {
        await permissionsService.updateUserPermissions(selectedUser.id, permissionsToProcess);
      }

      // Salvar roles do usuário
      const updateUserData = {
        username: selectedUser.username,
        email: selectedUser.email,
        fullName: selectedUser.fullName,
        status: selectedUser.status,
        language: selectedUser.language,
        timezone: selectedUser.timezone,
        systemAdmin: selectedUser.systemAdmin,
        roleIds: selectedRoles.map(id => id.toString())
      };

      await userService.updateUser(selectedUser.id, updateUserData);

      setHasChanges(false);
      setSuccessMessage(`Permissões e roles de ${selectedUser.fullName} atualizadas com sucesso!`);

      // Recarregar permissões do usuário para refletir as mudanças
      await loadUserPermissions(selectedUser.id);

      // Remove success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

    } catch (err) {
      setError('Erro ao salvar permissões e roles');
      console.error('Erro ao salvar permissões e roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetPermissions = () => {
    if (selectedUser) {
      loadUserPermissions(selectedUser.id);
    }
  };

  const getPermissionModules = (): PermissionModule[] => {
    const modules: PermissionModule[] = [
      {
        id: 'all',
        name: 'Todas',
        icon: '📋',
        permissions: permissions
      },
      {
        id: 'finance',
        name: 'Financeiro',
        icon: '💰',
        permissions: permissions.filter(p => p.module === 'FINANCE')
      },
      {
        id: 'admin',
        name: 'Administrativo',
        icon: '⚙️',
        permissions: permissions.filter(p => p.module === 'ADMIN')
      }
    ];

    return modules;
  };

  const getFilteredPermissions = (modulePermissions: Permission[]) => {
    if (!searchTerm) return modulePermissions;

    return modulePermissions.filter(permission =>
      permission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const isPermissionGranted = (permissionId: number) => {
    return userPermissions.some(up => up.permissionId === permissionId && up.granted);
  };

  const modules = getPermissionModules();
  const activeModule = modules.find(m => m.id === activeTab);
  const filteredPermissions = activeModule ? getFilteredPermissions(activeModule.permissions) : [];

  return (
    <div className="permissions-page">
      <div className="page-header">
        <h1>
          <span className="page-icon">🔐</span>
          Configuração de Permissões
        </h1>
        <p className="page-description">
          Configure as permissões de acesso para cada usuário do sistema
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <div className="alert-content">
            <strong>❌ Erro:</strong> {error}
            {error.includes('cancellation_reason') && (
              <div className="error-details">
                <h4>🔧 Detalhes Técnicos:</h4>
                <p>Este erro indica que existe uma entidade JPA no backend tentando acessar uma coluna que não existe no banco de dados.</p>
                <h5>Possíveis soluções:</h5>
                <ul>
                  <li>Verificar se o schema do banco está atualizado</li>
                  <li>Executar migrações pendentes no backend</li>
                  <li>Verificar mapeamento JPA incorreto</li>
                </ul>
                <button
                  className="btn btn--secondary btn--small"
                  onClick={loadInitialData}
                  disabled={loading}
                >
                  🔄 Tentar Novamente
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <div className="alert-content">
            <strong>✅ Sucesso:</strong> {successMessage}
          </div>
        </div>
      )}

      <div className="permissions-content">
        {/* User Selection */}
        <div className="user-selection-section">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="userSelect">Selecionar Usuário</label>
              <select
                className="form-select"
                value={selectedUser?.id || ''}
                onChange={(e) => handleUserSelect(e.target.value)}
                disabled={loading}
              >
                <option value="">Selecione um usuário...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="permissionSearch">Pesquisar Permissões</label>
              <input
                type="text"
                id="permissionSearch"
                className="form-input"
                placeholder="Digite para pesquisar..."
                value={searchTerm}
                onChange={(e) => {
                  console.log('Input change event:', e.target.value);
                  setSearchTerm(e.target.value);
                }}
                onKeyDown={(e) => {
                  console.log('Key down event:', e.key);
                  e.stopPropagation();
                }}
                onFocus={() => console.log('Input focused')}
                onBlur={() => console.log('Input blurred')}
              />
            </div>
          </div>
        </div>

        {/* User Info */}
        {selectedUser && (
          <div className="user-info-section">
            <div className="user-info-card">
              <h3>👤 Informações do Usuário</h3>
              <div className="user-details">
                <div className="user-detail">
                  <strong>Nome:</strong> {selectedUser.fullName}
                </div>
                <div className="user-detail">
                  <strong>Email:</strong> {selectedUser.email}
                </div>
                <div className="user-detail">
                  <strong>Status:</strong>
                  <span className={`status-badge status-${selectedUser.status.toLowerCase()}`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Role Selection */}
        {selectedUser && (
          <div className="role-selection-section">
            <div className="role-selection-card">
              <h3>🎭 Roles do Usuário</h3>
              <div className="roles-grid">
                {roles.map(role => (
                  <div key={role.id} className="role-item">
                    <label className="role-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.id)}
                        onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                      />
                      <span className="role-name">{role.role}</span>
                      {role.description && (
                        <span className="role-description">{role.description}</span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Permissions Grid */}
        {selectedUser && (
          <div className="permissions-section">
            <h3>🔑 Permissões Disponíveis</h3>

            {/* Module Tabs */}
            <div className="module-tabs">
              {modules.map(module => (
                <button
                  key={module.id}
                  className={`tab-button ${activeTab === module.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(module.id)}
                >
                  <span className="tab-icon">{module.icon}</span>
                  {module.name}
                </button>
              ))}
            </div>

            {/* Permissions List */}
            <div className="permissions-grid">
              {filteredPermissions.map(permission => (
                <div key={permission.id} className="permission-card">
                  <div className="permission-header">
                    <label className="permission-checkbox">
                      <input
                        type="checkbox"
                        checked={isPermissionGranted(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                      />
                      <span className="checkmark"></span>
                    </label>
                    <h4 className="permission-name">{permission.name}</h4>
                  </div>
                  {permission.description && (
                    <p className="permission-description">{permission.description}</p>
                  )}
                  <div className="permission-meta">
                    <span className="permission-key">{permission.permissionKey}</span>
                    <span className="permission-module">{permission.module}</span>
                  </div>
                </div>
              ))}
            </div>

            {filteredPermissions.length === 0 && (
              <div className="no-permissions">
                <p>Nenhuma permissão encontrada para os critérios de busca.</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              <Button
                variant="secondary"
                onClick={resetPermissions}
                disabled={loading || !hasChanges}
              >
                {loading ? '🔄 Carregando...' : '🔄 Resetar'}
              </Button>
              <Button
                variant="primary"
                onClick={savePermissions}
                disabled={loading || !hasChanges}
                loading={loading}
              >
                {loading ? 'Salvando...' : '💾 Salvar Permissões'}
              </Button>
              {hasChanges && (
                <div className="changes-indicator">
                  <span className="changes-badge">
                    ⚠️ Alterações não salvas
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">Carregando...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionsPage;