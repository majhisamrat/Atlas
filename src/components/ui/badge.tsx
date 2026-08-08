import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/15 text-primary shadow-sm shadow-primary/10',
        secondary: 'border-white/[0.06] bg-white/[0.05] text-muted-foreground',
        destructive: 'border-transparent bg-red-500/15 text-red-400 shadow-sm shadow-red-500/10',
        outline: 'border-white/[0.1] text-foreground bg-white/[0.03]',
        success: 'border-transparent bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/10',
        warning: 'border-transparent bg-amber-500/15 text-amber-400 shadow-sm shadow-amber-500/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
