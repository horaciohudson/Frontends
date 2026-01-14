import { authService } from './authService';

export interface Role {
    id: number;
    role: string;
    description?: string;
}

const API_BASE_URL = '/api';

class RoleService {
    async getAllRoles(): Promise<Role[]> {
        try {
            console.log('👥 RoleService - Buscando todas as roles...');

            const response = await authService.makeAuthenticatedRequest(`${API_BASE_URL}/roles`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erro ao buscar roles: ${response.status}`);
            }

            const roles = await response.json();
            console.log('✅ RoleService - Roles carregadas:', roles.length, 'roles');
            return roles;
        } catch (error) {
            console.error('Erro ao buscar roles:', error);
            throw error;
        }
    }

    async getRoleById(id: number): Promise<Role> {
        try {
            const response = await authService.makeAuthenticatedRequest(`${API_BASE_URL}/roles/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Role não encontrada');
                }
                throw new Error(`Erro ao buscar role: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('Erro ao buscar role:', error);
            throw error;
        }
    }
}

export const roleService = new RoleService();
