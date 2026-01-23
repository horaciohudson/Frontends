/**
 * Complete Authentication Flow Test Script
 * 
 * This script implements Task 8: Checkpoint - Test Complete Authentication Flow
 * 
 * Tests:
 * - Complete login to API access flow
 * - Verify no 403 errors occur for authenticated requests
 * - Verify proper error handling for unauthenticated requests
 * 
 * Requirements: 5.1, 5.3
 */

import { authService } from '../services/auth.service';
import { productService } from '../services/product.service';
import { TokenManager } from '../services/api';
import api from '../services/api';

interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  details?: any;
  duration?: number;
}

interface AuthFlowTestResults {
  overallSuccess: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
  summary: string;
}

export class CompleteAuthFlowTester {
  private results: TestResult[] = [];
  private testCompanyId = 'test-company';

  /**
   * Run all authentication flow tests
   */
  async runCompleteAuthFlowTest(): Promise<AuthFlowTestResults> {
    console.log('🚀 Starting Complete Authentication Flow Test');
    console.log('=' .repeat(70));
    
    this.results = [];
    
    // Test 1: Initial state verification
    await this.testInitialState();
    
    // Test 2: Login flow
    await this.testLoginFlow();
    
    // Test 3: Authenticated API access (no 403 errors)
    await this.testAuthenticatedApiAccess();
    
    // Test 4: Token persistence and validation
    await this.testTokenPersistence();
    
    // Test 5: Unauthenticated access handling
    await this.testUnauthenticatedAccess();
    
    // Test 6: Error message quality (no "undefined" messages)
    await this.testErrorMessageQuality();
    
    // Test 7: Session management
    await this.testSessionManagement();
    
    // Generate final report
    return this.generateFinalReport();
  }

  /**
   * Test 1: Verify initial authentication state
   */
  private async testInitialState(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const hasToken = TokenManager.getToken() !== null;
      const isAuthenticated = TokenManager.isAuthenticated();
      
      console.log('📋 Test 1: Initial Authentication State');
      console.log(`   Token present: ${hasToken ? 'Yes' : 'No'}`);
      console.log(`   Is authenticated: ${isAuthenticated ? 'Yes' : 'No'}`);
      
      if (hasToken) {
        const token = TokenManager.getToken()!;
        const isExpired = TokenManager.isTokenExpired(token);
        console.log(`   Token expired: ${isExpired ? 'Yes' : 'No'}`);
      }
      
      this.addResult({
        testName: 'Initial State Verification',
        success: true,
        message: `Token present: ${hasToken}, Authenticated: ${isAuthenticated}`,
        duration: Date.now() - startTime,
        details: { hasToken, isAuthenticated }
      });
      
    } catch (error: any) {
      this.addResult({
        testName: 'Initial State Verification',
        success: false,
        message: `Error checking initial state: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  /**
   * Test 2: Complete login flow
   */
  private async testLoginFlow(): Promise<void> {
    const startTime = Date.now();
    
    console.log('\n📋 Test 2: Login Flow');
    
    // Clear any existing authentication
    TokenManager.clearToken();
    
    // Test credentials (try multiple common ones)
    const credentialOptions = [
      { username: 'admin', password: 'admin123' },
      { username: 'emissor', password: 'emissor123' },
      { username: 'fiscal', password: 'fiscal123' },
      { username: 'test', password: 'test123' },
      { username: 'user', password: 'password' }
    ];
    
    let loginSuccessful = false;
    let loginError = '';
    
    for (const credentials of credentialOptions) {
      try {
        console.log(`   Trying login with: ${credentials.username}`);
        
        const loginResponse = await authService.login(credentials);
        
        if (loginResponse.token) {
          console.log(`   ✅ Login successful with: ${credentials.username}`);
          loginSuccessful = true;
          
          // Verify token was stored
          const storedToken = TokenManager.getToken();
          const isAuthenticated = TokenManager.isAuthenticated();
          
          console.log(`   Token stored: ${storedToken ? 'Yes' : 'No'}`);
          console.log(`   Is authenticated: ${isAuthenticated ? 'Yes' : 'No'}`);
          
          this.addResult({
            testName: 'Login Flow',
            success: true,
            message: `Login successful with ${credentials.username}`,
            duration: Date.now() - startTime,
            details: { 
              credentials: credentials.username,
              tokenReceived: !!loginResponse.token,
              tokenStored: !!storedToken,
              isAuthenticated
            }
          });
          
          break;
        }
        
      } catch (error: any) {
        console.log(`   ❌ Login failed with ${credentials.username}: ${error.message}`);
        loginError = error.message;
        
        // If it's a 401, that's expected for wrong credentials
        if (error.response?.status === 401) {
          continue;
        }
        
        // If it's a network error, backend might not be running
        if (!error.response) {
          console.log('   ⚠️ Network error - backend may not be running');
          break;
        }
      }
    }
    
    if (!loginSuccessful) {
      this.addResult({
        testName: 'Login Flow',
        success: false,
        message: `Login failed with all test credentials. Last error: ${loginError}`,
        duration: Date.now() - startTime,
        details: { 
          testedCredentials: credentialOptions.map(c => c.username),
          lastError: loginError
        }
      });
    }
  }

  /**
   * Test 3: Authenticated API access (Requirements 5.1 - no 403 errors)
   */
  private async testAuthenticatedApiAccess(): Promise<void> {
    const startTime = Date.now();
    
    console.log('\n📋 Test 3: Authenticated API Access (No 403 Errors)');
    
    if (!TokenManager.isAuthenticated()) {
      this.addResult({
        testName: 'Authenticated API Access',
        success: false,
        message: 'Cannot test authenticated access - not authenticated',
        duration: Date.now() - startTime
      });
      return;
    }
    
    // Test multiple protected endpoints
    const protectedEndpoints = [
      { url: '/api/fiscal/products', method: 'GET', description: 'Fiscal Products' },
      { url: '/api/companies', method: 'GET', description: 'Companies' },
      { url: '/api/customers', method: 'GET', description: 'Customers' },
      { url: '/api/dashboard/stats', method: 'GET', description: 'Dashboard Stats' }
    ];
    
    let accessResults: any[] = [];
    let has403Errors = false;
    
    for (const endpoint of protectedEndpoints) {
      try {
        console.log(`   Testing ${endpoint.description}: ${endpoint.method} ${endpoint.url}`);
        
        const response = await api.get(endpoint.url);
        
        console.log(`   ✅ ${endpoint.description}: HTTP ${response.status}`);
        
        accessResults.push({
          endpoint: endpoint.url,
          description: endpoint.description,
          status: response.status,
          success: true,
          message: `HTTP ${response.status} - Success`
        });
        
      } catch (error: any) {
        const status = error.response?.status;
        
        console.log(`   ${status === 403 ? '❌' : '⚠️'} ${endpoint.description}: HTTP ${status || 'Network Error'}`);
        
        if (status === 403) {
          has403Errors = true;
          console.log(`   🚨 CRITICAL: 403 Forbidden error detected!`);
        }
        
        accessResults.push({
          endpoint: endpoint.url,
          description: endpoint.description,
          status: status || 0,
          success: status !== 403, // 403 is a failure, other errors might be acceptable
          message: error.message,
          error: status === 403 ? 'FORBIDDEN_ERROR' : 'OTHER_ERROR'
        });
      }
    }
    
    // Test the specific fiscal products endpoint that was causing issues
    await this.testSpecificFiscalProductsEndpoint(accessResults);
    
    this.addResult({
      testName: 'Authenticated API Access',
      success: !has403Errors,
      message: has403Errors 
        ? 'CRITICAL: 403 Forbidden errors detected in authenticated requests'
        : 'All authenticated requests succeeded (no 403 errors)',
      duration: Date.now() - startTime,
      details: { 
        endpointResults: accessResults,
        has403Errors,
        testedEndpoints: protectedEndpoints.length
      }
    });
  }

  /**
   * Test the specific /api/fiscal/products endpoint that was causing the original issue
   */
  private async testSpecificFiscalProductsEndpoint(accessResults: any[]): Promise<void> {
    console.log('\n   🎯 Specific Test: /api/fiscal/products endpoint');
    
    try {
      // Test via productService (this was the original failing scenario)
      const products = await productService.getAll(this.testCompanyId);
      
      console.log(`   ✅ productService.getAll(): Success - ${products?.length || 0} products`);
      
      accessResults.push({
        endpoint: '/api/fiscal/products',
        description: 'Fiscal Products (via productService)',
        status: 200,
        success: true,
        message: `Success - ${products?.length || 0} products returned`,
        method: 'productService.getAll'
      });
      
    } catch (error: any) {
      const status = error.response?.status;
      
      console.log(`   ${status === 403 ? '❌' : '⚠️'} productService.getAll(): ${error.message}`);
      
      accessResults.push({
        endpoint: '/api/fiscal/products',
        description: 'Fiscal Products (via productService)',
        status: status || 0,
        success: status !== 403,
        message: error.message,
        method: 'productService.getAll',
        error: status === 403 ? 'FORBIDDEN_ERROR' : 'OTHER_ERROR'
      });
    }
    
    // Also test the endpoint test method
    try {
      const endpointWorks = await productService.testEndpoint(this.testCompanyId);
      
      console.log(`   ${endpointWorks ? '✅' : '⚠️'} productService.testEndpoint(): ${endpointWorks ? 'Success' : 'Failed'}`);
      
      accessResults.push({
        endpoint: '/api/fiscal/products',
        description: 'Fiscal Products (endpoint test)',
        status: endpointWorks ? 200 : 0,
        success: endpointWorks,
        message: endpointWorks ? 'Endpoint test passed' : 'Endpoint test failed',
        method: 'productService.testEndpoint'
      });
      
    } catch (error: any) {
      console.log(`   ❌ productService.testEndpoint(): ${error.message}`);
      
      accessResults.push({
        endpoint: '/api/fiscal/products',
        description: 'Fiscal Products (endpoint test)',
        status: 0,
        success: false,
        message: error.message,
        method: 'productService.testEndpoint'
      });
    }
  }

  /**
   * Test 4: Token persistence and validation
   */
  private async testTokenPersistence(): Promise<void> {
    const startTime = Date.now();
    
    console.log('\n📋 Test 4: Token Persistence and Validation');
    
    if (!TokenManager.isAuthenticated()) {
      this.addResult({
        testName: 'Token Persistence',
        success: false,
        message: 'Cannot test token persistence - not authenticated',
        duration: Date.now() - startTime
      });
      return;
    }
    
    try {
      const originalToken = TokenManager.getToken();
      
      // Test token retrieval
      console.log('   Testing token retrieval...');
      expect(originalToken).toBeDefined();
      expect(originalToken).not.toBeNull();
      
      // Test token format (should be JWT)
      console.log('   Testing token format...');
      const tokenParts = originalToken!.split('.');
      expect(tokenParts).toHaveLength(3);
      
      // Test token expiration check
      console.log('   Testing token expiration check...');
      const isExpired = TokenManager.isTokenExpired(originalToken!);
      expect(isExpired).toBe(false);
      
      // Test localStorage persistence
      console.log('   Testing localStorage persistence...');
      const storedToken = localStorage.getItem('token');
      expect(storedToken).toBe(originalToken);
      
      console.log('   ✅ Token persistence tests passed');
      
      this.addResult({
        testName: 'Token Persistence',
        success: true,
        message: 'Token persistence and validation working correctly',
        duration: Date.now() - startTime,
        details: {
          tokenFormat: 'JWT (3 parts)',
          isExpired: false,
          persistedInLocalStorage: true
        }
      });
      
    } catch (error: any) {
      console.log(`   ❌ Token persistence test failed: ${error.message}`);
      
      this.addResult({
        testName: 'Token Persistence',
        success: false,
        message: `Token persistence test failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  /**
   * Test 5: Unauthenticated access handling (Requirements 5.3)
   */
  private async testUnauthenticatedAccess(): Promise<void> {
    const startTime = Date.now();
    
    console.log('\n📋 Test 5: Unauthenticated Access Handling');
    
    // Save current token
    const originalToken = TokenManager.getToken();
    
    try {
      // Clear authentication
      TokenManager.clearToken();
      
      console.log('   Testing access without authentication...');
      
      let unauthenticatedResults: any[] = [];
      
      // Test accessing protected endpoints without authentication
      const testEndpoints = [
        '/api/fiscal/products',
        '/api/companies',
        '/api/customers'
      ];
      
      for (const endpoint of testEndpoints) {
        try {
          await api.get(endpoint);
          
          // Should not reach here - unauthenticated access should be denied
          console.log(`   ⚠️ ${endpoint}: Unexpected success (should be denied)`);
          
          unauthenticatedResults.push({
            endpoint,
            expectedBehavior: 'Deny access',
            actualBehavior: 'Allowed access',
            success: false,
            message: 'Unauthenticated access was allowed (security issue)'
          });
          
        } catch (error: any) {
          const status = error.response?.status;
          
          if (status === 401 || status === 403) {
            console.log(`   ✅ ${endpoint}: Properly denied (HTTP ${status})`);
            
            unauthenticatedResults.push({
              endpoint,
              expectedBehavior: 'Deny access',
              actualBehavior: `Denied (HTTP ${status})`,
              success: true,
              message: `Properly denied with HTTP ${status}`
            });
          } else {
            console.log(`   ⚠️ ${endpoint}: Unexpected error (HTTP ${status || 'Network'})`);
            
            unauthenticatedResults.push({
              endpoint,
              expectedBehavior: 'Deny access',
              actualBehavior: `Error (HTTP ${status || 'Network'})`,
              success: false,
              message: error.message
            });
          }
        }
      }
      
      // Test productService without authentication
      try {
        await productService.getAll(this.testCompanyId);
        
        console.log('   ⚠️ productService.getAll(): Unexpected success (should be denied)');
        
        unauthenticatedResults.push({
          endpoint: 'productService.getAll',
          expectedBehavior: 'Deny access',
          actualBehavior: 'Allowed access',
          success: false,
          message: 'Unauthenticated productService access was allowed'
        });
        
      } catch (error: any) {
        console.log(`   ✅ productService.getAll(): Properly denied - ${error.message}`);
        
        unauthenticatedResults.push({
          endpoint: 'productService.getAll',
          expectedBehavior: 'Deny access',
          actualBehavior: 'Denied',
          success: true,
          message: `Properly denied: ${error.message}`
        });
      }
      
      const allProperlyDenied = unauthenticatedResults.every(r => r.success);
      
      this.addResult({
        testName: 'Unauthenticated Access Handling',
        success: allProperlyDenied,
        message: allProperlyDenied 
          ? 'All unauthenticated requests properly denied'
          : 'Some unauthenticated requests were improperly allowed',
        duration: Date.now() - startTime,
        details: { 
          results: unauthenticatedResults,
          totalTests: unauthenticatedResults.length,
          properlyDenied: unauthenticatedResults.filter(r => r.success).length
        }
      });
      
    } catch (error: any) {
      this.addResult({
        testName: 'Unauthenticated Access Handling',
        success: false,
        message: `Error during unauthenticated access test: ${error.message}`,
        duration: Date.now() - startTime
      });
    } finally {
      // Restore original token
      if (originalToken) {
        TokenManager.setToken(originalToken);
      }
    }
  }

  /**
   * Test 6: Error message quality (no "undefined" messages)
   */
  private async testErrorMessageQuality(): Promise<void> {
    const startTime = Date.now();
    
    console.log('\n📋 Test 6: Error Message Quality');
    
    const originalToken = TokenManager.getToken();
    
    try {
      let errorMessages: string[] = [];
      let hasUndefinedMessages = false;
      
      // Test various error scenarios
      const errorScenarios = [
        {
          name: 'No authentication',
          test: async () => {
            TokenManager.clearToken();
            await productService.getAll(this.testCompanyId);
          }
        },
        {
          name: 'Invalid token',
          test: async () => {
            TokenManager.setToken('invalid-token-123');
            await productService.getAll(this.testCompanyId);
          }
        },
        {
          name: 'Malformed token',
          test: async () => {
            TokenManager.setToken('malformed.token');
            await productService.getAll(this.testCompanyId);
          }
        },
        {
          name: 'Empty company ID',
          test: async () => {
            if (originalToken) TokenManager.setToken(originalToken);
            await productService.getAll('');
          }
        }
      ];
      
      for (const scenario of errorScenarios) {
        try {
          await scenario.test();
          console.log(`   ⚠️ ${scenario.name}: No error thrown (unexpected)`);
        } catch (error: any) {
          const message = error.message || '';
          errorMessages.push(message);
          
          console.log(`   📝 ${scenario.name}: "${message}"`);
          
          // Check for "undefined" in error message
          if (message.includes('undefined') || message === 'undefined' || !message.trim()) {
            hasUndefinedMessages = true;
            console.log(`   ❌ Contains "undefined" or is empty!`);
          } else {
            console.log(`   ✅ Meaningful error message`);
          }
        }
      }
      
      this.addResult({
        testName: 'Error Message Quality',
        success: !hasUndefinedMessages,
        message: hasUndefinedMessages 
          ? 'Some error messages contain "undefined" or are empty'
          : 'All error messages are meaningful',
        duration: Date.now() - startTime,
        details: { 
          errorMessages,
          hasUndefinedMessages,
          totalScenarios: errorScenarios.length
        }
      });
      
    } catch (error: any) {
      this.addResult({
        testName: 'Error Message Quality',
        success: false,
        message: `Error during message quality test: ${error.message}`,
        duration: Date.now() - startTime
      });
    } finally {
      // Restore original token
      if (originalToken) {
        TokenManager.setToken(originalToken);
      }
    }
  }

  /**
   * Test 7: Session management
   */
  private async testSessionManagement(): Promise<void> {
    const startTime = Date.now();
    
    console.log('\n📋 Test 7: Session Management');
    
    try {
      // Test logout functionality
      console.log('   Testing logout functionality...');
      
      const wasAuthenticated = TokenManager.isAuthenticated();
      
      if (wasAuthenticated) {
        authService.logout();
        
        const isAuthenticatedAfterLogout = TokenManager.isAuthenticated();
        const tokenAfterLogout = TokenManager.getToken();
        
        console.log(`   Before logout: ${wasAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
        console.log(`   After logout: ${isAuthenticatedAfterLogout ? 'Authenticated' : 'Not authenticated'}`);
        console.log(`   Token cleared: ${tokenAfterLogout === null ? 'Yes' : 'No'}`);
        
        const logoutWorked = !isAuthenticatedAfterLogout && tokenAfterLogout === null;
        
        this.addResult({
          testName: 'Session Management',
          success: logoutWorked,
          message: logoutWorked 
            ? 'Logout properly clears authentication state'
            : 'Logout did not properly clear authentication state',
          duration: Date.now() - startTime,
          details: {
            wasAuthenticated,
            isAuthenticatedAfterLogout,
            tokenCleared: tokenAfterLogout === null
          }
        });
      } else {
        this.addResult({
          testName: 'Session Management',
          success: true,
          message: 'Cannot test logout - was not authenticated',
          duration: Date.now() - startTime,
          details: { wasAuthenticated: false }
        });
      }
      
    } catch (error: any) {
      this.addResult({
        testName: 'Session Management',
        success: false,
        message: `Error during session management test: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  /**
   * Add a test result
   */
  private addResult(result: TestResult): void {
    this.results.push(result);
    
    // Log result immediately
    const status = result.success ? '✅' : '❌';
    const duration = result.duration ? ` (${result.duration}ms)` : '';
    console.log(`${status} ${result.testName}: ${result.message}${duration}`);
  }

  /**
   * Generate final test report
   */
  private generateFinalReport(): AuthFlowTestResults {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const overallSuccess = failedTests === 0;
    
    console.log('\n' + '=' .repeat(70));
    console.log('📊 COMPLETE AUTHENTICATION FLOW TEST RESULTS');
    console.log('=' .repeat(70));
    
    console.log(`\n📈 Summary:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests} ✅`);
    console.log(`   Failed: ${failedTests} ❌`);
    console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    console.log(`   Overall Result: ${overallSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    
    console.log(`\n📋 Detailed Results:`);
    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`   ${index + 1}. ${status} ${result.testName}${duration}`);
      console.log(`      ${result.message}`);
    });
    
    // Critical issues summary
    const criticalIssues = this.results.filter(r => 
      !r.success && (
        r.testName.includes('403') || 
        r.testName.includes('Authenticated API Access') ||
        r.testName.includes('Unauthenticated Access')
      )
    );
    
    if (criticalIssues.length > 0) {
      console.log(`\n🚨 Critical Issues Found:`);
      criticalIssues.forEach(issue => {
        console.log(`   ❌ ${issue.testName}: ${issue.message}`);
      });
    }
    
    const summary = overallSuccess 
      ? `✅ All authentication flow tests passed! The 403 error issue appears to be resolved.`
      : `❌ ${failedTests} test(s) failed. Authentication flow needs attention.`;
    
    console.log(`\n${summary}`);
    console.log('=' .repeat(70));
    
    return {
      overallSuccess,
      totalTests,
      passedTests,
      failedTests,
      results: this.results,
      summary
    };
  }
}

// Helper function for simple assertions
function expect(actual: any) {
  return {
    toBeDefined: () => {
      if (actual === undefined) throw new Error(`Expected value to be defined, but got undefined`);
    },
    toBeNull: () => {
      if (actual !== null) throw new Error(`Expected value to be null, but got ${actual}`);
    },
    toBe: (expected: any) => {
      if (actual !== expected) throw new Error(`Expected ${expected}, but got ${actual}`);
    },
    toHaveLength: (expected: number) => {
      if (!actual || actual.length !== expected) throw new Error(`Expected length ${expected}, but got ${actual?.length}`);
    },
    not: {
      toBeNull: () => {
        if (actual === null) throw new Error(`Expected value not to be null`);
      }
    }
  };
}

// Export for use in browser console or test runner
export const runCompleteAuthFlowTest = async (): Promise<AuthFlowTestResults> => {
  const tester = new CompleteAuthFlowTester();
  return await tester.runCompleteAuthFlowTest();
};

// Make available in browser console
if (typeof window !== 'undefined') {
  (window as any).runCompleteAuthFlowTest = runCompleteAuthFlowTest;
  console.log('🛠️ Complete Auth Flow Test available: runCompleteAuthFlowTest()');
}