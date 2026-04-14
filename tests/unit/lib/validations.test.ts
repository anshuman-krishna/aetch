import {
  aiGenerateSchema,
  availabilitySchema,
  bookingRequestSchema,
  createCommentSchema,
  createPostSchema,
  createShopSchema,
  createTattooSchema,
  loginSchema,
  paginationSchema,
  registerSchema,
  reviewSchema,
  savePreviewSchema,
  sendMessageSchema,
  updateArtistSchema,
  updateBookingStatusSchema,
  updateProfileSchema,
} from '@/lib/validations';

const cuid = 'clg1z2y3x0000t8p9a1b2c3d4';

describe('loginSchema', () => {
  it('accepts valid email', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co' }).success).toBe(true);
  });
  it('rejects invalid email', () => {
    expect(loginSchema.safeParse({ email: 'nope' }).success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('normalizes casing and trims', () => {
    const parsed = registerSchema.parse({
      name: '  Jane  ',
      email: 'JANE@Example.com',
      username: 'JANE_DOE',
    });
    expect(parsed).toEqual({ name: 'Jane', email: 'jane@example.com', username: 'jane_doe' });
  });

  it('rejects short username', () => {
    const res = registerSchema.safeParse({ name: 'Jane', email: 'a@b.co', username: 'jo' });
    expect(res.success).toBe(false);
  });

  it('rejects invalid username characters', () => {
    const res = registerSchema.safeParse({ name: 'Jane', email: 'a@b.co', username: 'ja ne' });
    expect(res.success).toBe(false);
  });
});

describe('updateProfileSchema', () => {
  it('accepts full optional update', () => {
    const res = updateProfileSchema.safeParse({
      name: 'Jane',
      username: 'jane',
      bio: 'Tattoo lover',
      image: 'https://cdn.example.com/a.webp',
    });
    expect(res.success).toBe(true);
  });
  it('rejects invalid image url', () => {
    const res = updateProfileSchema.safeParse({ image: 'not-a-url' });
    expect(res.success).toBe(false);
  });
});

describe('reviewSchema', () => {
  it('bounds rating 1–5', () => {
    expect(reviewSchema.safeParse({ rating: 0 }).success).toBe(false);
    expect(reviewSchema.safeParse({ rating: 6 }).success).toBe(false);
    expect(reviewSchema.safeParse({ rating: 5 }).success).toBe(true);
  });
});

describe('bookingRequestSchema', () => {
  const valid = {
    artistId: cuid,
    date: new Date().toISOString(),
    tattooIdea: 'Large japanese dragon sleeve',
  };
  it('accepts minimal valid', () => {
    expect(bookingRequestSchema.safeParse(valid).success).toBe(true);
  });
  it('rejects invalid artistId cuid', () => {
    expect(bookingRequestSchema.safeParse({ ...valid, artistId: 'x' }).success).toBe(false);
  });
  it('rejects short tattoo idea', () => {
    expect(bookingRequestSchema.safeParse({ ...valid, tattooIdea: 'hi' }).success).toBe(false);
  });
});

describe('updateBookingStatusSchema', () => {
  it('accepts allowed statuses', () => {
    expect(updateBookingStatusSchema.safeParse({ status: 'CONFIRMED' }).success).toBe(true);
  });
  it('rejects disallowed status', () => {
    expect(updateBookingStatusSchema.safeParse({ status: 'PENDING' }).success).toBe(false);
  });
});

describe('availabilitySchema', () => {
  it('accepts valid HH:MM', () => {
    expect(
      availabilitySchema.safeParse({ dayOfWeek: 1, startTime: '09:00', endTime: '17:30' }).success,
    ).toBe(true);
  });
  it('rejects malformed time', () => {
    expect(
      availabilitySchema.safeParse({ dayOfWeek: 1, startTime: '9:00', endTime: '17:30' }).success,
    ).toBe(false);
  });
  it('rejects dayOfWeek out of range', () => {
    expect(
      availabilitySchema.safeParse({ dayOfWeek: 9, startTime: '09:00', endTime: '10:00' }).success,
    ).toBe(false);
  });
});

describe('createPostSchema', () => {
  it('caps tags to 10', () => {
    const tags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
    expect(createPostSchema.safeParse({ tags }).success).toBe(false);
  });
});

describe('createCommentSchema', () => {
  it('requires content + valid postId', () => {
    expect(createCommentSchema.safeParse({ content: 'nice', postId: cuid }).success).toBe(true);
    expect(createCommentSchema.safeParse({ content: '', postId: cuid }).success).toBe(false);
  });
});

describe('updateArtistSchema', () => {
  it('validates instagram handle', () => {
    expect(updateArtistSchema.safeParse({ instagram: 'valid.user_1' }).success).toBe(true);
    expect(updateArtistSchema.safeParse({ instagram: 'bad handle!' }).success).toBe(false);
  });
});

describe('createShopSchema', () => {
  it('enforces slug shape', () => {
    const base = { name: 'Ink House', slug: 'ink-house' };
    expect(createShopSchema.safeParse(base).success).toBe(true);
    expect(createShopSchema.safeParse({ ...base, slug: 'Ink House' }).success).toBe(false);
  });
});

describe('createTattooSchema', () => {
  it('requires at least one style', () => {
    expect(createTattooSchema.safeParse({ title: 'Dragon', styles: [] }).success).toBe(false);
  });
  it('caps styles at 5', () => {
    expect(
      createTattooSchema.safeParse({
        title: 'Dragon',
        styles: ['JAPANESE', 'TRADITIONAL', 'BLACKWORK', 'FINE_LINE', 'MINIMALIST', 'REALISM'],
      }).success,
    ).toBe(false);
  });
  it('defaults colorType to COLOR', () => {
    const parsed = createTattooSchema.parse({ title: 'Dragon', styles: ['JAPANESE'] });
    expect(parsed.colorType).toBe('COLOR');
  });
});

describe('aiGenerateSchema', () => {
  it('defaults complexity to moderate', () => {
    const parsed = aiGenerateSchema.parse({ idea: 'phoenix rising' });
    expect(parsed.complexity).toBe('moderate');
  });
  it('rejects too-short idea', () => {
    expect(aiGenerateSchema.safeParse({ idea: 'no' }).success).toBe(false);
  });
});

describe('savePreviewSchema', () => {
  it('applies defaults for missing transform values', () => {
    const parsed = savePreviewSchema.parse({
      bodyImageUrl: 'https://a.co/b.jpg',
      tattooImageUrl: 'https://a.co/t.jpg',
    });
    expect(parsed.positionX).toBe(50);
    expect(parsed.scale).toBe(1);
    expect(parsed.opacity).toBe(0.85);
  });

  it('clamps rotation range', () => {
    expect(
      savePreviewSchema.safeParse({
        bodyImageUrl: 'https://a.co/b.jpg',
        tattooImageUrl: 'https://a.co/t.jpg',
        rotation: 1000,
      }).success,
    ).toBe(false);
  });
});

describe('sendMessageSchema', () => {
  it('rejects empty or too-long messages', () => {
    expect(sendMessageSchema.safeParse({ conversationId: 'c1', content: '' }).success).toBe(false);
    expect(
      sendMessageSchema.safeParse({ conversationId: 'c1', content: 'x'.repeat(2001) }).success,
    ).toBe(false);
  });
});

describe('paginationSchema', () => {
  it('coerces strings and applies defaults', () => {
    expect(paginationSchema.parse({ page: '3', limit: '40' })).toEqual({ page: 3, limit: 40 });
    expect(paginationSchema.parse({})).toEqual({ page: 1, limit: 20 });
  });

  it('rejects limit above 100', () => {
    expect(paginationSchema.safeParse({ limit: 500 }).success).toBe(false);
  });
});
