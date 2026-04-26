// snapshot the public api contract from zod schemas.
// when this snapshot fails, either:
//   - the change was intentional → run jest -u to refresh
//   - the change was accidental → undo it before merging.

import { z } from 'zod';
import * as schemas from '@/lib/validations';

// extract just the zod schemas (skip non-zod exports like TATTOO_STYLES)
const isZod = (v: unknown): v is z.ZodTypeAny => !!v && typeof v === 'object' && 'safeParse' in v;

function describeSchema(s: z.ZodTypeAny): unknown {
  // zod 4 surfaces .def for the parsed schema definition
  // we only care that the SHAPE is stable, not the implementation details
  const def = (s as unknown as { def?: { typeName?: string; type?: string } }).def;
  const typeName =
    (def?.typeName as string | undefined) ?? (def?.type as string | undefined) ?? 'unknown';
  if (typeName.toLowerCase().includes('object')) {
    const shape = (s as unknown as z.ZodObject<z.ZodRawShape>).shape;
    return Object.fromEntries(
      Object.entries(shape).map(([k, v]) => [k, describeSchema(v as z.ZodTypeAny)]),
    );
  }
  return typeName;
}

describe('api contract — zod schema snapshots', () => {
  const entries = (Object.entries(schemas) as Array<[string, unknown]>)
    .filter((entry): entry is [string, z.ZodTypeAny] => isZod(entry[1]))
    .sort(([a], [b]) => a.localeCompare(b));

  it('exposes the expected schema names', () => {
    expect(entries.map(([k]) => k)).toMatchSnapshot('schema-names');
  });

  for (const [name, schema] of entries) {
    it(`shape: ${name}`, () => {
      expect(describeSchema(schema)).toMatchSnapshot(name);
    });
  }
});
