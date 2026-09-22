import { type StorageDriver } from '../storage';

export class MemoryStorageDriver implements StorageDriver {
  private store = new Map<string, Uint8Array>();

  async put(key: string, data: string | Uint8Array): Promise<void> {
    const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    this.store.set(key, bytes);
  }

  async get(key: string): Promise<Uint8Array | null> {
    return this.store.get(key) ?? null;
  }

  async getText(key: string): Promise<string | null> {
    const bytes = this.store.get(key);
    return bytes ? new TextDecoder().decode(bytes) : null;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  async list(prefix?: string): Promise<string[]> {
    return [...this.store.keys()].filter((k) => !prefix || k.startsWith(prefix)).sort();
  }

  async copy(from: string, to: string): Promise<void> {
    const bytes = this.store.get(from);
    if (!bytes) throw new Error(`Key not found: ${from}`);
    this.store.set(to, bytes);
  }

  async size(key: string): Promise<number | null> {
    const bytes = this.store.get(key);
    return bytes ? bytes.byteLength : null;
  }
}
