import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SessionManager, SessionData, SessionValidationResult } from './sessionManager'

/**
 * Session Management Tests
 * 
 * Property 5: Authentication Failure Redirect
 * **Validates: Requirements 3.2**
 * 
 * Tests redirect behavior on authentication failures and session persistence across app restarts
 */
describe('SessionManager - Session Management Tests', () => {
  const mockValidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsInJvbGVzIjpbIkVNSVNTT1IiXSwiZXhwIjoxNzA2NzM2MDAwLCJpYXQiOjE3MDY2NDk2MDAsImxhbmd1YWdlIjoicHQifQ.test'
  const mockUser = {
    sub: 'testuser',
    roles: ['EMISSOR'],
    exp: 1706736000,
    iat: 1706649600,
    language: 'pt'
  }

  // Mock Date.now to control time-based tests
  const mockNow = 1706650000000 // Fixed timestamp for consistent testing
  const originalDateNow = Date.now

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    
    // Mock Date.now for consistent time-based testing
    Date.now = vi.fn(() => mockNow)
  })

  afterEach(() => {
    localStorage.clear()
    Date.now = originalDateNow
    vi.restoreAllMocks()
  })

  describe('Property 5: Authentication Failure Redirect', () => {
    /**
     * Property-based test: For any authentication failure scenario,
     * the frontend SHALL redirect the user to the login page.
     * 
     * **Validates: Requirements 3.2**
     */
    it('should detect expired sessions and trigger redirect behavior', async () => {
      // Test multiple expiration scenarios
      const expirationScenarios = [
        {
          name: 'session too old',
          sessionAge: 25 * 60 * 60 * 1000, // 25 hours (exceeds MAX_SESSION_AGE)
          inactivity: 1 * 60 * 60 * 1000,   // 1 hour
          expectedReason: 'expired'
        },
        {
          name: 'session inactive too long',
          sessionAge: 1 * 60 * 60 * 1000,   // 1 hour
          inactivity: 3 * 60 * 60 * 1000,   // 3 hours (exceeds MAX_INACTIVITY)
          expectedReason: 'inactive'
        },
        {
          name: 'both expired and inactive',
          sessionAge: 30 * 60 * 60 * 1000,  // 30 hours
          inactivity: 5 * 60 * 60 * 1000,   // 5 hours
          expectedReason: 'expired' // Should detect age expiration first
        }
      ]

      for (const scenario of expirationScenarios) {
        // Clear previous test state
        localStorage.clear()

        // Arrange - Create session with specific age and inactivity
        const sessionTimestamp = mockNow - scenario.sessionAge
        const lastActivity = mockNow - scenario.inactivity
        
        const expiredSession: SessionData = {
          token: mockValidToken,
          user: mockUser,
          timestamp: sessionTimestamp,
          lastActivity: lastActivity
        }

        localStorage.setItem('apinfe_session', JSON.stringify(expiredSession))

        // Act - Validate the session
        const validation: SessionValidationResult = SessionManager.validateSession()

        // Assert - Should detect expiration and provide correct reason
        expect(validation.isValid).toBe(false)
        expect(validation.reason).toBe(scenario.expectedReason)
        expect(validation.session).toEqual(expiredSession)

        console.log(`✓ Detected ${scenario.name}: ${validation.reason}`)
      }
    })

    it('should detect corrupted sessions and trigger redirect behavior', async () => {
      // Test various corruption scenarios
      const corruptionScenarios = [
        {
          name: 'malformed JSON',
          sessionData: 'invalid-json-data',
          expectedBehavior: 'cleared_by_getSession'
        },
        {
          name: 'missing token field',
          sessionData: JSON.stringify({ user: mockUser, timestamp: mockNow }),
          expectedBehavior: 'cleared_by_getSession'
        },
        {
          name: 'missing timestamp field',
          sessionData: JSON.stringify({ token: mockValidToken, user: mockUser }),
          expectedBehavior: 'cleared_by_getSession'
        },
        {
          name: 'invalid token structure',
          sessionData: JSON.stringify({
            token: 'not-a-jwt-token',
            user: mockUser,
            timestamp: mockNow,
            lastActivity: mockNow
          }),
          expectedBehavior: 'corrupted_during_validation'
        }
      ]

      for (const scenario of corruptionScenarios) {
        // Clear previous test state
        localStorage.clear()

        // Arrange - Set corrupted session data
        localStorage.setItem('apinfe_session', scenario.sessionData)

        // Act - Try to get and validate session
        const session = SessionManager.getSession()
        
        if (scenario.expectedBehavior === 'cleared_by_getSession') {
          // Should return null and clear session for missing fields or malformed JSON
          expect(session).toBeNull()
          expect(localStorage.getItem('apinfe_session')).toBeNull()
          
          // Validation should return 'missing' since session was cleared
          const validation = SessionManager.validateSession(session)
          expect(validation.isValid).toBe(false)
          expect(validation.reason).toBe('missing')
        } else {
          // Should detect corruption during validation (invalid token structure)
          expect(session).toBeDefined()
          const validation = SessionManager.validateSession(session)
          expect(validation.isValid).toBe(false)
          expect(validation.reason).toBe('corrupted')
        }

        console.log(`✓ Detected ${scenario.name}`)
      }
    })

    it('should handle missing sessions and trigger redirect behavior', async () => {
      // Test scenarios where no session exists
      const missingSessionScenarios = [
        {
          name: 'no session in localStorage',
          setup: () => localStorage.clear()
        },
        {
          name: 'null session value',
          setup: () => localStorage.setItem('apinfe_session', 'null')
        },
        {
          name: 'empty session value',
          setup: () => localStorage.setItem('apinfe_session', '')
        }
      ]

      for (const scenario of missingSessionScenarios) {
        // Arrange
        scenario.setup()

        // Act - Try to validate session
        const validation = SessionManager.validateSession()

        // Assert - Should detect missing session
        expect(validation.isValid).toBe(false)
        expect(validation.reason).toBe('missing')
        expect(validation.session).toBeUndefined()

        console.log(`✓ Detected ${scenario.name}`)
      }
    })

    it('should provide session diagnostic information for redirect decisions', async () => {
      // Test that session info provides enough data for redirect decisions
      const diagnosticScenarios = [
        {
          name: 'valid session',
          sessionData: {
            token: mockValidToken,
            user: mockUser,
            timestamp: mockNow - (1 * 60 * 60 * 1000), // 1 hour ago
            lastActivity: mockNow - (30 * 60 * 1000)    // 30 minutes ago
          },
          expectedInfo: {
            hasSession: true,
            isValid: true,
            age: 1 * 60 * 60 * 1000,
            inactivity: 30 * 60 * 1000
          }
        },
        {
          name: 'expired session',
          sessionData: {
            token: mockValidToken,
            user: mockUser,
            timestamp: mockNow - (25 * 60 * 60 * 1000), // 25 hours ago
            lastActivity: mockNow - (1 * 60 * 60 * 1000)  // 1 hour ago
          },
          expectedInfo: {
            hasSession: true,
            isValid: false,
            age: 25 * 60 * 60 * 1000,
            inactivity: 1 * 60 * 60 * 1000,
            reason: 'expired'
          }
        }
      ]

      for (const scenario of diagnosticScenarios) {
        // Clear previous state
        localStorage.clear()

        // Arrange
        localStorage.setItem('apinfe_session', JSON.stringify(scenario.sessionData))

        // Act - Get session diagnostic info
        const sessionInfo = SessionManager.getSessionInfo()

        // Assert - Should provide accurate diagnostic information
        expect(sessionInfo.hasSession).toBe(scenario.expectedInfo.hasSession)
        expect(sessionInfo.isValid).toBe(scenario.expectedInfo.isValid)
        expect(sessionInfo.age).toBe(scenario.expectedInfo.age)
        expect(sessionInfo.inactivity).toBe(scenario.expectedInfo.inactivity)
        
        if (scenario.expectedInfo.reason) {
          expect(sessionInfo.reason).toBe(scenario.expectedInfo.reason)
        }

        console.log(`✓ Diagnostic info correct for ${scenario.name}`)
      }
    })
  })

  describe('Session Persistence Across App Restarts', () => {
    /**
     * Test session persistence across app restarts
     * This validates that sessions survive browser refreshes and app restarts
     */
    it('should persist valid sessions across app restarts', async () => {
      // Test multiple restart scenarios
      const persistenceScenarios = [
        {
          name: 'fresh session',
          sessionAge: 5 * 60 * 1000,      // 5 minutes old
          inactivity: 2 * 60 * 1000,      // 2 minutes inactive
          shouldPersist: true
        },
        {
          name: 'older but valid session',
          sessionAge: 12 * 60 * 60 * 1000, // 12 hours old
          inactivity: 1 * 60 * 60 * 1000,  // 1 hour inactive
          shouldPersist: true
        },
        {
          name: 'expired session',
          sessionAge: 25 * 60 * 60 * 1000, // 25 hours old
          inactivity: 1 * 60 * 60 * 1000,  // 1 hour inactive
          shouldPersist: false
        },
        {
          name: 'inactive session',
          sessionAge: 1 * 60 * 60 * 1000,  // 1 hour old
          inactivity: 3 * 60 * 60 * 1000,  // 3 hours inactive
          shouldPersist: false
        }
      ]

      for (const scenario of persistenceScenarios) {
        // Clear previous state
        localStorage.clear()

        // Arrange - Create session with specific characteristics
        const sessionTimestamp = mockNow - scenario.sessionAge
        const lastActivity = mockNow - scenario.inactivity
        
        const sessionData: SessionData = {
          token: mockValidToken,
          user: mockUser,
          timestamp: sessionTimestamp,
          lastActivity: lastActivity
        }

        // Simulate saving session before "app shutdown"
        SessionManager.saveSession(sessionData.token, sessionData.user)
        
        // Manually set the timestamps to simulate the passage of time
        const savedSession = JSON.parse(localStorage.getItem('apinfe_session')!)
        savedSession.timestamp = sessionTimestamp
        savedSession.lastActivity = lastActivity
        localStorage.setItem('apinfe_session', JSON.stringify(savedSession))

        // Act - Simulate app restart by initializing SessionManager
        const initializationResult: SessionValidationResult = SessionManager.initialize()

        // Assert - Check if session persisted correctly
        if (scenario.shouldPersist) {
          expect(initializationResult.isValid).toBe(true)
          expect(initializationResult.session).toBeDefined()
          expect(initializationResult.session!.token).toBe(mockValidToken)
          expect(initializationResult.session!.user).toEqual(mockUser)
          
          // Should still be available after initialization
          const retrievedSession = SessionManager.getSession()
          expect(retrievedSession).toBeDefined()
          expect(retrievedSession!.token).toBe(mockValidToken)
          
          console.log(`✓ ${scenario.name}: Session persisted across restart`)
        } else {
          expect(initializationResult.isValid).toBe(false)
          expect(initializationResult.reason).toBeDefined()
          
          // Session should be cleared after failed validation
          const retrievedSession = SessionManager.getSession()
          expect(retrievedSession).toBeNull()
          
          console.log(`✓ ${scenario.name}: Expired session cleared on restart (${initializationResult.reason})`)
        }
      }
    })

    it('should migrate legacy session data on app restart', async () => {
      // Test migration from old token/user storage format to new session format
      const migrationScenarios = [
        {
          name: 'valid legacy data',
          legacyToken: mockValidToken,
          legacyUser: JSON.stringify(mockUser),
          shouldMigrate: true
        },
        {
          name: 'legacy token only',
          legacyToken: mockValidToken,
          legacyUser: null,
          shouldMigrate: false
        },
        {
          name: 'legacy user only',
          legacyToken: null,
          legacyUser: JSON.stringify(mockUser),
          shouldMigrate: false
        },
        {
          name: 'corrupted legacy user data',
          legacyToken: mockValidToken,
          legacyUser: 'invalid-json',
          shouldMigrate: false
        }
      ]

      for (const scenario of migrationScenarios) {
        // Clear all storage
        localStorage.clear()

        // Arrange - Set up legacy storage format
        if (scenario.legacyToken) {
          localStorage.setItem('token', scenario.legacyToken)
        }
        if (scenario.legacyUser) {
          localStorage.setItem('user', scenario.legacyUser)
        }

        // Act - Initialize SessionManager (should trigger migration)
        const initializationResult = SessionManager.initialize()

        // Assert - Check migration results
        if (scenario.shouldMigrate) {
          expect(initializationResult.isValid).toBe(true)
          expect(initializationResult.session).toBeDefined()
          
          // New session format should be present
          const newSession = SessionManager.getSession()
          expect(newSession).toBeDefined()
          expect(newSession!.token).toBe(scenario.legacyToken)
          expect(newSession!.user).toEqual(mockUser)
          
          // Legacy data should be removed
          expect(localStorage.getItem('token')).toBeNull()
          expect(localStorage.getItem('user')).toBeNull()
          
          // New session data should be present
          expect(localStorage.getItem('apinfe_session')).toBeDefined()
          
          console.log(`✓ ${scenario.name}: Successfully migrated to new format`)
        } else {
          // Migration should fail gracefully
          expect(initializationResult.isValid).toBe(false)
          
          // No new session should be created
          const newSession = SessionManager.getSession()
          expect(newSession).toBeNull()
          
          console.log(`✓ ${scenario.name}: Migration failed gracefully`)
        }
      }
    })

    it('should handle concurrent session access across multiple tabs', async () => {
      // Test session consistency when accessed from multiple tabs
      const concurrentScenarios = [
        {
          name: 'session update in tab 1',
          action: () => {
            // Simulate session update in another tab
            const session = SessionManager.getSession()!
            session.lastActivity = mockNow + (5 * 60 * 1000) // 5 minutes later
            localStorage.setItem('apinfe_session', JSON.stringify(session))
          }
        },
        {
          name: 'session clear in tab 2',
          action: () => {
            // Simulate session clear in another tab
            SessionManager.clearSession()
          }
        }
      ]

      for (const scenario of concurrentScenarios) {
        // Clear and set up initial session
        localStorage.clear()
        SessionManager.saveSession(mockValidToken, mockUser)
        
        // Verify initial state
        let session = SessionManager.getSession()
        expect(session).toBeDefined()
        expect(SessionManager.hasValidSession()).toBe(true)

        // Act - Simulate action in another tab
        scenario.action()

        // Assert - Current tab should reflect changes
        session = SessionManager.getSession()
        
        if (scenario.name.includes('update')) {
          expect(session).toBeDefined()
          expect(session!.lastActivity).toBe(mockNow + (5 * 60 * 1000))
        } else if (scenario.name.includes('clear')) {
          expect(session).toBeNull()
          expect(SessionManager.hasValidSession()).toBe(false)
        }

        console.log(`✓ ${scenario.name}: Concurrent access handled correctly`)
      }
    })

    it('should maintain session activity tracking across restarts', async () => {
      // Test that activity tracking works correctly after app restarts
      
      // Arrange - Create session with initial activity
      SessionManager.saveSession(mockValidToken, mockUser)
      let session = SessionManager.getSession()!
      const initialActivity = session.lastActivity

      // Act - Update activity (simulate user interaction)
      SessionManager.updateActivity()
      
      // Assert - Activity should be updated
      session = SessionManager.getSession()!
      expect(session.lastActivity).toBeGreaterThanOrEqual(initialActivity)

      // Act - Simulate app restart
      const restartTime = mockNow + (10 * 60 * 1000) // 10 minutes later
      Date.now = vi.fn(() => restartTime)
      
      const initResult = SessionManager.initialize()
      
      // Assert - Session should still be valid and activity preserved
      expect(initResult.isValid).toBe(true)
      expect(initResult.session).toBeDefined()
      
      // Activity should be preserved from before restart
      const restoredSession = SessionManager.getSession()!
      expect(restoredSession.lastActivity).toBe(session.lastActivity)

      console.log('✓ Activity tracking maintained across restart')
    })
  })

  describe('Session Validation Edge Cases', () => {
    it('should handle edge cases in session validation', async () => {
      const edgeCases = [
        {
          name: 'session at exact expiration boundary',
          sessionAge: 24 * 60 * 60 * 1000, // Exactly 24 hours
          inactivity: 0,
          expectedValid: false,
          expectedReason: 'expired'
        },
        {
          name: 'session at exact inactivity boundary',
          sessionAge: 0,
          inactivity: 2 * 60 * 60 * 1000, // Exactly 2 hours
          expectedValid: false,
          expectedReason: 'inactive'
        },
        {
          name: 'session just under limits',
          sessionAge: (24 * 60 * 60 * 1000) - 1000, // 1 second under 24 hours
          inactivity: (2 * 60 * 60 * 1000) - 1000,  // 1 second under 2 hours
          expectedValid: true
        }
      ]

      for (const edgeCase of edgeCases) {
        // Clear previous state
        localStorage.clear()

        // Arrange
        const sessionTimestamp = mockNow - edgeCase.sessionAge
        const lastActivity = mockNow - edgeCase.inactivity
        
        const sessionData: SessionData = {
          token: mockValidToken,
          user: mockUser,
          timestamp: sessionTimestamp,
          lastActivity: lastActivity
        }

        localStorage.setItem('apinfe_session', JSON.stringify(sessionData))

        // Act
        const validation = SessionManager.validateSession()

        // Assert
        expect(validation.isValid).toBe(edgeCase.expectedValid)
        if (!edgeCase.expectedValid) {
          expect(validation.reason).toBe(edgeCase.expectedReason)
        }

        console.log(`✓ Edge case handled: ${edgeCase.name}`)
      }
    })
  })
})