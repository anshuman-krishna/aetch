import { storage, type UploadResult } from '@/lib/storage';
import { processTattooImage, processAvatarImage } from '@/lib/image-processing';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2mb max
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10mb max

export interface ProcessedUploadResult {
  imageUrl: string;
  thumbnailUrl: string;
  blurDataUrl: string;
  width: number;
  height: number;
}

function validateImage(file: Buffer, contentType: string, maxSize: number) {
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    throw new Error(
      `Invalid file type: ${contentType}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    );
  }
  if (file.byteLength > maxSize) {
    throw new Error(`File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`);
  }
}

function generateKey(prefix: string, userId: string, ext: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}/${userId}/${timestamp}-${random}.${ext}`;
}

function extensionFromType(contentType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
  };
  return map[contentType] ?? 'jpg';
}

// upload avatar with resize
export async function uploadAvatar(
  file: Buffer,
  contentType: string,
  userId: string,
): Promise<UploadResult> {
  validateImage(file, contentType, MAX_AVATAR_SIZE);
  const processed = await processAvatarImage(file);
  const key = generateKey('avatars', userId, 'webp');
  return storage.uploadFile(processed, key, 'image/webp');
}

// upload tattoo with full pipeline
export async function uploadTattooImage(
  file: Buffer,
  contentType: string,
  userId: string,
): Promise<ProcessedUploadResult> {
  validateImage(file, contentType, MAX_IMAGE_SIZE);
  const processed = await processTattooImage(file);
  const base = `tattoos/${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const [full, thumb] = await Promise.all([
    storage.uploadFile(processed.image, `${base}/full.webp`, 'image/webp'),
    storage.uploadFile(processed.thumbnail, `${base}/thumb.webp`, 'image/webp'),
  ]);

  return {
    imageUrl: full.url,
    thumbnailUrl: thumb.url,
    blurDataUrl: processed.blurDataUrl,
    width: processed.width,
    height: processed.height,
  };
}

export async function uploadPortfolioImage(
  file: Buffer,
  contentType: string,
  userId: string,
): Promise<UploadResult> {
  validateImage(file, contentType, MAX_IMAGE_SIZE);
  const key = generateKey('portfolio', userId, extensionFromType(contentType));
  return storage.uploadFile(file, key, contentType);
}
