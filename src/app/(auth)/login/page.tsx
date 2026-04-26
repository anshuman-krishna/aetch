'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import { FormError } from '@/components/forms/form-error';
import { Mail } from 'lucide-react';
import Link from 'next/link';

const errorMessages: Record<string, string> = {
  OAuthSignin: 'Error starting sign-in. Try again.',
  OAuthCallback: 'Error during sign-in callback. Try again.',
  OAuthAccountNotLinked: 'This email is already linked to another account.',
  EmailSignin: 'Error sending sign-in email. Check the address.',
  CredentialsSignin: 'Invalid credentials.',
  Default: 'An error occurred. Please try again.',
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <GlassCard variant="strong" padding="lg" className="w-full max-w-md h-80 animate-pulse" />
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';
  const authError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await signIn('nodemailer', { email, callbackUrl, redirect: false });
      setEmailSent(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  if (emailSent) {
    return (
      <GlassCard variant="strong" padding="lg" className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pastel-mint/20">
          <Mail className="h-7 w-7 text-pastel-mint" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Check your email</h1>
        <p className="mt-2 text-sm text-muted">
          We sent a sign-in link to <strong className="text-foreground">{email}</strong>
        </p>
        <GlassButton variant="ghost" size="sm" className="mt-4" onClick={() => setEmailSent(false)}>
          Use a different email
        </GlassButton>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="strong" padding="lg" className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Sign in to your AETCH account</p>

      {authError && (
        <FormError message={errorMessages[authError] ?? errorMessages.Default} className="mt-4" />
      )}

      {/* Google */}
      <GlassButton variant="default" size="lg" className="mt-6 w-full" onClick={handleGoogleSignIn}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </GlassButton>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border/50" />
        <span className="text-xs text-muted">or</span>
        <div className="h-px flex-1 bg-border/50" />
      </div>

      {/* Email */}
      <form onSubmit={handleEmailSignIn} className="space-y-4">
        <GlassInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <GlassButton variant="primary" size="lg" className="w-full" type="submit" loading={loading}>
          Send sign-in link
        </GlassButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </GlassCard>
  );
}
