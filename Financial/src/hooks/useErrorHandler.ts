// Hook para gerenciar tratamento de erros e notificações

import { useState, useCallback } from 'react';
import { ErrorHandler, type ErrorInfo } from '../utils/errorHandler';

interface UseErrorHandlerReturn {
  error: ErrorInfo | null;
  showError: (error: any, context?: string) => void;
  clearError: () => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showError = useCallback((error: any, context?: string) => {
    // Log detalhado para debugging
    ErrorHandler.logError(error, context);
    
    // Processar erro para exibição ao usuário
    const errorInfo = ErrorHandler.processApiError(error);
    setError(errorInfo);
    
    // Auto-limpar erro após 10 segundos para erros de warning/info
    if (errorInfo.type !== 'error') {
      setTimeout(() => {
        setError(null);
      }, 10000);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    // Limpar erro quando começar nova operação
    if (loading) {
      setError(null);
    }
  }, []);

  return {
    error,
    showError,
    clearError,
    isLoading,
    setLoading
  };
};

export default useErrorHandler;