import Link from 'next/link';
import { Reveal } from './reveal';

export function Cta() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <Reveal>
        <div className="gradient-brand relative overflow-hidden rounded-3xl px-6 py-16 text-center md:py-20">
          <div className="absolute inset-0 bg-black/5" aria-hidden />
          <div className="relative">
            <h2 className="text-h1 text-white mb-4">Ready to Create?</h2>
            <p className="text-white/85 max-w-xl mx-auto mb-10">
              Join the most advanced tattoo platform on the internet.
            </p>
            <Link
              href="/register"
              className="inline-flex rounded-xl bg-white px-10 py-4 text-lg font-medium text-primary transition-transform hover:scale-105"
            >
              Create Account
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
