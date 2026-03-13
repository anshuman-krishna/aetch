// generate url-friendly slug
export function slugify(input: string): string {
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// slug with random suffix
export function uniqueSlug(input: string): string {
  const base = slugify(input);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

// slug with counter suffix
export function slugWithCounter(input: string, counter: number): string {
  const base = slugify(input);
  return counter > 0 ? `${base}-${counter}` : base;
}
