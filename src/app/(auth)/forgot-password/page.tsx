'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      // NextAuth magic link handles password-less flow
      await signIn('nodemailer', { email, callbackUrl: '/', redirect: false });
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <GlassCard variant="strong" padding="lg" className="w-full max-w-md text-center">
        <h1 className="text-xl font-bold text-foreground">Check your email</h1>
        <p className="mt-2 text-sm text-muted">
          If an account exists for <strong className="text-foreground">{email}</strong>,
          we sent a sign-in link.
        </p>
        <Link href="/login" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="strong" padding="lg" className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-foreground">Reset access</h1>
      <p className="mt-1 text-sm text-muted">
        Enter your email and we&apos;ll send a sign-in link
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
          Send link
        </GlassButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </GlassCard>
  );
}
