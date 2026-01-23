/**
 * Frontend Loading and Error Resolution Verification Test
 * 
 * This test verifies:
 * - Frontend loads without authentication errors
 * - "Acesso negado: undefined" error is resolved
 * - API endpoints return proper responses or meaningful errors
 * 
 * Requirements: 3.1, 4.2, 5.2
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TokenManager, ErrorHandler } from '../services/api';
import { SessionManager } from '../utils/sessionManager';

// Mock console methods to capture logs
const consoleSpy = {
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  log: vi.spyOn(console, 'log').mockImplementation(() => {})
};

describe('Frontend Loading and Error Resolution Verification', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Reset all mocks
    vi.clearAllMocks();
    
    // Reset console spies
    consoleSpy.error.mockClear();
    consoleSpy.warn.mockClear();
    consoleSpy.log.mockClear();

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000',
        pathname: '/',
        search: '',
        hash: ''
      },
      writable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Token Management Without Errors', () => {
    it('should handle missing token gracefully without errors', () => {
      // Ensure no token is present
      TokenManager.clearToken();

      // Should handle missing token correctly
      expect(TokenManager.getToken()).toBeNull();
      expect(TokenManager.isAuthenticated()).toBe(false);
      
      // Should not throw errors
      expect(() => TokenManager.clearToken()).not.toThrow();
      expect(() => TokenManager.isAuthenticated()).not.toThrow();
    });

    it('should handle expired token gracefully without errors', () => {
      // Set an expired token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImV4cCI6MTYwMDAwMDAwMH0.invalid';
      TokenManager.setToken(expiredToken);

      // Should detect expired token
      expect(TokenManager.isTokenExpired(expiredToken)).toBe(true);
      expect(TokenManager.isAuthenticated()).toBe(false);
      
      // Should not throw errors
      expect(() => TokenManager.isTokenExpired(expiredToken)).not.toThrow();
    });

    it('should handle invalid token gracefully without errors', () => {
      // Set an invalid token
      const invalidToken = 'invalid-token-format';
      TokenManager.setToken(invalidToken);

      // Should detect invalid token
      expect(TokenManager.isTokenExpired(invalidToken)).toBe(true);
      expect(TokenManager.isAuthenticated()).toBe(false);
      
      // Should not throw errors
      expect(() => TokenManager.isTokenExpired(invalidToken)).not.toThrow();
    });

    it('should handle valid token correctly without errors', () => {
      // Set a valid token (not expired)
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImV4cCI6OTk5OTk5OTk5OX0.test';
      TokenManager.setToken(validToken);

      // Should accept valid token
      expect(TokenManager.isTokenExpired(validToken)).toBe(false);
      expect(TokenManager.isAuthenticated()).toBe(true);
      expect(TokenManager.getToken()).toBe(validToken);
      
      // Should not throw errors
      expect(() => TokenManager.isAuthenticated()).not.toThrow();
    });
  });

  describe('Error Message Resolution - No More "undefined" Errors', () => {
    it('should never return "undefined" error messages from ErrorHandler', () => {
      const testCases = [
        // 403 error with no message
        {
          response: { status: 403, data: {} },
          message: 'Network Error'
        },
        // 403 error with undefined message
        {
          response: { status: 403, data: { message: undefined } },
          message: 'Network Error'
        },
        // 403 error with empty message
        {
          response: { status: 403, data: { message: '' } },
          message: 'Network Error'
        },
        // 403 error with "undefined" string
        {
          response: { status: 403, data: { message: 'undefined' } },
          message: 'Network Error'
        },
        // Network error with no response
        {
          message: 'Network Error'
        }
      ];

      testCases.forEach((testCase, index) => {
        const mockError = testCase as any;
        const errorMessage = ErrorHandler.getErrorMessage(mockError);
        
        expect(errorMessage).toBeDefined();
        expect(errorMessage).not.toBe('undefined');
        expect(errorMessage).not.toBe('');
        expect(typeof errorMessage).toBe('string');
        expect(errorMessage.trim()).not.toBe('');
        
        console.log(`Test case ${index + 1}: "${errorMessage}"`);
      });
    });

    it('should provide meaningful error messages for 403 errors', () => {
      const error403Cases = [
        {
          response: { 
            status: 403, 
            data: { message: 'Access denied to resource' } 
          },
          expected: 'Access denied to resource'
        },
        {
          response: { 
            status: 403, 
            data: { error: 'Insufficient permissions' } 
          },
          expected: 'Insufficient permissions'
        },
        {
          response: { 
            status: 403, 
            data: {} 
          },
          expected: 'Acesso negado. Você não tem permissão para acessar este recurso.'
        }
      ];

      error403Cases.forEach((testCase) => {
        const errorMessage = ErrorHandler.getErrorMessage(testCase as any);
        
        expect(errorMessage).toBe(testCase.expected);
        expect(errorMessage).not.toContain('undefined');
      });
    });

    it('should extract error messages from various response formats', () => {
      const responseFormats = [
        { message: 'Error from message field' },
        { error: 'Error from error field' },
        { details: 'Error from details field' },
        { errorMessage: 'Error from errorMessage field' },
        { description: 'Error from description field' }
      ];

      responseFormats.forEach((data) => {
        const mockError = {
          response: { status: 400, data },
          message: 'Network Error'
        };

        const errorMessage = ErrorHandler.getErrorMessage(mockError as any);
        const expectedMessage = Object.values(data)[0];
        
        expect(errorMessage).toBe(expectedMessage);
      });
    });

    it('should handle network errors with meaningful messages', () => {
      const networkError = {
        message: 'Network Error'
      };

      const errorMessage = ErrorHandler.getErrorMessage(networkError as any);
      
      // The ErrorHandler should return a meaningful message (not undefined)
      expect(errorMessage).toBeDefined();
      expect(errorMessage).not.toBe('undefined');
      expect(errorMessage).not.toBe('');
      expect(errorMessage).not.toContain('undefined');
      expect(typeof errorMessage).toBe('string');
      expect(errorMessage.trim()).not.toBe('');
    });

    it('should handle timeout errors with meaningful messages', () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 10000ms exceeded'
      };

      const errorType = ErrorHandler.getErrorType(timeoutError as any);
      const errorMessage = ErrorHandler.getErrorMessage(timeoutError as any);

      expect(errorType).toBe('timeout');
      // The error message should be meaningful (not undefined)
      expect(errorMessage).toBeDefined();
      expect(errorMessage).not.toBe('undefined');
      expect(errorMessage).not.toBe('');
      expect(errorMessage).not.toContain('undefined');
      expect(typeof errorMessage).toBe('string');
      expect(errorMessage.trim()).not.toBe('');
    });
  });

  describe('Error Type Classification', () => {
    it('should correctly classify different error types', () => {
      const errorCases = [
        {
          error: { response: { status: 401 } },
          expectedType: 'auth'
        },
        {
          error: { response: { status: 403 } },
          expectedType: 'auth'
        },
        {
          error: { response: { status: 500 } },
          expectedType: 'server'
        },
        {
          error: { response: { status: 400 } },
          expectedType: 'client'
        },
        {
          error: { code: 'ECONNABORTED', message: 'timeout' },
          expectedType: 'timeout'
        },
        {
          error: { message: 'Network Error' },
          expectedType: 'network'
        }
      ];

      errorCases.forEach(({ error, expectedType }) => {
        const actualType = ErrorHandler.getErrorType(error as any);
        expect(actualType).toBe(expectedType);
      });
    });
  });

  describe('Session Management Without Errors', () => {
    it('should handle session operations without errors', () => {
      // Test session clearing
      expect(() => SessionManager.clearSession()).not.toThrow();
      
      const sessionInfoAfterClear = SessionManager.getSessionInfo();
      expect(sessionInfoAfterClear.hasSession).toBe(false);
      
      // Test session initialization
      expect(() => SessionManager.initialize()).not.toThrow();
      
      const initResult = SessionManager.initialize();
      expect(initResult.isValid).toBe(false); // No valid session should exist
      
      // Test session validation
      expect(() => SessionManager.validateSession()).not.toThrow();
      
      const validationResult = SessionManager.validateSession();
      expect(validationResult.isValid).toBe(false); // No session to validate
    });

    it('should handle missing session gracefully', () => {
      // Clear any existing session
      SessionManager.clearSession();
      
      // Should handle missing session without errors
      const sessionInfo = SessionManager.getSessionInfo();
      expect(sessionInfo.hasSession).toBe(false);
      expect(sessionInfo.isValid).toBe(false);
      
      // Should not throw errors
      expect(() => SessionManager.getSessionInfo()).not.toThrow();
    });
  });

  describe('Frontend Loading Verification', () => {
    it('should verify TokenManager is properly initialized', () => {
      // TokenManager should be available and functional
      expect(TokenManager).toBeDefined();
      expect(typeof TokenManager.getToken).toBe('function');
      expect(typeof TokenManager.setToken).toBe('function');
      expect(typeof TokenManager.clearToken).toBe('function');
      expect(typeof TokenManager.isAuthenticated).toBe('function');
      expect(typeof TokenManager.isTokenExpired).toBe('function');
    });

    it('should verify ErrorHandler is properly initialized', () => {
      // ErrorHandler should be available and functional
      expect(ErrorHandler).toBeDefined();
      expect(typeof ErrorHandler.getErrorMessage).toBe('function');
      expect(typeof ErrorHandler.getErrorType).toBe('function');
      expect(typeof ErrorHandler.extractErrorMessage).toBe('function');
    });

    it('should verify SessionManager is properly initialized', () => {
      // SessionManager should be available and functional
      expect(SessionManager).toBeDefined();
      expect(typeof SessionManager.getSessionInfo).toBe('function');
      expect(typeof SessionManager.clearSession).toBe('function');
      expect(typeof SessionManager.initialize).toBe('function');
      expect(typeof SessionManager.validateSession).toBe('function');
    });

    it('should verify no authentication errors during initialization', () => {
      // Clear any existing state
      TokenManager.clearToken();
      SessionManager.clearSession();
      
      // Initialize components - should not throw errors
      expect(() => TokenManager.isAuthenticated()).not.toThrow();
      expect(() => SessionManager.initialize()).not.toThrow();
      
      // Test ErrorHandler with a valid error object
      const testError = { response: { status: 500 } };
      expect(() => ErrorHandler.getErrorType(testError as any)).not.toThrow();
      
      // Verify no authentication errors in console
      const authErrors = consoleSpy.error.mock.calls.filter(call => 
        call.some(arg => 
          typeof arg === 'string' && 
          (arg.includes('auth') || arg.includes('token') || arg.includes('403') || arg.includes('401'))
        )
      );

      expect(authErrors).toHaveLength(0);
    });
  });

  describe('API Error Handling Verification', () => {
    it('should handle API errors without returning undefined messages', () => {
      const apiErrorScenarios = [
        {
          name: 'API 403 Error',
          error: {
            response: { status: 403, data: { message: 'Access denied' } },
            message: 'Request failed'
          }
        },
        {
          name: 'API 401 Error',
          error: {
            response: { status: 401, data: {} },
            message: 'Request failed'
          }
        },
        {
          name: 'API 500 Error',
          error: {
            response: { status: 500, data: { error: 'Internal server error' } },
            message: 'Request failed'
          }
        },
        {
          name: 'Network Connection Error',
          error: {
            message: 'Network Error'
          }
        }
      ];

      apiErrorScenarios.forEach(({ name, error }) => {
        const errorMessage = ErrorHandler.getErrorMessage(error as any);
        
        // Verify error message is meaningful
        expect(errorMessage).toBeDefined();
        expect(errorMessage).not.toBe('undefined');
        expect(errorMessage).not.toBe('');
        expect(typeof errorMessage).toBe('string');
        expect(errorMessage.trim()).not.toBe('');
        
        console.log(`${name}: "${errorMessage}"`);
      });
    });

    it('should classify API errors correctly', () => {
      const apiErrors = [
        { status: 401, expectedType: 'auth' },
        { status: 403, expectedType: 'auth' },
        { status: 404, expectedType: 'client' },
        { status: 500, expectedType: 'server' },
        { status: 502, expectedType: 'server' },
        { status: 503, expectedType: 'server' }
      ];

      apiErrors.forEach(({ status, expectedType }) => {
        const error = { response: { status } };
        const actualType = ErrorHandler.getErrorType(error as any);
        
        expect(actualType).toBe(expectedType);
      });
    });
  });
});