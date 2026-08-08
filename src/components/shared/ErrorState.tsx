import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FadeIn } from '@/components/shared/motion';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <FadeIn className="w-full">
      <Alert variant="destructive" className={cn('my-4', className)}>
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-base font-semibold">{title}</AlertTitle>
        <AlertDescription className="mt-2 text-sm">
          <p>{message}</p>
          {onRetry && (
            <Button variant="outline" size="sm" className="mt-3 gap-2 border-red-500/30 hover:bg-red-500/10 text-red-300" onClick={onRetry}>
              <RefreshCw className="h-3.5 w-3.5" />
              Retry Request
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </FadeIn>
  );
}
