import { prisma } from '@/lib/prisma';
import type { UserRole } from '@prisma/client';
import { rotateUserSessions } from '@/lib/session-rotate';

// add role to user — rotates sessions so new role takes effect immediately
export async function addUserRole(userId: string, role: UserRole) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { roles: true },
  });
  if (!user) throw new Error('User not found');

  if (user.roles.includes(role)) {
    return prisma.user.update({ where: { id: userId }, data: {} });
  }

  const roles = [...user.roles, role];
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { roles },
  });
  await rotateUserSessions(userId);
  return updated;
}

// remove role from user — rotates sessions so revoked role drops immediately
export async function removeUserRole(userId: string, role: UserRole) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { roles: true },
  });
  if (!user) throw new Error('User not found');

  if (!user.roles.includes(role)) {
    return prisma.user.update({ where: { id: userId }, data: {} });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { roles: user.roles.filter((r) => r !== role) },
  });
  await rotateUserSessions(userId);
  return updated;
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
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { roles: true },
  });
  const roles = user?.roles ?? ['USER'];
  if (!roles.includes('ARTIST')) roles.push('ARTIST');

  return prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        username: data.username,
        roles,
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
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { roles: true },
  });
  const roles = user?.roles ?? ['USER'];
  if (!roles.includes('SHOP_OWNER')) roles.push('SHOP_OWNER');

  return prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        username: data.username,
        roles,
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
      roles: true,
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
