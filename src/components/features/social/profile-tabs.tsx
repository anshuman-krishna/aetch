'use client';

import { useState, useEffect } from 'react';
import { GlassButton } from '@/components/ui/glass-button';
import { PostGrid } from './post-grid';
import { type PostCardData } from './post-card';

type Tab = 'posts' | 'liked';

interface ProfileTabsProps {
  userId: string;
}

export function ProfileTabs({ userId }: ProfileTabsProps) {
  const [tab, setTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const endpoint = tab === 'posts'
      ? `/api/users/${userId}/posts`
      : `/api/users/${userId}/liked`;

    fetch(endpoint)
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .finally(() => setLoading(false));
  }, [userId, tab]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <GlassButton variant={tab === 'posts' ? 'primary' : 'ghost'} size="sm" onClick={() => setTab('posts')}>
          Posts
        </GlassButton>
        <GlassButton variant={tab === 'liked' ? 'primary' : 'ghost'} size="sm" onClick={() => setTab('liked')}>
          Liked
        </GlassButton>
      </div>
      <PostGrid posts={posts} loading={loading} />
    </div>
  );
}
