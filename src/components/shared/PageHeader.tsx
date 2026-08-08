import { cn } from '@/lib/utils';
import { FadeIn } from '@/components/shared/motion';

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <FadeIn direction="down" duration={0.3} className={cn('flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-sky-100/80 pb-8', className)}>
      <div className="space-y-2">
        <p className="app-kicker">Atlas workspace</p>
        <h1 className="workspace-title font-display text-4xl lg:text-5xl font-black text-foreground">
          {title}
        </h1>
        {description && typeof description === 'string' ? (
          <p className="workspace-description max-w-2xl text-base text-muted-foreground font-medium">{description}</p>
        ) : (
          description
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-4 shrink-0">{children}</div>}
    </FadeIn>
  );
}
