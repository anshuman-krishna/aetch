export const fixturePosts = [
  {
    id: 'fix_post_1',
    caption: 'Fresh koi sleeve in progress.',
    imageUrl: null,
    tags: ['japanese', 'koi'],
    authorId: 'fix_user_artist1',
    tattooId: 'fix_tattoo_1',
    likesCount: 8,
    commentsCount: 1,
  },
  {
    id: 'fix_post_2',
    caption: 'Tiny sun for a first tattoo.',
    imageUrl: null,
    tags: ['minimalist'],
    authorId: 'fix_user_artist2',
    tattooId: 'fix_tattoo_2',
    likesCount: 4,
    commentsCount: 0,
  },
];

export type FixturePost = (typeof fixturePosts)[number];
