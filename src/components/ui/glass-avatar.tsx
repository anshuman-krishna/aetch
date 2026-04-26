import { cn } from '@/utils/cn';
import Image from 'next/image';

interface GlassAvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
} as const;

const imageSizes = { sm: 32, md: 40, lg: 48, xl: 64 } as const;

export function GlassAvatar({ src, alt = '', fallback, size = 'md', className }: GlassAvatarProps) {
  const initials =
    fallback ??
    alt
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        'glass-strong',
        sizeClasses[size],
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-semibold text-foreground/70">{initials}</span>
      )}
    </div>
  );
}
