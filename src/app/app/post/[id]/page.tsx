'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { PageContainer } from '@/components/layouts/page-container';
import { PostCard, type PostCardData } from '@/components/features/social/post-card';
import { CommentList, type CommentData } from '@/components/features/social/comment-list';
import { CommentInput } from '@/components/features/social/comment-input';
import { GlassCard } from '@/components/ui/glass-card';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [post, setPost] = useState<PostCardData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/posts/${id}/comments`);
    const data = await res.json();
    setComments(data.comments ?? []);
  }, [id]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/posts/${id}`).then((r) => r.json()),
      fetch(`/api/posts/${id}/comments`).then((r) => r.json()),
    ]).then(([postData, commentData]) => {
      setPost(postData.post ?? null);
      setComments(commentData.comments ?? []);
      setLoading(false);
    });
  }, [id]);

  const handleDeleteComment = async (commentId: string) => {
    const res = await fetch(`/api/posts/${id}/comments`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId }),
    });
    if (res.ok) fetchComments();
  };

  if (loading) {
    return (
      <PageContainer size="sm">
        <div className="py-12 space-y-4">
          <div className="h-96 rounded-2xl glass animate-pulse" />
          <div className="h-32 rounded-2xl glass animate-pulse" />
        </div>
      </PageContainer>
    );
  }

  if (!post) {
    return (
      <PageContainer size="sm">
        <div className="py-12 text-center">
          <p className="text-muted">Post not found.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="sm">
      <div className="py-8 sm:py-12 space-y-6">
        <PostCard post={post} currentUserId={session?.user?.id} />

        <GlassCard variant="subtle" padding="md" className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground/80">Comments ({comments.length})</h3>
          <CommentInput postId={id} onCommentAdded={fetchComments} />
          <CommentList
            comments={comments}
            currentUserId={session?.user?.id}
            onDelete={handleDeleteComment}
          />
        </GlassCard>
      </div>
    </PageContainer>
  );
}
