import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  TextField,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { productService } from '../../services/product.service';
import {
  runCompleteDiagnostics,
  verifyEndpointReturns200,
  testErrorScenarios,
  type EndpointTestResult,
  type DiagnosticResult,
} from '../../services/fiscal-products-diagnostics';

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

export const FiscalProductsTest: React.FC = () => {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [diagnosticResults, setDiagnosticResults] = useState<EndpointTestResult[]>([]);
  const [errorScenarios, setErrorScenarios] = useState<DiagnosticResult[]>([]);
  const [customCompanyId, setCustomCompanyId] = useState('');

  const companyId = customCompanyId || user?.companyId || 'test-company';

  const runBasicTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];
    const timestamp = new Date().toISOString();

    try {
      // Teste 1: Verificar se retorna HTTP 200
      console.log('🧪 Executando Teste 1: Verificação HTTP 200...');
      try {
        const returns200 = await verifyEndpointReturns200(companyId);
        results.push({
          name: 'HTTP 200 Response',
          success: returns200,
          message: returns200 
            ? 'Endpoint retorna HTTP 200 corretamente' 
            : 'Endpoint não retorna HTTP 200',
          timestamp,
        });
      } catch (error: any) {
        results.push({
          name: 'HTTP 200 Response',
          success: false,
          message: `Erro no teste: ${error.message}`,
          timestamp,
        });
      }

      // Teste 2: Buscar produtos via service
      console.log('🧪 Executando Teste 2: Busca de produtos...');
      try {
        const products = await productService.getAll(companyId);
        results.push({
          name: 'Product Service GetAll',
          success: true,
          message: `Sucesso: ${products.length} produtos encontrados`,
          details: { productCount: products.length },
          timestamp,
        });
      } catch (error: any) {
        results.push({
          name: 'Product Service GetAll',
          success: false,
          message: `Erro: ${error.message}`,
          details: { error: error.message },
          timestamp,
        });
      }

      // Teste 3: Testar endpoint diretamente
      console.log('🧪 Executando Teste 3: Teste direto do endpoint...');
      try {
        const endpointWorks = await productService.testEndpoint(companyId);
        results.push({
          name: 'Direct Endpoint Test',
          success: endpointWorks,
          message: endpointWorks 
            ? 'Endpoint responde corretamente' 
            : 'Endpoint não responde corretamente',
          timestamp,
        });
      } catch (error: any) {
        results.push({
          name: 'Direct Endpoint Test',
          success: false,
          message: `Erro no teste direto: ${error.message}`,
          timestamp,
        });
      }

      setTestResults(results);
    } catch (error: any) {
      console.error('Erro durante execução dos testes:', error);
      results.push({
        name: 'Test Execution',
        success: false,
        message: `Erro geral: ${error.message}`,
        timestamp,
      });
      setTestResults(results);
    } finally {
      setIsRunning(false);
    }
  };

  const runCompleteDiagnosticsTest = async () => {
    setIsRunning(true);
    try {
      console.log('🚀 Executando diagnósticos completos...');
      const results = await runCompleteDiagnostics(companyId);
      setDiagnosticResults(results);
    } catch (error: any) {
      console.error('Erro nos diagnósticos completos:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runErrorScenariosTest = async () => {
    setIsRunning(true);
    try {
      console.log('🧪 Testando cenários de erro...');
      const results = await testErrorScenarios();
      setErrorScenarios(results);
    } catch (error: any) {
      console.error('Erro ao testar cenários de erro:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <SuccessIcon color="success" />
    ) : (
      <ErrorIcon color="error" />
    );
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'success' : 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Teste do Endpoint /api/fiscal/products
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Esta ferramenta testa especificamente o endpoint <code>/api/fiscal/products</code> 
          para diagnosticar problemas de autenticação e conectividade.
        </Typography>
      </Alert>

      {/* Configuração */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Configuração do Teste
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company ID (opcional)"
                value={customCompanyId}
                onChange={(e) => setCustomCompanyId(e.target.value)}
                placeholder={user?.companyId || 'test-company'}
                helperText={`Usando: ${companyId}`}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">
                Usuário atual: {user?.username || 'Não logado'}
                <br />
                Token presente: {localStorage.getItem('token') ? 'Sim' : 'Não'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Botões de Teste */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={isRunning ? <CircularProgress size={20} /> : <PlayIcon />}
          onClick={runBasicTests}
          disabled={isRunning}
        >
          Executar Testes Básicos
        </Button>
        
        <Button
          variant="outlined"
          startIcon={isRunning ? <CircularProgress size={20} /> : <InfoIcon />}
          onClick={runCompleteDiagnosticsTest}
          disabled={isRunning}
        >
          Diagnósticos Completos
        </Button>
        
        <Button
          variant="outlined"
          color="warning"
          startIcon={isRunning ? <CircularProgress size={20} /> : <ErrorIcon />}
          onClick={runErrorScenariosTest}
          disabled={isRunning}
        >
          Testar Cenários de Erro
        </Button>
      </Box>

      {/* Resultados dos Testes Básicos */}
      {testResults.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              Resultados dos Testes Básicos ({testResults.filter(r => r.success).length}/{testResults.length} passou)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {testResults.map((result, index) => (
                <Card key={index} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {getStatusIcon(result.success)}
                      <Typography variant="h6">
                        {result.name}
                      </Typography>
                      <Chip 
                        label={result.success ? 'PASSOU' : 'FALHOU'} 
                        color={getStatusColor(result.success)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {result.timestamp}
                    </Typography>
                    <Typography variant="body1">
                      {result.message}
                    </Typography>
                    {result.details && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="caption" component="pre">
                          {JSON.stringify(result.details, null, 2)}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Resultados dos Diagnósticos Completos */}
      {diagnosticResults.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              Diagnósticos Completos ({diagnosticResults.filter(r => r.result.success).length}/{diagnosticResults.length} passou)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {diagnosticResults.map((result, index) => (
                <Card key={index} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {getStatusIcon(result.result.success)}
                      <Typography variant="h6">
                        {result.method} {result.endpoint}
                      </Typography>
                      <Chip 
                        label={result.authenticated ? 'Autenticado' : 'Não Autenticado'} 
                        color={result.authenticated ? 'primary' : 'default'}
                        size="small"
                      />
                      <Chip 
                        label={result.result.success ? 'PASSOU' : 'FALHOU'} 
                        color={getStatusColor(result.result.success)}
                        size="small"
                      />
                    </Box>
                    {result.result.status && (
                      <Typography variant="body2" color="textSecondary">
                        HTTP Status: {result.result.status}
                      </Typography>
                    )}
                    <Typography variant="body1">
                      {result.result.message}
                    </Typography>
                    {result.result.details && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="caption" component="pre">
                          {JSON.stringify(result.result.details, null, 2)}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Resultados dos Cenários de Erro */}
      {errorScenarios.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              Cenários de Erro ({errorScenarios.filter(r => r.success).length}/{errorScenarios.length} passou)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {errorScenarios.map((result, index) => (
                <Card key={index} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {getStatusIcon(result.success)}
                      <Typography variant="h6">
                        Cenário de Erro {index + 1}
                      </Typography>
                      <Chip 
                        label={result.success ? 'PASSOU' : 'FALHOU'} 
                        color={getStatusColor(result.success)}
                        size="small"
                      />
                    </Box>
                    {result.status && (
                      <Typography variant="body2" color="textSecondary">
                        HTTP Status: {result.status}
                      </Typography>
                    )}
                    <Typography variant="body1">
                      {result.message}
                    </Typography>
                    {result.details && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="caption" component="pre">
                          {JSON.stringify(result.details, null, 2)}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Instruções */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Como Interpretar os Resultados
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li><strong>HTTP 200 Response:</strong> Verifica se o endpoint retorna status 200 para requisições autenticadas</li>
              <li><strong>Product Service GetAll:</strong> Testa o serviço de produtos através da camada de serviço</li>
              <li><strong>Direct Endpoint Test:</strong> Testa diretamente o endpoint com timeout configurado</li>
              <li><strong>Diagnósticos Completos:</strong> Executa uma bateria completa de testes incluindo cenários de erro</li>
              <li><strong>Cenários de Erro:</strong> Testa especificamente o tratamento de erros 401, 403 e outros</li>
            </ul>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};