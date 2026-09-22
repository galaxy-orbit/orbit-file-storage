export interface StorageStats {
  size: number;
  lastModified: Date;
}

export interface StorageDriver {
  put(key: string, data: string | Uint8Array): Promise<void>;
  get(key: string): Promise<Uint8Array | null>;
  getText(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  list(prefix?: string): Promise<string[]>;
  copy(from: string, to: string): Promise<void>;
  size(key: string): Promise<number | null>;
}

export class StorageKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageKeyError';
  }
}

export function validateKey(key: string): string {
  if (key.startsWith('/') || key.includes('..')) {
    throw new StorageKeyError(`Invalid storage key: ${key}`);
  }
  return key;
}
