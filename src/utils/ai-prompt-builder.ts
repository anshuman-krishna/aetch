import { STYLE_LABELS, PLACEMENT_LABELS } from '@/lib/validations';

interface PromptInput {
  idea: string;
  style?: string;
  placement?: string;
  colorType?: string;
  complexity?: string;
}

// color type descriptions
const colorDescriptions: Record<string, string> = {
  COLOR: 'vibrant full color ink',
  BLACK_AND_GREY: 'black and grey ink only',
  MIXED: 'mixed color and black ink',
};

// complexity modifiers
const complexityModifiers: Record<string, string> = {
  simple: 'clean minimal design',
  moderate: 'balanced detail level',
  detailed: 'highly detailed intricate design',
  complex: 'extremely detailed masterwork',
};

export function buildTattooPrompt(input: PromptInput): string {
  const parts: string[] = [];

  // core idea
  parts.push(input.idea.trim());

  // style modifier
  if (input.style) {
    const label = STYLE_LABELS[input.style] ?? input.style;
    parts.push(`${label.toLowerCase()} style`);
  }

  // placement context
  if (input.placement) {
    const label = PLACEMENT_LABELS[input.placement] ?? input.placement;
    parts.push(`${label.toLowerCase()} placement`);
  }

  // color preference
  if (input.colorType) {
    const desc = colorDescriptions[input.colorType];
    if (desc) parts.push(desc);
  }

  // complexity
  if (input.complexity) {
    const mod = complexityModifiers[input.complexity];
    if (mod) parts.push(mod);
  }

  // tattoo context suffix
  parts.push('tattoo design on white background');

  return parts.join(', ');
}

export function buildSystemPrompt(): string {
  return [
    'You are a professional tattoo designer.',
    'Generate a high-quality tattoo design.',
    'The design should be suitable for skin.',
    'Use clean lines and proper contrast.',
    'Place the design on a white background.',
  ].join(' ');
}

interface CoverupInput {
  existingDescription: string;
  desiredStyle?: string;
  desiredSubject?: string;
  placement?: string;
}

// build a coverup-specific prompt that asks the model to mask the existing piece
export function buildCoverupPrompt(input: CoverupInput): string {
  const parts: string[] = [];
  parts.push(
    `coverup design that fully obscures an existing tattoo: ${input.existingDescription.trim()}`,
  );
  if (input.desiredSubject) parts.push(`new subject: ${input.desiredSubject.trim()}`);
  if (input.desiredStyle) {
    const label = STYLE_LABELS[input.desiredStyle] ?? input.desiredStyle;
    parts.push(`${label.toLowerCase()} style`);
  }
  if (input.placement) {
    const label = PLACEMENT_LABELS[input.placement] ?? input.placement;
    parts.push(`${label.toLowerCase()} placement`);
  }
  parts.push('dark heavy ink with strong silhouette to mask underlying linework');
  parts.push('tattoo design on white background');
  return parts.join(', ');
}

export function buildAftercareSystemPrompt(): string {
  return [
    'You are an expert tattoo aftercare assistant.',
    'Give safe, conservative, evidence-aligned guidance.',
    'Recommend hypoallergenic fragrance-free moisturizers and gentle soap.',
    'Always advise contacting a doctor for fever, spreading redness, pus, or red streaks.',
    'Keep replies under 200 words. Use bullet points where helpful.',
    'Never diagnose. Never prescribe medication.',
  ].join(' ');
}
