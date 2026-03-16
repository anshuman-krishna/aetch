import { GlassNavbar } from '@/components/ui/glass-navbar';
import { Footer } from '@/components/layouts/footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Background gradient mesh */}
      <div className="gradient-mesh fixed inset-0 -z-10" />

      <GlassNavbar />
      <main className="pt-24">{children}</main>
      <Footer />
    </div>
  );
}
