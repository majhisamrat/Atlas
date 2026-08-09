import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Sparkles, Lock, Mail, ArrowRight, Loader2, ShieldCheck, FileText, MessageSquare, Quote, Eye, EyeOff } from 'lucide-react';
import { ScaleIn } from '@/components/shared/motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In handler
  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setError('');
      setIsLoading(true);
      try {
        // Get user info from Google using the access token
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { 'Authorization': `Bearer ${codeResponse.access_token}` },
        });
        
        if (!userInfoResponse.ok) {
          throw new Error('Failed to get Google user info');
        }

        const userInfo = await userInfoResponse.json();

        // Send user info to backend for authentication
        const backendResponse = await fetch('/api/v1/auth/google-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: codeResponse.access_token,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
          }),
        });

        if (!backendResponse.ok) {
          const errorData = await backendResponse.json();
          throw new Error(errorData.detail || 'Google authentication failed');
        }

        const data = await backendResponse.json();
        
        // Store tokens
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }

        // Verify token is stored
        const storedToken = localStorage.getItem('access_token');
        console.log('Token stored:', !!storedToken, storedToken?.substring(0, 20) + '...');

        // Small delay to ensure localStorage is written before page reload
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Google Sign-In failed');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Google Sign-In failed. Please try again.');
      setIsLoading(false);
    },
    flow: 'implicit',
  });


  return (
    <div className="min-h-screen bg-[#f8fcff] text-foreground selection:bg-primary/20 selection:text-primary lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#082d69] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-80 aurora-panel mix-blend-screen" />
        <div className="relative flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-3xl bg-white text-[#0d479f]"><Brain className="h-6 w-6" /></span><span className="brand-atlas text-4xl leading-none text-[#082c67] ">ATLAS</span></div>
        <div className="relative max-w-xl"><div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-white/15 backdrop-blur"><Quote className="h-7 w-7 text-sky-900" /></div><h1 className="font-display text-5xl font-black leading-[1.02] text-[#06285f]">Bring calm clarity to your team’s most important work.</h1><p className="mt-6 max-w-md text-lg leading-8 text-blue-900">A considered workspace for every document, question, and decision.</p><div className="mt-10 flex gap-3"><div className="rounded-2xl bg-white/15 p-4 backdrop-blur"><FileText className="h-5 w-9 text-slate-700" /><p className="mt-5 text-xl font-bold text-blue-900  ">Connected knowledge</p></div><div className="rounded-2xl bg-white/15 p-4 backdrop-blur"><MessageSquare className="h-5 w-9 text-pink-900" /><p className="mt-5 text-xl font-bold text-blue-900">Grounded answers</p></div></div></div>
        <div className="relative text-xl font-semibold text-slate-700">Trusted by teams who need answers they can stand behind.</div>
      </section>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#8bd0f7_0%,#dff3ff_43%,#ffffff_100%)] p-4 sm:p-6 md:p-10">
        <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-sky-100/60 blur-3xl" /><div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/80 blur-3xl" />
      <ScaleIn className="relative z-10 w-full max-w-sm md:max-w-md lg:max-w-lg">
        {/* Logo and Name - Top Left (Mobile only) */}
        <Link to="/landing" className="absolute -top-16 left-0 mb-4 flex items-center gap-2 md:hidden">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#103d88] text-white">
            <Brain className="h-5 w-5" />
          </span>
          <span className="brand-atlas text-3xl leading-none text-[#082c67]">ATLAS</span>
        </Link>
        
        <div className="mb-6 space-y-1.5">
          <h1 className="font-display text-3xl md:text-6xl font-black text-[#06285f]">Sign in</h1>
          <p className="text-lg md:text-lg text-[#365c89]">Access your Atlas workspace.</p>
        </div>
        <Card className="border border-white/70 bg-white/72 p-5 md:p-8 lg:p-10 shadow-[0_24px_60px_-35px_rgba(11,53,111,.30)] backdrop-blur sm:p-8 rounded-[1.8rem]">
          <CardHeader className="sr-only"><CardTitle>Sign in</CardTitle><CardDescription>Enter your credentials</CardDescription></CardHeader>

          <CardContent className="p-0 pt-6">
            {error && (
              <Alert variant="destructive" className="mb-6 text-base py-3.5 font-bold rounded-xl">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <button type="button" onClick={() => handleGoogleSignIn()} disabled={isLoading} className="flex h-12 md:h-14 w-full items-center justify-center gap-2 md:gap-3 rounded-full bg-[#1246b8] text-base md:text-lg font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#0e3b99] disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="grid h-5 md:h-6 w-5 md:w-6 place-items-center rounded-full bg-white text-sm md:text-base font-black text-[#1246b8]">G</span>
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </button>
            <div className="my-5 md:my-7 flex items-center gap-3 text-sm md:text-sm font-medium text-[#4f6683]"><span className="h-px flex-1 bg-sky-200/80" />or<span className="h-px flex-1 bg-sky-200/80" /></div>

            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-7">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg md:text-base font-bold text-[#173a72]">Work email</Label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 md:left-4 z-10 h-4 md:h-5 w-4 md:w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ 
                      paddingLeft: '2.5rem',
                      backgroundColor: '#e0f2fe !important',
                      color: '#000000 !important',
                    }}
                    className="h-11 md:h-14 text-lg md:text-lg font-medium rounded-xl border-sky-200 focus-visible:ring-[#2465bf] bg-sky-100 text-black placeholder:text-gray-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-lg md:text-base font-bold text-[#173a72]">Password</Label>
                  <Link to="/forgot-password" className="text-sm md:text-sm font-semibold text-[#1246b8] hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 md:left-4 z-10 h-4 md:h-5 w-4 md:w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ 
                      paddingLeft: '2.5rem', 
                      paddingRight: '2.5rem',
                      backgroundColor: '#e0f2fe !important',
                      color: '#000000 !important',
                    }}
                    className="h-11 md:h-14 text-lg md:text-lg font-medium rounded-xl border-sky-200 focus-visible:ring-[#2465bf] bg-sky-100 text-black placeholder:text-gray-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 md:right-3 grid h-8 md:h-9 w-8 md:w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-sky-50 hover:text-[#1246a7] focus:outline-none focus:ring-2 focus:ring-[#2465bf]/30"
                  >
                    {showPassword ? <EyeOff className="h-4 md:h-5 w-4 md:w-5" /> : <Eye className="h-4 md:h-5 w-4 md:w-5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" size="lg" variant="outline" className="w-full gap-2 md:gap-3 mt-2 md:mt-3 h-11 md:h-14 text-base md:text-lg font-extrabold rounded-full border-[#0d4abd] text-[#1246a7] bg-white/60 hover:bg-white hover:text-[#0d398a]" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-5 text-center text-lg md:text-base font-semibold text-[#425b7c]">
              Don't have an account?{' '}
              <Link to="/register" className="font-extrabold text-primary hover:underline">
                Create Account
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-5 flex flex-wrap items-center gap-3 md:gap-5 text-xs md:text-sm font-bold text-[#47688f]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 md:h-5 w-4 md:w-5 text-primary" /> Enterprise Grade
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-4 md:h-5 w-4 md:w-5 text-purple-500" /> Hybrid Search
          </span>
          <span className="flex items-center gap-1.5">
            <Brain className="h-4 md:h-5 w-4 md:w-5 text-emerald-500" /> Fast RAG
          </span>
        </div>
      </ScaleIn>
      </section>
    </div>
  );
}
