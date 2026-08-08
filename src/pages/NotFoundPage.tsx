import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Compass } from 'lucide-react';
import { ScaleIn } from '@/components/shared/motion';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center text-center p-4 bg-background text-foreground relative overflow-hidden">
      {/* Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[140px]" />
      </div>

      <ScaleIn className="relative z-10 max-w-md space-y-6">
        <div className="relative inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/[0.04] border border-white/[0.08] shadow-glass mb-2 animate-float">
          <Compass className="h-10 w-10 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Page Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <Button asChild className="gap-2 shadow-md shadow-primary/20">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Return to Dashboard
          </Link>
        </Button>
      </ScaleIn>
    </div>
  );
}
