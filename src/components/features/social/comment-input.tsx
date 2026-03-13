'use client';

import { useState } from 'react';
import { GlassInput } from '@/components/ui/glass-input';
import { GlassButton } from '@/components/ui/glass-button';
import { Send } from 'lucide-react';

interface CommentInputProps {
  postId: string;
  parentId?: string;
  onCommentAdded?: () => void;
}

export function CommentInput({ postId, parentId, onCommentAdded }: CommentInputProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.trim(), parentId }),
    });

    if (res.ok) {
      setContent('');
      onCommentAdded?.();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <GlassInput
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        className="flex-1"
        maxLength={1000}
      />
      <GlassButton type="submit" variant="primary" size="sm" loading={loading} disabled={!content.trim()}>
        <Send className="h-4 w-4" />
      </GlassButton>
    </form>
  );
}
