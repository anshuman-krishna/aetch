import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { PageContainer } from '@/components/layouts/page-container';
import { GlassCard } from '@/components/ui/glass-card';
import { TattooUploadForm } from '@/components/features/gallery/tattoo-upload-form';
import { Ban } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Upload Tattoo — AETCH',
  description: 'Upload your tattoo work to AETCH.',
};

export default async function UploadPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/upload');
  }

  if (session.user.role !== 'ARTIST' && session.user.role !== 'ADMIN') {
    return (
      <PageContainer size="sm" animate={false}>
        <div className="py-12">
          <GlassCard variant="strong" padding="lg" className="text-center">
            <div className="rounded-full glass p-4 mx-auto w-fit mb-4">
              <Ban className="h-8 w-8 text-muted" />
            </div>
            <h1 className="text-h3 text-foreground">Artist Access Required</h1>
            <p className="mt-2 text-sm text-muted max-w-md mx-auto">
              Only artists can upload tattoos. If you&apos;re an artist, update your role in settings.
            </p>
          </GlassCard>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="sm" animate={false}>
      <div className="py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-h2 text-foreground">Upload Tattoo</h1>
          <p className="mt-2 text-muted">
            Share your work with the AETCH community.
          </p>
        </div>
        <TattooUploadForm />
      </div>
    </PageContainer>
  );
}
