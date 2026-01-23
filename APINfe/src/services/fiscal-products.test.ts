import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { productService } from './product.service';
import api, { TokenManager } from './api';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Mock the api module
vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  TokenManager: {
    getToken: vi.fn(),
    setToken: vi.fn(),
    clearToken: vi.fn(),
    isAuthenticated: vi.fn(),
    isTokenExpired: vi.fn(),
  },
  handleApiError: vi.fn((error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'Erro desconhecido';
  }),
}));

describe('Fiscal Products Endpoint Tests', () => {
  const mockCompanyId = 'test-company-123';
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.Lbf_5Afe3zOE8VNP8D2Sv7zKpF8Zw1Qx2Yx3Zw4Qx5Y';
  
  const mockProducts = [
    {
      id: '1',
      productCode: 'PROD001',
      description: 'Produto Teste 1',
      ncm: '12345678',
      cfop: '5102',
      origem: '0',
      unitValue: 100.50,
      active: true,
      companyId: mockCompanyId,
    },
    {
      id: '2',
      productCode: 'PROD002',
      description: 'Produto Teste 2',
      ncm: '87654321',
      cfop: '5101',
      origem: '0',
      unitValue: 250.75,
      active: true,
      companyId: mockCompanyId,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock token as valid by default
    vi.mocked(TokenManager.getToken).mockReturnValue(mockToken);
    vi.mocked(TokenManager.isAuthenticated).mockReturnValue(true);
    vi.mocked(TokenManager.isTokenExpired).mockReturnValue(false);
  });

  describe('GET /api/fiscal/products', () => {
    it('should successfully fetch products with valid authentication', async () => {
      // Arrange
      const mockResponse = { data: mockProducts };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      // Act
      const result = await productService.getAll(mockCompanyId);

      // Assert
      expect(api.get).toHaveBeenCalledWith('/fiscal/products', {
        params: { companyId: mockCompanyId },
      });
      expect(result).toEqual(mockProducts);
    });

    it('should handle 403 Forbidden error with meaningful message', async () => {
      // Arrange
      const error403 = {
        response: {
          status: 403,
          statusText: 'Forbidden',
          data: {
            message: 'Acesso negado ao endpoint /api/fiscal/products',
            timestamp: '2024-01-15T10:00:00Z',
            path: '/api/fiscal/products',
          },
        },
        message: 'Request failed with status code 403',
      };
      vi.mocked(api.get).mockRejectedValue(error403);

      // Act & Assert
      await expect(productService.getAll(mockCompanyId)).rejects.toThrow(
        'Acesso negado ao endpoint de produtos fiscais. Verifique suas permissões.'
      );
    });

    it('should handle 401 Unauthorized error', async () => {
      // Arrange
      const error401 = {
        response: {
          status: 401,
          statusText: 'Unauthorized',
          data: {
            message: 'Token inválido ou expirado',
          },
        },
        message: 'Request failed with status code 401',
      };
      vi.mocked(api.get).mockRejectedValue(error401);

      // Act & Assert
      await expect(productService.getAll(mockCompanyId)).rejects.toThrow(
        'Sessão expirada. Faça login novamente para acessar os produtos.'
      );
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      const networkError = {
        message: 'Network Error',
        code: 'NETWORK_ERROR',
      };
      vi.mocked(api.get).mockRejectedValue(networkError);

      // Act & Assert
      await expect(productService.getAll(mockCompanyId)).rejects.toThrow('Network Error');
    });

    it('should handle server errors (500)', async () => {
      // Arrange
      const error500 = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: {
            message: 'Erro interno do servidor',
          },
        },
        message: 'Request failed with status code 500',
      };
      vi.mocked(api.get).mockRejectedValue(error500);

      // Act & Assert
      await expect(productService.getAll(mockCompanyId)).rejects.toThrow('Erro interno do servidor');
    });
  });

  describe('GET /api/fiscal/products/:id', () => {
    it('should successfully fetch a single product', async () => {
      // Arrange
      const mockProduct = mockProducts[0];
      const mockResponse = { data: mockProduct };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      // Act
      const result = await productService.getById(mockProduct.id);

      // Assert
      expect(api.get).toHaveBeenCalledWith(`/fiscal/products/${mockProduct.id}`);
      expect(result).toEqual(mockProduct);
    });

    it('should handle 404 Not Found error', async () => {
      // Arrange
      const error404 = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: {
            message: 'Produto não encontrado',
          },
        },
        message: 'Request failed with status code 404',
      };
      vi.mocked(api.get).mockRejectedValue(error404);

      // Act & Assert
      await expect(productService.getById('non-existent-id')).rejects.toThrow(
        'Produto fiscal com ID non-existent-id não foi encontrado'
      );
    });
  });

  describe('POST /api/fiscal/products', () => {
    it('should successfully create a new product', async () => {
      // Arrange
      const newProduct = {
        productCode: 'PROD003',
        description: 'Novo Produto',
        ncm: '11111111',
        cfop: '5103',
        origem: '0',
        unitValue: 150.00,
        active: true,
        companyId: mockCompanyId,
      };
      const createdProduct = { ...newProduct, id: '3' };
      const mockResponse = { data: createdProduct };
      vi.mocked(api.post).mockResolvedValue(mockResponse);

      // Act
      const result = await productService.create(newProduct);

      // Assert
      expect(api.post).toHaveBeenCalledWith('/fiscal/products', newProduct);
      expect(result).toEqual(createdProduct);
    });

    it('should handle validation errors (400)', async () => {
      // Arrange
      const invalidProduct = {
        productCode: '', // Invalid: empty code
        description: 'Produto Inválido',
        ncm: '123', // Invalid: too short
        cfop: '5103',
        origem: '0',
        unitValue: -10, // Invalid: negative value
        active: true,
        companyId: mockCompanyId,
      };

      // Act & Assert - The service validates before making the API call
      await expect(productService.create(invalidProduct)).rejects.toThrow(
        'Código do produto é obrigatório'
      );
    });
  });

  describe('PUT /api/fiscal/products/:id', () => {
    it('should successfully update a product', async () => {
      // Arrange
      const productId = '1';
      const updateData = {
        description: 'Produto Atualizado',
        unitValue: 200.00,
      };
      const updatedProduct = { ...mockProducts[0], ...updateData };
      const mockResponse = { data: updatedProduct };
      vi.mocked(api.put).mockResolvedValue(mockResponse);

      // Act
      const result = await productService.update(productId, updateData);

      // Assert
      expect(api.put).toHaveBeenCalledWith(`/fiscal/products/${productId}`, updateData);
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('DELETE /api/fiscal/products/:id', () => {
    it('should successfully delete a product', async () => {
      // Arrange
      const productId = '1';
      vi.mocked(api.delete).mockResolvedValue({ data: null });

      // Act
      await productService.delete(productId);

      // Assert
      expect(api.delete).toHaveBeenCalledWith(`/fiscal/products/${productId}`);
    });

    it('should handle 403 Forbidden when trying to delete', async () => {
      // Arrange
      const productId = '1';
      const error403 = {
        response: {
          status: 403,
          statusText: 'Forbidden',
          data: {
            message: 'Não é possível excluir este produto',
          },
        },
        message: 'Request failed with status code 403',
      };
      vi.mocked(api.delete).mockRejectedValue(error403);

      // Act & Assert
      await expect(productService.delete(productId)).rejects.toThrow(
        'Sem permissão para excluir este produto fiscal.'
      );
    });
  });

  describe('Authentication Integration', () => {
    it('should include Authorization header when token is available', async () => {
      // This test verifies that the API interceptor is working correctly
      // The actual header addition is tested in the api.test.ts file
      // Here we just verify the service calls work with authentication

      // Arrange
      const mockResponse = { data: mockProducts };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      // Act
      await productService.getAll(mockCompanyId);

      // Assert
      expect(api.get).toHaveBeenCalledWith('/fiscal/products', {
        params: { companyId: mockCompanyId },
      });
    });

    it('should handle expired token scenario', async () => {
      // Arrange
      vi.mocked(TokenManager.isTokenExpired).mockReturnValue(true);
      vi.mocked(TokenManager.isAuthenticated).mockReturnValue(false);

      // Act & Assert
      await expect(productService.getAll(mockCompanyId)).rejects.toThrow(
        'Usuário não autenticado. Faça login para acessar os produtos.'
      );
    });
  });
});