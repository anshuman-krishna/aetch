import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifySocketToken } from '@/lib/socket-jwt';

export const runtime = 'nodejs';

let io: Server | null = null;

// event types
export interface ServerToClientEvents {
  'message:new': (data: MessageEvent) => void;
  'message:read': (data: { conversationId: string; byUserId: string }) => void;
  'message:typing': (data: { conversationId: string; userId: string }) => void;
  'message:typing-stop': (data: { conversationId: string; userId: string }) => void;
  'notification:new': (data: NotificationEvent) => void;
  'user:online': (data: { userId: string }) => void;
  'user:offline': (data: { userId: string }) => void;
}

export interface ClientToServerEvents {
  'conversation:join': (conversationId: string) => void;
  'conversation:leave': (conversationId: string) => void;
  'message:typing': (conversationId: string) => void;
  'message:typing-stop': (conversationId: string) => void;
}

export interface MessageEvent {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  content: string;
  createdAt: string;
}

export interface NotificationEvent {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}

// user id to socket mapping
const userSockets = new Map<string, Set<string>>();

// prefer short-lived jwt; fall back to legacy `userId` only when SOCKET_JWT_SECRET
// is unset (dev-only convenience). production should always require a token.
function resolveUserId(socket: Socket): string | null {
  const token = (socket.handshake.auth.token ?? socket.handshake.query.token) as
    | string
    | undefined;
  if (token) {
    try {
      const payload = verifySocketToken(token);
      return payload?.sub ?? null;
    } catch {
      return null;
    }
  }
  if (process.env.SOCKET_JWT_SECRET) return null;
  const userId = socket.handshake.auth.userId as string | undefined;
  return userId ?? null;
}

// initialize socket server
export function initSocketServer(httpServer: HttpServer): Server {
  if (io) return io;

  io = new Server(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    const userId = resolveUserId(socket);

    if (!userId) {
      socket.disconnect();
      return;
    }

    // track user connection
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socket.id);

    // join user room
    socket.join(`user:${userId}`);

    // join conversation rooms
    socket.on('conversation:join', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // typing indicators (start + stop)
    socket.on('message:typing', (conversationId: string) => {
      socket
        .to(`conversation:${conversationId}`)
        .emit('message:typing' as never, { conversationId, userId });
    });
    socket.on('message:typing-stop', (conversationId: string) => {
      socket
        .to(`conversation:${conversationId}`)
        .emit('message:typing-stop' as never, { conversationId, userId });
    });

    // presence: tell others this user is online + replay at connect
    socket.broadcast.emit('user:online' as never, { userId });

    // cleanup on disconnect
    socket.on('disconnect', () => {
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
          socket.broadcast.emit('user:offline' as never, { userId });
        }
      }
    });
  });

  return io;
}

// get socket server instance
export function getIO(): Server | null {
  return io;
}

// emit message to conversation
export function emitNewMessage(event: MessageEvent) {
  io?.to(`conversation:${event.conversationId}`).emit('message:new', event);
}

// emit notification to user
export function emitNotification(userId: string, event: NotificationEvent) {
  io?.to(`user:${userId}`).emit('notification:new', event);
}

// broadcast read receipt to the other participant(s)
export function emitConversationRead(conversationId: string, byUserId: string) {
  io?.to(`conversation:${conversationId}`).emit('message:read', {
    conversationId,
    byUserId,
  } as never);
}

// check if user is online
export function isUserOnline(userId: string): boolean {
  return userSockets.has(userId);
}

// list currently-online user ids (presence)
export function listOnlineUsers(): string[] {
  return [...userSockets.keys()];
}
