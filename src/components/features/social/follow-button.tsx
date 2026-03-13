'use client';

import { useState } from 'react';
import { GlassButton } from '@/components/ui/glass-button';
import { UserPlus, UserCheck } from 'lucide-react';

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
}

export function FollowButton({ userId, initialFollowing = false }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const res = await fetch(`/api/users/${userId}/follow`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setFollowing(data.following);
    }
    setLoading(false);
  };

  return (
    <GlassButton
      variant={following ? 'ghost' : 'primary'}
      size="sm"
      onClick={handleToggle}
      loading={loading}
    >
      {following ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
      {following ? 'Following' : 'Follow'}
    </GlassButton>
  );
}
