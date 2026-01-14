import React, { useState, useEffect } from 'react';
import { permissionsService, type Permission, type UserPermission } from '../services/permissionsService';
import { userService } from '../services/userService';
import { roleService, type Role } from '../services/roleService';
import type { User } from '../types/user';
import './PermissionsPage.css';
import './RoleSelection.css';

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

            // Carregar usuários
            console.log('📋 PermissionsPage - Carregando usuários...');
            const usersResponse = await userService.getAllUsers();
            console.log('✅ PermissionsPage - Usuários carregados:', usersResponse.content.length);
            setUsers(usersResponse.content);

            // Carregar permissões
            console.log('🔑 PermissionsPage - Carregando permissões...');
            const permissionsResponse = await permissionsService.getAllPermissions();
            console.log('✅ PermissionsPage - Permissões carregadas:', permissionsResponse.length);
            setPermissions(permissionsResponse);

            // Carregar roles
            console.log('👥 PermissionsPage - Carregando roles...');
            const rolesResponse = await roleService.getAllRoles();
            console.log('✅ PermissionsPage - Roles carregadas:', rolesResponse.length);
            setRoles(rolesResponse);

            console.log('🎉 PermissionsPage - Todos os dados carregados com sucesso!');

        } catch (err: any) {
            console.error('❌ PermissionsPage - Erro ao carregar dados:', err);

            let errorMessage = 'Erro ao carregar dados iniciais';
            if (err.message?.includes('403')) {
                errorMessage = 'Acesso negado. Faça login para acessar as permissões.';
            } else if (err.message?.includes('401')) {
                errorMessage = 'Sessão expirada. Faça login novamente.';
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
            console.log('Permissões carregadas:', userPerms);
            setUserPermissions(userPerms);
            setHasChanges(false);
            setError(null);
        } catch (err: any) {
            console.error('Erro ao carregar permissões do usuário:', err);
            setError('Erro ao carregar permissões do usuário');
        } finally {
            setLoading(false);
        }
    };

    const handleUserSelect = async (userId: string) => {
        console.log('handleUserSelect chamado com userId:', userId);

        const user = users.find(u => u.id === userId);
        console.log('Usuário encontrado:', user);

        if (user) {
            setSelectedUser(user);
            await loadUserPermissions(userId);

            // Carregar roles do usuário
            if (user.roles) {
                const userRoleIds = roles
                    .filter(role => user.roles?.includes(role.role))
                    .map(role => role.id);
                setSelectedRoles(userRoleIds);
            } else {
                setSelectedRoles([]);
            }
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
        const hasPermission = userPermissions.some(up => up.permissionId === permissionId);

        if (hasPermission) {
            setUserPermissions(prev => prev.filter(up => up.permissionId !== permissionId));
        } else {
            const newPermission: UserPermission = {
                userId: selectedUser!.id,
                permissionId: permissionId,
                tenantId: selectedUser!.tenantId,
                granted: true,
            };
            setUserPermissions(prev => [...prev, newPermission]);
        }

        setHasChanges(true);
    };

    const savePermissions = async () => {
        if (!selectedUser) return;

        try {
            setLoading(true);
            setError(null);
            setSuccessMessage(null);

            // Obter permissões atuais
            const currentPermissions = await permissionsService.getUserPermissions(selectedUser.id);

            // Criar lista de permissões para processar
            const permissionsToProcess: UserPermission[] = [];

            // Permissões concedidas
            for (const userPerm of userPermissions) {
                const existsInCurrent = currentPermissions.some(cp => cp.permissionId === userPerm.permissionId);
                if (!existsInCurrent) {
                    permissionsToProcess.push({ ...userPerm, granted: true });
                }
            }

            // Permissões revogadas
            for (const currentPerm of currentPermissions) {
                const existsInUser = userPermissions.some(up => up.permissionId === currentPerm.permissionId);
                if (!existsInUser) {
                    permissionsToProcess.push({ ...currentPerm, granted: false });
                }
            }

            // Processar mudanças
            if (permissionsToProcess.length > 0) {
                await permissionsService.updateUserPermissions(selectedUser.id, permissionsToProcess);
            }

            // Salvar roles
            const updateUserData = {
                username: selectedUser.username,
                email: selectedUser.email,
                fullName: selectedUser.fullName,
                status: selectedUser.status,
                language: selectedUser.language,
                timezone: selectedUser.timezone,
                systemAdmin: selectedUser.systemAdmin,
                roleIds: selectedRoles
            };

            await userService.updateUser(selectedUser.id, updateUserData);

            setHasChanges(false);
            setSuccessMessage(`Permissões e roles de ${selectedUser.fullName} atualizadas com sucesso!`);

            // Recarregar permissões
            await loadUserPermissions(selectedUser.id);

            setTimeout(() => setSuccessMessage(null), 5000);

        } catch (err) {
            setError('Erro ao salvar permissões e roles');
            console.error('Erro ao salvar:', err);
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
        return [
            {
                id: 'all',
                name: 'Todas',
                icon: '📋',
                permissions: permissions
            },
            {
                id: 'PRODUCTION',
                name: 'Produção',
                icon: '🏭',
                permissions: permissions.filter(p => p.module === 'PRODUCTION')
            },
            {
                id: 'ADMIN',
                name: 'Administrativo',
                icon: '⚙️',
                permissions: permissions.filter(p => p.module === 'ADMIN')
            }
        ];
    };

    const getFilteredPermissions = (modulePermissions: Permission[]) => {
        if (!searchTerm) return modulePermissions;

        return modulePermissions.filter(permission =>
            permission.permissionKey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                                        <h4 className="permission-name">{permission.permissionKey}</h4>
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
                            <button
                                className="btn-secondary"
                                onClick={resetPermissions}
                                disabled={loading || !hasChanges}
                            >
                                {loading ? '🔄 Carregando...' : '🔄 Resetar'}
                            </button>
                            <button
                                className="btn-primary"
                                onClick={savePermissions}
                                disabled={loading || !hasChanges}
                            >
                                {loading ? 'Salvando...' : '💾 Salvar Permissões'}
                            </button>
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
