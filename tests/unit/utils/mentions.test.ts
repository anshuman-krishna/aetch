import { extractMentions, linkifyMentions } from '@/utils/mentions';

describe('extractMentions', () => {
  it('returns empty array on empty input', () => {
    expect(extractMentions('')).toEqual([]);
  });

  it('extracts a single mention', () => {
    expect(extractMentions('hello @inkwell')).toEqual(['inkwell']);
  });

  it('lowercases + dedupes', () => {
    expect(extractMentions('@Inkwell and @INKWELL and @sam')).toEqual(['inkwell', 'sam']);
  });

  it('rejects mentions inside other words (no match without leading whitespace)', () => {
    expect(extractMentions('email me at foo@bar')).toEqual([]);
  });

  it('respects min/max length bounds (3-30)', () => {
    expect(extractMentions('@ab @abc @' + 'a'.repeat(31))).toEqual(['abc']);
  });

  it('handles multiple mentions across lines', () => {
    const text = '@one\n@two @three';
    expect(extractMentions(text).sort()).toEqual(['one', 'three', 'two']);
  });
});

describe('linkifyMentions', () => {
  it('rewrites @user → markdown link', () => {
    expect(linkifyMentions('hi @inkwell!')).toBe('hi [@inkwell](/app/profile/inkwell)!');
  });

  it('preserves leading whitespace', () => {
    expect(linkifyMentions('a @bee')).toContain(' [@bee]');
  });

  it('leaves plain text untouched', () => {
    expect(linkifyMentions('no mentions here')).toBe('no mentions here');
  });
});
