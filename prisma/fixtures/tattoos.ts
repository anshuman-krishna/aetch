export const fixtureTattoos = [
  {
    id: 'fix_tattoo_1',
    title: 'Koi Sleeve Sketch',
    slug: 'koi-sleeve-sketch',
    description: 'Half-sleeve koi flowing through waves.',
    imageUrl: 'https://placehold.co/800x800/png?text=koi',
    thumbnailUrl: 'https://placehold.co/240x240/png?text=koi',
    blurDataUrl:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIHZpZXdCb3g9IjAgMCA4IDgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNlMmQ5ZjMiLz48L3N2Zz4=',
    styles: ['JAPANESE'],
    bodyPlacement: 'half-sleeve',
    colorType: 'COLOR',
    likesCount: 12,
    viewsCount: 200,
    artistId: 'fix_artist_1',
  },
  {
    id: 'fix_tattoo_2',
    title: 'Minimal Sun',
    slug: 'minimal-sun',
    description: 'Single-line sun with rays.',
    imageUrl: 'https://placehold.co/800x800/png?text=sun',
    thumbnailUrl: 'https://placehold.co/240x240/png?text=sun',
    blurDataUrl:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIHZpZXdCb3g9IjAgMCA4IDgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiLz48L3N2Zz4=',
    styles: ['MINIMALIST', 'FINE_LINE'],
    bodyPlacement: 'wrist',
    colorType: 'BLACK_AND_GREY',
    likesCount: 5,
    viewsCount: 88,
    artistId: 'fix_artist_2',
  },
];

export type FixtureTattoo = (typeof fixtureTattoos)[number];
