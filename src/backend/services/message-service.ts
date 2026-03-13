import { prisma } from '@/lib/prisma';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { type PaginationParams, buildPaginationMeta } from '@/utils/pagination';

// guard messaging feature
function assertMessagingEnabled() {
  if (!isFeatureEnabled('MESSAGING_ENABLED')) {
    throw new Error('Messaging is disabled');
  }
}

// find or create conversation
export async function findOrCreateConversation(
  userId: string,
  participantId: string,
  bookingId?: string,
) {
  assertMessagingEnabled();

  if (userId === participantId) {
    throw new Error('Cannot message yourself');
  }

  // check existing conversation
  const existing = await prisma.conversation.findFirst({
    where: {
      participants: {
        every: {
          userId: { in: [userId, participantId] },
        },
      },
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: participantId } } },
      ],
    },
    include: {
      participants: { include: { user: { select: { id: true, name: true, image: true, username: true } } } },
    },
  });

  if (existing) return existing;

  return prisma.conversation.create({
    data: {
      bookingId,
      participants: {
        create: [
          { userId },
          { userId: participantId },
        ],
      },
    },
    include: {
      participants: { include: { user: { select: { id: true, name: true, image: true, username: true } } } },
    },
  });
}

// send message in conversation
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
) {
  assertMessagingEnabled();

  // verify sender is participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: senderId,
      },
    },
  });

  if (!participant) {
    throw new Error('Not a participant');
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, senderId, content },
      include: {
        sender: { select: { id: true, name: true, image: true, username: true } },
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content.slice(0, 100),
        lastActivity: new Date(),
      },
    }),
  ]);

  return message;
}

// get user conversations
export async function getUserConversations(
  userId: string,
  pagination: PaginationParams,
) {
  assertMessagingEnabled();

  const where = {
    participants: { some: { userId } },
  };

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      orderBy: { lastActivity: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, image: true, username: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.conversation.count({ where }),
  ]);

  return {
    conversations,
    pagination: buildPaginationMeta(total, pagination),
  };
}

// get messages for conversation
export async function getMessages(
  conversationId: string,
  userId: string,
  pagination: PaginationParams,
) {
  assertMessagingEnabled();

  // verify participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });

  if (!participant) {
    throw new Error('Not a participant');
  }

  const where = { conversationId };

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
      include: {
        sender: { select: { id: true, name: true, image: true, username: true } },
      },
    }),
    prisma.message.count({ where }),
  ]);

  return {
    messages,
    pagination: buildPaginationMeta(total, pagination),
  };
}

// mark messages as read
export async function markConversationRead(
  conversationId: string,
  userId: string,
) {
  assertMessagingEnabled();

  await prisma.$transaction([
    prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    }),
    prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: { lastReadAt: new Date() },
    }),
  ]);
}

// get unread message count
export async function getUnreadMessageCount(userId: string) {
  const participantRecords = await prisma.conversationParticipant.findMany({
    where: { userId },
    select: { conversationId: true, lastReadAt: true },
  });

  if (participantRecords.length === 0) return 0;

  return prisma.message.count({
    where: {
      senderId: { not: userId },
      read: false,
      conversationId: {
        in: participantRecords.map((p) => p.conversationId),
      },
    },
  });
}

// get conversation with details
export async function getConversationById(
  conversationId: string,
  userId: string,
) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: { some: { userId } },
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, image: true, username: true } },
        },
      },
      booking: {
        select: { id: true, status: true, date: true },
      },
    },
  });

  return conversation;
}
