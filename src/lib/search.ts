import { MeiliSearch } from 'meilisearch';
import { logger } from '@/lib/logger';

const TATTOO_INDEX = 'tattoos';

interface TattooSearchDocument {
  id: string;
  title: string;
  description: string;
  styles: string[];
  bodyPlacement: string;
  colorType: string;
  artistName: string;
  artistSlug: string;
}

interface SearchResult {
  hits: TattooSearchDocument[];
  totalHits: number;
  page: number;
  totalPages: number;
}

function getClient(): MeiliSearch | null {
  const host = process.env.MEILISEARCH_HOST;
  const apiKey = process.env.MEILISEARCH_API_KEY;

  if (!host) {
    return null;
  }

  return new MeiliSearch({ host, apiKey });
}

// index tattoo for search
export async function indexTattoo(doc: TattooSearchDocument): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    const index = client.index(TATTOO_INDEX);
    await index.addDocuments([doc]);
  } catch (err) {
    logger.error({ err }, 'Failed to index tattoo in search');
  }
}

// search tattoos
export async function searchTattoos(
  query: string,
  options?: {
    page?: number;
    limit?: number;
    styles?: string[];
    bodyPlacement?: string;
    colorType?: string;
  },
): Promise<SearchResult> {
  const client = getClient();
  if (!client) {
    return { hits: [], totalHits: 0, page: 1, totalPages: 0 };
  }

  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;

  const filter: string[] = [];
  if (options?.styles?.length) {
    filter.push(`styles IN [${options.styles.map((s) => `"${s}"`).join(', ')}]`);
  }
  if (options?.bodyPlacement) {
    filter.push(`bodyPlacement = "${options.bodyPlacement}"`);
  }
  if (options?.colorType) {
    filter.push(`colorType = "${options.colorType}"`);
  }

  try {
    const index = client.index(TATTOO_INDEX);
    const result = await index.search(query, {
      hitsPerPage: limit,
      page,
      filter: filter.length ? filter : undefined,
    });

    return {
      hits: result.hits as TattooSearchDocument[],
      totalHits: result.totalHits ?? 0,
      page,
      totalPages: result.totalPages ?? 0,
    };
  } catch (err) {
    logger.error({ err }, 'Failed to search tattoos');
    return { hits: [], totalHits: 0, page, totalPages: 0 };
  }
}

// remove from search index
export async function removeTattooIndex(tattooId: string): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    const index = client.index(TATTOO_INDEX);
    await index.deleteDocument(tattooId);
  } catch (err) {
    logger.error({ err }, 'Failed to remove tattoo from search index');
  }
}
