import { eventToIcs } from '@/backend/services/event-service';

describe('eventToIcs', () => {
  it('builds a valid VCALENDAR/VEVENT block', () => {
    const ics = eventToIcs({
      id: 'evt_1',
      name: 'London Tattoo Convention',
      description: 'Three days of ink',
      venue: 'Tobacco Dock',
      city: 'London',
      startsAt: new Date('2026-09-25T10:00:00Z'),
      endsAt: new Date('2026-09-27T18:00:00Z'),
      websiteUrl: 'https://example.com',
    });
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('UID:evt_1@aetch.app');
    expect(ics).toContain('DTSTART:20260925T100000Z');
    expect(ics).toContain('DTEND:20260927T180000Z');
    expect(ics).toContain('SUMMARY:London Tattoo Convention');
    expect(ics).toContain('LOCATION:Tobacco Dock\\, London');
  });

  it('skips optional fields when missing', () => {
    const ics = eventToIcs({
      id: 'evt_2',
      name: 'Local Meet',
      startsAt: new Date('2026-01-01T00:00:00Z'),
      endsAt: new Date('2026-01-01T03:00:00Z'),
    });
    expect(ics).not.toContain('DESCRIPTION:');
    expect(ics).not.toContain('LOCATION:');
    expect(ics).not.toContain('URL:');
  });
});
