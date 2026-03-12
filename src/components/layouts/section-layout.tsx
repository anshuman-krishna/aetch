import { cn } from '@/utils/cn';

interface SectionLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function SectionLayout({ children, title, subtitle, className }: SectionLayoutProps) {
  return (
    <section className={cn('py-16', className)}>
      {(title || subtitle) && (
        <div className="mb-10 text-center">
          {title && (
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {title}
            </h2>
          )}
          {subtitle && <p className="mt-3 text-lg text-muted">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
