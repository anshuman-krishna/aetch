// deterministic seed users — ids and emails stable across runs

export const fixtureUsers = [
  {
    id: 'fix_user_admin',
    email: 'admin@aetch.test',
    username: 'admin',
    name: 'Admin User',
    roles: ['ADMIN'] as const,
    onboardingComplete: true,
    favoriteStyles: [] as string[],
  },
  {
    id: 'fix_user_artist1',
    email: 'artist1@aetch.test',
    username: 'inkwell',
    name: 'Maya Inkwell',
    roles: ['USER', 'ARTIST'] as const,
    onboardingComplete: true,
    favoriteStyles: ['JAPANESE', 'BLACKWORK'],
  },
  {
    id: 'fix_user_artist2',
    email: 'artist2@aetch.test',
    username: 'finelineco',
    name: 'Sam Fineline',
    roles: ['USER', 'ARTIST'] as const,
    onboardingComplete: true,
    favoriteStyles: ['FINE_LINE', 'MINIMALIST'],
  },
  {
    id: 'fix_user_shopowner',
    email: 'shop@aetch.test',
    username: 'parlourmaster',
    name: 'Parlour Owner',
    roles: ['USER', 'SHOP_OWNER'] as const,
    onboardingComplete: true,
    favoriteStyles: [] as string[],
  },
  {
    id: 'fix_user_client',
    email: 'client@aetch.test',
    username: 'newink',
    name: 'Casey Client',
    roles: ['USER'] as const,
    onboardingComplete: true,
    favoriteStyles: ['NEO_TRADITIONAL'],
  },
];

export type FixtureUser = (typeof fixtureUsers)[number];
