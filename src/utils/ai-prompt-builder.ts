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
