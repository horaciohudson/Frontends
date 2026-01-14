import { authService } from './authService';
import type { Permission, UserPermission } from '../types/permission';

const API_BASE_URL = '/api';

class PermissionsService {
    private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        try {
            const fullUrl = `${API_BASE_URL}${endpoint}`;
            console.log('🌐 PermissionsService - Fazendo requisição para:', fullUrl);

            const response = await authService.makeAuthenticatedRequest(fullUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            console.log('📡 PermissionsService - Resposta recebida:', {
                status: response.status,
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
                if (error.message.includes('Token de autenticação expirado')) {
                    window.location.href = '/login';
                    throw new Error('Sessão expirada. Redirecionando para login...');
                }
                throw error;
            }
            throw new Error('Erro de conexão com o servidor');
        }
    }

    // Helper method to get current user's tenant ID
    private getCurrentUserTenantId(): string {
        const user = authService.getUser();
        if (!user || !user.tenantId) {
            throw new Error('Usuário não autenticado ou tenant não encontrado');
        }
        return user.tenantId;
    }

    // Permission methods
    async getAllPermissions(): Promise<Permission[]> {
        console.log('🔑 PermissionsService - Buscando todas as permissões...');
        return this.makeRequest<Permission[]>('/permissions');
    }

    async getPermissionById(permissionId: number): Promise<Permission> {
        return this.makeRequest<Permission>(`/permissions/${permissionId}`);
    }

    async searchPermissions(query: string): Promise<Permission[]> {
        return this.makeRequest<Permission[]>(`/permissions/search?query=${encodeURIComponent(query)}`);
    }

    // User Permission methods
    async getUserPermissions(userId: string, tenantId?: string): Promise<UserPermission[]> {
        const currentTenantId = tenantId || this.getCurrentUserTenantId();
        return this.makeRequest<UserPermission[]>(`/permissions/user/${userId}?tenantId=${currentTenantId}`);
    }

    async grantPermissionToUser(
        userId: string,
        permissionId: number,
        tenantId?: string,
        notes?: string
    ): Promise<UserPermission> {
        const currentTenantId = tenantId || this.getCurrentUserTenantId();
        const params = new URLSearchParams({ tenantId: currentTenantId });
        if (notes) params.append('notes', notes);

        return this.makeRequest<UserPermission>(
            `/permissions/users/${userId}/permissions/${permissionId}/grant?${params}`,
            { method: 'POST' }
        );
    }

    async revokePermissionFromUser(
        userId: string,
        permissionId: number,
        tenantId?: string
    ): Promise<void> {
        const currentTenantId = tenantId || this.getCurrentUserTenantId();
        return this.makeRequest<void>(
            `/permissions/user/${userId}/permission/${permissionId}?tenantId=${currentTenantId}`,
            { method: 'DELETE' }
        );
    }

    async updateUserPermissions(
        userId: string,
        permissions: UserPermission[],
        tenantId?: string
    ): Promise<UserPermission[]> {
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

    // Utility methods
    async checkUserPermission(userId: string, permissionKey: string, tenantId?: string): Promise<boolean> {
        try {
            const currentTenantId = tenantId || this.getCurrentUserTenantId();
            const result = await this.makeRequest<boolean>(
                `/permissions/users/${userId}/check-permission/${permissionKey}?tenantId=${currentTenantId}`
            );
            return result;
        } catch (error) {
            console.error('Error checking user permission:', error);
            return false;
        }
    }

    // Permission modules
    getPermissionModules(): string[] {
        return ['FINANCE', 'ADMIN', 'USER_MANAGEMENT', 'REPORTS', 'SYSTEM', 'PRODUCTION'];
    }

    getPermissionsByModule(permissions: Permission[], module: string): Permission[] {
        return permissions.filter(permission => permission.module === module);
    }
}

export const permissionsService = new PermissionsService();
export type { Permission, UserPermission };
