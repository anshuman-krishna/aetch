'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassButton } from '@/components/ui/glass-button';
import { MessageCircle } from 'lucide-react';

interface MessageArtistButtonProps {
  artistUserId: string;
}

export function MessageArtistButton({ artistUserId }: MessageArtistButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: artistUserId }),
      });

      if (!res.ok) return;
      const { conversation } = await res.json();
      router.push(`/app/messages/${conversation.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassButton variant="secondary" size="md" onClick={handleClick} loading={loading}>
      <MessageCircle className="h-4 w-4" />
      Message Artist
    </GlassButton>
  );
}
