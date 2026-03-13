'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

let globalSocket: Socket | null = null;

// get shared socket instance
function getSocket(userId: string): Socket {
  if (!globalSocket) {
    globalSocket = io({
      path: '/api/socket',
      auth: { userId },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }
  return globalSocket;
}

export function useSocket(userId: string | undefined) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;
    const socket = getSocket(userId);
    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      // keep connection alive
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
