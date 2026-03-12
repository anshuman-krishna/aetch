import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gradient-mesh flex min-h-screen flex-col items-center justify-center px-4">
      <Link href="/" className="mb-8 text-3xl font-bold tracking-tight text-foreground">
        AETCH
      </Link>
      {children}
    </div>
  );
}
