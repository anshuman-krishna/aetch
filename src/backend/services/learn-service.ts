import { promises as fs } from 'fs';
import path from 'path';

export interface LearnEntry {
  slug: string;
  title: string;
  description: string;
  order: number;
  body: string;
}

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'learn');

export async function listLearnEntries(): Promise<LearnEntry[]> {
  const files = await fs.readdir(CONTENT_DIR).catch(() => [] as string[]);
  const entries: LearnEntry[] = [];
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const raw = await fs.readFile(path.join(CONTENT_DIR, file), 'utf8');
    entries.push(parseEntry(raw, file.replace(/\.md$/, '')));
  }
  return entries.sort((a, b) => a.order - b.order);
}

export async function getLearnEntry(slug: string): Promise<LearnEntry | null> {
  const safe = slug.replace(/[^a-z0-9-]/gi, '');
  if (!safe) return null;
  const filePath = path.join(CONTENT_DIR, `${safe}.md`);
  const raw = await fs.readFile(filePath, 'utf8').catch(() => null);
  if (!raw) return null;
  return parseEntry(raw, safe);
}

function parseEntry(raw: string, fallbackSlug: string): LearnEntry {
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const meta: Record<string, string> = {};
  let body = raw;
  if (fmMatch) {
    body = raw.slice(fmMatch[0].length);
    for (const line of fmMatch[1].split('\n')) {
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      meta[key] = value;
    }
  }
  return {
    slug: meta.slug ?? fallbackSlug,
    title: meta.title ?? fallbackSlug,
    description: meta.description ?? '',
    order: Number(meta.order ?? 99),
    body,
  };
}

// minimal markdown → html. handles headings, lists, paragraphs, bold, code, and inline links.
export function renderMarkdown(md: string): string {
  let html = md;
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  html = html.replace(/^# (.*)$/gm, '<h1 class="text-h2 text-foreground">$1</h1>');
  html = html.replace(/^## (.*)$/gm, '<h2 class="text-h3 text-foreground mt-6">$1</h2>');
  html = html.replace(/^### (.*)$/gm, '<h3 class="text-h4 text-foreground mt-4">$1</h3>');

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="underline" href="$2">$1</a>');
  html = html.replace(/`([^`]+)`/g, '<code class="px-1 rounded bg-white/10">$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  html = html.replace(/((?:^- .+\n?)+)/gm, (block) => {
    const items = block
      .trim()
      .split('\n')
      .map((line) => `<li>${line.replace(/^- /, '')}</li>`)
      .join('');
    return `<ul class="list-disc pl-5 space-y-1">${items}</ul>`;
  });

  html = html
    .split(/\n{2,}/)
    .map((para) =>
      para.startsWith('<h') || para.startsWith('<ul') ? para : `<p class="mt-3">${para}</p>`,
    )
    .join('\n');

  return html;
}
