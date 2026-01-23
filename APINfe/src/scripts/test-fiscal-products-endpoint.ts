/**
 * Script para testar o endpoint /api/fiscal/products
 * 
 * Este script pode ser executado para verificar se o endpoint está funcionando corretamente
 * com o backend real. Útil para debugging e verificação manual.
 * 
 * Para executar:
 * npm run dev (em um terminal)
 * Abrir o console do navegador e executar as funções deste script
 */

import { productService } from '../services/product.service';
import { TokenManager } from '../services/api';
import {
  runCompleteDiagnostics,
  verifyEndpointReturns200,
  testErrorScenarios,
  printDiagnosticsReport,
} from '../services/fiscal-products-diagnostics';

// Função para testar o endpoint com dados reais
export const testFiscalProductsEndpoint = async (companyId?: string) => {
  console.log('🚀 Iniciando teste do endpoint /api/fiscal/products...');
  console.log('=' .repeat(60));
  
  // Usar companyId fornecido ou tentar obter do localStorage
  const testCompanyId = companyId || localStorage.getItem('user')?.replace(/['"]/g, '') || 'test-company';
  
  console.log(`📋 Company ID: ${testCompanyId}`);
  console.log(`🔐 Token presente: ${TokenManager.getToken() ? 'Sim' : 'Não'}`);
  console.log(`✅ Autenticado: ${TokenManager.isAuthenticated() ? 'Sim' : 'Não'}`);
  
  if (TokenManager.getToken()) {
    const isExpired = TokenManager.isTokenExpired(TokenManager.getToken()!);
    console.log(`⏰ Token expirado: ${isExpired ? 'Sim' : 'Não'}`);
  }
  
  console.log('');

  // Teste 1: Verificação básica HTTP 200
  console.log('🧪 Teste 1: Verificação HTTP 200...');
  try {
    const returns200 = await verifyEndpointReturns200(testCompanyId);
    console.log(`Resultado: ${returns200 ? '✅ PASSOU' : '❌ FALHOU'}`);
  } catch (error: any) {
    console.log(`Resultado: ❌ ERRO - ${error.message}`);
  }
  console.log('');

  // Teste 2: Buscar produtos via service
  console.log('🧪 Teste 2: Buscar produtos via productService...');
  try {
    const products = await productService.getAll(testCompanyId);
    console.log(`Resultado: ✅ SUCESSO - ${products.length} produtos encontrados`);
    
    if (products.length > 0) {
      console.log('📦 Primeiros produtos:');
      products.slice(0, 3).forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.productCode} - ${product.description}`);
      });
    }
  } catch (error: any) {
    console.log(`Resultado: ❌ ERRO - ${error.message}`);
  }
  console.log('');

  // Teste 3: Diagnósticos completos
  console.log('🧪 Teste 3: Diagnósticos completos...');
  try {
    const diagnostics = await runCompleteDiagnostics(testCompanyId);
    printDiagnosticsReport(diagnostics);
  } catch (error: any) {
    console.log(`Resultado: ❌ ERRO - ${error.message}`);
  }
  console.log('');

  // Teste 4: Cenários de erro
  console.log('🧪 Teste 4: Cenários de erro...');
  try {
    const errorResults = await testErrorScenarios();
    console.log('Resultados dos cenários de erro:');
    errorResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${index + 1}. ${result.message}`);
    });
  } catch (error: any) {
    console.log(`Resultado: ❌ ERRO - ${error.message}`);
  }

  console.log('');
  console.log('🏁 Teste concluído!');
  console.log('=' .repeat(60));
};

// Função para testar apenas a conectividade básica
export const quickConnectivityTest = async (companyId?: string) => {
  const testCompanyId = companyId || 'test-company';
  
  console.log('⚡ Teste rápido de conectividade...');
  
  if (!TokenManager.isAuthenticated()) {
    console.log('❌ Não autenticado - faça login primeiro');
    return false;
  }

  try {
    const returns200 = await verifyEndpointReturns200(testCompanyId);
    console.log(`Conectividade: ${returns200 ? '✅ OK' : '❌ FALHOU'}`);
    return returns200;
  } catch (error: any) {
    console.log(`Conectividade: ❌ ERRO - ${error.message}`);
    return false;
  }
};

// Função para testar com diferentes company IDs
export const testMultipleCompanies = async (companyIds: string[]) => {
  console.log('🏢 Testando múltiplas empresas...');
  
  for (const companyId of companyIds) {
    console.log(`\n📋 Testando empresa: ${companyId}`);
    
    try {
      const products = await productService.getAll(companyId);
      console.log(`  ✅ ${products.length} produtos encontrados`);
    } catch (error: any) {
      console.log(`  ❌ Erro: ${error.message}`);
    }
  }
};

// Função para verificar se o problema "Acesso negado: undefined" foi resolvido
export const verifyUndefinedErrorFixed = async () => {
  console.log('🔍 Verificando se o erro "undefined" foi corrigido...');
  
  // Temporariamente limpar token para forçar erro 403
  const originalToken = TokenManager.getToken();
  TokenManager.clearToken();
  
  try {
    await productService.getAll('test-company');
    console.log('⚠️ Inesperado: Não houve erro 403');
  } catch (error: any) {
    const errorMessage = error.message;
    
    console.log(`📝 Mensagem de erro capturada: "${errorMessage}"`);
    
    const hasUndefined = errorMessage.includes('undefined');
    const isEmpty = !errorMessage || errorMessage.trim() === '';
    
    if (hasUndefined) {
      console.log('❌ PROBLEMA: Mensagem ainda contém "undefined"');
    } else if (isEmpty) {
      console.log('❌ PROBLEMA: Mensagem de erro vazia');
    } else {
      console.log('✅ CORRIGIDO: Mensagem de erro é significativa');
    }
    
    return !hasUndefined && !isEmpty;
  } finally {
    // Restaurar token original
    if (originalToken) {
      TokenManager.setToken(originalToken);
    }
  }
};

// Função para simular o cenário original do problema
export const simulateOriginalProblem = async () => {
  console.log('🎭 Simulando cenário original do problema...');
  console.log('Tentando acessar /api/fiscal/products sem autenticação adequada...');
  
  const originalToken = TokenManager.getToken();
  
  // Cenário 1: Sem token
  console.log('\n📋 Cenário 1: Sem token de autenticação');
  TokenManager.clearToken();
  
  try {
    await productService.getAll('test-company');
  } catch (error: any) {
    console.log(`Resultado: ${error.message}`);
  }
  
  // Cenário 2: Token inválido
  console.log('\n📋 Cenário 2: Token inválido');
  TokenManager.setToken('invalid-token-123');
  
  try {
    await productService.getAll('test-company');
  } catch (error: any) {
    console.log(`Resultado: ${error.message}`);
  }
  
  // Restaurar token original
  if (originalToken) {
    TokenManager.setToken(originalToken);
  } else {
    TokenManager.clearToken();
  }
  
  console.log('\n✅ Simulação concluída');
};

// Exportar para uso no console do navegador
if (typeof window !== 'undefined') {
  (window as any).testFiscalProducts = {
    testFiscalProductsEndpoint,
    quickConnectivityTest,
    testMultipleCompanies,
    verifyUndefinedErrorFixed,
    simulateOriginalProblem,
  };
  
  console.log('🛠️ Funções de teste disponíveis no console:');
  console.log('- testFiscalProducts.testFiscalProductsEndpoint()');
  console.log('- testFiscalProducts.quickConnectivityTest()');
  console.log('- testFiscalProducts.verifyUndefinedErrorFixed()');
  console.log('- testFiscalProducts.simulateOriginalProblem()');
}