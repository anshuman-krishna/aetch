import { buildSystemPrompt, buildTattooPrompt } from '@/utils/ai-prompt-builder';

describe('buildTattooPrompt', () => {
  it('returns idea + tattoo context when only idea given', () => {
    const result = buildTattooPrompt({ idea: 'phoenix rising' });
    expect(result).toBe('phoenix rising, tattoo design on white background');
  });

  it('includes style label when style provided', () => {
    const result = buildTattooPrompt({ idea: 'koi fish', style: 'JAPANESE' });
    expect(result).toContain('japanese style');
  });

  it('maps color enum to descriptor', () => {
    const result = buildTattooPrompt({ idea: 'rose', colorType: 'BLACK_AND_GREY' });
    expect(result).toContain('black and grey ink only');
  });

  it('applies complexity modifier', () => {
    const result = buildTattooPrompt({ idea: 'skull', complexity: 'complex' });
    expect(result).toContain('extremely detailed masterwork');
  });

  it('ignores unknown complexity and color', () => {
    const result = buildTattooPrompt({
      idea: 'compass',
      colorType: 'UNKNOWN',
      complexity: 'INVALID',
    });
    expect(result).not.toContain('UNKNOWN');
    expect(result).not.toContain('INVALID');
  });

  it('falls back to raw value when label missing', () => {
    const result = buildTattooPrompt({ idea: 'wave', style: 'CUSTOM_STYLE' });
    expect(result).toContain('custom_style style');
  });

  it('trims the idea input', () => {
    const result = buildTattooPrompt({ idea: '  dragon  ' });
    expect(result.startsWith('dragon')).toBe(true);
  });
});

describe('buildSystemPrompt', () => {
  it('returns a non-empty tattoo-designer persona', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toMatch(/tattoo designer/i);
    expect(prompt.length).toBeGreaterThan(40);
  });
});
