// extract @mentions from caption / comment content.
// rules: 3-30 chars, [a-zA-Z0-9_-], must follow whitespace or string start
// and end at a non-username char (so 31-char strings don't truncate-match).

const MENTION_RE = /(^|\s)@([a-zA-Z0-9_-]{3,30})(?![a-zA-Z0-9_-])/g;

export function extractMentions(text: string): string[] {
  if (!text) return [];
  const set = new Set<string>();
  for (const match of text.matchAll(MENTION_RE)) {
    set.add(match[2].toLowerCase());
  }
  return [...set];
}

// replace @username with a markdown link the renderer can resolve client-side
export function linkifyMentions(text: string): string {
  if (!text) return '';
  return text.replace(MENTION_RE, (_, lead, name) => {
    return `${lead}[@${name}](/app/profile/${name.toLowerCase()})`;
  });
}
