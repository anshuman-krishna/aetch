'use client';

import { cn } from '@/utils/cn';
import { GlassAvatar } from '@/components/ui/glass-avatar';

interface MessageBubbleProps {
  content: string;
  senderName: string;
  senderImage?: string | null;
  isOwn: boolean;
  timestamp: string | Date;
}

export function MessageBubble({
  content,
  senderName,
  senderImage,
  isOwn,
  timestamp,
}: MessageBubbleProps) {
  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={cn('flex gap-2 max-w-[80%]', isOwn && 'ml-auto flex-row-reverse')}>
      {!isOwn && <GlassAvatar src={senderImage} alt={senderName} size="sm" />}
      <div>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm',
            isOwn
              ? 'bg-primary/90 text-white rounded-br-md'
              : 'glass rounded-bl-md text-foreground',
          )}
        >
          {content}
        </div>
        <p className={cn('text-[10px] text-muted mt-1', isOwn && 'text-right')}>{time}</p>
      </div>
    </div>
  );
}
