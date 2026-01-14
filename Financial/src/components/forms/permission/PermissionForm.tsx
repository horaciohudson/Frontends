import React, { useState, useEffect } from 'react';
import { permissionsService, type Permission, type UserPermission } from '../../../services/permissionsService';
import { roleService, type Role } from '../../../services/roleService';
import { userService } from '../../../services/userService';
import type { User, UpdateUserRequest } from '../../../types/User';
import { Button } from '../../ui/Button';
import '../../../styles/pages/PermissionsPage.css';
import '../../../styles/pages/RoleSelection.css';

interface PermissionModule {
  id: string;
  name: string;
  icon: string;
  permissions: Permission[];
}

interface PermissionFormProps {
  selectedUser: User;
  onSave: (success: boolean, message?: string) => void;
  onCancel?: () => void;
}

const PermissionForm: React.FC<PermissionFormProps> = ({ 
  selectedUser, 
  onSave, 
  onCancel 
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      loadFormData();
    }
  }, [selectedUser]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar permissões disponíveis
      const permissionsResponse = await permissionsService.getAllPermissions();
      setPermissions(permissionsResponse);
      
      // Carregar roles disponíveis
      const rolesResponse = await roleService.getAllRoles();
      setRoles(rolesResponse);
      
      // Carregar permissões do usuário
      await loadUserPermissions(selectedUser.id);
      
      // Carregar roles do usuário
      const userRoles = selectedUser.roles || [];
      const roleIds = userRoles.map(role => {
        const foundRole = rolesResponse.find(r => r.role === role);
        return foundRole ? foundRole.id : null;
      }).filter(id => id !== null) as number[];
      
      setSelectedRoles(roleIds);
      
    } catch (err) {
      setError('Erro ao carregar dados do formulário');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPermissions = async (userId: string) => {
    try {
      const userPerms = await permissionsService.getUserPermissions(userId);
      setUserPermissions(userPerms);
    } catch (err) {
      console.error('Erro ao carregar permissões do usuário:', err);
      setUserPermissions([]);
    }
  };

  const handleRoleChange = (roleId: number, checked: boolean) => {
    setSelectedRoles(prev => {
      const newRoles = checked 
        ? [...prev, roleId]
        : prev.filter(id => id !== roleId);
      setHasChanges(true);
      return newRoles;
    });
  };

  const isPermissionGranted = (permissionId: number): boolean => {
    const userPerm = userPermissions.find(up => up.permissionId === permissionId);
    return userPerm ? userPerm.granted : false;
  };

  const togglePermission = (permissionId: number) => {
    setUserPermissions(prev => {
      const existingIndex = prev.findIndex(up => up.permissionId === permissionId);
      let newPermissions;
      
      if (existingIndex >= 0) {
        // Atualizar permissão existente
        newPermissions = [...prev];
        newPermissions[existingIndex] = {
          ...newPermissions[existingIndex],
          granted: !newPermissions[existingIndex].granted
        };
      } else {
        // Adicionar nova permissão
        const permission = permissions.find(p => p.id === permissionId);
        if (permission) {
          newPermissions = [...prev, {
            userId: selectedUser.id,
            permissionId: permissionId,
            granted: true,
            grantedAt: new Date(),
            grantedBy: ''
          }];
        } else {
          return prev;
        }
      }
      
      setHasChanges(true);
      return newPermissions;
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Preparar permissões para atualização
      const permissionsToProcess: UserPermission[] = [];
      
      // Verificar permissões que foram concedidas/revogadas
      const currentPermissions = userPermissions.filter(up => up.granted);
      
      // Verificar permissões que foram concedidas (estão em userPermissions mas não em currentPermissions)
      for (const userPerm of userPermissions) {
        const existsInCurrent = currentPermissions.some(cp => cp.permissionId === userPerm.permissionId);
        if (!existsInCurrent) {
          const permission = permissions.find(p => p.id === userPerm.permissionId);
          if (permission) {
            permissionsToProcess.push({
              ...userPerm,
              permissionId: permission.id,
              granted: true
            });
          }
        }
      }
      
      // Verificar permissões que foram revogadas
      for (const currentPerm of currentPermissions) {
        const existsInUser = userPermissions.some(up => up.permissionId === currentPerm.permissionId);
        if (!existsInUser) {
          permissionsToProcess.push({
            ...currentPerm,
            granted: false
          });
        }
      }
      
      // Processar mudanças de permissões
      if (permissionsToProcess.length > 0) {
        await permissionsService.updateUserPermissions(selectedUser.id, permissionsToProcess);
      }
      
      // Salvar roles do usuário
      const updateUserData: UpdateUserRequest = {
        username: selectedUser.username,
        email: selectedUser.email,
        fullName: selectedUser.fullName,
        status: selectedUser.status,
        language: selectedUser.language,
        timezone: selectedUser.timezone,
        systemAdmin: selectedUser.systemAdmin,
        roleIds: selectedRoles.map(id => id.toString())
      };
      
      // Atualizar o usuário com as novas roles
      await userService.updateUser(selectedUser.id, updateUserData);
      
      setHasChanges(false);
      onSave(true, `Permissões e roles de ${selectedUser.fullName} atualizadas com sucesso!`);
      
      // Recarregar permissões do usuário
      await loadUserPermissions(selectedUser.id);
      
    } catch (err) {
      setError('Erro ao salvar permissões e roles');
      console.error('Erro ao salvar:', err);
      onSave(false, 'Erro ao salvar permissões e roles');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    loadUserPermissions(selectedUser.id);
    setHasChanges(false);
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

  const modules = getPermissionModules();
  const activeModule = modules.find(m => m.id === activeTab) || modules[0];
  const filteredPermissions = getFilteredPermissions(activeModule.permissions);

  if (loading && permissions.length === 0) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner">Carregando formulário...</div>
      </div>
    );
  }

  return (
    <div className="permission-form">
      {error && (
        <div className="alert alert-error">
          <div className="alert-content">
            <strong>❌ Erro:</strong> {error}
          </div>
        </div>
      )}

      {/* User Info */}
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

      {/* Search */}
      <div className="form-group">
        <label htmlFor="permissionSearch">Pesquisar Permissões</label>
        <input
          type="text"
          id="permissionSearch"
          className="form-input"
          placeholder="Digite para pesquisar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Role Selection */}
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

      {/* Permissions Section */}
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
            onClick={handleReset}
            disabled={loading || !hasChanges}
          >
            {loading ? '🔄 Carregando...' : '🔄 Resetar'}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading || !hasChanges}
            loading={loading}
          >
            {loading ? 'Salvando...' : '💾 Salvar Permissões'}
          </Button>
          {onCancel && (
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
          )}
          {hasChanges && (
            <div className="changes-indicator">
              <span className="changes-badge">
                ⚠️ Alterações não salvas
              </span>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Carregando...</div>
        </div>
      )}
    </div>
  );
};

export default PermissionForm;