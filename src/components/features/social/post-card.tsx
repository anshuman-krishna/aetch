'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassAvatar } from '@/components/ui/glass-avatar';
import { GlassBadge } from '@/components/ui/glass-badge';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/utils/cn';

export interface PostCardData {
  id: string;
  caption: string | null;
  imageUrl: string | null;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
  tattoo?: {
    id: string;
    title: string;
    slug: string;
    imageUrl: string;
    thumbnailUrl: string | null;
  } | null;
}

interface PostCardProps {
  post: PostCardData;
  currentUserId?: string;
  initialLiked?: boolean;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, currentUserId, initialLiked = false, onDelete }: PostCardProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(post.likesCount);

  const handleLike = async () => {
    setLiked(!liked);
    setLikes((c) => (liked ? c - 1 : c + 1));
    await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
  };

  const displayImage = post.imageUrl ?? post.tattoo?.imageUrl;
  const timeAgo = formatTimeAgo(post.createdAt);

  return (
    <GlassCard padding="sm" className="overflow-hidden !p-0">
      {/* header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <Link href={`/profile/${post.author.username}`}>
          <GlassAvatar src={post.author.image} alt={post.author.name ?? ''} size="sm" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${post.author.username}`} className="text-sm font-medium text-foreground hover:underline">
            {post.author.name ?? post.author.username}
          </Link>
          <p className="text-xs text-muted">{timeAgo}</p>
        </div>
        {currentUserId === post.author.id && onDelete && (
          <button onClick={() => onDelete(post.id)} className="text-muted hover:text-red-400 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* image */}
      {displayImage && (
        <div className="relative aspect-square w-full bg-black/20">
          <Image
            src={displayImage}
            alt={post.caption ?? 'Post image'}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 600px"
          />
        </div>
      )}

      {/* actions */}
      <div className="px-4 pt-3 flex items-center gap-4">
        <button onClick={handleLike} className="flex items-center gap-1.5 group">
          <Heart className={cn('h-5 w-5 transition-colors', liked ? 'fill-red-400 text-red-400' : 'text-muted group-hover:text-foreground')} />
          <span className="text-sm text-muted">{likes}</span>
        </button>
        <Link href={`/post/${post.id}`} className="flex items-center gap-1.5 group">
          <MessageCircle className="h-5 w-5 text-muted group-hover:text-foreground transition-colors" />
          <span className="text-sm text-muted">{post.commentsCount}</span>
        </Link>
      </div>

      {/* caption */}
      {post.caption && (
        <div className="px-4 pt-2">
          <p className="text-sm text-foreground">
            <Link href={`/profile/${post.author.username}`} className="font-medium hover:underline mr-1">
              {post.author.username}
            </Link>
            {post.caption}
          </p>
        </div>
      )}

      {/* tags */}
      {post.tags.length > 0 && (
        <div className="px-4 pt-2 flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <GlassBadge key={tag} size="sm">#{tag}</GlassBadge>
          ))}
        </div>
      )}

      <div className="h-4" />
    </GlassCard>
  );
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}
