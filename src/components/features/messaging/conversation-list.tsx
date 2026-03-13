'use client';

import Link from 'next/link';
import { cn } from '@/utils/cn';
import { GlassAvatar } from '@/components/ui/glass-avatar';
import { GlassCard } from '@/components/ui/glass-card';
import { MessageCircle } from 'lucide-react';

interface Participant {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    username: string | null;
  };
}

interface ConversationItem {
  id: string;
  lastMessage: string | null;
  lastActivity: string | Date;
  participants: Participant[];
  messages: Array<{
    sender: { id: string; name: string | null };
  }>;
}

interface ConversationListProps {
  conversations: ConversationItem[];
  currentUserId: string;
  activeId?: string;
}

export function ConversationList({
  conversations,
  currentUserId,
  activeId,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <GlassCard variant="subtle" padding="lg" className="text-center">
        <MessageCircle className="mx-auto h-10 w-10 text-muted mb-3" />
        <p className="text-muted text-sm">No conversations yet</p>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {conversations.map((conv) => {
        // get other participant
        const other = conv.participants.find(
          (p) => p.user.id !== currentUserId,
        )?.user;

        if (!other) return null;

        const timeAgo = formatRelative(String(conv.lastActivity));

        return (
          <Link
            key={conv.id}
            href={`/messages/${conv.id}`}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-3 transition-colors',
              'hover:bg-white/10',
              activeId === conv.id && 'bg-white/15',
            )}
          >
            <GlassAvatar
              src={other.image}
              alt={other.name ?? ''}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground truncate">
                  {other.name ?? other.username}
                </p>
                <span className="text-[10px] text-muted shrink-0">
                  {timeAgo}
                </span>
              </div>
              {conv.lastMessage && (
                <p className="text-xs text-muted truncate mt-0.5">
                  {conv.lastMessage}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// relative time formatter
function formatRelative(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(date).toLocaleDateString();
}
