'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, AlertCircle, ArrowRight, Github, ArrowLeftRight, Calendar, Shield, Play } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'reset';

function AuthPageContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        window.location.href = '/dashboard';
      }
    }
    checkUser();
    
    const tabParam = searchParams.get('tab');
    if (tabParam === 'signup') {
      setMode('signup');
    }
    
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    if (errorParam) {
      setError(decodeURIComponent(errorDescription || 'Authentication failed. Please try again.'));
    }
  }, [searchParams, supabase]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(getErrorMessage(error.message));
    } else {
      window.location.href = '/dashboard';
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(getErrorMessage(error.message));
    } else {
      setSuccessMessage('Account created! Check your email to confirm your account.');
      setMode('signin');
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/profile`,
    });

    if (error) {
      setError(getErrorMessage(error.message));
    } else {
      setSuccessMessage('Password reset email sent! Check your inbox.');
    }
    setLoading(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setSocialLoading(provider);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(getErrorMessage(error.message));
      setSocialLoading(null);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: 'demo@shiftswap.app',
      password: 'demo1234',
    });

    if (error) {
      setError('Demo account is not available. Please sign up for a new account.');
      setDemoLoading(false);
    } else {
      window.location.href = '/dashboard';
    }
  };

  const getErrorMessage = (message: string): string => {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password. Please try again.',
      'Email not confirmed': 'Please verify your email address first. Check your inbox.',
      'User already registered': 'An account with this email already exists. Try signing in.',
      'Password should be at least 8 characters': 'Password must be at least 8 characters.',
      'Unable to validate email address: invalid format': 'Please enter a valid email address.',
      'Signup requires a valid password': 'Please enter a valid password (min 8 characters).',
    };
    return errorMap[message] || message;
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Decorative (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-background to-background" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-3xl" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="size-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold">ShiftSwap</span>
          </Link>
          
          <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
            Shift management,{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
              simplified
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-md">
            Join thousands of shift workers who use ShiftSwap to manage their schedules effortlessly.
          </p>
          
          {/* Feature highlights */}
          <div className="space-y-6">
            {[
              { icon: ArrowLeftRight, text: 'Swap shifts with trusted colleagues in seconds' },
              { icon: Calendar, text: 'See all your shifts at a glance on any device' },
              { icon: Shield, text: 'Manager approvals keep your team covered' },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="size-5 text-emerald-500" />
                </div>
                <p className="text-sm text-muted-foreground pt-1.5">{feature.text}</p>
              </div>
            ))}
          </div>
          
          {/* Social proof */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {['MK', 'JT', 'SL', 'AR'].map((initials, i) => (
                  <div key={i} className="size-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-background flex items-center justify-center text-xs font-medium text-white">
                    {initials}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="size-4 text-yellow-500 fill-yellow-500" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Trusted by 500+ shift workers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-2xl font-bold">ShiftSwap</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {mode === 'signin' && 'Welcome back'}
              {mode === 'signup' && 'Create your account'}
              {mode === 'reset' && 'Reset your password'}
            </h2>
            <p className="text-muted-foreground">
              {mode === 'signin' && 'Sign in to continue to ShiftSwap'}
              {mode === 'signup' && 'Get started with your free account'}
              {mode === 'reset' && 'Enter your email to receive a reset link'}
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mb-6 bg-emerald-500/10 border-emerald-500/20">
              <AlertCircle className="h-4 w-4 text-emerald-500" />
              <AlertDescription className="text-emerald-500">{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Social Login Buttons - More Prominent */}
          <div className="space-y-3 mb-8">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => handleSocialLogin('google')}
              disabled={!!socialLoading}
              className="w-full h-12 bg-card border-border hover:bg-accent hover:text-accent-foreground shadow-sm"
            >
              {socialLoading === 'google' ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span className="font-medium">Continue with Google</span>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => handleSocialLogin('github')}
              disabled={!!socialLoading}
              className="w-full h-12 bg-card border-border hover:bg-accent hover:text-accent-foreground shadow-sm"
            >
              {socialLoading === 'github' ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Github className="mr-2 h-5 w-5" />
              )}
              <span className="font-medium">Continue with GitHub</span>
            </Button>
          </div>

          {/* Try Demo Button */}
          <Button
            type="button"
            size="lg"
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/25 font-semibold"
          >
            {demoLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading demo...
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Try Demo
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Explore the app with sample data — no signup required
          </p>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground">or continue with email</span>
            </div>
          </div>

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-card border-border"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password" className="text-sm font-medium">Password</Label>
                  <button
                    type="button"
                    onClick={() => { setMode('reset'); setError(null); setSuccessMessage(null); }}
                    className="text-sm text-emerald-500 hover:text-emerald-400 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-card border-border"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} size="lg" className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25 font-semibold">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-12 bg-card border-border"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-card border-border"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-card border-border"
                    minLength={8}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
              </div>

              <Button type="submit" disabled={loading} size="lg" className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25 font-semibold">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By creating an account, you agree to our{' '}
                <Link href="/" className="text-emerald-500 hover:text-emerald-400">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/" className="text-emerald-500 hover:text-emerald-400">Privacy Policy</Link>.
              </p>
            </form>
          )}

          {/* Reset Password Form */}
          {mode === 'reset' && (
            <form onSubmit={handlePasswordReset} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-card border-border"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} size="lg" className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25 font-semibold">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending email...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); setSuccessMessage(null); }}
                  className="text-emerald-500 hover:text-emerald-400 font-medium"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            {mode === 'signin' && (
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); setSuccessMessage(null); }}
                  className="text-emerald-500 hover:text-emerald-400 font-semibold"
                >
                  Sign up free
                </button>
              </p>
            )}
            {mode === 'signup' && (
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); setSuccessMessage(null); }}
                  className="text-emerald-500 hover:text-emerald-400 font-semibold"
                >
                  Sign in
                </button>
              </p>
            )}
            <Link href="/" className="inline-flex items-center gap-2 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowRight className="size-4 rotate-180" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
