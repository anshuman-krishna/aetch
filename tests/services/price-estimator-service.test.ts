import { estimatePrice } from '@/backend/services/price-estimator-service';

describe('estimatePrice', () => {
  const baseRate = 200;

  it('throws on non-positive hourly rate', () => {
    expect(() => estimatePrice({ hourlyRate: 0, size: 'SMALL' })).toThrow(/positive/);
    expect(() => estimatePrice({ hourlyRate: -1, size: 'SMALL' })).toThrow(/positive/);
    expect(() => estimatePrice({ hourlyRate: NaN, size: 'SMALL' })).toThrow(/positive/);
  });

  it('returns midpoint = baseHours * rate when no modifiers', () => {
    const out = estimatePrice({ hourlyRate: baseRate, size: 'MEDIUM' });
    // 3 base hours * 200 = 600 → rounds to nearest 5 (still 600)
    expect(out.midpoint).toBe(600);
    expect(out.low).toBe(480);
    expect(out.high).toBe(720);
    expect(out.estimatedHours).toBe(3);
  });

  it('color and complexity multipliers compound', () => {
    const grey = estimatePrice({
      hourlyRate: baseRate,
      size: 'LARGE',
      colorType: 'BLACK_AND_GREY',
    });
    const color = estimatePrice({ hourlyRate: baseRate, size: 'LARGE', colorType: 'COLOR' });
    expect(color.midpoint).toBeGreaterThan(grey.midpoint);

    const simple = estimatePrice({
      hourlyRate: baseRate,
      size: 'LARGE',
      complexity: 'simple',
    });
    const complex = estimatePrice({
      hourlyRate: baseRate,
      size: 'LARGE',
      complexity: 'complex',
    });
    expect(complex.midpoint).toBeGreaterThan(simple.midpoint);
  });

  it('placement bumps cost for hard areas (ribs > arm)', () => {
    const arm = estimatePrice({ hourlyRate: baseRate, size: 'MEDIUM', placement: 'arm' });
    const ribs = estimatePrice({ hourlyRate: baseRate, size: 'MEDIUM', placement: 'ribs' });
    expect(ribs.midpoint).toBeGreaterThan(arm.midpoint);
  });

  it('style multiplier picks the highest of selected styles, capped at 1.4', () => {
    const minimal = estimatePrice({
      hourlyRate: baseRate,
      size: 'MEDIUM',
      styles: ['MINIMALIST'],
    });
    const realism = estimatePrice({
      hourlyRate: baseRate,
      size: 'MEDIUM',
      styles: ['REALISM', 'MINIMALIST'],
    });
    expect(realism.styleMultiplier).toBe(1.25);
    expect(minimal.styleMultiplier).toBe(1);
  });

  it('outputs round to nearest $5 to avoid false precision', () => {
    const out = estimatePrice({
      hourlyRate: 173,
      size: 'SMALL',
      colorType: 'COLOR',
      complexity: 'detailed',
    });
    expect(out.midpoint % 5).toBe(0);
    expect(out.low % 5).toBe(0);
    expect(out.high % 5).toBe(0);
  });

  it('breakdown returns all multipliers used', () => {
    const out = estimatePrice({
      hourlyRate: baseRate,
      size: 'EXTRA_LARGE',
      colorType: 'MIXED',
      placement: 'full-sleeve',
      complexity: 'complex',
      styles: ['JAPANESE'],
    });
    expect(out).toMatchObject({
      baseHours: 12,
      colorMultiplier: 1.15,
      placementMultiplier: 1.4,
      complexityMultiplier: 1.55,
      styleMultiplier: 1.2,
      hourlyRate: baseRate,
      currency: 'USD',
    });
  });
});
