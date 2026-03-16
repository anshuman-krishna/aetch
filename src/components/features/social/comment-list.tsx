'use client';

import { GlassAvatar } from '@/components/ui/glass-avatar';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';

export interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
  replies?: CommentData[];
  _count?: { replies: number };
}

interface CommentListProps {
  comments: CommentData[];
  currentUserId?: string;
  onDelete?: (commentId: string) => void;
}

export function CommentList({ comments, currentUserId, onDelete }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-sm text-muted py-4 text-center">No comments yet.</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((c) => (
        <CommentItem key={c.id} comment={c} currentUserId={currentUserId} onDelete={onDelete} />
      ))}
    </div>
  );
}

function CommentItem({
  comment,
  currentUserId,
  onDelete,
}: {
  comment: CommentData;
  currentUserId?: string;
  onDelete?: (id: string) => void;
}) {
  const timeAgo = formatTimeAgo(comment.createdAt);

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <Link href={`/app/profile/${comment.author.username}`}>
          <GlassAvatar src={comment.author.image} alt={comment.author.name ?? ''} size="sm" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link href={`/app/profile/${comment.author.username}`} className="text-sm font-medium text-foreground hover:underline">
              {comment.author.username ?? comment.author.name}
            </Link>
            <span className="text-xs text-muted">{timeAgo}</span>
            {currentUserId === comment.author.id && onDelete && (
              <button onClick={() => onDelete(comment.id)} className="text-muted hover:text-red-400 ml-auto">
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
          <p className="text-sm text-foreground/90">{comment.content}</p>
        </div>
      </div>

      {/* replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 space-y-2 border-l border-white/10 pl-4">
          {comment.replies.map((r) => (
            <CommentItem key={r.id} comment={r} currentUserId={currentUserId} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}
