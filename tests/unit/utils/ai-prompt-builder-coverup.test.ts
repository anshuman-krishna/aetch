import { buildAftercareSystemPrompt, buildCoverupPrompt } from '@/utils/ai-prompt-builder';

describe('buildCoverupPrompt', () => {
  it('always includes the mask-existing instruction', () => {
    const out = buildCoverupPrompt({ existingDescription: 'faded tribal band' });
    expect(out).toContain('faded tribal band');
    expect(out).toContain('coverup design that fully obscures');
    expect(out).toContain('dark heavy ink');
    expect(out).toContain('white background');
  });

  it('includes desired subject + style + placement when provided', () => {
    const out = buildCoverupPrompt({
      existingDescription: 'old name',
      desiredSubject: 'snake and dagger',
      desiredStyle: 'JAPANESE',
      placement: 'forearm',
    });
    expect(out).toContain('new subject: snake and dagger');
    expect(out).toContain('japanese style');
    expect(out).toContain('forearm placement');
  });
});

describe('buildAftercareSystemPrompt', () => {
  it('contains medical-safety guard rails', () => {
    const out = buildAftercareSystemPrompt();
    expect(out).toMatch(/never diagnose/i);
    expect(out).toMatch(/never prescribe/i);
    expect(out).toMatch(/contacting a doctor/i);
  });
});
