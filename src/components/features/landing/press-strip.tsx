// illustrative social-proof row — text wordmarks, no binary assets
const outlets = ['INK QUARTERLY', 'NEEDLE & THREAD', 'CANVAS', 'STUDIO WEEKLY', 'FLASH'];

export function PressStrip() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-10" aria-label="As featured in">
      <p className="mb-6 text-center text-xs uppercase tracking-widest text-muted">As featured in</p>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {outlets.map((name) => (
          <span
            key={name}
            className="text-sm font-semibold uppercase tracking-wide text-foreground/40 transition-colors hover:text-foreground/70"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
