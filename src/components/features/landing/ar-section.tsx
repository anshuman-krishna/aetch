import { ArDemo } from '@/components/features/landing-demo/ar-demo';
import Link from 'next/link';
import { Reveal } from './reveal';

// wraps the standalone f2 demo into a landing section
export function ArSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <Reveal>
        <div className="glass-strong rounded-3xl p-6 md:p-12">
          <div className="mb-8 text-center">
            <h2 className="text-h1 text-foreground mb-4">See It On Your Skin</h2>
            <p className="text-muted max-w-2xl mx-auto">
              Try the AR preview right here — pick a design, drag it into place, and adjust the fit.
              Use one of ours or drop in your own photo. Nothing leaves your browser.
            </p>
          </div>
          <ArDemo />
          <div className="mt-8 text-center">
            <Link
              href="/register"
              className="inline-flex rounded-xl bg-primary/90 px-6 py-3 text-sm font-medium text-white border border-primary-light/30 transition-colors hover:bg-primary"
            >
              Unlock the full AR studio
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
