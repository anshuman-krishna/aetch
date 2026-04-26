import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const SCHEMA_PATH = join(__dirname, '..', 'prisma', 'schema.prisma');
const OUTPUT_PATH = join(__dirname, '..', 'docs', 'database-schema.md');

interface Field {
  name: string;
  type: string;
  optional: boolean;
  attributes: string[];
}

interface Model {
  name: string;
  fields: Field[];
  indexes: string[];
}

interface EnumDef {
  name: string;
  values: string[];
}

function parseSchema(content: string) {
  const models: Model[] = [];
  const enums: EnumDef[] = [];
  const lines = content.split('\n');

  let current: Model | null = null;
  let currentEnum: EnumDef | null = null;

  for (const raw of lines) {
    const line = raw.trim();

    // model start
    const modelMatch = line.match(/^model\s+(\w+)\s*\{/);
    if (modelMatch) {
      current = { name: modelMatch[1], fields: [], indexes: [] };
      continue;
    }

    // enum start
    const enumMatch = line.match(/^enum\s+(\w+)\s*\{/);
    if (enumMatch) {
      currentEnum = { name: enumMatch[1], values: [] };
      continue;
    }

    // close block
    if (line === '}') {
      if (current) {
        models.push(current);
        current = null;
      }
      if (currentEnum) {
        enums.push(currentEnum);
        currentEnum = null;
      }
      continue;
    }

    // enum value
    if (currentEnum && line && !line.startsWith('//') && !line.startsWith('@@')) {
      currentEnum.values.push(line);
      continue;
    }

    // indexes and constraints
    if (current && (line.startsWith('@@index') || line.startsWith('@@unique'))) {
      current.indexes.push(line);
      continue;
    }

    // model field
    if (current && line && !line.startsWith('//') && !line.startsWith('@@')) {
      const fieldMatch = line.match(/^(\w+)\s+(\S+?)(\?)?\s*(.*)?$/);
      if (fieldMatch) {
        current.fields.push({
          name: fieldMatch[1],
          type: fieldMatch[2],
          optional: !!fieldMatch[3],
          attributes: fieldMatch[4] ? fieldMatch[4].split(/\s+/).filter(Boolean) : [],
        });
      }
    }
  }

  return { models, enums };
}

function generateMarkdown(models: Model[], enums: EnumDef[]) {
  const lines: string[] = [
    '# AETCH Database Schema',
    '',
    `> Auto-generated on ${new Date().toISOString().split('T')[0]}`,
    '',
    '---',
    '',
  ];

  // table of contents
  lines.push('## Models', '');
  for (const m of models) {
    lines.push(`- [${m.name}](#${m.name.toLowerCase()})`);
  }
  lines.push('', '## Enums', '');
  for (const e of enums) {
    lines.push(`- [${e.name}](#${e.name.toLowerCase()})`);
  }
  lines.push('', '---', '');

  // models
  for (const model of models) {
    lines.push(`### ${model.name}`, '');
    lines.push('| Field | Type | Required | Attributes |');
    lines.push('|-------|------|----------|------------|');

    for (const f of model.fields) {
      const req = f.optional ? 'No' : 'Yes';
      const attrs = f.attributes.join(' ');
      lines.push(`| ${f.name} | ${f.type} | ${req} | ${attrs} |`);
    }

    if (model.indexes.length > 0) {
      lines.push('', '**Indexes:**', '');
      for (const idx of model.indexes) {
        lines.push(`- \`${idx}\``);
      }
    }

    // relations
    const relations = model.fields.filter((f) =>
      f.attributes.some((a) => a.startsWith('@relation')),
    );
    if (relations.length > 0) {
      lines.push('', '**Relations:**', '');
      for (const rel of relations) {
        lines.push(`- ${rel.name} → ${rel.type}`);
      }
    }

    lines.push('');
  }

  // enums
  lines.push('---', '', '## Enum Values', '');
  for (const e of enums) {
    lines.push(`### ${e.name}`, '');
    for (const v of e.values) {
      lines.push(`- ${v}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// main
const schema = readFileSync(SCHEMA_PATH, 'utf-8');
const { models, enums } = parseSchema(schema);
const markdown = generateMarkdown(models, enums);
writeFileSync(OUTPUT_PATH, markdown, 'utf-8');
console.log(`schema doc generated: ${OUTPUT_PATH}`);
