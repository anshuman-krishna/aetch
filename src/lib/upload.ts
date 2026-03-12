import { storage, type UploadResult } from '@/lib/storage';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

function validateImage(file: Buffer, contentType: string, maxSize: number) {
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    throw new Error(`Invalid file type: ${contentType}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
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

export async function uploadAvatar(
  file: Buffer,
  contentType: string,
  userId: string,
): Promise<UploadResult> {
  validateImage(file, contentType, MAX_AVATAR_SIZE);
  const key = generateKey('avatars', userId, extensionFromType(contentType));
  return storage.uploadFile(file, key, contentType);
}

export async function uploadTattooImage(
  file: Buffer,
  contentType: string,
  userId: string,
): Promise<UploadResult> {
  validateImage(file, contentType, MAX_IMAGE_SIZE);
  const key = generateKey('tattoos', userId, extensionFromType(contentType));
  return storage.uploadFile(file, key, contentType);
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
