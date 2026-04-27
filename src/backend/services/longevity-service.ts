// v0 longevity simulator — derives aged-tattoo CSS filter parameters from
// inputs (placement, style, line thickness, color palette). v1 will swap to
// stable diffusion img2img with an aged-tattoo lora.

export type AgeYears = 1 | 5 | 10;
export type LineThickness = 'fine' | 'medium' | 'bold';
export type ColorPalette = 'COLOR' | 'BLACK_AND_GREY' | 'MIXED';

interface SimulateInput {
  ageYears: AgeYears;
  lineThickness?: LineThickness;
  colorPalette?: ColorPalette;
  placement?: string;
  style?: string;
}

export interface AgedFilter {
  ageYears: AgeYears;
  blurPx: number;
  brightness: number;
  contrast: number;
  saturate: number;
  sepia: number;
  // svg displacement seed for irregular fade
  noiseSeed: number;
  notes: string[];
}

// placements with high friction or sun exposure age tattoos faster
const PLACEMENT_AGING_BIAS: Record<string, number> = {
  hand: 1.4,
  finger: 1.6,
  foot: 1.4,
  ankle: 1.2,
  neck: 1.15,
  ribs: 1.05,
  chest: 1.0,
  shoulder: 0.95,
  back: 0.9,
  thigh: 0.92,
  forearm: 0.95,
};

// styles with delicate work degrade faster
const STYLE_AGING_BIAS: Record<string, number> = {
  FINE_LINE: 1.3,
  MINIMALIST: 1.2,
  WATERCOLOR: 1.4,
  REALISM: 1.1,
  TRADITIONAL: 0.85,
  BLACKWORK: 0.85,
  TRIBAL: 0.85,
  JAPANESE: 0.9,
};

const LINE_THICKNESS_BIAS: Record<LineThickness, number> = {
  fine: 1.25,
  medium: 1.0,
  bold: 0.8,
};

// color tattoos lose vibrancy faster than black-and-grey
const COLOR_BIAS: Record<ColorPalette, number> = {
  COLOR: 1.2,
  MIXED: 1.05,
  BLACK_AND_GREY: 0.9,
};

export function simulateAging(input: SimulateInput): AgedFilter {
  const placementBias = input.placement ? (PLACEMENT_AGING_BIAS[input.placement] ?? 1) : 1;
  const styleBias = input.style ? (STYLE_AGING_BIAS[input.style] ?? 1) : 1;
  const thicknessBias = LINE_THICKNESS_BIAS[input.lineThickness ?? 'medium'];
  const colorBias = COLOR_BIAS[input.colorPalette ?? 'BLACK_AND_GREY'];

  const composite = placementBias * styleBias * thicknessBias * colorBias;

  // base aging curve — log-like fade rather than linear
  const ageFactor = Math.log10(1 + input.ageYears) * composite;

  const blurPx = round2(0.3 + ageFactor * 0.7);
  const brightness = round2(1 + ageFactor * 0.05);
  const contrast = round2(Math.max(0.6, 1 - ageFactor * 0.18));
  const saturate = round2(Math.max(0.4, 1 - ageFactor * 0.32));
  const sepia = round2(Math.min(0.4, ageFactor * 0.12));

  const notes = buildNotes(input, composite);
  return {
    ageYears: input.ageYears,
    blurPx,
    brightness,
    contrast,
    saturate,
    sepia,
    noiseSeed: Math.floor(input.ageYears * 137 + composite * 1000),
    notes,
  };
}

function buildNotes(input: SimulateInput, composite: number): string[] {
  const notes: string[] = [];
  if (input.lineThickness === 'fine') notes.push('Fine lines tend to soften within 2-3 years.');
  if (input.colorPalette === 'COLOR')
    notes.push('Color saturation fades faster than black-and-grey.');
  if (input.placement && (PLACEMENT_AGING_BIAS[input.placement] ?? 1) > 1.1)
    notes.push('High-friction placement accelerates fading.');
  if (composite > 1.3) notes.push('Aftercare and sunscreen will matter a lot here.');
  return notes;
}

export function simulateAgingTimeline(input: Omit<SimulateInput, 'ageYears'>): AgedFilter[] {
  const ages: AgeYears[] = [1, 5, 10];
  return ages.map((ageYears) => simulateAging({ ...input, ageYears }));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
