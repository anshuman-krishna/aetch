'use client';

import { PostCard, type PostCardData } from './post-card';
import { EmptyState } from '@/components/ui/empty-state';
import { GlassSkeleton } from '@/components/ui/glass-skeleton';
import { FileText } from 'lucide-react';

interface PostGridProps {
  posts: PostCardData[];
  currentUserId?: string;
  loading?: boolean;
  onDelete?: (postId: string) => void;
}

export function PostGrid({ posts, currentUserId, loading = false, onDelete }: PostGridProps) {
  if (loading) return <PostGridSkeleton />;

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No posts yet"
        description="Be the first to share something."
      />
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={currentUserId} onDelete={onDelete} />
      ))}
    </div>
  );
}

function PostGridSkeleton() {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {Array.from({ length: 3 }).map((_, i) => (
        <GlassSkeleton key={i} className="h-96 rounded-2xl" />
      ))}
    </div>
  );
}
