export const fixtureArtists = [
  {
    id: 'fix_artist_1',
    userId: 'fix_user_artist1',
    displayName: 'Maya Inkwell',
    slug: 'inkwell',
    bio: 'Japanese-inspired large scale work.',
    specialties: ['JAPANESE', 'BLACKWORK'],
    hourlyRate: 180,
    currency: 'USD',
    location: 'Brooklyn, NY',
    verified: true,
  },
  {
    id: 'fix_artist_2',
    userId: 'fix_user_artist2',
    displayName: 'Sam Fineline',
    slug: 'finelineco',
    bio: 'Fine line micro-tattoos.',
    specialties: ['FINE_LINE', 'MINIMALIST'],
    hourlyRate: 150,
    currency: 'USD',
    location: 'Austin, TX',
    verified: false,
  },
];

export type FixtureArtist = (typeof fixtureArtists)[number];
