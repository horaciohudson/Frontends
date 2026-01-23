import api, { TokenManager, ErrorHandler } from './api';
import { handleApiError } from './api';

/**
 * Utilitário para diagnosticar e testar o endpoint /api/fiscal/products
 * Este módulo fornece funções específicas para testar a conectividade,
 * autenticação e tratamento de erros do endpoint de produtos fiscais.
 */

export interface DiagnosticResult {
  success: boolean;
  status?: number;
  message: string;
  details?: any;
  timestamp: string;
}

export interface EndpointTestResult {
  endpoint: string;
  method: string;
  authenticated: boolean;
  result: DiagnosticResult;
}

/**
 * Testa a conectividade básica com o endpoint de produtos fiscais
 */
export const testFiscalProductsConnectivity = async (companyId: string): Promise<DiagnosticResult> => {
  const timestamp = new Date().toISOString();
  
  try {
    console.log('🔍 Testando conectividade com /api/fiscal/products...');
    
    const response = await api.get('/fiscal/products', {
      params: { companyId },
      timeout: 5000, // 5 second timeout for diagnostics
    });

    return {
      success: true,
      status: response.status,
      message: `Sucesso: Endpoint respondeu com status ${response.status}`,
      details: {
        dataLength: response.data?.length || 0,
        headers: response.headers,
      },
      timestamp,
    };
  } catch (error: any) {
    console.error('❌ Erro ao testar conectividade:', error);
    
    return {
      success: false,
      status: error.response?.status,
      message: handleApiError(error),
      details: {
        errorType: ErrorHandler.getErrorType(error),
        originalError: error.message,
        responseData: error.response?.data,
      },
      timestamp,
    };
  }
};

/**
 * Testa especificamente o tratamento de erros 403 no endpoint
 */
export const testForbiddenErrorHandling = async (): Promise<DiagnosticResult> => {
  const timestamp = new Date().toISOString();
  
  try {
    console.log('🔍 Testando tratamento de erro 403...');
    
    // Temporariamente limpar o token para forçar um erro 403
    const originalToken = TokenManager.getToken();
    TokenManager.clearToken();
    
    try {
      await api.get('/fiscal/products', {
        params: { companyId: 'test-company' },
      });
      
      // Se chegou aqui, não houve erro 403 como esperado
      return {
        success: false,
        message: 'Erro: Esperava-se um erro 403, mas a requisição foi bem-sucedida',
        timestamp,
      };
    } catch (error: any) {
      // Restaurar o token original
      if (originalToken) {
        TokenManager.setToken(originalToken);
      }
      
      if (error.response?.status === 403) {
        const errorMessage = handleApiError(error);
        
        return {
          success: true,
          status: 403,
          message: `Sucesso: Erro 403 tratado corretamente - "${errorMessage}"`,
          details: {
            errorMessage,
            containsUndefined: errorMessage.includes('undefined'),
            responseData: error.response.data,
          },
          timestamp,
        };
      } else {
        return {
          success: false,
          status: error.response?.status,
          message: `Erro: Esperava-se 403, mas recebeu ${error.response?.status}`,
          details: {
            actualError: handleApiError(error),
          },
          timestamp,
        };
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Erro durante teste: ${error.message}`,
      timestamp,
    };
  }
};

/**
 * Testa a autenticação com token válido
 */
export const testAuthenticatedAccess = async (companyId: string): Promise<DiagnosticResult> => {
  const timestamp = new Date().toISOString();
  
  try {
    console.log('🔍 Testando acesso autenticado...');
    
    const token = TokenManager.getToken();
    if (!token) {
      return {
        success: false,
        message: 'Erro: Nenhum token de autenticação encontrado',
        timestamp,
      };
    }

    if (TokenManager.isTokenExpired(token)) {
      return {
        success: false,
        message: 'Erro: Token de autenticação expirado',
        timestamp,
      };
    }

    const response = await api.get('/fiscal/products', {
      params: { companyId },
    });

    return {
      success: true,
      status: response.status,
      message: `Sucesso: Acesso autenticado funcionando (${response.status})`,
      details: {
        tokenPresent: true,
        tokenExpired: false,
        dataReceived: !!response.data,
        recordCount: response.data?.length || 0,
      },
      timestamp,
    };
  } catch (error: any) {
    console.error('❌ Erro no acesso autenticado:', error);
    
    return {
      success: false,
      status: error.response?.status,
      message: handleApiError(error),
      details: {
        errorType: ErrorHandler.getErrorType(error),
        tokenPresent: !!TokenManager.getToken(),
        tokenExpired: TokenManager.getToken() ? TokenManager.isTokenExpired(TokenManager.getToken()!) : null,
      },
      timestamp,
    };
  }
};

/**
 * Executa uma bateria completa de testes no endpoint de produtos fiscais
 */
export const runCompleteDiagnostics = async (companyId: string): Promise<EndpointTestResult[]> => {
  console.log('🚀 Iniciando diagnósticos completos do endpoint /api/fiscal/products...');
  
  const results: EndpointTestResult[] = [];

  // Teste 1: Conectividade básica
  results.push({
    endpoint: '/api/fiscal/products',
    method: 'GET',
    authenticated: true,
    result: await testFiscalProductsConnectivity(companyId),
  });

  // Teste 2: Tratamento de erro 403
  results.push({
    endpoint: '/api/fiscal/products',
    method: 'GET',
    authenticated: false,
    result: await testForbiddenErrorHandling(),
  });

  // Teste 3: Acesso autenticado
  results.push({
    endpoint: '/api/fiscal/products',
    method: 'GET',
    authenticated: true,
    result: await testAuthenticatedAccess(companyId),
  });

  // Log dos resultados
  console.log('📊 Resultados dos diagnósticos:');
  results.forEach((test, index) => {
    const status = test.result.success ? '✅' : '❌';
    console.log(`${status} Teste ${index + 1}: ${test.result.message}`);
  });

  return results;
};

/**
 * Verifica se o endpoint está retornando HTTP 200 para requisições autenticadas
 */
export const verifyEndpointReturns200 = async (companyId: string): Promise<boolean> => {
  try {
    const response = await api.get('/fiscal/products', {
      params: { companyId },
    });
    
    const success = response.status === 200;
    console.log(`🎯 Verificação HTTP 200: ${success ? 'PASSOU' : 'FALHOU'} (Status: ${response.status})`);
    
    return success;
  } catch (error: any) {
    console.error(`🎯 Verificação HTTP 200: FALHOU (Erro: ${error.response?.status || 'Network Error'})`);
    return false;
  }
};

/**
 * Testa diferentes cenários de erro para garantir tratamento adequado
 */
export const testErrorScenarios = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];
  
  console.log('🧪 Testando cenários de erro...');

  // Cenário 1: Token inválido
  const originalToken = TokenManager.getToken();
  TokenManager.setToken('invalid-token-123');
  
  try {
    await api.get('/fiscal/products', { params: { companyId: 'test' } });
    results.push({
      success: false,
      message: 'Erro: Token inválido deveria ter sido rejeitado',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const errorMessage = handleApiError(error);
    results.push({
      success: !errorMessage.includes('undefined'),
      status: error.response?.status,
      message: `Token inválido: ${errorMessage}`,
      details: { containsUndefined: errorMessage.includes('undefined') },
      timestamp: new Date().toISOString(),
    });
  }

  // Restaurar token original
  if (originalToken) {
    TokenManager.setToken(originalToken);
  } else {
    TokenManager.clearToken();
  }

  // Cenário 2: Parâmetros inválidos
  try {
    await api.get('/fiscal/products', { params: { companyId: '' } });
    results.push({
      success: false,
      message: 'Erro: CompanyId vazio deveria ter sido rejeitado',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const errorMessage = handleApiError(error);
    results.push({
      success: !errorMessage.includes('undefined'),
      status: error.response?.status,
      message: `CompanyId inválido: ${errorMessage}`,
      details: { containsUndefined: errorMessage.includes('undefined') },
      timestamp: new Date().toISOString(),
    });
  }

  return results;
};

/**
 * Função utilitária para exibir um relatório formatado dos diagnósticos
 */
export const printDiagnosticsReport = (results: EndpointTestResult[]): void => {
  console.log('\n📋 RELATÓRIO DE DIAGNÓSTICOS - /api/fiscal/products');
  console.log('=' .repeat(60));
  
  results.forEach((test, index) => {
    const status = test.result.success ? '✅ PASSOU' : '❌ FALHOU';
    console.log(`\n${index + 1}. ${test.method} ${test.endpoint} (Auth: ${test.authenticated ? 'Sim' : 'Não'})`);
    console.log(`   Status: ${status}`);
    console.log(`   Mensagem: ${test.result.message}`);
    if (test.result.status) {
      console.log(`   HTTP Status: ${test.result.status}`);
    }
    if (test.result.details) {
      console.log(`   Detalhes: ${JSON.stringify(test.result.details, null, 2)}`);
    }
  });
  
  const passedTests = results.filter(r => r.result.success).length;
  const totalTests = results.length;
  
  console.log(`\n📊 RESUMO: ${passedTests}/${totalTests} testes passaram`);
  console.log('=' .repeat(60));
};