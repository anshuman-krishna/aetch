import Link from 'next/link';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gradient-mesh flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-6 text-2xl font-bold tracking-tight text-foreground">
        AETCH
      </Link>
      <div className="w-full max-w-xl">{children}</div>
    </div>
  );
}
