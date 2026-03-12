import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

function createLimiter(requests: number, window: `${number} ${'s' | 'ms' | 'm' | 'h' | 'd'}`) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
  });
}

const limiters = {
  auth: createLimiter(10, '1 m'),
  ai: createLimiter(5, '1 m'),
  upload: createLimiter(20, '1 m'),
  api: createLimiter(60, '1 m'),
} as const;

export type RateLimitTier = keyof typeof limiters;

export async function rateLimit(
  identifier: string,
  tier: RateLimitTier = 'api',
): Promise<{ success: true; error: null } | { success: false; error: NextResponse }> {
  const limiter = limiters[tier];

  if (!limiter) {
    return { success: true, error: null };
  }

  const result = await limiter.limit(identifier);

  if (!result.success) {
    return {
      success: false,
      error: NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.toString(),
          },
        },
      ),
    };
  }

  return { success: true, error: null };
}
