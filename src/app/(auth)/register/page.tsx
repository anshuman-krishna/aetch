'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import { FormError } from '@/components/forms/form-error';
import { Mail } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const result = await signIn('nodemailer', { email, callbackUrl: '/onboarding/role', redirect: false });
      if (result?.error) {
        setError('Failed to send sign-in email. Please check the address.');
      } else {
        setEmailSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    signIn('google', { callbackUrl: '/onboarding/role' });
  };

  if (emailSent) {
    return (
      <GlassCard variant="strong" padding="lg" className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pastel-sky/20">
          <Mail className="h-7 w-7 text-pastel-sky" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Check your email</h1>
        <p className="mt-2 text-sm text-muted">
          We sent a link to <strong className="text-foreground">{email}</strong> to get you started.
        </p>
        <GlassButton
          variant="ghost"
          size="sm"
          className="mt-4"
          onClick={() => setEmailSent(false)}
        >
          Use a different email
        </GlassButton>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="strong" padding="lg" className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
      <p className="mt-1 text-sm text-muted">Join the AETCH tattoo community</p>

      {error && <FormError message={error} className="mt-4" />}

      <GlassButton
        variant="default"
        size="lg"
        className="mt-6 w-full"
        onClick={handleGoogleSignUp}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign up with Google
      </GlassButton>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border/50" />
        <span className="text-xs text-muted">or</span>
        <div className="h-px flex-1 bg-border/50" />
      </div>

      <form onSubmit={handleEmailRegister} className="space-y-4">
        <GlassInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <GlassButton
          variant="primary"
          size="lg"
          className="w-full"
          type="submit"
          loading={loading}
        >
          Continue with email
        </GlassButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </GlassCard>
  );
}
