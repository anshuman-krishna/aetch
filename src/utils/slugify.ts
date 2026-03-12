/**
 * Generate a URL-friendly slug from a string.
 * Handles unicode, special characters, and ensures uniqueness via optional suffix.
 */
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

/**
 * Generate a unique slug by appending a short random ID.
 * Use when the base slug may already exist in the database.
 */
export function uniqueSlug(input: string): string {
  const base = slugify(input);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

/**
 * Generate a slug with a counter suffix for deterministic uniqueness.
 */
export function slugWithCounter(input: string, counter: number): string {
  const base = slugify(input);
  return counter > 0 ? `${base}-${counter}` : base;
}
