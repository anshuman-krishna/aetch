import { cn } from '@/utils/cn';

interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl bg-pastel-coral/15 border border-pastel-coral/30 px-4 py-3 text-sm text-red-700 dark:text-pastel-coral',
        className,
      )}
    >
      {message}
    </div>
  );
}
