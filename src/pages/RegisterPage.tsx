import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Sparkles, Lock, Mail, User, Building, ArrowRight, Loader2, CheckCircle2, Shield } from 'lucide-react';
import { ScaleIn, FadeIn } from '@/components/shared/motion';

export default function RegisterPage() {
  // Step 1: Registration form
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    organization_name: '',
    department: '',
  });
  
  // Step 2: OTP verification
  const [otp, setOtp] = useState('');
  
  // Registration flow state
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  
  const { isAuthenticated, refreshAuth } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated on mount
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Build request body - only include optional fields if they have values
      const requestBody: any = {
        name: form.name,
        email: form.email,
        password: form.password,
      };
      
      // Only add optional fields if they're not empty
      if (form.organization_name?.trim()) {
        requestBody.organization_name = form.organization_name;
      }
      if (form.department?.trim()) {
        requestBody.department = form.department;
      }

      const response = await fetch('/api/v1/auth/register-init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        const errorMsg = Array.isArray(errorData.detail) 
          ? errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ')
          : errorData.detail || 'Failed to send OTP';
        throw new Error(errorMsg);
      }

      setVerifiedEmail(form.email);
      setStep('otp');
    } catch (err: any) {
      let errorMsg = 'Failed to send OTP';
      if (err?.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and create account
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length < 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      // Build request body - only include optional fields if they have values
      const requestBody: any = {
        email: verifiedEmail,
        otp: otp,
        name: form.name,
        password: form.password,
      };
      
      // Only add optional fields if they're not empty
      if (form.organization_name?.trim()) {
        requestBody.organization_name = form.organization_name;
      }
      if (form.department?.trim()) {
        requestBody.department = form.department;
      }

      // Use register-verify endpoint to verify OTP and create account
      const response = await fetch('/api/v1/auth/register-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = Array.isArray(errorData.detail) 
          ? errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ')
          : errorData.detail || 'OTP verification failed';
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log('Verify-OTP response:', data);
      
      // Store tokens
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      console.log('Tokens stored, access_token:', !!localStorage.getItem('access_token'));
      setStep('success');
      
      // Refresh auth context before navigating
      setTimeout(async () => {
        console.log('Refreshing auth context before redirect');
        await refreshAuth();
        console.log('Auth refreshed, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      }, 1500);
    } catch (err: any) {
      let errorMsg = 'OTP verification failed';
      if (err?.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-Up handler
  const handleGoogleSignUp = useGoogleLogin({
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

        // Send user info to backend for authentication/registration
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
            organization_name: form.organization_name || 'Default Enterprise',
          }),
        });

        if (!backendResponse.ok) {
          try {
            const errorData = await backendResponse.json();
            const errorMsg = typeof errorData === 'string' 
              ? errorData 
              : (errorData.detail || JSON.stringify(errorData).substring(0, 100) || 'Google authentication failed');
            throw new Error(errorMsg);
          } catch (parseError) {
            throw new Error(`Server error: ${backendResponse.status} ${backendResponse.statusText}`);
          }
        }

        const data = await backendResponse.json();
        
        // Store tokens
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }

        // Small delay to ensure localStorage is written before page reload
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      } catch (err: any) {
        let errorMsg = 'Google Sign-Up failed';
        if (err?.message) {
          errorMsg = err.message;
        }
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Google Sign-Up failed. Please try again.');
      setIsLoading(false);
    },
    flow: 'implicit',
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground relative overflow-hidden p-4 sm:p-6 selection:bg-primary/20 selection:text-primary">
      {/* Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 right-1/4 w-[700px] h-[700px] bg-primary/15 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-[700px] h-[700px] bg-indigo-600/15 rounded-full blur-[150px] animate-pulse" />
      </div>

      <ScaleIn className="w-full max-w-sm md:max-w-2xl relative z-10 my-4 md:my-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-5 md:mb-8 space-y-2 md:space-y-3">
          <div className="relative flex h-12 md:h-18 w-12 md:w-18 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-indigo-600 shadow-xl shadow-primary/30 glow-md">
            <Brain className="h-6 md:h-10 w-6 md:w-10 text-white" />
            <Sparkles className="absolute -top-0.5 -right-0.5 h-3 md:h-4.5 w-3 md:w-4.5 text-sky-300 animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            Create Your Account
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-semibold">
            Get started with ATLAS in less than two minutes
          </p>
        </div>

        {/* Form Card */}
        <Card className="glass-card border border-border shadow-2xl p-5 md:p-10 lg:p-12 rounded-3xl">
          <CardContent className="p-0">
            {error && (
              <Alert variant="destructive" className="mb-4 md:mb-6 text-sm md:text-base py-2.5 md:py-3.5 font-bold rounded-xl">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 'form' && (
              <>
                {/* Google Sign-Up Button */}
                <button 
                  type="button" 
                  onClick={() => handleGoogleSignUp()} 
                  disabled={isLoading}
                  className="flex h-12 md:h-14 w-full items-center justify-center gap-2 md:gap-3 rounded-full bg-[#1246b8] text-base md:text-lg font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#0e3b99] disabled:opacity-50 disabled:cursor-not-allowed mb-4 md:mb-6"
                >
                  <span className="grid h-5 md:h-6 w-5 md:w-6 place-items-center rounded-full bg-white text-sm md:text-base font-black text-[#1246b8]">G</span>
                  {isLoading ? 'Creating account...' : 'Sign up with Google'}
                </button>

                <div className="relative mb-4 md:mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/40"></span>
                  </div>
                  <div className="relative flex justify-center text-sm md:text-sm">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="name" className="text-sm md:text-base font-bold">Full Name</Label>
                      <div className="relative flex items-center">
                        <User className="absolute left-3 md:left-4 z-10 h-4 md:h-5 w-4 md:w-5 text-muted-foreground pointer-events-none" />
                        <Input
                          id="name"
                          placeholder="Samrat Doe"
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          style={{ paddingLeft: '2.5rem' }}
                          className="h-10 md:h-14 text-sm md:text-lg font-medium rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="email" className="text-sm md:text-base font-bold">Work Email</Label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3 md:left-4 z-10 h-4 md:h-5 w-4 md:w-5 text-muted-foreground pointer-events-none" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="jane@company.com"
                          value={form.email}
                          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                          style={{ paddingLeft: '2.5rem' }}
                          className="h-10 md:h-14 text-sm md:text-lg font-medium rounded-xl"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="password" className="text-sm md:text-base font-bold">Password</Label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 md:left-4 z-10 h-4 md:h-5 w-4 md:w-5 text-muted-foreground pointer-events-none" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="At least 6 characters"
                        value={form.password}
                        onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                        style={{ paddingLeft: '2.5rem' }}
                        className="h-10 md:h-14 text-sm md:text-lg font-medium rounded-xl"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="org" className="text-sm md:text-base font-bold">Organization (Optional)</Label>
                      <div className="relative flex items-center">
                        <Building className="absolute left-3 md:left-4 z-10 h-4 md:h-5 w-4 md:w-5 text-muted-foreground pointer-events-none" />
                        <Input
                          id="org"
                          placeholder="Acme Inc."
                          value={form.organization_name}
                          onChange={(e) => setForm((p) => ({ ...p, organization_name: e.target.value }))}
                          style={{ paddingLeft: '2.5rem' }}
                          className="h-10 md:h-14 text-sm md:text-lg font-medium rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="dept" className="text-sm md:text-base font-bold">Department (Optional)</Label>
                      <Input
                        id="dept"
                        placeholder="Engineering / Sales"
                        value={form.department}
                        onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                        className="h-10 md:h-14 text-sm md:text-lg font-medium rounded-xl px-3 md:px-5"
                      />
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full gap-2 md:gap-3 mt-2 md:mt-4 h-10 md:h-14 text-sm md:text-lg font-extrabold shadow-lg shadow-primary/25 rounded-xl" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 md:h-5 w-5 md:w-5 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        Complete Registration
                        <ArrowRight className="h-5 md:h-5 w-5 md:w-5" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-4 md:mt-8 text-center text-sm md:text-base font-semibold text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-primary hover:underline">
                    Sign In
                  </Link>
                </div>
              </>
            )}

            {step === 'otp' && (
              <FadeIn>
                <div className="space-y-6 md:space-y-8">
                  <div className="text-center space-y-2 md:space-y-3">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 md:p-4 rounded-full bg-primary/10 border border-primary/20">
                        <Shield className="h-6 md:h-8 w-6 md:w-8 text-primary" />
                      </div>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Verify Your Email</h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                      We've sent a verification code to <span className="font-semibold text-foreground">{verifiedEmail}</span>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-4 md:space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="otp" className="text-sm md:text-base font-bold">Enter OTP</Label>
                      <Input
                        id="otp"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="h-12 md:h-14 text-center text-2xl md:text-3xl font-bold tracking-widest rounded-xl"
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full gap-2 md:gap-3 h-10 md:h-14 text-sm md:text-lg font-extrabold shadow-lg shadow-primary/25 rounded-xl" 
                      disabled={isLoading || otp.length < 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 md:h-5 w-5 md:w-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify & Complete
                          <ArrowRight className="h-5 md:h-5 w-5 md:w-5" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('form');
                        setOtp('');
                        setError('');
                      }}
                      className="text-sm md:text-base font-semibold text-muted-foreground hover:text-primary transition"
                    >
                      Back to Registration
                    </button>
                  </div>
                </div>
              </FadeIn>
            )}

            {step === 'success' && (
              <FadeIn>
                <div className="text-center space-y-6 md:space-y-8 py-6 md:py-8">
                  <div className="flex justify-center">
                    <div className="p-4 md:p-6 rounded-full bg-green-500/10 border border-green-500/20 animate-pulse">
                      <CheckCircle2 className="h-8 md:h-12 w-8 md:w-12 text-green-500" />
                    </div>
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Account Created!</h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Welcome to ATLAS. Redirecting to your dashboard...
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Loader2 className="h-5 md:h-6 w-5 md:w-6 animate-spin text-primary" />
                  </div>
                </div>
              </FadeIn>
            )}
          </CardContent>
        </Card>
      </ScaleIn>
    </div>
  );
}
