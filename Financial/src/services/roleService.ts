import { authService } from './authService';

export interface Role {
  id: number;
  role: string;
  description: string;
}

class RoleService {
  private baseURL = 'http://localhost:8081/api/roles';

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    // Verifica se está autenticado (inclui validação de expiração)
    if (!authService.isAuthenticated()) {
      authService.logout();
      throw new Error('Token de autenticação expirado ou inválido');
    }

    const token = authService.getToken();
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Se receber 401 ou 403, pode ser token expirado
      if (response.status === 401 || response.status === 403) {
        authService.logout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAllRoles(): Promise<Role[]> {
    return this.makeRequest('');
  }

  async getRoleById(roleId: number): Promise<Role> {
    return this.makeRequest(`/${roleId}`);
  }
}

export const roleService = new RoleService();