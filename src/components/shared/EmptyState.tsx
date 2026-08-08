import { FileQuestion, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/shared/motion';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
  icon?: React.ElementType;
}

export function EmptyState({ title, description, action, className, icon: Icon = FolderOpen }: EmptyStateProps) {
  return (
    <FadeIn className={cn('flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01]', className)}>
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-inner mb-4 animate-float">
        <Icon className="h-8 w-8 text-primary/70" />
      </div>
      <h3 className="text-lg font-semibold text-foreground tracking-tight">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1.5 max-w-md leading-relaxed">{description}</p>}
      {action && (
        <Button variant="outline" className="mt-6 gap-2" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </FadeIn>
  );
}
