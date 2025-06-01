import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { CartProvider } from '@/contexts/CartContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import AppRoutes from '@/routes';

// Create a client with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // You can integrate with error reporting services here
  // Example: Sentry.captureException(event.reason);
});

// Global error handler for JavaScript errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // You can integrate with error reporting services here
  // Example: Sentry.captureException(event.error);
});

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to error reporting service
        console.error('App-level error:', error, errorInfo);
        // Example: Sentry.captureException(error, { extra: errorInfo });
      }}
    >
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CartProvider>
              <SidebarProvider>
                <ErrorBoundary
                  onError={(error, errorInfo) => {
                    console.error('Router-level error:', error, errorInfo);
                  }}
                >
                  <AppRoutes />
                </ErrorBoundary>
                <Toaster />
              </SidebarProvider>
            </CartProvider>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
