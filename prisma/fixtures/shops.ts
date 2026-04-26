export const fixtureShops = [
  {
    id: 'fix_shop_1',
    name: 'Parlour Brooklyn',
    slug: 'parlour-brooklyn',
    description: 'Boutique studio in Williamsburg.',
    address: '123 Bedford Ave',
    city: 'Brooklyn',
    state: 'NY',
    country: 'USA',
    ownerId: 'fix_user_shopowner',
    verified: true,
  },
];

export type FixtureShop = (typeof fixtureShops)[number];
