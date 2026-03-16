'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { GlassAvatar } from '@/components/ui/glass-avatar';
import { GlassSkeleton } from '@/components/ui/glass-skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string | Date;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
    username: string | null;
  };
}

interface Participant {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    username: string | null;
  };
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  participants: Participant[];
  initialMessages: Message[];
}

export function ChatWindow({
  conversationId,
  currentUserId,
  participants,
  initialMessages,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { socket, joinConversation, leaveConversation, emitTyping } =
    useSocket(currentUserId);

  // get other participant
  const other = participants.find(
    (p) => p.user.id !== currentUserId,
  )?.user;

  // join socket room
  useEffect(() => {
    joinConversation(conversationId);
    return () => leaveConversation(conversationId);
  }, [conversationId, joinConversation, leaveConversation]);

  // listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handler = (data: {
      id: string;
      conversationId: string;
      senderId: string;
      senderName: string;
      senderImage?: string;
      content: string;
      createdAt: string;
    }) => {
      if (data.conversationId !== conversationId) return;
      setMessages((prev) => [
        ...prev,
        {
          id: data.id,
          content: data.content,
          senderId: data.senderId,
          createdAt: data.createdAt,
          sender: {
            id: data.senderId,
            name: data.senderName,
            image: data.senderImage ?? null,
            username: null,
          },
        },
      ]);
    };

    socket.on('message:new', handler);
    return () => { socket.off('message:new', handler); };
  }, [socket, conversationId]);

  // auto scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages.length]);

  // mark as read on mount
  useEffect(() => {
    fetch(`/api/messages/${conversationId}`, { method: 'PATCH' });
  }, [conversationId]);

  // send message handler
  const handleSend = useCallback(async (content: string) => {
    setSending(true);
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, content }),
      });
      if (!res.ok) return;
      const { message } = await res.json();
      setMessages((prev) => [...prev, message]);
    } finally {
      setSending(false);
    }
  }, [conversationId]);

  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="flex items-center gap-3 glass-strong rounded-2xl px-4 py-3 mb-3">
        <Link
          href="/app/messages"
          className="md:hidden text-muted hover:text-foreground"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <GlassAvatar
          src={other?.image}
          alt={other?.name ?? ''}
          size="sm"
        />
        <div>
          <p className="text-sm font-medium text-foreground">
            {other?.name ?? other?.username ?? 'User'}
          </p>
        </div>
      </div>

      {/* messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 px-1 pb-3"
      >
        {messages.length === 0 ? (
          <p className="text-center text-muted text-sm py-12">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              content={msg.content}
              senderName={msg.sender.name ?? 'User'}
              senderImage={msg.sender.image}
              isOwn={msg.senderId === currentUserId}
              timestamp={String(msg.createdAt)}
            />
          ))
        )}
      </div>

      {/* input */}
      <MessageInput
        onSend={handleSend}
        onTyping={() => emitTyping(conversationId)}
        disabled={sending}
      />
    </div>
  );
}

// loading skeleton
export function ChatWindowSkeleton() {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="glass-strong rounded-2xl px-4 py-3 flex items-center gap-3">
        <GlassSkeleton className="h-8 w-8 rounded-full" />
        <GlassSkeleton className="h-4 w-32" />
      </div>
      <div className="flex-1 space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={i % 2 === 0 ? '' : 'flex justify-end'}>
            <GlassSkeleton className="h-10 w-48 rounded-2xl" />
          </div>
        ))}
      </div>
      <GlassSkeleton className="h-14 rounded-2xl" />
    </div>
  );
}
