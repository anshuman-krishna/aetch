import { slugify, slugWithCounter, uniqueSlug } from '@/utils/slugify';

describe('slugify', () => {
  it('lowercases and hyphenates words', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('strips punctuation and symbols', () => {
    expect(slugify('Japanese Dragon!! Sleeve?')).toBe('japanese-dragon-sleeve');
  });

  it('collapses repeated whitespace and dashes', () => {
    expect(slugify('  too   many    spaces  ')).toBe('too-many-spaces');
    expect(slugify('multi---dash')).toBe('multi-dash');
  });

  it('trims leading and trailing dashes', () => {
    expect(slugify('---edge---')).toBe('edge');
  });

  it('preserves numbers and underscores', () => {
    expect(slugify('ink_42_artist')).toBe('ink_42_artist');
  });

  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('');
  });
});

describe('slugWithCounter', () => {
  it('omits suffix when counter is zero', () => {
    expect(slugWithCounter('My Shop', 0)).toBe('my-shop');
  });

  it('appends positive counter', () => {
    expect(slugWithCounter('My Shop', 2)).toBe('my-shop-2');
  });
});

describe('uniqueSlug', () => {
  it('produces a slug with a random suffix of 5 chars', () => {
    const result = uniqueSlug('Tattoo Studio');
    expect(result).toMatch(/^tattoo-studio-[a-z0-9]{1,5}$/);
  });
});
