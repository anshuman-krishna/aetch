export const runtime = "nodejs";

import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/backend/middleware/rate-limit';
import {
  completeUserOnboarding,
  completeArtistOnboarding,
  completeShopOnboarding,
  isUsernameTaken,
  isArtistSlugTaken,
  isShopSlugTaken,
} from '@/backend/services/user-service';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const rl = await rateLimit(session.user.id, 'api');
  if (!rl.success) return rl.error;

  const body = await request.json();
  const { type, username, ...data } = body;

  // validate username
  if (!username || typeof username !== 'string' || username.length < 3 || username.length > 30) {
    return NextResponse.json(
      { success: false, error: 'Username must be 3-30 characters' },
      { status: 400 },
    );
  }

  if (!/^[a-z0-9_-]+$/.test(username)) {
    return NextResponse.json(
      { success: false, error: 'Username can only contain lowercase letters, numbers, hyphens, and underscores' },
      { status: 400 },
    );
  }

  const taken = await isUsernameTaken(username);
  if (taken) {
    return NextResponse.json(
      { success: false, error: 'Username is already taken' },
      { status: 409 },
    );
  }

  try {
    if (type === 'user') {
      await completeUserOnboarding(session.user.id, {
        username,
        bio: data.bio,
        favoriteStyles: data.favoriteStyles,
      });
    } else if (type === 'artist') {
      if (!data.displayName || !data.slug) {
        return NextResponse.json(
          { success: false, error: 'Artist name is required' },
          { status: 400 },
        );
      }

      const slugTaken = await isArtistSlugTaken(data.slug);
      if (slugTaken) {
        return NextResponse.json(
          { success: false, error: 'This artist URL is already taken. Try a different name.' },
          { status: 409 },
        );
      }

      await completeArtistOnboarding(session.user.id, {
        username,
        displayName: data.displayName,
        slug: data.slug,
        bio: data.bio,
        specialties: data.specialties,
        location: data.location,
        hourlyRate: data.hourlyRate,
      });
    } else if (type === 'shop') {
      if (!data.shopName || !data.slug) {
        return NextResponse.json(
          { success: false, error: 'Shop name is required' },
          { status: 400 },
        );
      }

      const slugTaken = await isShopSlugTaken(data.slug);
      if (slugTaken) {
        return NextResponse.json(
          { success: false, error: 'This shop URL is already taken. Try a different name.' },
          { status: 409 },
        );
      }

      await completeShopOnboarding(session.user.id, {
        username,
        shopName: data.shopName,
        slug: data.slug,
        description: data.description,
        city: data.city,
        address: data.address,
        country: data.country,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid onboarding type' },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Onboarding error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to complete onboarding' },
      { status: 500 },
    );
  }
}
