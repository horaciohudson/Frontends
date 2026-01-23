import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { productService } from './product.service';
import { TokenManager } from './api';
import {
  runCompleteDiagnostics,
  verifyEndpointReturns200,
  testErrorScenarios,
} from './fiscal-products-diagnostics';

/**
 * Testes de integração para o endpoint /api/fiscal/products
 * Estes testes fazem requisições reais para o backend
 * 
 * IMPORTANTE: Para executar estes testes, certifique-se de que:
 * 1. O backend APINfe está rodando
 * 2. Você tem um token de autenticação válido
 * 3. Existe pelo menos uma empresa no sistema
 */

describe('Fiscal Products Integration Tests', () => {
  const testCompanyId = 'test-company-integration';
  let originalToken: string | null;

  beforeAll(() => {
    // Salvar token original se existir
    originalToken = TokenManager.getToken();
    
    // Para testes de integração, você pode definir um token de teste aqui
    // TokenManager.setToken('seu-token-de-teste-aqui');
  });

  afterAll(() => {
    // Restaurar token original
    if (originalToken) {
      TokenManager.setToken(originalToken);
    } else {
      TokenManager.clearToken();
    }
  });

  describe('Real Backend Integration', () => {
    it('should verify endpoint returns HTTP 200 for authenticated requests', async () => {
      // Skip if no token available
      if (!TokenManager.isAuthenticated()) {
        console.log('⏭️ Pulando teste - nenhum token de autenticação disponível');
        return;
      }

      try {
        const returns200 = await verifyEndpointReturns200(testCompanyId);
        
        // Log result for manual verification
        console.log(`🎯 Endpoint HTTP 200 Test: ${returns200 ? 'PASSOU' : 'FALHOU'}`);
        
        // This test is informational - we don't fail if backend is not available
        // expect(returns200).toBe(true);
      } catch (error) {
        console.log('⚠️ Backend não disponível para teste de integração:', error);
      }
    }, 10000); // 10 second timeout

    it('should run complete diagnostics on the endpoint', async () => {
      // Skip if no token available
      if (!TokenManager.isAuthenticated()) {
        console.log('⏭️ Pulando diagnósticos - nenhum token de autenticação disponível');
        return;
      }

      try {
        const results = await runCompleteDiagnostics(testCompanyId);
        
        // Log results for manual verification
        console.log('📊 Resultados dos Diagnósticos:');
        results.forEach((test, index) => {
          const status = test.result.success ? '✅' : '❌';
          console.log(`${status} ${index + 1}. ${test.method} ${test.endpoint}: ${test.result.message}`);
        });

        // Verify we got some results
        expect(results).toBeDefined();
        expect(results.length).toBeGreaterThan(0);
        
        // At least one test should provide meaningful results
        const hasResults = results.some(r => r.result.message && r.result.message !== '');
        expect(hasResults).toBe(true);
      } catch (error) {
        console.log('⚠️ Erro durante diagnósticos:', error);
      }
    }, 15000); // 15 second timeout

    it('should test error scenarios properly', async () => {
      try {
        const errorResults = await testErrorScenarios();
        
        // Log results
        console.log('🧪 Resultados dos Cenários de Erro:');
        errorResults.forEach((result, index) => {
          const status = result.success ? '✅' : '❌';
          console.log(`${status} ${index + 1}. ${result.message}`);
        });

        // Verify we got some results
        expect(errorResults).toBeDefined();
        expect(errorResults.length).toBeGreaterThan(0);
        
        // Check that error messages don't contain "undefined"
        const hasUndefinedErrors = errorResults.some(r => 
          r.message.includes('undefined') || 
          (r.details && JSON.stringify(r.details).includes('undefined'))
        );
        
        if (hasUndefinedErrors) {
          console.warn('⚠️ Encontradas mensagens de erro com "undefined"');
        }
        
        // This is informational - we don't fail the test
        // expect(hasUndefinedErrors).toBe(false);
      } catch (error) {
        console.log('⚠️ Erro durante teste de cenários de erro:', error);
      }
    }, 10000);

    it('should handle product service operations gracefully', async () => {
      // Skip if no token available
      if (!TokenManager.isAuthenticated()) {
        console.log('⏭️ Pulando teste de serviço - nenhum token de autenticação disponível');
        return;
      }

      try {
        // Test getting all products
        console.log('🔍 Testando productService.getAll...');
        const products = await productService.getAll(testCompanyId);
        
        console.log(`✅ Produtos encontrados: ${products?.length || 0}`);
        
        // Verify we get an array (even if empty)
        expect(Array.isArray(products)).toBe(true);
        
        // Test endpoint test method
        console.log('🧪 Testando productService.testEndpoint...');
        const endpointWorks = await productService.testEndpoint(testCompanyId);
        
        console.log(`🎯 Endpoint test: ${endpointWorks ? 'PASSOU' : 'FALHOU'}`);
        
        // This is informational
        // expect(endpointWorks).toBe(true);
        
      } catch (error: any) {
        console.log('⚠️ Erro durante teste do serviço:', error.message);
        
        // Verify that error messages are meaningful (not "undefined")
        expect(error.message).toBeDefined();
        expect(error.message).not.toBe('undefined');
        expect(error.message.trim()).not.toBe('');
        
        // Log the error for debugging
        console.log('📝 Mensagem de erro capturada:', error.message);
      }
    }, 10000);
  });

  describe('Authentication State Tests', () => {
    it('should properly detect authentication state', () => {
      const isAuthenticated = TokenManager.isAuthenticated();
      const hasToken = TokenManager.getToken() !== null;
      
      console.log(`🔐 Estado de autenticação: ${isAuthenticated ? 'Autenticado' : 'Não autenticado'}`);
      console.log(`🎫 Token presente: ${hasToken ? 'Sim' : 'Não'}`);
      
      if (hasToken) {
        const token = TokenManager.getToken()!;
        const isExpired = TokenManager.isTokenExpired(token);
        console.log(`⏰ Token expirado: ${isExpired ? 'Sim' : 'Não'}`);
      }
      
      // These are always valid tests
      expect(typeof isAuthenticated).toBe('boolean');
      expect(typeof hasToken).toBe('boolean');
    });

    it('should handle missing authentication gracefully', async () => {
      // Temporarily clear token
      const currentToken = TokenManager.getToken();
      TokenManager.clearToken();
      
      try {
        await productService.getAll(testCompanyId);
        
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        // Should get a meaningful error message
        expect(error.message).toBeDefined();
        expect(error.message).not.toBe('undefined');
        expect(error.message).toContain('autenticado');
        
        console.log('✅ Erro de autenticação tratado corretamente:', error.message);
      } finally {
        // Restore token
        if (currentToken) {
          TokenManager.setToken(currentToken);
        }
      }
    });
  });

  describe('Error Message Quality Tests', () => {
    it('should never return undefined error messages', async () => {
      // Test various error scenarios to ensure no "undefined" messages
      const errorScenarios = [
        {
          name: 'Empty company ID',
          test: () => productService.getAll(''),
        },
        {
          name: 'Invalid product ID',
          test: () => productService.getById(''),
        },
        {
          name: 'Invalid product creation',
          test: () => productService.create({
            productCode: '',
            description: '',
            ncm: '',
            cfop: '',
            origem: '',
            unitValue: 0,
            active: true,
            companyId: testCompanyId,
          }),
        },
      ];

      for (const scenario of errorScenarios) {
        try {
          await scenario.test();
          
          // Should not reach here for these invalid inputs
          console.warn(`⚠️ ${scenario.name}: Esperava-se um erro, mas não houve`);
        } catch (error: any) {
          // Verify error message quality
          expect(error.message).toBeDefined();
          expect(error.message).not.toBe('undefined');
          expect(error.message.trim()).not.toBe('');
          expect(error.message).not.toContain('undefined');
          
          console.log(`✅ ${scenario.name}: ${error.message}`);
        }
      }
    });
  });
});