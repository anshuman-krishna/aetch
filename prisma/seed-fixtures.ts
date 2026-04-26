import { PrismaClient, type Prisma } from '@prisma/client';
import {
  fixtureArtists,
  fixturePosts,
  fixtureShops,
  fixtureTattoos,
  fixtureUsers,
} from './fixtures';

// idempotent seed for tests + local dev
async function main() {
  const prisma = new PrismaClient();

  for (const u of fixtureUsers) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id: u.id,
        email: u.email,
        username: u.username,
        name: u.name,
        roles: [...u.roles],
        onboardingComplete: u.onboardingComplete,
        favoriteStyles: [...u.favoriteStyles],
      },
    });
  }

  for (const s of fixtureShops) {
    await prisma.shop.upsert({
      where: { id: s.id },
      update: {},
      create: { ...s },
    });
  }

  for (const a of fixtureArtists) {
    await prisma.artist.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        userId: a.userId,
        displayName: a.displayName,
        slug: a.slug,
        bio: a.bio,
        specialties: [...a.specialties],
        hourlyRate: a.hourlyRate as unknown as Prisma.Decimal,
        currency: a.currency,
        location: a.location,
        verified: a.verified,
      },
    });
  }

  for (const t of fixtureTattoos) {
    await prisma.tattoo.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        title: t.title,
        slug: t.slug,
        description: t.description,
        imageUrl: t.imageUrl,
        thumbnailUrl: t.thumbnailUrl,
        blurDataUrl: t.blurDataUrl,
        styles: [...t.styles] as unknown as Prisma.TattooCreatestylesInput,
        bodyPlacement: t.bodyPlacement,
        colorType: t.colorType as Prisma.TattooUncheckedCreateInput['colorType'],
        likesCount: t.likesCount,
        viewsCount: t.viewsCount,
        artistId: t.artistId,
      },
    });
  }

  for (const p of fixturePosts) {
    await prisma.post.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        caption: p.caption,
        imageUrl: p.imageUrl,
        tags: [...p.tags],
        authorId: p.authorId,
        tattooId: p.tattooId,
        likesCount: p.likesCount,
        commentsCount: p.commentsCount,
      },
    });
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
