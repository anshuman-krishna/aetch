import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { type PaginationParams, buildPaginationMeta } from '@/utils/pagination';

const collectionInclude = {
  owner: { select: { id: true, name: true, username: true, image: true } },
  _count: { select: { items: true } },
} as const;

const itemInclude = {
  collection: { select: { id: true, name: true, slug: true, ownerId: true } },
} as const;

interface CreateInput {
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  isPublic?: boolean;
}

export async function createCollection(input: CreateInput) {
  return prisma.collection.create({
    data: {
      ownerId: input.ownerId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      isPublic: input.isPublic ?? true,
    },
    include: collectionInclude,
  });
}

export async function getCollectionsForOwner(ownerId: string, pagination: PaginationParams) {
  const where: Prisma.CollectionWhereInput = { ownerId };
  const [collections, total] = await Promise.all([
    prisma.collection.findMany({
      where,
      include: collectionInclude,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.collection.count({ where }),
  ]);
  return { collections, pagination: buildPaginationMeta(total, pagination) };
}

export async function getCollectionBySlug(ownerId: string, slug: string) {
  return prisma.collection.findUnique({
    where: { ownerId_slug: { ownerId, slug } },
    include: {
      ...collectionInclude,
      items: {
        orderBy: { createdAt: 'desc' },
        take: 60,
      },
    },
  });
}

interface AddItemInput {
  collectionId: string;
  ownerId: string;
  tattooId?: string;
  postId?: string;
  note?: string;
}

export async function addCollectionItem(input: AddItemInput) {
  // verify ownership
  const collection = await prisma.collection.findUnique({
    where: { id: input.collectionId },
    select: { ownerId: true },
  });
  if (!collection || collection.ownerId !== input.ownerId) {
    throw new Error('Collection not found');
  }

  return prisma.collectionItem.create({
    data: {
      collectionId: input.collectionId,
      tattooId: input.tattooId,
      postId: input.postId,
      note: input.note,
    },
    include: itemInclude,
  });
}

export async function removeCollectionItem(itemId: string, ownerId: string) {
  const item = await prisma.collectionItem.findUnique({
    where: { id: itemId },
    include: { collection: { select: { ownerId: true } } },
  });
  if (!item || item.collection.ownerId !== ownerId) {
    throw new Error('Item not found');
  }
  await prisma.collectionItem.delete({ where: { id: itemId } });
}
