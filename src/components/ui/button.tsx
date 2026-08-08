import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-base font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:brightness-110',
        destructive:
          'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25 hover:shadow-xl hover:shadow-destructive/35 hover:brightness-110',
        outline:
          'border border-border bg-card shadow-sm hover:bg-muted hover:text-foreground hover:shadow-md',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md',
        ghost:
          'hover:bg-muted hover:text-foreground',
        link:
          'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-12 px-6 py-3 text-base',
        sm: 'h-10 rounded-xl px-4 text-sm font-semibold',
        lg: 'h-14 rounded-2xl px-9 text-lg font-black',
        icon: 'h-12 w-12 rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
