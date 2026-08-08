import { AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface UploadLimitAlertProps {
  uploadCount: number;
  maxUploads: number;
  resetTime: string;
  isLimitReached: boolean;
}

export default function UploadLimitAlert({
  uploadCount,
  maxUploads,
  resetTime,
  isLimitReached,
}: UploadLimitAlertProps) {
  if (!isLimitReached) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6 border-red-400/50 bg-red-50/80 dark:bg-red-950/20 rounded-xl">
      <div className="flex items-start gap-4">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <AlertTitle className="text-base font-bold text-red-900 dark:text-red-200">
            Daily Upload Limit Reached
          </AlertTitle>
          <AlertDescription className="text-sm text-red-800 dark:text-red-300 space-y-3">
            <p>
              You have uploaded <span className="font-bold">{uploadCount}</span> of your{' '}
              <span className="font-bold">{maxUploads}</span> daily documents.
            </p>
            <div className="flex items-center gap-2 p-3 bg-white/40 dark:bg-black/20 rounded-lg">
              <Clock className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
              <div className="text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-300 mb-0.5">
                  Upload Limit Resets
                </p>
                <p className="font-mono text-sm font-bold text-red-900 dark:text-red-100">
                  {resetTime}
                </p>
              </div>
            </div>
            <p className="text-xs text-red-700 dark:text-red-300 italic">
              You can upload more documents after the reset time. Thank you!
            </p>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
