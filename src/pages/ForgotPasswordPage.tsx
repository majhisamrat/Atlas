import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Mail, Lock, CheckCircle, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { ScaleIn } from '@/components/shared/motion';

type ForgotPasswordStep = 'email' | 'otp' | 'reset' | 'success';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMessage = data.detail || 'Failed to send OTP';
        
        // If email not registered, show error with option to go back to login
        if (response.status === 404) {
          setError(errorMessage);
        } else {
          setError(errorMessage);
        }
        return;
      }

      setStep('otp');
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Invalid OTP');
      }

      setStep('reset');
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to reset password');
      }

      setStep('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fcff] text-foreground selection:bg-primary/20 selection:text-primary lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#082d69] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-80 aurora-panel mix-blend-screen" />
        <div className="relative flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#0d479f]">
            <Brain className="h-6 w-6" />
          </span>
          <span className="brand-atlas text-3xl leading-none">ATLAS</span>
        </div>
        <div className="relative max-w-xl">
          <h1 className="font-display text-5xl font-black leading-[1.02]">Reset Your Password Securely</h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-blue-100">Follow the simple steps to verify your identity and set a new password.</p>
        </div>
        <div className="relative text-sm font-semibold text-blue-200">Your account security is our priority.</div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#8bd0f7_0%,#dff3ff_43%,#ffffff_100%)] p-4 sm:p-6 md:p-10">
        <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/80 blur-3xl" />

        <ScaleIn className="relative z-10 w-full max-w-sm">
          <Link to="/login" className="mb-4 flex items-center gap-2 text-sm font-bold text-[#1246a7] hover:text-[#0d398a]">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>

          <div className="mb-6 space-y-1.5">
            <h1 className="font-display text-3xl md:text-5xl font-black text-[#06285f]">Reset Password</h1>
            <p className="text-sm md:text-lg text-[#365c89]">
              {step === 'email' && 'Enter your email to receive an OTP'}
              {step === 'otp' && 'Enter the OTP sent to your email'}
              {step === 'reset' && 'Set your new password'}
              {step === 'success' && 'Your password has been reset'}
            </p>
          </div>

          <Card className="border border-white/70 bg-white/72 p-5 md:p-8 shadow-[0_24px_60px_-35px_rgba(11,53,111,.30)] backdrop-blur sm:p-8 rounded-[1.8rem]">
            <CardContent className="p-0 pt-6">
              {/* Step 1: Email */}
              {step === 'email' && (
                <form onSubmit={handleSendOTP} className="space-y-5 md:space-y-7">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm md:text-base font-bold text-[#173a72]">
                      Email Address
                    </Label>
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
                        className="h-11 md:h-14 text-sm md:text-lg font-medium rounded-xl border-sky-200 focus-visible:ring-[#2465bf] bg-sky-100 text-black placeholder:text-gray-600"
                        required
                      />
                    </div>
                  </div>

                  {error && error.includes('not registered') && (
                    <div className="space-y-3">
                      <Alert variant="destructive" className="text-sm md:text-base py-3.5 font-bold rounded-xl">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('');
                          setError('');
                        }}
                        className="block w-full text-center text-sm md:text-base font-semibold text-[#1246b8] hover:text-[#0d398a] underline"
                      >
                        Back to Email
                      </button>
                    </div>
                  )}

                  {error && !error.includes('not registered') && (
                    <Alert variant="destructive" className="text-sm md:text-base py-3.5 font-bold rounded-xl">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2 md:gap-3 h-11 md:h-14 text-base md:text-lg font-extrabold rounded-full border-[#0d4abd] text-white bg-[#1246b8] hover:bg-[#0e3b99]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </Button>
                </form>
              )}

              {/* Step 2: OTP */}
              {step === 'otp' && (
                <form onSubmit={handleVerifyOTP} className="space-y-5 md:space-y-7">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm md:text-base font-bold text-[#173a72]">
                      Enter OTP
                    </Label>
                    <p className="text-xs md:text-sm text-[#365c89]">Check your email for the 6-digit OTP</p>
                    <input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                      maxLength={6}
                      required
                      style={{
                        width: '100%',
                        height: '3.5rem',
                        backgroundColor: '#e0f2fe',
                        color: '#000000',
                        border: '2px solid #bae6fd',
                        borderRadius: '0.75rem',
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        letterSpacing: '0.5rem',
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        padding: '0',
                        outline: 'none',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2465bf';
                        e.target.style.boxShadow = '0 0 0 3px rgba(36, 101, 191, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#bae6fd';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive" className="text-sm md:text-base py-3.5 font-bold rounded-xl">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2 md:gap-3 h-11 md:h-14 text-base md:text-lg font-extrabold rounded-full text-white bg-[#1246b8] hover:bg-[#0e3b99]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify OTP'
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setError('');
                    }}
                    className="w-full text-center text-sm font-semibold text-[#1246b8] hover:underline"
                  >
                    Back to Email
                  </button>
                </form>
              )}

              {/* Step 3: Reset Password */}
              {step === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-5 md:space-y-7">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm md:text-base font-bold text-[#173a72]">
                      New Password
                    </Label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 md:left-4 z-10 h-4 md:h-5 w-4 md:w-5 text-muted-foreground pointer-events-none" />
                      <input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          height: '3.5rem',
                          paddingLeft: '2.5rem',
                          paddingRight: '2.5rem',
                          backgroundColor: '#e0f2fe',
                          color: '#000000',
                          border: '2px solid #bae6fd',
                          borderRadius: '0.75rem',
                          fontSize: '1rem',
                          fontWeight: '500',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#2465bf';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(36, 101, 191, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#bae6fd';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 md:right-3 grid h-8 md:h-9 w-8 md:w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-sky-50 hover:text-[#1246a7]"
                      >
                        {showPassword ? <EyeOff className="h-4 md:h-5 w-4 md:w-5" /> : <Eye className="h-4 md:h-5 w-4 md:w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm md:text-base font-bold text-[#173a72]">
                      Confirm Password
                    </Label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 md:left-4 z-10 h-4 md:h-5 w-4 md:w-5 text-muted-foreground pointer-events-none" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          height: '3.5rem',
                          paddingLeft: '2.5rem',
                          paddingRight: '2.5rem',
                          backgroundColor: '#e0f2fe',
                          color: '#000000',
                          border: '2px solid #bae6fd',
                          borderRadius: '0.75rem',
                          fontSize: '1rem',
                          fontWeight: '500',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#2465bf';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(36, 101, 191, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#bae6fd';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 md:right-3 grid h-8 md:h-9 w-8 md:w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-sky-50 hover:text-[#1246a7]"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 md:h-5 w-4 md:w-5" /> : <Eye className="h-4 md:h-5 w-4 md:w-5" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="text-sm md:text-base py-3.5 font-bold rounded-xl">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2 md:gap-3 h-11 md:h-14 text-base md:text-lg font-extrabold rounded-full text-white bg-[#1246b8] hover:bg-[#0e3b99]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('otp');
                      setError('');
                    }}
                    className="w-full text-center text-sm font-semibold text-[#1246b8] hover:underline"
                  >
                    Back to OTP
                  </button>
                </form>
              )}

              {/* Step 4: Success */}
              {step === 'success' && (
                <div className="space-y-5 md:space-y-7 text-center">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-green-100 p-4">
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-[#06285f] mb-2">Password Reset Successful!</h2>
                    <p className="text-sm md:text-base text-[#365c89]">Your password has been updated. You can now log in with your new password.</p>
                  </div>

                  <Button
                    onClick={() => navigate('/login')}
                    size="lg"
                    className="w-full gap-2 md:gap-3 h-11 md:h-14 text-base md:text-lg font-extrabold rounded-full text-white bg-[#1246b8] hover:bg-[#0e3b99]"
                  >
                    Back to Login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </ScaleIn>
      </section>
    </div>
  );
}
