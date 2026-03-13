import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { PageContainer } from '@/components/layouts/page-container';
import { CreatePostForm } from '@/components/features/social/create-post-form';

export const metadata = {
  title: 'Create Post — AETCH',
};

export default async function CreatePostPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/create-post');

  return (
    <PageContainer size="sm" animate={false}>
      <div className="py-8 sm:py-12 space-y-6">
        <div>
          <h1 className="text-h3 text-foreground">Create Post</h1>
          <p className="text-muted text-sm mt-1">Share your tattoo journey</p>
        </div>
        <CreatePostForm />
      </div>
    </PageContainer>
  );
}
