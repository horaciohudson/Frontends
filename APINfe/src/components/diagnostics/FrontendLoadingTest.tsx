import React, { useState, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { TokenManager, ErrorHandler } from '../../services/api';
import { SessionManager } from '../../utils/sessionManager';
import { productService } from '../../services/product.service';
import { FrontendLoadingVerifier, type VerificationResult } from '../../scripts/verify-frontend-loading';

interface TestSummary {
  category: string;
  total: number;
  passed: number;
  failed: number;
  results: VerificationResult[];
}

export const FrontendLoadingTest: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<VerificationResult[]>([]);
  const [testSummary, setTestSummary] = useState<TestSummary[]>([]);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'passed' | 'failed'>('idle');

  const runVerificationTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    setTestResults([]);
    setTestSummary([]);

    try {
      console.log('🚀 Starting Frontend Loading Verification...');
      
      const verifier = new FrontendLoadingVerifier();
      const results = await verifier.runAllTests();
      
      setTestResults(results);
      
      // Generate summary by category
      const categories = new Map<string, VerificationResult[]>();
      results.forEach(result => {
        const category = result.test.split(':')[0];
        if (!categories.has(category)) {
          categories.set(category, []);
        }
        categories.get(category)!.push(result);
      });

      const summary: TestSummary[] = Array.from(categories.entries()).map(([category, categoryResults]) => ({
        category,
        total: categoryResults.length,
        passed: categoryResults.filter(r => r.success).length,
        failed: categoryResults.filter(r => !r.success).length,
        results: categoryResults
      }));

      setTestSummary(summary);
      
      // Determine overall status
      const totalFailed = results.filter(r => !r.success).length;
      setOverallStatus(totalFailed === 0 ? 'passed' : 'failed');
      
      console.log('✅ Frontend Loading Verification completed');
      
    } catch (error: any) {
      console.error('❌ Error running verification tests:', error);
      setOverallStatus('failed');
    } finally {
      setIsRunning(false);
    }
  };

  const runQuickErrorTest = () => {
    console.log('🧪 Running Quick Error Message Test...');
    
    // Test various error scenarios
    const testErrors = [
      {
        name: '403 with undefined message',
        error: { response: { status: 403, data: { message: undefined } } }
      },
      {
        name: '403 with empty message',
        error: { response: { status: 403, data: { message: '' } } }
      },
      {
        name: '403 with "undefined" string',
        error: { response: { status: 403, data: { message: 'undefined' } } }
      },
      {
        name: 'Network error',
        error: { message: 'Network Error' }
      }
    ];

    testErrors.forEach(({ name, error }) => {
      const message = ErrorHandler.getErrorMessage(error as any);
      const isValid = message && message !== 'undefined' && message.trim() !== '';
      
      console.log(`${isValid ? '✅' : '❌'} ${name}: "${message}"`);
    });
  };

  const testCurrentAuthState = () => {
    console.log('🔍 Current Authentication State:');
    console.log('- Authenticated:', isAuthenticated);
    console.log('- User:', user?.sub || 'None');
    console.log('- Token present:', !!TokenManager.getToken());
    console.log('- Token valid:', TokenManager.isAuthenticated());
    console.log('- Session info:', SessionManager.getSessionInfo());
  };

  const getStatusIcon = (status: 'idle' | 'running' | 'passed' | 'failed') => {
    switch (status) {
      case 'running':
        return <CircularProgress size={20} />;
      case 'passed':
        return <SuccessIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'success' : 'error';
  };

  const getCategoryColor = (passed: number, total: number) => {
    if (passed === total) return 'success';
    if (passed === 0) return 'error';
    return 'warning';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Frontend Loading & Error Resolution Test
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Este teste verifica se o frontend carrega sem erros de autenticação, 
          se o erro "Acesso negado: undefined" foi resolvido, e se os endpoints 
          da API retornam respostas adequadas ou mensagens de erro significativas.
        </Typography>
      </Alert>

      {/* Current Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Status Atual do Sistema
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2">Autenticado:</Typography>
                <Chip 
                  label={isAuthenticated ? 'Sim' : 'Não'}
                  color={isAuthenticated ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2">Token Presente:</Typography>
                <Chip 
                  label={TokenManager.getToken() ? 'Sim' : 'Não'}
                  color={TokenManager.getToken() ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2">Usuário:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {user?.sub || 'Nenhum'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2">Token Válido:</Typography>
                <Chip 
                  label={TokenManager.isAuthenticated() ? 'Sim' : 'Não'}
                  color={TokenManager.isAuthenticated() ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={getStatusIcon(overallStatus)}
          onClick={runVerificationTests}
          disabled={isRunning}
          size="large"
        >
          {isRunning ? 'Executando Testes...' : 'Executar Verificação Completa'}
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<WarningIcon />}
          onClick={runQuickErrorTest}
          disabled={isRunning}
        >
          Teste Rápido de Erros
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<InfoIcon />}
          onClick={testCurrentAuthState}
          disabled={isRunning}
        >
          Verificar Estado Auth
        </Button>
      </Box>

      {/* Overall Results */}
      {testResults.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {getStatusIcon(overallStatus)}
              <Typography variant="h6">
                Resultado Geral
              </Typography>
              <Chip 
                label={overallStatus === 'passed' ? 'TODOS OS TESTES PASSARAM' : 'ALGUNS TESTES FALHARAM'}
                color={overallStatus === 'passed' ? 'success' : 'error'}
              />
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">Total de Testes</Typography>
                <Typography variant="h4">{testResults.length}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">Passou</Typography>
                <Typography variant="h4" color="success.main">
                  {testResults.filter(r => r.success).length}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">Falhou</Typography>
                <Typography variant="h4" color="error.main">
                  {testResults.filter(r => !r.success).length}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Test Results by Category */}
      {testSummary.map((summary, index) => (
        <Accordion key={index} defaultExpanded={summary.failed > 0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {summary.category}
              </Typography>
              <Chip 
                label={`${summary.passed}/${summary.total}`}
                color={getCategoryColor(summary.passed, summary.total)}
                size="small"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {summary.results.map((result, resultIndex) => (
                <React.Fragment key={resultIndex}>
                  <ListItem>
                    <ListItemIcon>
                      {result.success ? (
                        <SuccessIcon color="success" />
                      ) : (
                        <ErrorIcon color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={result.test}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {result.message}
                          </Typography>
                          {result.details && (
                            <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                              <Typography variant="caption" component="pre">
                                {JSON.stringify(result.details, null, 2)}
                              </Typography>
                            </Box>
                          )}
                          <Typography variant="caption" color="textSecondary">
                            {new Date(result.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {resultIndex < summary.results.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Requirements Validation */}
      {testResults.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Validação dos Requisitos
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  {testResults.some(r => r.test.includes('Token') && r.success) ? (
                    <SuccessIcon color="success" />
                  ) : (
                    <ErrorIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary="Requisito 3.1: Frontend carrega sem erros de autenticação"
                  secondary="Verificado através dos testes de gerenciamento de token e sessão"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  {testResults.some(r => r.test.includes('Error Message') && r.success) ? (
                    <SuccessIcon color="success" />
                  ) : (
                    <ErrorIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary="Requisito 4.2: Erro 'Acesso negado: undefined' resolvido"
                  secondary="Verificado através dos testes de resolução de mensagens de erro"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  {testResults.some(r => r.test.includes('API') && r.success) ? (
                    <SuccessIcon color="success" />
                  ) : (
                    <ErrorIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary="Requisito 5.2: Endpoints retornam respostas adequadas"
                  secondary="Verificado através dos testes de tratamento de erros da API"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Como Interpretar os Resultados
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li><strong>Token Management:</strong> Verifica se o sistema lida corretamente com tokens ausentes, inválidos e expirados</li>
              <li><strong>Error Message:</strong> Garante que nunca são exibidas mensagens "undefined" ou vazias</li>
              <li><strong>Error Classification:</strong> Verifica se diferentes tipos de erro são classificados corretamente</li>
              <li><strong>Session Management:</strong> Testa o gerenciamento de sessão sem erros</li>
              <li><strong>API Endpoint Error Handling:</strong> Verifica se erros de API são tratados adequadamente</li>
            </ul>
          </Typography>
          
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Sucesso:</strong> Todos os testes passaram significa que o frontend carrega corretamente, 
              não há mais erros "undefined", e os endpoints retornam mensagens de erro apropriadas.
            </Typography>
          </Alert>
          
          <Alert severity="warning" sx={{ mt: 1 }}>
            <Typography variant="body2">
              <strong>Falhas:</strong> Testes falhados indicam áreas que ainda precisam de correção. 
              Revise os detalhes de cada teste para identificar os problemas específicos.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};