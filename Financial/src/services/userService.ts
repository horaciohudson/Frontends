import type { User, CreateUserRequest, UpdateUserRequest, Role } from '../types/User';
import { authService } from './authService';

const API_BASE_URL = 'http://localhost:8081/api';

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

class UserService {
  async getAllUsers(page: number = 0, size: number = 10): Promise<PaginatedResponse<User>> {
    try {
      console.log('👥 UserService - Buscando usuários - Página:', page, 'Tamanho:', size);
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      const response = await authService.makeAuthenticatedRequest(`${API_BASE_URL}/users?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Se receber 401 ou 403, pode ser token expirado
        if (response.status === 401 || response.status === 403) {
          authService.logout();
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        throw new Error(`Erro ao buscar usuários: ${response.status}`);
      }

      const result = await response.json();
      console.log('👥 UserService - Usuários recebidos:', result);
      return result;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }
  async getUsersPaginated(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'username',
    sortDir: string = 'asc'
  ): Promise<PaginatedResponse<User>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir,
      });

      const response = await authService.makeAuthenticatedRequest(`${API_BASE_URL}/users/paginated?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar usuários paginados: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao buscar usuários paginados:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const response = await authService.makeAuthenticatedRequest(`${API_BASE_URL}/users/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuário não encontrado');
        }
        throw new Error(`Erro ao buscar usuário: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User> {
    try {
      const response = await authService.makeAuthenticatedRequest(`${API_BASE_URL}/users/username/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuário não encontrado');
        }
        throw new Error(`Erro ao buscar usuário: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await authService.makeAuthenticatedRequest(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Dados inválidos para criação do usuário');
        }
        throw new Error(`Erro ao criar usuário: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await authService.makeAuthenticatedRequest(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Dados inválidos para atualização do usuário');
        }
        throw new Error(`Erro ao atualizar usuário: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const response = await authService.makeAuthenticatedRequest(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuário não encontrado');
        }
        throw new Error(`Erro ao remover usuário: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      throw error;
    }
  }

  async blockUser(id: string): Promise<void> {
    try {
      const response = await authService.makeAuthenticatedRequest(`${API_BASE_URL}/users/${id}/block`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuário não encontrado');
        }
        throw new Error(`Erro ao bloquear usuário: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao bloquear usuário:', error);
      throw error;
    }
  }

  async unblockUser(id: string): Promise<void> {
    try {
      const response = await authService.makeAuthenticatedRequest(`${API_BASE_URL}/users/${id}/unblock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuário não encontrado');
        }
        throw new Error(`Erro ao desbloquear usuário: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao desbloquear usuário:', error);
      throw error;
    }
  }

  async getRoles(): Promise<Role[]> {
    try {
      const response = await authService.makeAuthenticatedRequest(`${API_BASE_URL}/roles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar papéis: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao buscar papéis:', error);
      throw error;
    }
  }
}

export const userService = new UserService();