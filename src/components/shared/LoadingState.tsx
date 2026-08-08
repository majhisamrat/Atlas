import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateProps {
  className?: string;
  count?: number;
}

export function LoadingState({ className, count = 3 }: LoadingStateProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <Skeleton className="h-4 w-3/4 rounded-lg" />
          <Skeleton className="h-3 w-1/2 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-4 shadow-sm', className)}>
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-1/3 rounded-lg" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
      <Skeleton className="h-8 w-1/4 rounded-lg" />
      <Skeleton className="h-3 w-2/3 rounded-lg" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2 border-b border-white/[0.04] last:border-0">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}
