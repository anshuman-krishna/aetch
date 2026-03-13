import { prisma } from '@/lib/prisma';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { type PaginationParams, buildPaginationMeta } from '@/utils/pagination';

interface SavePreviewInput {
  userId: string;
  bodyImageUrl: string;
  tattooImageUrl: string;
  previewImageUrl?: string;
  placement?: string;
  positionX: number;
  positionY: number;
  scale: number;
  rotation: number;
  opacity: number;
}

// save ar preview
export async function savePreview(input: SavePreviewInput) {
  if (!isFeatureEnabled('AR_PREVIEW_ENABLED')) {
    throw new Error('AR preview is disabled');
  }

  return prisma.tattooPreview.create({
    data: {
      userId: input.userId,
      bodyImageUrl: input.bodyImageUrl,
      tattooImageUrl: input.tattooImageUrl,
      previewImageUrl: input.previewImageUrl,
      placement: input.placement,
      positionX: input.positionX,
      positionY: input.positionY,
      scale: input.scale,
      rotation: input.rotation,
      opacity: input.opacity,
    },
  });
}

// get user preview history
export async function getUserPreviews(userId: string, pagination: PaginationParams) {
  const where = { userId };
  const [previews, total] = await Promise.all([
    prisma.tattooPreview.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.tattooPreview.count({ where }),
  ]);

  return {
    previews,
    pagination: buildPaginationMeta(total, pagination),
  };
}

// get single preview
export async function getPreviewById(id: string) {
  return prisma.tattooPreview.findUnique({ where: { id } });
}

// delete preview
export async function deletePreview(id: string, userId: string) {
  const preview = await prisma.tattooPreview.findUnique({ where: { id } });
  if (!preview || preview.userId !== userId) {
    throw new Error('Preview not found');
  }
  return prisma.tattooPreview.delete({ where: { id } });
}
