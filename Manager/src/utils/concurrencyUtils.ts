/**
 * Utility functions for handling concurrency and retries
 */

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 300, // Reduced from 1000ms to 300ms
  maxDelay: 2000, // Reduced from 10000ms to 2000ms
  backoffMultiplier: 1.5, // Reduced from 2 to 1.5 (less aggressive)
};

/**
 * Checks if an error is related to concurrency conflict
 */
export function isConcurrencyError(error: any): boolean {
  // Check HTTP status
  if (error.response?.status === 409) {
    return true;
  }
  
  // DO NOT capture entity not found errors
  if (error.response?.status === 404) {
    return false;
  }
  
  // Check error messages in English
  if (error.response?.data?.message) {
    const message = error.response.data.message.toLowerCase();
    if (
      message.includes("updated or deleted by another transaction") ||
      message.includes("version conflict") ||
      message.includes("stale object state") ||
      message.includes("concurrency") ||
      message.includes("version") ||
      message.includes("row was updated or deleted") ||
      message.includes("objectoptimisticlockingfailureexception")
    ) {
      return true;
    }
  }
  
  // Check error messages in Portuguese
  if (error.response?.data?.message) {
    const message = error.response.data.message.toLowerCase();
    if (
      message.includes("atualizada ou excluída por outra transação") ||
      message.includes("conflito de versão") ||
      message.includes("estado obsoleto do objeto") ||
      message.includes("concorrência") ||
      message.includes("versão") ||
      message.includes("linha foi atualizada ou excluída")
    ) {
      return true;
    }
  }
  
  // Check error type names
  if (error.constructor?.name) {
    const className = error.constructor.name.toLowerCase();
    if (
      className.includes("optimisticlockingfailureexception") ||
      className.includes("staleobjectstateexception") ||
      className.includes("concurrency")
    ) {
      return true;
    }
  }
  
  return false;
}

/**
 * Wraps a function with automatic retry logic for concurrency conflicts
 */
export async function withConcurrencyRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Only retry on concurrency errors
      if (!isConcurrencyError(error) || attempt === config.maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelay
      );
      
      console.log(`🔄 Concurrency conflict detected, retrying in ${delay}ms... (attempt ${attempt + 1}/${config.maxRetries + 1})`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Utility function to create a delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
