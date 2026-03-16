import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getUserConversations } from '@/backend/services/message-service';
import { getPaginationParams } from '@/utils/pagination';
import { PageContainer } from '@/components/layouts/page-container';
import { ConversationList } from '@/components/features/messaging/conversation-list';
import { MessageCircle } from 'lucide-react';

export const metadata = {
  title: 'Messages — AETCH',
  description: 'Your conversations on AETCH.',
};

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/app/messages');

  const { conversations } = await getUserConversations(
    session.user.id,
    getPaginationParams(1, 50),
  );

  return (
    <PageContainer size="md" animate={false}>
      <div className="py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h1 className="text-h3 text-foreground">Messages</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
          {/* conversation list */}
          <div className="glass rounded-2xl p-3">
            <ConversationList
              conversations={conversations}
              currentUserId={session.user.id}
            />
          </div>

          {/* empty state for desktop */}
          <div className="hidden md:flex items-center justify-center glass rounded-2xl p-8">
            <div className="text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-muted mb-3" />
              <p className="text-muted text-sm">
                Select a conversation to start chatting
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
