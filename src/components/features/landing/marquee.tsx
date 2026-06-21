const styles = [
  'Traditional',
  'Japanese',
  'Fine-line',
  'Blackwork',
  'Realism',
  'Neo-traditional',
  'Watercolor',
  'Geometric',
  'Tribal',
  'Dotwork',
  'Lettering',
  'Minimalist',
];

// seamless looped strip — the list is rendered twice and shifted -50%
export function StyleMarquee() {
  return (
    <section className="relative overflow-hidden py-8" aria-label="Tattoo styles">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <div className="flex w-max animate-marquee gap-4">
        {[...styles, ...styles].map((s, i) => (
          <span
            key={`${s}-${i}`}
            className="glass rounded-full px-5 py-2 text-sm font-medium text-foreground/80 whitespace-nowrap"
          >
            {s}
          </span>
        ))}
      </div>
    </section>
  );
}
