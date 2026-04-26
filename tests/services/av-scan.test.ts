const uploadJob = {
  upsert: jest.fn(),
  update: jest.fn(),
  findUnique: jest.fn(),
};

jest.mock('@/lib/prisma', () => ({ prisma: { uploadJob } }));
jest.mock('@/lib/logger', () => ({
  logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn() },
}));

import { assertScanSafe, recordScanResult, registerUploadForScan } from '@/lib/av-scan';

const fetchMock = jest.fn();
beforeAll(() => {
  global.fetch = fetchMock as unknown as typeof fetch;
});

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.AV_SCAN_WEBHOOK_URL;
  delete process.env.AV_SCAN_WEBHOOK_TOKEN;
});

describe('registerUploadForScan', () => {
  it('marks SKIPPED when no webhook configured', async () => {
    uploadJob.upsert.mockResolvedValue({ id: 'j1' });
    uploadJob.update.mockResolvedValue({});
    await registerUploadForScan({
      bucket: 'b',
      key: 'k',
      userId: 'u1',
      contentType: 'image/webp',
    });
    expect(uploadJob.upsert).toHaveBeenCalled();
    expect(uploadJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'j1' },
        data: expect.objectContaining({ scanStatus: 'SKIPPED' }),
      }),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('dispatches webhook when configured', async () => {
    process.env.AV_SCAN_WEBHOOK_URL = 'https://av.example.com/scan';
    process.env.AV_SCAN_WEBHOOK_TOKEN = 'secret';
    uploadJob.upsert.mockResolvedValue({ id: 'j2' });
    fetchMock.mockResolvedValue({ ok: true });
    await registerUploadForScan({
      bucket: 'b',
      key: 'k',
      userId: 'u1',
      contentType: 'image/webp',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://av.example.com/scan',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ authorization: 'Bearer secret' }),
      }),
    );
  });

  it('swallows webhook errors so the upload still registers', async () => {
    process.env.AV_SCAN_WEBHOOK_URL = 'https://av.example.com/scan';
    uploadJob.upsert.mockResolvedValue({ id: 'j3' });
    fetchMock.mockRejectedValue(new Error('network'));
    await expect(
      registerUploadForScan({
        bucket: 'b',
        key: 'k',
        userId: 'u1',
        contentType: 'image/webp',
      }),
    ).resolves.toBeDefined();
  });
});

describe('recordScanResult', () => {
  it('flips status + scannedAt timestamp', async () => {
    uploadJob.update.mockResolvedValue({});
    await recordScanResult('j1', 'CLEAN', 'ok');
    const arg = uploadJob.update.mock.calls[0][0];
    expect(arg.where).toEqual({ id: 'j1' });
    expect(arg.data.scanStatus).toBe('CLEAN');
    expect(arg.data.scanResult).toBe('ok');
    expect(arg.data.scannedAt).toBeInstanceOf(Date);
  });
});

describe('assertScanSafe', () => {
  it('throws when status INFECTED', async () => {
    uploadJob.findUnique.mockResolvedValue({ scanStatus: 'INFECTED' });
    await expect(assertScanSafe('b', 'k')).rejects.toThrow(/antivirus/i);
  });

  it('passes when status CLEAN / PENDING / SKIPPED / unknown', async () => {
    for (const status of ['CLEAN', 'PENDING', 'SKIPPED', 'ERROR']) {
      uploadJob.findUnique.mockResolvedValue({ scanStatus: status });
      await expect(assertScanSafe('b', 'k')).resolves.toBeUndefined();
    }
  });

  it('passes when no row exists', async () => {
    uploadJob.findUnique.mockResolvedValue(null);
    await expect(assertScanSafe('b', 'k')).resolves.toBeUndefined();
  });
});
