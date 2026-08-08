import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { DrawerProvider } from '@/context/DrawerContext';
import { PWAProvider } from '@/context/PWAContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';
import { router } from '@/routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.warn('VITE_GOOGLE_CLIENT_ID is not set in .env');
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={googleClientId || ''}>
        <ThemeProvider>
          <AuthProvider>
            <PWAProvider>
              <DrawerProvider>
                <TooltipProvider>
                  <RouterProvider router={router} />
                  <Toaster position="top-right" richColors closeButton />
                </TooltipProvider>
              </DrawerProvider>
            </PWAProvider>
          </AuthProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}
