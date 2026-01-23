import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act, cleanup } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import { TokenManager } from '../services/api'
import { SessionManager } from '../utils/sessionManager'
import { jwtDecode } from 'jwt-decode'

// Mock dependencies
vi.mock('../services/api', () => ({
  default: {
    post: vi.fn()
  },
  TokenManager: {
    getToken: vi.fn(),
    setToken: vi.fn(),
    clearToken: vi.fn(),
    isTokenExpired: vi.fn()
  }
}))

vi.mock('../utils/sessionManager', () => ({
  SessionManager: {
    initialize: vi.fn(),
    validateSession: vi.fn(),
    clearSession: vi.fn(),
    saveSession: vi.fn(),
    getSessionInfo: vi.fn(),
    stopActivityMonitoring: vi.fn()
  }
}))

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn()
}))

// Test component to access auth context
const TestComponent = ({ testId = 'default' }: { testId?: string }) => {
  const auth = useAuth()
  return (
    <div data-testid={`container-${testId}`}>
      <div data-testid={`isAuthenticated-${testId}`}>{auth.isAuthenticated.toString()}</div>
      <div data-testid={`loading-${testId}`}>{auth.loading.toString()}</div>
      <div data-testid={`error-${testId}`}>{auth.error || 'no-error'}</div>
      <div data-testid={`user-${testId}`}>{auth.user ? JSON.stringify(auth.user) : 'no-user'}</div>
      <button onClick={auth.redirectToLogin} data-testid={`redirect-btn-${testId}`}>Redirect</button>
      <button onClick={auth.logout} data-testid={`logout-btn-${testId}`}>Logout</button>
      <button onClick={auth.checkAuthStatus} data-testid={`check-auth-btn-${testId}`}>Check Auth</button>
    </div>
  )
}

const renderWithAuthProvider = (testId = 'default') => {
  return render(
    <AuthProvider>
      <TestComponent testId={testId} />
    </AuthProvider>
  )
}

describe('AuthContext - Authentication State Management', () => {
  const mockValidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsInJvbGVzIjpbIkVNSVNTT1IiXSwiZXhwIjoxNzA2NzM2MDAwLCJpYXQiOjE3MDY2NDk2MDAsImxhbmd1YWdlIjoicHQifQ.test'
  const mockDecodedToken = {
    sub: 'testuser',
    roles: ['EMISSOR'],
    exp: 1706736000,
    iat: 1706649600,
    language: 'pt'
  }

  // Mock window.location.href
  const mockLocationHref = vi.fn()
  Object.defineProperty(window, 'location', {
    value: {
      href: '',
      pathname: '/dashboard'
    },
    writable: true
  })

  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
    
    // Reset window.location
    Object.defineProperty(window.location, 'href', {
      set: mockLocationHref,
      configurable: true
    })

    // Setup default SessionManager mocks
    vi.mocked(SessionManager.initialize).mockReturnValue({
      isValid: false,
      reason: undefined,
      session: null
    })
    vi.mocked(SessionManager.getSessionInfo).mockReturnValue({
      hasSession: false,
      isValid: false
    })
    vi.mocked(SessionManager.validateSession).mockReturnValue({
      isValid: false,
      reason: undefined,
      session: null
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Property 3: Invalid Token Error Handling', () => {
    it('should handle missing tokens gracefully and redirect to login', async () => {
      // Property: For any API request made with missing tokens, 
      // the frontend SHALL handle the error gracefully and redirect to login
      
      // Arrange - No token available
      vi.mocked(TokenManager.getToken).mockReturnValue(null)

      // Act
      renderWithAuthProvider('missing-token')

      // Assert - Should not be authenticated
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated-missing-token')).toHaveTextContent('false')
        expect(screen.getByTestId('user-missing-token')).toHaveTextContent('no-user')
        expect(screen.getByTestId('loading-missing-token')).toHaveTextContent('false')
      })

      // Act - Trigger redirect
      act(() => {
        screen.getByTestId('redirect-btn-missing-token').click()
      })

      // Assert - Should redirect to login
      expect(mockLocationHref).toHaveBeenCalledWith('/login')
    })

    it('should handle expired tokens gracefully and redirect to login', async () => {
      // Property: For any API request made with expired tokens,
      // the frontend SHALL handle the error gracefully and redirect to login

      // Arrange - Expired token scenario
      vi.mocked(TokenManager.getToken).mockReturnValue(mockValidToken)
      vi.mocked(TokenManager.isTokenExpired).mockReturnValue(true)
      
      // Mock SessionManager to return invalid session due to expired token
      vi.mocked(SessionManager.initialize).mockReturnValue({
        isValid: false,
        reason: 'expired',
        session: {
          token: mockValidToken,
          user: mockDecodedToken,
          timestamp: Date.now() - 1000000, // Old timestamp
          lastActivity: Date.now() - 1000000
        }
      })

      // Act
      renderWithAuthProvider('expired-token')

      // Assert - Should clear authentication and not be authenticated
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated-expired-token')).toHaveTextContent('false')
        expect(screen.getByTestId('user-expired-token')).toHaveTextContent('no-user')
        expect(TokenManager.clearToken).toHaveBeenCalled()
      })

      // Act - Trigger redirect
      act(() => {
        screen.getByTestId('redirect-btn-expired-token').click()
      })

      // Assert - Should redirect to login
      expect(mockLocationHref).toHaveBeenCalledWith('/login')
    })

    it('should handle malformed tokens gracefully and redirect to login', async () => {
      // Property: For any API request made with malformed tokens,
      // the frontend SHALL handle the error gracefully and redirect to login

      const malformedTokens = [
        'invalid-token',
        'not.a.jwt',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid-payload'
      ]

      for (let i = 0; i < malformedTokens.length; i++) {
        const malformedToken = malformedTokens[i]
        const testId = `malformed-${i}`
        
        // Clear previous state
        vi.clearAllMocks()

        // Arrange - Malformed token scenario
        vi.mocked(TokenManager.getToken).mockReturnValue(malformedToken)
        vi.mocked(TokenManager.isTokenExpired).mockReturnValue(false)
        vi.mocked(jwtDecode).mockImplementation(() => {
          throw new Error('Invalid token format')
        })

        // Mock SessionManager to return invalid session due to corrupted token
        vi.mocked(SessionManager.initialize).mockReturnValue({
          isValid: false,
          reason: 'corrupted',
          session: {
            token: malformedToken,
            user: null,
            timestamp: Date.now(),
            lastActivity: Date.now()
          }
        })

        // Act
        renderWithAuthProvider(testId)

        // Assert - Should handle error gracefully
        await waitFor(() => {
          expect(screen.getByTestId(`isAuthenticated-${testId}`)).toHaveTextContent('false')
          expect(screen.getByTestId(`user-${testId}`)).toHaveTextContent('no-user')
          expect(TokenManager.clearToken).toHaveBeenCalled()
        })

        // Act - Trigger redirect
        act(() => {
          screen.getByTestId(`redirect-btn-${testId}`).click()
        })

        // Assert - Should redirect to login
        expect(mockLocationHref).toHaveBeenCalledWith('/login')
        
        cleanup()
      }
    })

    it('should handle corrupted token payload gracefully', async () => {
      // Property: For any token with corrupted payload,
      // the frontend SHALL handle the error gracefully

      // Arrange - Token that decodes but has invalid structure
      vi.mocked(TokenManager.getToken).mockReturnValue(mockValidToken)
      vi.mocked(TokenManager.isTokenExpired).mockReturnValue(false)
      vi.mocked(jwtDecode).mockReturnValue({
        sub: 'testuser',
        // Missing required fields like exp, roles, etc.
      })

      // Mock SessionManager to return valid session (token structure is valid)
      vi.mocked(SessionManager.initialize).mockReturnValue({
        isValid: true,
        reason: undefined,
        session: {
          token: mockValidToken,
          user: { sub: 'testuser' }, // Partial user data
          timestamp: Date.now(),
          lastActivity: Date.now()
        }
      })

      // Act
      renderWithAuthProvider('corrupted-payload')

      // Assert - Should handle gracefully with partial data
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated-corrupted-payload')).toHaveTextContent('true')
        // Should still work with partial token data
      })
    })

    it('should clear authentication state on logout and redirect when requested', async () => {
      // Property: Logout should clear all authentication state and allow redirect

      // Arrange - Valid authenticated state
      vi.mocked(TokenManager.getToken).mockReturnValue(mockValidToken)
      vi.mocked(TokenManager.isTokenExpired).mockReturnValue(false)
      vi.mocked(jwtDecode).mockReturnValue(mockDecodedToken)

      // Mock SessionManager to return valid session initially
      vi.mocked(SessionManager.initialize).mockReturnValue({
        isValid: true,
        reason: undefined,
        session: {
          token: mockValidToken,
          user: mockDecodedToken,
          timestamp: Date.now(),
          lastActivity: Date.now()
        }
      })

      renderWithAuthProvider('logout-test')

      // Wait for initial authentication
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated-logout-test')).toHaveTextContent('true')
      })

      // Act - Logout
      act(() => {
        screen.getByTestId('logout-btn-logout-test').click()
      })

      // Assert - Should clear authentication state
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated-logout-test')).toHaveTextContent('false')
        expect(screen.getByTestId('user-logout-test')).toHaveTextContent('no-user')
        expect(screen.getByTestId('error-logout-test')).toHaveTextContent('no-error')
        expect(TokenManager.clearToken).toHaveBeenCalled()
      })

      // Act - Trigger redirect after logout
      act(() => {
        screen.getByTestId('redirect-btn-logout-test').click()
      })

      // Assert - Should redirect to login
      expect(mockLocationHref).toHaveBeenCalledWith('/login')
    })
  })

  describe('Redirect Behavior on Authentication Failures', () => {
    it('should not redirect when already on login page', async () => {
      // Arrange - Already on login page
      Object.defineProperty(window.location, 'pathname', {
        value: '/login',
        configurable: true
      })
      vi.mocked(TokenManager.getToken).mockReturnValue(null)

      renderWithAuthProvider('login-page')

      // Act - Trigger redirect
      act(() => {
        screen.getByTestId('redirect-btn-login-page').click()
      })

      // Assert - Should not redirect when already on login
      expect(mockLocationHref).not.toHaveBeenCalled()
    })

    it('should redirect from any other page when authentication fails', async () => {
      const testPaths = ['/dashboard', '/products', '/customers']

      for (let i = 0; i < testPaths.length; i++) {
        const path = testPaths[i]
        const testId = `redirect-${i}`
        
        // Clear previous calls
        vi.clearAllMocks()

        // Arrange - Different page paths
        Object.defineProperty(window.location, 'pathname', {
          value: path,
          configurable: true
        })
        vi.mocked(TokenManager.getToken).mockReturnValue(null)

        renderWithAuthProvider(testId)

        // Act - Trigger redirect
        act(() => {
          screen.getByTestId(`redirect-btn-${testId}`).click()
        })

        // Assert - Should redirect to login from any page except login
        expect(mockLocationHref).toHaveBeenCalledWith('/login')
        
        cleanup()
      }
    })

    it('should handle authentication check failures and maintain consistent state', async () => {
      // Property: Authentication state checks should be consistent and handle failures gracefully

      const failureScenarios = [
        { token: null, expired: false, shouldThrow: false, testId: 'scenario-0' },
        { token: 'valid-token', expired: true, shouldThrow: false, testId: 'scenario-1' },
        { token: 'invalid-token', expired: false, shouldThrow: true, testId: 'scenario-2' }
      ]

      for (const scenario of failureScenarios) {
        // Clear previous state
        vi.clearAllMocks()

        // Arrange
        vi.mocked(TokenManager.getToken).mockReturnValue(scenario.token)
        vi.mocked(TokenManager.isTokenExpired).mockReturnValue(scenario.expired)
        
        if (scenario.shouldThrow) {
          vi.mocked(jwtDecode).mockImplementation(() => {
            throw new Error('Token decode error')
          })
        } else {
          vi.mocked(jwtDecode).mockReturnValue(mockDecodedToken)
        }

        renderWithAuthProvider(scenario.testId)

        // Act - Trigger auth check
        act(() => {
          screen.getByTestId(`check-auth-btn-${scenario.testId}`).click()
        })

        // Assert - Should handle all scenarios gracefully
        await waitFor(() => {
          expect(screen.getByTestId(`loading-${scenario.testId}`)).toHaveTextContent('false')
          
          if (scenario.token && !scenario.expired && !scenario.shouldThrow) {
            expect(screen.getByTestId(`isAuthenticated-${scenario.testId}`)).toHaveTextContent('true')
          } else {
            expect(screen.getByTestId(`isAuthenticated-${scenario.testId}`)).toHaveTextContent('false')
            expect(screen.getByTestId(`user-${scenario.testId}`)).toHaveTextContent('no-user')
          }
        })
        
        cleanup()
      }
    })

    it('should handle storage events and maintain authentication consistency', async () => {
      // Property: Authentication state should remain consistent across browser tabs

      // Arrange - Initial authenticated state
      vi.mocked(TokenManager.getToken).mockReturnValue(mockValidToken)
      vi.mocked(TokenManager.isTokenExpired).mockReturnValue(false)
      vi.mocked(jwtDecode).mockReturnValue(mockDecodedToken)

      // Mock SessionManager to return valid session initially
      vi.mocked(SessionManager.initialize).mockReturnValue({
        isValid: true,
        reason: undefined,
        session: {
          token: mockValidToken,
          user: mockDecodedToken,
          timestamp: Date.now(),
          lastActivity: Date.now()
        }
      })

      renderWithAuthProvider('storage-events')

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated-storage-events')).toHaveTextContent('true')
      })

      // Act - Simulate token removal in another tab
      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'token',
          newValue: null,
          oldValue: mockValidToken
        })
        window.dispatchEvent(storageEvent)
      })

      // Assert - Should update authentication state
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated-storage-events')).toHaveTextContent('false')
        expect(screen.getByTestId('user-storage-events')).toHaveTextContent('no-user')
      })

      // Act - Simulate token update in another tab
      vi.mocked(TokenManager.getToken).mockReturnValue(mockValidToken)
      vi.mocked(TokenManager.isTokenExpired).mockReturnValue(false)
      
      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'token',
          newValue: mockValidToken,
          oldValue: null
        })
        window.dispatchEvent(storageEvent)
      })

      // Assert - Should re-authenticate
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated-storage-events')).toHaveTextContent('true')
      })
    })
  })
})