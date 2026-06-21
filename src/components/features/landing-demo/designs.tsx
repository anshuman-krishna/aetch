import type { ReactNode } from 'react';

// bundled sample line-art — stroke uses currentColor so it reads as ink
export interface Design {
  id: string;
  name: string;
  art: ReactNode;
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const designs: Design[] = [
  {
    id: 'moon',
    name: 'Moon & stars',
    art: (
      <g {...stroke}>
        <path d="M66 22a32 32 0 1 0 0 56 24 24 0 1 1 0-56z" />
        <path d="M26 30l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" />
        <path d="M34 60l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z" />
      </g>
    ),
  },
  {
    id: 'wave',
    name: 'Wave',
    art: (
      <g {...stroke}>
        <path d="M10 62c10-22 26-22 36 0 8-18 22-18 32-2" />
        <path d="M14 74c8-16 22-16 30 0 7-14 18-14 28 0" />
        <path d="M70 40c0 8-6 12-12 12" />
      </g>
    ),
  },
  {
    id: 'rose',
    name: 'Rose',
    art: (
      <g {...stroke}>
        <circle cx="50" cy="44" r="7" />
        <path d="M50 30c8 0 14 6 14 14s-6 16-14 16-14-7-14-16 6-14 14-14z" />
        <path d="M50 22c12 0 22 9 22 22s-10 24-22 24-22-11-22-24S38 22 50 22z" />
        <path d="M50 68v16M50 84l-8-6M50 84l8-6" />
      </g>
    ),
  },
  {
    id: 'butterfly',
    name: 'Butterfly',
    art: (
      <g {...stroke}>
        <path d="M50 26v48" />
        <path d="M50 34c-6-12-30-16-34 0-4 14 16 22 34 14" />
        <path d="M50 34c6-12 30-16 34 0 4 14-16 22-34 14" />
        <path d="M50 54c-5 10-22 12-28 2M50 54c5 10 22 12 28 2" />
        <path d="M50 26l-5-6M50 26l5-6" />
      </g>
    ),
  },
];
