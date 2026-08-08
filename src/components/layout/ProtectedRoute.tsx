import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Brain } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground space-y-4">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-indigo-600 shadow-xl shadow-primary/30 glow-md animate-pulse">
          <Brain className="h-7 w-7 text-white animate-spin-slow" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Authenticating...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  return <>{children}</>;
}
