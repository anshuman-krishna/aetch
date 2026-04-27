import { simulateAging, simulateAgingTimeline } from '@/backend/services/longevity-service';

describe('longevity simulator', () => {
  it('produces increasing fade with age', () => {
    const y1 = simulateAging({ ageYears: 1 });
    const y10 = simulateAging({ ageYears: 10 });
    expect(y10.blurPx).toBeGreaterThan(y1.blurPx);
    expect(y10.saturate).toBeLessThan(y1.saturate);
    expect(y10.contrast).toBeLessThan(y1.contrast);
  });

  it('color tattoos fade faster than black-and-grey', () => {
    const grey = simulateAging({ ageYears: 5, colorPalette: 'BLACK_AND_GREY' });
    const color = simulateAging({ ageYears: 5, colorPalette: 'COLOR' });
    expect(color.saturate).toBeLessThan(grey.saturate);
  });

  it('high-friction placements degrade faster', () => {
    const back = simulateAging({ ageYears: 5, placement: 'back' });
    const finger = simulateAging({ ageYears: 5, placement: 'finger' });
    expect(finger.saturate).toBeLessThan(back.saturate);
  });

  it('fine line ages faster than blackwork', () => {
    const fine = simulateAging({ ageYears: 5, lineThickness: 'fine' });
    const bold = simulateAging({ ageYears: 5, lineThickness: 'bold' });
    expect(fine.saturate).toBeLessThan(bold.saturate);
  });

  it('timeline returns 1/5/10 entries in order', () => {
    const timeline = simulateAgingTimeline({});
    expect(timeline.map((t) => t.ageYears)).toEqual([1, 5, 10]);
  });
});
