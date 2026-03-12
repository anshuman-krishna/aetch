export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

export interface StorageProvider {
  upload(file: Buffer, key: string, contentType: string): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}

class StorageService {
  private provider: StorageProvider | null = null;

  configure(provider: StorageProvider) {
    this.provider = provider;
  }

  private getProvider(): StorageProvider {
    if (!this.provider) {
      throw new Error(
        'Storage provider not configured. Call storage.configure() with a provider first.',
      );
    }
    return this.provider;
  }

  async uploadFile(file: Buffer, key: string, contentType: string): Promise<UploadResult> {
    return this.getProvider().upload(file, key, contentType);
  }

  async deleteFile(key: string): Promise<void> {
    return this.getProvider().delete(key);
  }

  getFileUrl(key: string): string {
    return this.getProvider().getUrl(key);
  }
}

export const storage = new StorageService();
