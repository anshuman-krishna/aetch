import { prisma } from '@/lib/prisma';
import type { UserRole } from '@prisma/client';

export async function updateUserRole(userId: string, role: UserRole) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
  });
}

export async function completeUserOnboarding(
  userId: string,
  data: {
    username: string;
    bio?: string;
    favoriteStyles?: string[];
  },
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      username: data.username,
      bio: data.bio,
      favoriteStyles: data.favoriteStyles ?? [],
      onboardingComplete: true,
    },
  });
}

export async function completeArtistOnboarding(
  userId: string,
  data: {
    username: string;
    displayName: string;
    slug: string;
    bio?: string;
    specialties?: string[];
    location?: string;
    hourlyRate?: number;
  },
) {
  return prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        username: data.username,
        role: 'ARTIST',
        onboardingComplete: true,
      },
    }),
    prisma.artist.create({
      data: {
        userId,
        displayName: data.displayName,
        slug: data.slug,
        bio: data.bio,
        specialties: data.specialties ?? [],
        location: data.location,
        hourlyRate: data.hourlyRate,
      },
    }),
  ]);
}

export async function completeShopOnboarding(
  userId: string,
  data: {
    username: string;
    shopName: string;
    slug: string;
    description?: string;
    city?: string;
    address?: string;
    country?: string;
  },
) {
  return prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        username: data.username,
        role: 'SHOP_OWNER',
        onboardingComplete: true,
      },
    }),
    prisma.shop.create({
      data: {
        name: data.shopName,
        slug: data.slug,
        description: data.description,
        city: data.city,
        address: data.address,
        country: data.country,
        ownerId: userId,
      },
    }),
  ]);
}

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      role: true,
      favoriteStyles: true,
      createdAt: true,
      artist: {
        select: {
          id: true,
          slug: true,
          displayName: true,
          specialties: true,
          verified: true,
        },
      },
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  });
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  return !!user;
}

export async function isArtistSlugTaken(slug: string): Promise<boolean> {
  const artist = await prisma.artist.findUnique({
    where: { slug },
    select: { id: true },
  });
  return !!artist;
}

export async function isShopSlugTaken(slug: string): Promise<boolean> {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    select: { id: true },
  });
  return !!shop;
}

export async function updateUserAvatar(userId: string, imageUrl: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { image: imageUrl },
  });
}
