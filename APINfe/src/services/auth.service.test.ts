import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from './auth.service'
import api from './api'
import { LoginRequest, LoginResponse, User } from '../types'

// Mock the api module
vi.mock('./api', () => ({
  default: {
    post: vi.fn()
  }
}))

describe('AuthService', () => {
  const mockUser: User = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    role: 'EMISSOR',
    companyId: 'company1'
  }

  const mockLoginResponse: LoginResponse = {
    token: 'mock-jwt-token',
    user: mockUser
  }

  const mockLoginRequest: LoginRequest = {
    username: 'testuser',
    password: 'password123'
  }

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Token Storage and Retrieval', () => {
    it('should store token and user data in localStorage on successful login', async () => {
      // Arrange
      const mockApiResponse = { data: mockLoginResponse }
      vi.mocked(api.post).mockResolvedValue(mockApiResponse)

      // Act
      const result = await authService.login(mockLoginRequest)

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token')
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser))
      expect(result).toEqual(mockLoginResponse)
    })

    it('should not store data in localStorage when login response has no token', async () => {
      // Arrange
      const responseWithoutToken = { data: { user: mockUser } as any }
      vi.mocked(api.post).mockResolvedValue(responseWithoutToken)

      // Act
      await authService.login(mockLoginRequest)

      // Assert
      expect(localStorage.setItem).not.toHaveBeenCalled()
    })

    it('should retrieve current user from localStorage', () => {
      // Arrange
      const userString = JSON.stringify(mockUser)
      vi.mocked(localStorage.getItem).mockReturnValue(userString)

      // Act
      const result = authService.getCurrentUser()

      // Assert
      expect(localStorage.getItem).toHaveBeenCalledWith('user')
      expect(result).toEqual(mockUser)
    })

    it('should return null when no user data in localStorage', () => {
      // Arrange
      vi.mocked(localStorage.getItem).mockReturnValue(null)

      // Act
      const result = authService.getCurrentUser()

      // Assert
      expect(result).toBeNull()
    })

    it('should handle invalid JSON in localStorage gracefully', () => {
      // Arrange
      vi.mocked(localStorage.getItem).mockReturnValue('invalid-json')

      // Act & Assert
      expect(() => authService.getCurrentUser()).toThrow()
    })
  })

  describe('Authentication State Management', () => {
    it('should return true when token exists in localStorage', () => {
      // Arrange - Use a valid JWT token format
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjo5OTk5OTk5OTk5fQ.Lm_vSyERn4EWaE_n3dWCOw8VLhqDzqhJqZhOJqZhOJo'
      vi.mocked(localStorage.getItem).mockReturnValue(validToken)

      // Act
      const result = authService.isAuthenticated()

      // Assert
      expect(localStorage.getItem).toHaveBeenCalledWith('token')
      expect(result).toBe(true)
    })

    it('should return false when no token in localStorage', () => {
      // Arrange
      vi.mocked(localStorage.getItem).mockReturnValue(null)

      // Act
      const result = authService.isAuthenticated()

      // Assert
      expect(result).toBe(false)
    })

    it('should return false when token is empty string', () => {
      // Arrange
      vi.mocked(localStorage.getItem).mockReturnValue('')

      // Act
      const result = authService.isAuthenticated()

      // Assert
      expect(result).toBe(false)
    })

    it('should clear token and user data on logout', () => {
      // Act
      authService.logout()

      // Assert
      expect(localStorage.removeItem).toHaveBeenCalledWith('token')
      expect(localStorage.removeItem).toHaveBeenCalledWith('user')
    })
  })

  describe('Property 1: Token Storage and Retrieval', () => {
    it('should maintain token integrity through storage and retrieval operations', async () => {
      // Property: For any valid authentication token, storing it in the frontend 
      // SHALL allow it to be retrieved correctly and securely
      
      // Generate test tokens with valid JWT structure for testing
      const testTokens = [
        // Valid JWT tokens with different expiration times (all future dates)
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjo5OTk5OTk5OTk5fQ.Lm_vSyERn4EWaE_n3dWCOw8VLhqDzqhJqZhOJqZhOJo',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiZXhwIjo5OTk5OTk5OTk5fQ.Lm_vSyERn4EWaE_n3dWCOw8VLhqDzqhJqZhOJqZhOJo',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIiwiZXhwIjo5OTk5OTk5OTk5fQ.Lm_vSyERn4EWaE_n3dWCOw8VLhqDzqhJqZhOJqZhOJo'
      ]

      for (const token of testTokens) {
        // Arrange
        const loginResponse = { ...mockLoginResponse, token }
        const mockApiResponse = { data: loginResponse }
        vi.mocked(api.post).mockResolvedValue(mockApiResponse)
        
        // Clear previous state
        localStorage.clear()
        vi.clearAllMocks()

        // Act - Store token through login
        await authService.login(mockLoginRequest)

        // Assert - Token should be stored correctly
        expect(localStorage.setItem).toHaveBeenCalledWith('token', token)
        
        // Act - Check authentication state
        vi.mocked(localStorage.getItem).mockReturnValue(token)
        const isAuthenticated = authService.isAuthenticated()

        // Assert - Should be authenticated with valid token
        expect(isAuthenticated).toBe(true)
        expect(localStorage.getItem).toHaveBeenCalledWith('token')
      }
    })

    it('should handle user data storage and retrieval consistently', async () => {
      // Property: For any valid user data, storing it in the frontend 
      // SHALL allow it to be retrieved correctly and maintain data integrity

      const testUsers: User[] = [
        { id: '1', username: 'user1', email: 'user1@test.com', role: 'EMISSOR', companyId: 'comp1' },
        { id: '2', username: 'user2', email: 'user2@test.com', role: 'FISCAL', companyId: 'comp2' },
        { id: '3', username: 'admin', email: 'admin@test.com', role: 'ADMIN', companyId: 'comp3' }
      ]

      for (const user of testUsers) {
        // Arrange
        const loginResponse = { ...mockLoginResponse, user }
        const mockApiResponse = { data: loginResponse }
        vi.mocked(api.post).mockResolvedValue(mockApiResponse)
        
        // Clear previous state
        localStorage.clear()
        vi.clearAllMocks()

        // Act - Store user through login
        await authService.login(mockLoginRequest)

        // Assert - User should be stored correctly
        expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(user))
        
        // Act - Retrieve user
        vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(user))
        const retrievedUser = authService.getCurrentUser()

        // Assert - Retrieved user should match original
        expect(retrievedUser).toEqual(user)
        expect(localStorage.getItem).toHaveBeenCalledWith('user')
      }
    })

    it('should maintain authentication state consistency across operations', () => {
      // Property: Authentication state should remain consistent across 
      // login, logout, and state check operations

      const scenarios = [
        { hasToken: true, expectedAuth: true },
        { hasToken: false, expectedAuth: false }
      ]

      for (const scenario of scenarios) {
        // Clear state
        localStorage.clear()
        vi.clearAllMocks()

        if (scenario.hasToken) {
          // Simulate having a valid JWT token
          const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjo5OTk5OTk5OTk5fQ.Lm_vSyERn4EWaE_n3dWCOw8VLhqDzqhJqZhOJqZhOJo'
          vi.mocked(localStorage.getItem).mockReturnValue(validToken)
        } else {
          // Simulate no token
          vi.mocked(localStorage.getItem).mockReturnValue(null)
        }

        // Act - Check authentication state
        const isAuthenticated = authService.isAuthenticated()

        // Assert - State should match expectation
        expect(isAuthenticated).toBe(scenario.expectedAuth)

        if (scenario.hasToken) {
          // Act - Logout should clear authentication
          authService.logout()
          
          // Assert - Should clear storage
          expect(localStorage.removeItem).toHaveBeenCalledWith('token')
          expect(localStorage.removeItem).toHaveBeenCalledWith('user')
        }
      }
    })
  })
})