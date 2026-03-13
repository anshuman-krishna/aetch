import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import {
  getConversationById,
  getMessages,
  getUserConversations,
} from '@/backend/services/message-service';
import { getPaginationParams } from '@/utils/pagination';
import { PageContainer } from '@/components/layouts/page-container';
import { ConversationList } from '@/components/features/messaging/conversation-list';
import { ChatWindow } from '@/components/features/messaging/chat-window';
import { MessageCircle } from 'lucide-react';

interface Props {
  params: Promise<{ conversationId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { conversationId } = await params;
  return {
    title: `Chat — AETCH`,
    description: `Conversation ${conversationId}`,
  };
}

export default async function ConversationPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/messages');

  const { conversationId } = await params;

  const [conversation, messagesResult, convList] = await Promise.all([
    getConversationById(conversationId, session.user.id),
    getMessages(conversationId, session.user.id, getPaginationParams(1, 50)),
    getUserConversations(session.user.id, getPaginationParams(1, 50)),
  ]);

  if (!conversation) notFound();

  // reverse for chronological order
  const messages = [...messagesResult.messages].reverse();

  return (
    <PageContainer size="lg" animate={false}>
      <div className="py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h1 className="text-h3 text-foreground">Messages</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-220px)]">
          {/* conversation sidebar */}
          <div className="hidden md:block glass rounded-2xl p-3 overflow-y-auto">
            <ConversationList
              conversations={convList.conversations}
              currentUserId={session.user.id}
              activeId={conversationId}
            />
          </div>

          {/* chat window */}
          <ChatWindow
            conversationId={conversationId}
            currentUserId={session.user.id}
            participants={conversation.participants}
            initialMessages={messages}
          />
        </div>
      </div>
    </PageContainer>
  );
}
