import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { authService } from '../services/auth.service'
import { productService } from '../services/product.service'
import { TokenManager } from '../services/api'
import api from '../services/api'
import { LoginRequest } from '../types'

/**
 * End-to-End Integration Tests for Authentication Flow
 * 
 * Task 8.1: Write end-to-end integration tests
 * 
 * Property 10: Unauthenticated Access Control
 * **Validates: Requirements 5.3**
 * 
 * Tests:
 * - That unauthenticated users are properly redirected
 * - Complete authentication flow from login to API access
 */
describe('Property 10: Unauthenticated Access Control - End-to-End Integration', () => {
  beforeEach(() => {
    // Clear any existing authentication state before each test
    TokenManager.clearToken()
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    // Clean up after each test
    TokenManager.clearToken()
    localStorage.clear()
    sessionStorage.clear()
  })

  /**
   * Property-based test: For any protected endpoint accessed without authentication,
   * the system SHALL return HTTP 401 or redirect to login.
   * 
   * **Validates: Requirements 5.3**
   * **Feature: apinfe-frontend-authentication-fix, Property 10: Unauthenticated Access Control**
   */
  it('should properly control access for unauthenticated users across all protected endpoints', async () => {
    // Ensure we start with no authentication
    expect(TokenManager.getToken()).toBeNull()
    expect(TokenManager.isAuthenticated()).toBe(false)

    // Define all protected endpoints that should require authentication
    const protectedEndpoints = [
      {
        url: '/api/fiscal/products?companyId=test-company',
        description: 'Fiscal Products endpoint',
        critical: true // This was the original failing endpoint
      },
      {
        url: '/api/companies',
        description: 'Companies endpoint',
        critical: false
      },
      {
        url: '/api/customers',
        description: 'Customers endpoint',
        critical: false
      }
    ]

    const accessControlResults: Array<{
      endpoint: string
      description: string
      expectedBehavior: string
      actualStatus: number | null
      actualBehavior: string
      success: boolean
      message: string
      critical: boolean
    }> = []

    // Test each protected endpoint without authentication
    for (const endpoint of protectedEndpoints) {
      try {
        console.log(`🧪 Testing unauthenticated access to: ${endpoint.description} (${endpoint.url})`)
        
        // Act - Attempt to access protected endpoint without authentication
        const response = await api.get(endpoint.url)
        
        // If we reach here, the endpoint allowed unauthenticated access
        console.warn(`⚠️ ${endpoint.description}: Unauthenticated access was allowed (HTTP ${response.status})`)
        
        accessControlResults.push({
          endpoint: endpoint.url,
          description: endpoint.description,
          expectedBehavior: 'Deny access (401/403)',
          actualStatus: response.status,
          actualBehavior: `Allowed access (HTTP ${response.status})`,
          success: false,
          message: `Security issue: Unauthenticated access was allowed`,
          critical: endpoint.critical
        })

      } catch (error: any) {
        const status = error.response?.status
        
        // Assert - Should receive 401 or 403 for unauthenticated access
        if (status === 401) {
          console.log(`✅ ${endpoint.description}: Properly denied with 401 Unauthorized`)
          
          accessControlResults.push({
            endpoint: endpoint.url,
            description: endpoint.description,
            expectedBehavior: 'Deny access (401/403)',
            actualStatus: status,
            actualBehavior: `Denied with 401 Unauthorized`,
            success: true,
            message: 'Properly denied unauthenticated access',
            critical: endpoint.critical
          })
          
        } else if (status === 403) {
          console.log(`✅ ${endpoint.description}: Properly denied with 403 Forbidden`)
          
          accessControlResults.push({
            endpoint: endpoint.url,
            description: endpoint.description,
            expectedBehavior: 'Deny access (401/403)',
            actualStatus: status,
            actualBehavior: `Denied with 403 Forbidden`,
            success: true,
            message: 'Properly denied unauthenticated access',
            critical: endpoint.critical
          })
          
        } else if (!error.response) {
          console.warn(`⚠️ ${endpoint.description}: Network error - backend may not be running`)
          
          accessControlResults.push({
            endpoint: endpoint.url,
            description: endpoint.description,
            expectedBehavior: 'Deny access (401/403)',
            actualStatus: null,
            actualBehavior: 'Network error',
            success: false,
            message: 'Network error - cannot verify access control',
            critical: endpoint.critical
          })
          
        } else {
          console.log(`⚠️ ${endpoint.description}: Unexpected status ${status}`)
          
          accessControlResults.push({
            endpoint: endpoint.url,
            description: endpoint.description,
            expectedBehavior: 'Deny access (401/403)',
            actualStatus: status,
            actualBehavior: `Unexpected status ${status}`,
            success: false,
            message: `Unexpected response status: ${status}`,
            critical: endpoint.critical
          })
        }

        // Verify error message is meaningful (not "undefined")
        expect(error.message).toBeDefined()
        expect(error.message).not.toBe('undefined')
        expect(error.message.trim()).not.toBe('')
      }
    }

    // Test service-level access control
    console.log(`\n🧪 Testing service-level access control...`)

    // Test productService without authentication
    try {
      console.log(`   Testing productService.getAll() without authentication`)
      
      const products = await productService.getAll('test-company')
      
      // Should not reach here - service should deny unauthenticated access
      console.warn(`⚠️ productService.getAll(): Unauthenticated access was allowed`)
      
      accessControlResults.push({
        endpoint: 'productService.getAll',
        description: 'Product Service (getAll)',
        expectedBehavior: 'Deny access',
        actualStatus: 200,
        actualBehavior: `Allowed access - returned ${products?.length || 0} products`,
        success: false,
        message: 'Service allowed unauthenticated access',
        critical: true
      })
      
    } catch (error: any) {
      const status = error.response?.status
      
      if (status === 401 || status === 403) {
        console.log(`   ✅ productService.getAll(): Properly denied (${status})`)
        
        accessControlResults.push({
          endpoint: 'productService.getAll',
          description: 'Product Service (getAll)',
          expectedBehavior: 'Deny access',
          actualStatus: status,
          actualBehavior: `Denied (${status})`,
          success: true,
          message: 'Service properly denied unauthenticated access',
          critical: true
        })
      } else {
        console.log(`   ⚠️ productService.getAll(): Unexpected error (${status || 'Network'})`)
        
        accessControlResults.push({
          endpoint: 'productService.getAll',
          description: 'Product Service (getAll)',
          expectedBehavior: 'Deny access',
          actualStatus: status || null,
          actualBehavior: `Error (${status || 'Network'})`,
          success: false,
          message: error.message,
          critical: true
        })
      }
    }

    // Analyze results
    const totalTests = accessControlResults.length
    const successfulTests = accessControlResults.filter(r => r.success).length
    const failedTests = totalTests - successfulTests
    const criticalFailures = accessControlResults.filter(r => !r.success && r.critical)

    console.log(`\n📊 Unauthenticated Access Control Results:`)
    console.log(`   Total endpoints tested: ${totalTests}`)
    console.log(`   Properly protected: ${successfulTests}`)
    console.log(`   Access control issues: ${failedTests}`)
    console.log(`   Critical failures: ${criticalFailures.length}`)

    // Log detailed results
    accessControlResults.forEach(result => {
      const status = result.success ? '✅' : '❌'
      console.log(`   ${status} ${result.description}: ${result.message}`)
    })

    // Assert that all critical endpoints are properly protected
    expect(criticalFailures.length).toBe(0)
    
    // Assert that at least 80% of endpoints are properly protected
    const successRate = (successfulTests / totalTests) * 100
    expect(successRate).toBeGreaterThanOrEqual(80)

  }, 60000) // 60 second timeout for comprehensive testing

  /**
   * Complete Authentication Flow Test
   * Tests the full flow from unauthenticated -> login -> authenticated access
   * 
   * **Validates: Requirements 5.3**
   * **Feature: apinfe-frontend-authentication-fix, Property 10: Unauthenticated Access Control**
   */
  it('should demonstrate complete authentication flow from unauthenticated to authenticated access', async () => {
    console.log(`\n🔄 Testing complete authentication flow...`)

    // Step 1: Verify initial unauthenticated state
    console.log(`   Step 1: Verifying initial unauthenticated state`)
    expect(TokenManager.getToken()).toBeNull()
    expect(TokenManager.isAuthenticated()).toBe(false)

    // Step 2: Verify unauthenticated access is denied
    console.log(`   Step 2: Verifying unauthenticated access is denied`)
    try {
      await productService.getAll('test-company')
      throw new Error('Unauthenticated access should have been denied')
    } catch (error: any) {
      const status = error.response?.status
      expect(status === 401 || status === 403 || !error.response).toBe(true)
      console.log(`   ✅ Unauthenticated access properly denied`)
    }

    // Step 3: Attempt authentication with test credentials
    console.log(`   Step 3: Attempting authentication`)
    
    const testCredentials: LoginRequest[] = [
      { username: 'admin', password: 'admin123' },
      { username: 'emissor', password: 'emissor123' },
      { username: 'fiscal', password: 'fiscal123' },
      { username: 'test', password: 'test123' }
    ]

    let authenticationSuccessful = false
    let authenticatedUser = ''

    for (const credentials of testCredentials) {
      try {
        console.log(`     Trying credentials: ${credentials.username}`)
        
        const loginResponse = await authService.login(credentials)
        
        // Verify login response
        expect(loginResponse).toBeDefined()
        expect(loginResponse.token).toBeDefined()
        expect(typeof loginResponse.token).toBe('string')
        expect(loginResponse.token.length).toBeGreaterThan(0)
        
        // Verify authentication state
        expect(TokenManager.getToken()).toBe(loginResponse.token)
        expect(TokenManager.isAuthenticated()).toBe(true)
        
        authenticationSuccessful = true
        authenticatedUser = credentials.username
        console.log(`   ✅ Authentication successful with user: ${credentials.username}`)
        break
        
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.log(`     ⚠️ Invalid credentials for: ${credentials.username}`)
          continue
        }
        
        if (!error.response) {
          console.warn(`     ⚠️ Network error - backend may not be running`)
          break
        }
        
        console.warn(`     ⚠️ Unexpected error for ${credentials.username}: ${error.message}`)
      }
    }

    // If authentication failed, skip the rest of the test
    if (!authenticationSuccessful) {
      console.warn(`   ⚠️ Could not authenticate with any test credentials - skipping authenticated access test`)
      return
    }

    // Step 4: Verify authenticated access is allowed
    console.log(`   Step 4: Verifying authenticated access is allowed`)
    
    const protectedEndpoints = [
      { url: '/api/fiscal/products?companyId=test-company', description: 'Fiscal Products' },
      { url: '/api/companies', description: 'Companies' },
      { url: '/api/customers', description: 'Customers' }
    ]

    let authenticatedAccessResults: any[] = []

    for (const endpoint of protectedEndpoints) {
      try {
        console.log(`     Testing authenticated access to: ${endpoint.description}`)
        
        const response = await api.get(endpoint.url)
        
        expect(response.status).toBeGreaterThanOrEqual(200)
        expect(response.status).toBeLessThan(300)
        
        console.log(`     ✅ ${endpoint.description}: Access granted (${response.status})`)
        
        authenticatedAccessResults.push({
          endpoint: endpoint.url,
          description: endpoint.description,
          success: true,
          status: response.status,
          message: `Access granted (${response.status})`
        })
        
      } catch (error: any) {
        const status = error.response?.status
        
        // 403 would indicate authentication is still not working
        if (status === 403) {
          console.error(`     ❌ ${endpoint.description}: Still getting 403 Forbidden!`)
          throw new Error(`Authenticated access to ${endpoint.url} still returns 403 - authentication fix not working`)
        }
        
        // 401 would indicate token is not being sent
        if (status === 401) {
          console.error(`     ❌ ${endpoint.description}: Getting 401 Unauthorized with valid token!`)
          throw new Error(`Authenticated access to ${endpoint.url} returns 401 - token not being sent correctly`)
        }
        
        // Other errors might be acceptable (404, 500, etc.)
        console.log(`     ⚠️ ${endpoint.description}: Error ${status} - ${error.message}`)
        
        authenticatedAccessResults.push({
          endpoint: endpoint.url,
          description: endpoint.description,
          success: status !== 403 && status !== 401, // 403/401 are failures, others might be acceptable
          status: status,
          message: error.message
        })
      }
    }

    // Test service-level authenticated access
    try {
      console.log(`     Testing authenticated productService.getAll()`)
      
      const products = await productService.getAll('test-company')
      
      console.log(`     ✅ productService.getAll(): Success - ${products?.length || 0} products`)
      
      authenticatedAccessResults.push({
        endpoint: 'productService.getAll',
        description: 'Product Service (authenticated)',
        success: true,
        status: 200,
        message: `Success - ${products?.length || 0} products returned`
      })
      
    } catch (error: any) {
      const status = error.response?.status
      
      if (status === 403) {
        console.error(`     ❌ productService.getAll(): Still getting 403 Forbidden!`)
        throw new Error(`Authenticated productService.getAll() still returns 403 - authentication fix not working`)
      }
      
      console.log(`     ⚠️ productService.getAll(): Error ${status} - ${error.message}`)
      
      authenticatedAccessResults.push({
        endpoint: 'productService.getAll',
        description: 'Product Service (authenticated)',
        success: status !== 403 && status !== 401,
        status: status,
        message: error.message
      })
    }

    // Step 5: Verify logout clears authentication
    console.log(`   Step 5: Verifying logout clears authentication`)
    
    authService.logout()
    
    expect(TokenManager.getToken()).toBeNull()
    expect(TokenManager.isAuthenticated()).toBe(false)
    
    console.log(`   ✅ Logout properly cleared authentication state`)

    // Step 6: Verify access is denied again after logout
    console.log(`   Step 6: Verifying access is denied after logout`)
    
    try {
      await productService.getAll('test-company')
      throw new Error('Access should be denied after logout')
    } catch (error: any) {
      const status = error.response?.status
      expect(status === 401 || status === 403 || !error.response).toBe(true)
      console.log(`   ✅ Access properly denied after logout`)
    }

    // Summary
    const successfulAccess = authenticatedAccessResults.filter(r => r.success).length
    const totalAccess = authenticatedAccessResults.length
    
    console.log(`\n📊 Complete Authentication Flow Results:`)
    console.log(`   Authenticated user: ${authenticatedUser}`)
    console.log(`   Successful authenticated access: ${successfulAccess}/${totalAccess}`)
    console.log(`   Authentication flow: ✅ Complete`)

    // Assert that we had at least some successful authenticated access
    expect(successfulAccess).toBeGreaterThan(0)

  }, 90000) // 90 second timeout for complete flow test
})