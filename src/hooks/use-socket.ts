'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let globalSocket: Socket | null = null;

async function fetchSocketToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/socket/token', { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.token === 'string' ? data.token : null;
  } catch {
    return null;
  }
}

function getSocket(token: string | null, userId: string): Socket {
  if (!globalSocket) {
    globalSocket = io({
      path: '/api/socket',
      auth: token ? { token } : { userId },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    // refresh token before each reconnect so we never present an expired bearer
    globalSocket.on('reconnect_attempt', async () => {
      const fresh = await fetchSocketToken();
      if (fresh && globalSocket) {
        globalSocket.auth = { token: fresh };
      }
    });
  }
  return globalSocket;
}

export function useSocket(userId: string | undefined) {
  const socketRef = useRef<Socket | null>(null);
  const [, setReady] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const token = await fetchSocketToken();
      if (cancelled) return;
      const socket = getSocket(token, userId);
      socketRef.current = socket;
      if (!socket.connected) socket.connect();
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:join', conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:leave', conversationId);
  }, []);

  const emitTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit('message:typing', conversationId);
  }, []);

  return {
    socket: socketRef.current,
    joinConversation,
    leaveConversation,
    emitTyping,
  };
}
