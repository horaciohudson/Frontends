/**
 * Frontend Loading Verification Script
 * 
 * This script performs comprehensive verification that:
 * - Frontend loads without authentication errors
 * - "Acesso negado: undefined" error is resolved
 * - API endpoints return proper responses or meaningful errors
 * 
 * Requirements: 3.1, 4.2, 5.2
 */

import { TokenManager, ErrorHandler } from '../services/api';
import { productService } from '../services/product.service';
import { SessionManager } from '../utils/sessionManager';

interface VerificationResult {
  test: string;
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

class FrontendLoadingVerifier {
  private results: VerificationResult[] = [];

  private addResult(test: string, success: boolean, message: string, details?: any) {
    this.results.push({
      test,
      success,
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Test 1: Verify TokenManager handles various token states without errors
   */
  async testTokenManagement(): Promise<void> {
    console.log('🧪 Testing Token Management...');

    try {
      // Test 1.1: Clear token operation
      TokenManager.clearToken();
      const isAuthenticatedAfterClear = TokenManager.isAuthenticated();
      
      this.addResult(
        'Token Clear Operation',
        !isAuthenticatedAfterClear,
        isAuthenticatedAfterClear 
          ? 'Token clear failed - still authenticated' 
          : 'Token cleared successfully'
      );

      // Test 1.2: Handle missing token
      const tokenAfterClear = TokenManager.getToken();
      this.addResult(
        'Missing Token Handling',
        tokenAfterClear === null,
        tokenAfterClear === null 
          ? 'Missing token handled correctly' 
          : 'Missing token not handled correctly'
      );

      // Test 1.3: Handle invalid token
      const invalidToken = 'invalid-token-format';
      TokenManager.setToken(invalidToken);
      const isInvalidTokenExpired = TokenManager.isTokenExpired(invalidToken);
      
      this.addResult(
        'Invalid Token Detection',
        isInvalidTokenExpired,
        isInvalidTokenExpired 
          ? 'Invalid token correctly detected as expired' 
          : 'Invalid token not detected as expired'
      );

      // Test 1.4: Handle expired token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImV4cCI6MTYwMDAwMDAwMH0.test';
      TokenManager.setToken(expiredToken);
      const isExpiredTokenDetected = TokenManager.isTokenExpired(expiredToken);
      
      this.addResult(
        'Expired Token Detection',
        isExpiredTokenDetected,
        isExpiredTokenDetected 
          ? 'Expired token correctly detected' 
          : 'Expired token not detected'
      );

      // Test 1.5: Handle valid token
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImV4cCI6OTk5OTk5OTk5OX0.test';
      TokenManager.setToken(validToken);
      const isValidTokenAccepted = !TokenManager.isTokenExpired(validToken);
      
      this.addResult(
        'Valid Token Acceptance',
        isValidTokenAccepted,
        isValidTokenAccepted 
          ? 'Valid token correctly accepted' 
          : 'Valid token incorrectly rejected'
      );

    } catch (error: any) {
      this.addResult(
        'Token Management Error',
        false,
        `Error during token management tests: ${error.message}`,
        { error: error.message }
      );
    }
  }

  /**
   * Test 2: Verify ErrorHandler never returns "undefined" messages
   */
  async testErrorMessageResolution(): Promise<void> {
    console.log('🧪 Testing Error Message Resolution...');

    const errorTestCases = [
      {
        name: '403 Error with No Message',
        error: {
          response: { status: 403, data: {} },
          message: 'Request failed'
        }
      },
      {
        name: '403 Error with Undefined Message',
        error: {
          response: { status: 403, data: { message: undefined } },
          message: 'Request failed'
        }
      },
      {
        name: '403 Error with Empty Message',
        error: {
          response: { status: 403, data: { message: '' } },
          message: 'Request failed'
        }
      },
      {
        name: '403 Error with "undefined" String',
        error: {
          response: { status: 403, data: { message: 'undefined' } },
          message: 'Request failed'
        }
      },
      {
        name: 'Network Error with No Response',
        error: {
          message: 'Network Error'
        }
      },
      {
        name: 'Timeout Error',
        error: {
          code: 'ECONNABORTED',
          message: 'timeout of 10000ms exceeded'
        }
      }
    ];

    for (const testCase of errorTestCases) {
      try {
        const errorMessage = ErrorHandler.getErrorMessage(testCase.error as any);
        
        const isValidMessage = 
          errorMessage !== undefined &&
          errorMessage !== 'undefined' &&
          errorMessage !== '' &&
          typeof errorMessage === 'string' &&
          errorMessage.trim() !== '';

        this.addResult(
          `Error Message: ${testCase.name}`,
          isValidMessage,
          isValidMessage 
            ? `Valid error message: "${errorMessage}"` 
            : `Invalid error message: "${errorMessage}"`,
          { originalError: testCase.error, resolvedMessage: errorMessage }
        );

      } catch (error: any) {
        this.addResult(
          `Error Message: ${testCase.name}`,
          false,
          `Error processing test case: ${error.message}`,
          { error: error.message }
        );
      }
    }
  }

  /**
   * Test 3: Verify error type classification works correctly
   */
  async testErrorTypeClassification(): Promise<void> {
    console.log('🧪 Testing Error Type Classification...');

    const classificationTestCases = [
      {
        name: '401 Unauthorized',
        error: { response: { status: 401 } },
        expectedType: 'auth'
      },
      {
        name: '403 Forbidden',
        error: { response: { status: 403 } },
        expectedType: 'auth'
      },
      {
        name: '500 Server Error',
        error: { response: { status: 500 } },
        expectedType: 'server'
      },
      {
        name: '400 Bad Request',
        error: { response: { status: 400 } },
        expectedType: 'client'
      },
      {
        name: 'Timeout Error',
        error: { code: 'ECONNABORTED', message: 'timeout' },
        expectedType: 'timeout'
      },
      {
        name: 'Network Error',
        error: { message: 'Network Error' },
        expectedType: 'network'
      }
    ];

    for (const testCase of classificationTestCases) {
      try {
        const actualType = ErrorHandler.getErrorType(testCase.error as any);
        const isCorrectType = actualType === testCase.expectedType;

        this.addResult(
          `Error Classification: ${testCase.name}`,
          isCorrectType,
          isCorrectType 
            ? `Correctly classified as "${actualType}"` 
            : `Incorrectly classified as "${actualType}", expected "${testCase.expectedType}"`,
          { expectedType: testCase.expectedType, actualType }
        );

      } catch (error: any) {
        this.addResult(
          `Error Classification: ${testCase.name}`,
          false,
          `Error during classification: ${error.message}`,
          { error: error.message }
        );
      }
    }
  }

  /**
   * Test 4: Verify SessionManager handles various states without errors
   */
  async testSessionManagement(): Promise<void> {
    console.log('🧪 Testing Session Management...');

    try {
      // Test 4.1: Clear session operation
      SessionManager.clearSession();
      const sessionInfoAfterClear = SessionManager.getSessionInfo();
      
      this.addResult(
        'Session Clear Operation',
        !sessionInfoAfterClear.hasSession,
        !sessionInfoAfterClear.hasSession 
          ? 'Session cleared successfully' 
          : 'Session clear failed'
      );

      // Test 4.2: Initialize with no existing session
      const initResult = SessionManager.initialize();
      
      this.addResult(
        'Session Initialization',
        !initResult.isValid,
        !initResult.isValid 
          ? 'Correctly detected no valid session' 
          : 'Incorrectly detected valid session'
      );

      // Test 4.3: Validate non-existent session
      const validationResult = SessionManager.validateSession();
      
      this.addResult(
        'Session Validation',
        !validationResult.isValid,
        !validationResult.isValid 
          ? 'Correctly validated no session' 
          : 'Incorrectly validated session'
      );

    } catch (error: any) {
      this.addResult(
        'Session Management Error',
        false,
        `Error during session management tests: ${error.message}`,
        { error: error.message }
      );
    }
  }

  /**
   * Test 5: Verify API endpoint error handling
   */
  async testApiEndpointErrorHandling(): Promise<void> {
    console.log('🧪 Testing API Endpoint Error Handling...');

    // Clear any existing token to test unauthenticated scenarios
    TokenManager.clearToken();

    try {
      // Test 5.1: Test endpoint with no authentication
      try {
        await productService.getAll('test-company');
        this.addResult(
          'Unauthenticated API Call',
          false,
          'API call succeeded when it should have failed (no auth)',
          { note: 'This might indicate the backend is not properly secured' }
        );
      } catch (error: any) {
        const hasProperErrorMessage = 
          error.message && 
          error.message !== 'undefined' && 
          error.message.trim() !== '';

        this.addResult(
          'Unauthenticated API Call',
          hasProperErrorMessage,
          hasProperErrorMessage 
            ? `Properly handled with message: "${error.message}"` 
            : `Improperly handled with message: "${error.message}"`,
          { errorMessage: error.message, errorType: typeof error.message }
        );
      }

      // Test 5.2: Test endpoint with invalid token
      TokenManager.setToken('invalid-token');
      
      try {
        await productService.getAll('test-company');
        this.addResult(
          'Invalid Token API Call',
          false,
          'API call succeeded with invalid token',
          { note: 'This might indicate the backend is not validating tokens properly' }
        );
      } catch (error: any) {
        const hasProperErrorMessage = 
          error.message && 
          error.message !== 'undefined' && 
          error.message.trim() !== '';

        this.addResult(
          'Invalid Token API Call',
          hasProperErrorMessage,
          hasProperErrorMessage 
            ? `Properly handled with message: "${error.message}"` 
            : `Improperly handled with message: "${error.message}"`,
          { errorMessage: error.message, errorType: typeof error.message }
        );
      }

    } catch (error: any) {
      this.addResult(
        'API Endpoint Error Handling',
        false,
        `Unexpected error during API tests: ${error.message}`,
        { error: error.message }
      );
    }
  }

  /**
   * Run all verification tests
   */
  async runAllTests(): Promise<VerificationResult[]> {
    console.log('🚀 Starting Frontend Loading Verification Tests...');
    console.log('='.repeat(60));

    this.results = [];

    await this.testTokenManagement();
    await this.testErrorMessageResolution();
    await this.testErrorTypeClassification();
    await this.testSessionManagement();
    await this.testApiEndpointErrorHandling();

    return this.results;
  }

  /**
   * Generate a summary report
   */
  generateReport(): void {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    console.log('\n' + '='.repeat(60));
    console.log('📊 FRONTEND LOADING VERIFICATION REPORT');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));

    // Group results by category
    const categories = new Map<string, VerificationResult[]>();
    
    this.results.forEach(result => {
      const category = result.test.split(':')[0];
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(result);
    });

    // Print results by category
    categories.forEach((results, category) => {
      console.log(`\n📋 ${category.toUpperCase()}`);
      console.log('-'.repeat(40));
      
      results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${result.test}: ${result.message}`);
        
        if (result.details && !result.success) {
          console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
        }
      });
    });

    // Print failed tests summary
    const failedResults = this.results.filter(r => !r.success);
    if (failedResults.length > 0) {
      console.log('\n🚨 FAILED TESTS SUMMARY');
      console.log('-'.repeat(40));
      failedResults.forEach(result => {
        console.log(`❌ ${result.test}`);
        console.log(`   Message: ${result.message}`);
        if (result.details) {
          console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
        }
        console.log('');
      });
    }

    console.log('\n' + '='.repeat(60));
    
    if (failedTests === 0) {
      console.log('🎉 ALL TESTS PASSED! Frontend loading verification successful.');
      console.log('✅ No authentication errors detected');
      console.log('✅ "Acesso negado: undefined" error resolved');
      console.log('✅ API endpoints return proper error messages');
    } else {
      console.log('⚠️  Some tests failed. Please review the issues above.');
    }
    
    console.log('='.repeat(60));
  }
}

// Export for use in other modules
export { FrontendLoadingVerifier, type VerificationResult };

// Run verification if this script is executed directly
if (typeof window !== 'undefined') {
  const verifier = new FrontendLoadingVerifier();
  
  verifier.runAllTests().then(() => {
    verifier.generateReport();
  }).catch(error => {
    console.error('❌ Error running verification tests:', error);
  });
}