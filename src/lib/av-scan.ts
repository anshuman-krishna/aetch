import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { AvScanStatus } from '@prisma/client';

interface ScanInput {
  bucket: string;
  key: string;
  userId: string;
  contentType: string;
  sizeBytes?: number;
}

// register an upload + dispatch scan
// real scan happens out-of-band (S3 Object Lambda or ClamAV worker) which
// then calls back to /api/internal/av-callback to flip status.
export async function registerUploadForScan(input: ScanInput) {
  const job = await prisma.uploadJob.upsert({
    where: { bucket_key: { bucket: input.bucket, key: input.key } },
    update: {
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
      scanStatus: 'PENDING',
      scanResult: null,
      scannedAt: null,
    },
    create: {
      userId: input.userId,
      bucket: input.bucket,
      key: input.key,
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
    },
  });

  await dispatchScanWebhook(job.id, input).catch((err) => {
    logger.warn({ err, jobId: job.id }, 'av scan dispatch failed');
  });

  return job;
}

// fire-and-forget call to AV worker; absent webhook = SKIPPED
async function dispatchScanWebhook(jobId: string, input: ScanInput): Promise<void> {
  const url = process.env.AV_SCAN_WEBHOOK_URL;
  if (!url) {
    await prisma.uploadJob.update({
      where: { id: jobId },
      data: { scanStatus: 'SKIPPED', scannedAt: new Date() },
    });
    return;
  }
  await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(process.env.AV_SCAN_WEBHOOK_TOKEN
        ? { authorization: `Bearer ${process.env.AV_SCAN_WEBHOOK_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({
      jobId,
      bucket: input.bucket,
      key: input.key,
      contentType: input.contentType,
    }),
  });
}

// callback handler - flip status from worker
export async function recordScanResult(jobId: string, status: AvScanStatus, scanResult?: string) {
  return prisma.uploadJob.update({
    where: { id: jobId },
    data: { scanStatus: status, scanResult, scannedAt: new Date() },
  });
}

// quarantine guard - require non-INFECTED status
export async function assertScanSafe(bucket: string, key: string) {
  const job = await prisma.uploadJob.findUnique({
    where: { bucket_key: { bucket, key } },
    select: { scanStatus: true },
  });
  if (!job) return;
  if (job.scanStatus === 'INFECTED') {
    throw new Error('Upload failed antivirus scan');
  }
}
