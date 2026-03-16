'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { PageContainer } from '@/components/layouts/page-container';
import { PostGrid } from '@/components/features/social/post-grid';
import { GlassButton } from '@/components/ui/glass-button';
import { type PostCardData } from '@/components/features/social/post-card';
import { Plus } from 'lucide-react';
import Link from 'next/link';

type FeedType = 'latest' | 'following' | 'trending';

const tabs: { value: FeedType; label: string }[] = [
  { value: 'latest', label: 'Latest' },
  { value: 'following', label: 'Following' },
  { value: 'trending', label: 'Trending' },
];

export default function FeedPage() {
  const { data: session } = useSession();
  const [feedType, setFeedType] = useState<FeedType>('latest');
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (pageNum: number, reset = false) => {
    setLoading(true);
    const params = new URLSearchParams({ type: feedType, page: String(pageNum) });
    const res = await fetch(`/api/posts?${params}`);
    const data = await res.json();
    const newPosts = data.posts ?? [];

    setPosts((prev) => reset ? newPosts : [...prev, ...newPosts]);
    setHasMore(data.pagination?.hasNext ?? false);
    setLoading(false);
  }, [feedType]);

  useEffect(() => {
    setPage(1);
    fetchPosts(1, true);
  }, [fetchPosts]);

  const handleDelete = async (postId: string) => {
    const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(next);
  };

  return (
    <PageContainer>
      <div className="py-8 sm:py-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h2 text-foreground">Feed</h1>
            <p className="mt-1 text-muted">See what the community is sharing</p>
          </div>
          <Link href="/app/create-post">
            <GlassButton variant="primary" size="md">
              <Plus className="h-4 w-4" /> New Post
            </GlassButton>
          </Link>
        </div>

        {/* feed tabs */}
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <GlassButton
              key={tab.value}
              variant={feedType === tab.value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFeedType(tab.value)}
            >
              {tab.label}
            </GlassButton>
          ))}
        </div>

        <PostGrid
          posts={posts}
          currentUserId={session?.user?.id}
          loading={loading && posts.length === 0}
          onDelete={handleDelete}
        />

        {!loading && hasMore && (
          <div className="flex justify-center pt-4">
            <GlassButton variant="ghost" size="md" onClick={loadMore}>
              Load More
            </GlassButton>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
