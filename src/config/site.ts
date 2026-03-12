export const siteConfig = {
  name: 'AETCH',
  description:
    'The ultimate tattoo creative platform — discover inspiration, connect with artists, book sessions, and explore AI-powered tattoo design.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ogImage: '/og.png',
  links: {
    instagram: '#',
    twitter: '#',
  },
} as const;
