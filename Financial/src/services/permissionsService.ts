import { authService } from './authService';

export interface Permission {
  id: number;  // Mudando de permissionId para id para corresponder ao backend
  permissionKey: string;
  name: string;
  description?: string;
  module: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserPermission {
  userId: string;
  permissionId: number;  // Mudando para number para corresponder ao backend
  granted: boolean;
  grantedAt: Date;
  grantedBy: string;
  revokedAt?: Date;
  revokedBy?: string;
  notes?: string;
}

export interface Role {
  roleId: string;
  role: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: Date;
  assignedBy: string;
}

class PermissionsService {
  private readonly API_BASE_URL = 'http://localhost:8081/api';

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const fullUrl = `${this.API_BASE_URL}${endpoint}`;
      console.log('🌐 PermissionsService - Fazendo requisição para:', fullUrl);
      console.log('🌐 PermissionsService - Método:', options.method || 'GET');
      console.log('🌐 PermissionsService - Headers:', options.headers);

      const response = await authService.makeAuthenticatedRequest(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log('📡 PermissionsService - Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ PermissionsService - Erro na resposta:', errorText);
        let errorMessage = `Erro ${response.status}`;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const text = await response.text();
      const result = text ? JSON.parse(text) : null;
      console.log('✅ PermissionsService - Dados recebidos:', result);
      return result;
    } catch (error) {
      console.error('❌ PermissionsService - Erro na requisição:', error);
      if (error instanceof Error) {
        // Check if it's an authentication error
        if (error.message.includes('Token de autenticação expirado')) {
          // Redirect to login or show authentication modal
          window.location.href = '/login';
          throw new Error('Sessão expirada. Redirecionando para login...');
        }
        throw error;
      }
      throw new Error('Erro de conexão com o servidor');
    }
  }

  // Permission methods
  async getAllPermissions(): Promise<Permission[]> {
    console.log('🔑 PermissionsService - Buscando todas as permissões...');
    return this.makeRequest<Permission[]>('/permissions');
  }

  async getPermissionById(permissionId: number): Promise<Permission> {
    return this.makeRequest<Permission>(`/permissions/${permissionId}`);
  }

  async createPermission(permission: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Permission> {
    return this.makeRequest<Permission>('/permissions', {
      method: 'POST',
      body: JSON.stringify(permission),
    });
  }

  async updatePermission(permissionId: number, permission: Partial<Permission>): Promise<Permission> {
    return this.makeRequest<Permission>(`/permissions/${permissionId}`, {
      method: 'PUT',
      body: JSON.stringify(permission),
    });
  }

  async deletePermission(permissionId: number): Promise<void> {
    return this.makeRequest<void>(`/permissions/${permissionId}`, {
      method: 'DELETE',
    });
  }

  // Helper method to get current user's tenant ID
  private getCurrentUserTenantId(): string {
    const user = authService.getUser();
    if (!user || !user.tenantId) {
      throw new Error('Usuário não autenticado ou tenant não encontrado');
    }
    return user.tenantId;
  }

  // User Permission methods
  async getUserPermissions(userId: string, tenantId?: string): Promise<UserPermission[]> {
    const currentTenantId = tenantId || this.getCurrentUserTenantId();
    return this.makeRequest<UserPermission[]>(`/permissions/user/${userId}?tenantId=${currentTenantId}`);
  }

  async grantPermissionToUser(userId: string, permissionId: number, tenantId?: string, notes?: string): Promise<UserPermission> {
    const currentTenantId = tenantId || this.getCurrentUserTenantId();
    const params = new URLSearchParams({ tenantId: currentTenantId });
    if (notes) params.append('notes', notes);

    return this.makeRequest<UserPermission>(`/permissions/users/${userId}/permissions/${permissionId}/grant?${params}`, {
      method: 'POST',
    });
  }

  async revokePermissionFromUser(userId: string, permissionId: number, tenantId?: string): Promise<void> {
    const currentTenantId = tenantId || this.getCurrentUserTenantId();
    return this.makeRequest<void>(`/permissions/user/${userId}/permission/${permissionId}?tenantId=${currentTenantId}`, {
      method: 'DELETE',
    });
  }

  async updateUserPermissions(userId: string, permissions: UserPermission[], tenantId?: string): Promise<UserPermission[]> {
    // Implementação usando métodos individuais
    const results: UserPermission[] = [];
    const currentTenantId = tenantId || this.getCurrentUserTenantId();

    for (const permission of permissions) {
      try {
        if (permission.granted) {
          // Conceder permissão
          const result = await this.grantPermissionToUser(
            userId,
            permission.permissionId,
            currentTenantId,
            permission.notes
          );
          results.push(result);
        } else {
          // Revogar permissão
          await this.revokePermissionFromUser(userId, permission.permissionId, currentTenantId);
        }
      } catch (error) {
        console.error(`Erro ao processar permissão ${permission.permissionId}:`, error);
        // Continue processando outras permissões mesmo se uma falhar
      }
    }

    return results;
  }

  // Role methods
  async getAllRoles(): Promise<Role[]> {
    return this.makeRequest<Role[]>('/roles');
  }

  async getRoleById(roleId: string): Promise<Role> {
    return this.makeRequest<Role>(`/roles/${roleId}`);
  }

  async createRole(role: Omit<Role, 'roleId'>): Promise<Role> {
    return this.makeRequest<Role>('/roles', {
      method: 'POST',
      body: JSON.stringify(role),
    });
  }

  async updateRole(roleId: string, role: Partial<Role>): Promise<Role> {
    return this.makeRequest<Role>(`/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(role),
    });
  }

  async deleteRole(roleId: string): Promise<void> {
    return this.makeRequest<void>(`/roles/${roleId}`, {
      method: 'DELETE',
    });
  }

  // Role Permission methods
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    return this.makeRequest<Permission[]>(`/roles/${roleId}/permissions`);
  }

  async assignPermissionToRole(roleId: string, permissionId: number): Promise<void> {
    return this.makeRequest<void>(`/roles/${roleId}/permissions/${permissionId}`, {
      method: 'POST',
    });
  }

  async removePermissionFromRole(roleId: string, permissionId: number): Promise<void> {
    return this.makeRequest<void>(`/roles/${roleId}/permissions/${permissionId}`, {
      method: 'DELETE',
    });
  }

  // User Role methods
  async getUserRoles(userId: string): Promise<Role[]> {
    return this.makeRequest<Role[]>(`/users/${userId}/roles`);
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<UserRole> {
    return this.makeRequest<UserRole>(`/users/${userId}/roles/${roleId}`, {
      method: 'POST',
    });
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    return this.makeRequest<void>(`/users/${userId}/roles/${roleId}`, {
      method: 'DELETE',
    });
  }

  // Utility methods
  async checkUserPermission(userId: string, permissionKey: string): Promise<boolean> {
    try {
      const result = await this.makeRequest<{ hasPermission: boolean }>(`/users/${userId}/check-permission/${permissionKey}`);
      return result.hasPermission;
    } catch (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
  }

  async getUserEffectivePermissions(userId: string): Promise<Permission[]> {
    return this.makeRequest<Permission[]>(`/users/${userId}/effective-permissions`);
  }

  // Permission modules
  getPermissionModules(): string[] {
    return ['FINANCE', 'ADMIN', 'USER_MANAGEMENT', 'REPORTS', 'SYSTEM'];
  }

  getPermissionsByModule(permissions: Permission[], module: string): Permission[] {
    return permissions.filter(permission => permission.module === module);
  }
}

export const permissionsService = new PermissionsService();