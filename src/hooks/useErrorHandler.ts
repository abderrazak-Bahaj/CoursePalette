import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  logToService?: boolean;
  customMessage?: string;
}

interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = useCallback(
    (error: Error | ApiError | any, options: ErrorHandlerOptions = {}) => {
      const {
        showToast = true,
        logToConsole = true,
        logToService = process.env.NODE_ENV === 'production',
        customMessage,
      } = options;

      // Extract error message
      let errorMessage = 'An unexpected error occurred';
      let errorTitle = 'Error';

      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.response?.data?.message) {
        // Axios error format
        errorMessage = error.response.data.message;
      } else if (error?.data?.message) {
        // API error format
        errorMessage = error.data.message;
      }

      // Set custom title based on error type
      if (error?.status >= 400 && error?.status < 500) {
        errorTitle = 'Client Error';
      } else if (error?.status >= 500) {
        errorTitle = 'Server Error';
      } else if (
        error?.name === 'NetworkError' ||
        error?.code === 'NETWORK_ERROR'
      ) {
        errorTitle = 'Network Error';
        errorMessage = 'Please check your internet connection';
      }

      // Use custom message if provided
      if (customMessage) {
        errorMessage = customMessage;
      }

      // Log to console in development
      if (logToConsole) {
        console.error('Error caught by useErrorHandler:', {
          error,
          message: errorMessage,
          stack: error?.stack,
          timestamp: new Date().toISOString(),
        });
      }

      // Log to error reporting service in production
      if (logToService) {
        // Integrate with error reporting services like Sentry
        // Example: Sentry.captureException(error);
        try {
          // You can implement your error reporting logic here
          // For now, we'll just log it
          console.error('Production error:', error);
        } catch (reportingError) {
          console.error('Failed to report error:', reportingError);
        }
      }

      // Show toast notification
      if (showToast) {
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: 'destructive',
        });
      }

      return {
        message: errorMessage,
        title: errorTitle,
        originalError: error,
      };
    },
    [toast]
  );

  // Specific handlers for common error types
  const handleApiError = useCallback(
    (error: any, customMessage?: string) => {
      return handleError(error, {
        customMessage,
        logToService: true,
      });
    },
    [handleError]
  );

  const handleValidationError = useCallback(
    (error: any) => {
      return handleError(error, {
        customMessage: 'Please check your input and try again',
      });
    },
    [handleError]
  );

  const handleNetworkError = useCallback(
    (error: any) => {
      return handleError(error, {
        customMessage:
          'Network error. Please check your connection and try again',
      });
    },
    [handleError]
  );

  const handleAuthError = useCallback(
    (error: any) => {
      return handleError(error, {
        customMessage: 'Authentication error. Please log in again',
      });
    },
    [handleError]
  );

  return {
    handleError,
    handleApiError,
    handleValidationError,
    handleNetworkError,
    handleAuthError,
  };
};

export default useErrorHandler;
