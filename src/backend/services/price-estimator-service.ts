// rule-based v1 price estimator. v2 will train on Booking.finalPrice once we have data.

export type Size = 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';
export type ColorType = 'COLOR' | 'BLACK_AND_GREY' | 'MIXED';
export type Complexity = 'simple' | 'moderate' | 'detailed' | 'complex';

interface EstimateInput {
  hourlyRate: number;
  size: Size;
  colorType?: ColorType;
  placement?: string;
  complexity?: Complexity;
  styles?: string[];
}

interface EstimateBreakdown {
  baseHours: number;
  colorMultiplier: number;
  placementMultiplier: number;
  complexityMultiplier: number;
  styleMultiplier: number;
  estimatedHours: number;
  hourlyRate: number;
  low: number;
  high: number;
  midpoint: number;
  currency: string;
}

// hours by size
const SIZE_HOURS: Record<Size, number> = {
  SMALL: 1,
  MEDIUM: 3,
  LARGE: 6,
  EXTRA_LARGE: 12,
};

// extra time/risk for full-color and mixed-ink work
const COLOR_MULTIPLIER: Record<ColorType, number> = {
  BLACK_AND_GREY: 1,
  MIXED: 1.15,
  COLOR: 1.3,
};

// hard-to-tattoo skin areas demand more session time
const PLACEMENT_MULTIPLIER: Record<string, number> = {
  ribs: 1.25,
  chest: 1.15,
  neck: 1.2,
  hand: 1.2,
  foot: 1.2,
  finger: 1.3,
  'behind-ear': 1.2,
  'full-sleeve': 1.4,
  'half-sleeve': 1.2,
};

// detail level lifts both time and ink count
const COMPLEXITY_MULTIPLIER: Record<Complexity, number> = {
  simple: 0.85,
  moderate: 1,
  detailed: 1.25,
  complex: 1.55,
};

// style-specific labor — japanese sleeves and realism take far longer
const STYLE_MULTIPLIER: Record<string, number> = {
  REALISM: 1.25,
  JAPANESE: 1.2,
  BIOMECHANICAL: 1.2,
  WATERCOLOR: 1.1,
  NEO_TRADITIONAL: 1.1,
  GEOMETRIC: 1.05,
  CHICANO: 1.1,
};

function styleFactor(styles?: string[]): number {
  if (!styles?.length) return 1;
  // pick the highest of all selected styles, capped to avoid stacking blowups
  const max = Math.max(...styles.map((s) => STYLE_MULTIPLIER[s] ?? 1));
  return Math.min(max, 1.4);
}

// produce a low/high/midpoint estimate + the multipliers used
export function estimatePrice(input: EstimateInput): EstimateBreakdown {
  if (!Number.isFinite(input.hourlyRate) || input.hourlyRate <= 0) {
    throw new Error('hourlyRate must be a positive number');
  }
  const baseHours = SIZE_HOURS[input.size];
  const colorMultiplier = COLOR_MULTIPLIER[input.colorType ?? 'BLACK_AND_GREY'];
  const placementMultiplier = input.placement ? (PLACEMENT_MULTIPLIER[input.placement] ?? 1) : 1;
  const complexityMultiplier = COMPLEXITY_MULTIPLIER[input.complexity ?? 'moderate'];
  const styleMultiplier = styleFactor(input.styles);

  const estimatedHours =
    baseHours * colorMultiplier * placementMultiplier * complexityMultiplier * styleMultiplier;

  // apply +/- 20% band to communicate uncertainty
  const midpoint = roundUsd(estimatedHours * input.hourlyRate);
  const low = roundUsd(midpoint * 0.8);
  const high = roundUsd(midpoint * 1.2);

  return {
    baseHours,
    colorMultiplier,
    placementMultiplier,
    complexityMultiplier,
    styleMultiplier,
    estimatedHours: round2(estimatedHours),
    hourlyRate: input.hourlyRate,
    low,
    high,
    midpoint,
    currency: 'USD',
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// usd estimates round to nearest 5 to avoid false precision
function roundUsd(n: number): number {
  return Math.round(n / 5) * 5;
}
