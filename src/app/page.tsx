import { FeaturedTattoo } from '@/components/features/featured/featured-tattoo';
import {
  ArSection,
  Cta,
  Faq,
  FeatureGrid,
  Hero,
  LandingFooter,
  LandingNav,
  PressStrip,
  StatCounters,
  StyleMarquee,
  Testimonials,
  Waitlist,
} from '@/components/features/landing';
import { BackToTop } from '@/components/ui/back-to-top';
import { ScrollProgress } from '@/components/ui/scroll-progress';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <div className="gradient-mesh fixed inset-0 -z-10" />

      <ScrollProgress />
      <LandingNav />

      <main>
        <Hero />
        <StyleMarquee />
        <PressStrip />
        <FeatureGrid />
        <FeaturedTattoo />
        <StatCounters />
        <ArSection />
        <Testimonials />
        <Faq />
        <Waitlist />
        <Cta />
      </main>

      <BackToTop />
      <LandingFooter />
    </div>
  );
}
