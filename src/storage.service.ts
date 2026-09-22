import { type StorageDriver } from './storage';
import { validateKey } from './storage';

export class StorageService {
  constructor(private driver: StorageDriver) {}

  async put(key: string, data: string | Uint8Array): Promise<void> {
    validateKey(key);
    return this.driver.put(key, data);
  }

  async get(key: string): Promise<Uint8Array | null> {
    return this.driver.get(key);
  }

  async getText(key: string): Promise<string | null> {
    return this.driver.getText(key);
  }

  async getJson<T = any>(key: string): Promise<T | null> {
    const text = await this.driver.getText(key);
    if (!text) return null;
    return JSON.parse(text) as T;
  }

  async putJson(key: string, value: any): Promise<void> {
    return this.driver.put(key, JSON.stringify(value));
  }

  async delete(key: string): Promise<void> {
    return this.driver.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.driver.exists(key);
  }

  async list(prefix?: string): Promise<string[]> {
    return this.driver.list(prefix);
  }

  async copy(from: string, to: string): Promise<void> {
    return this.driver.copy(from, to);
  }

  async size(key: string): Promise<number | null> {
    return this.driver.size(key);
  }
}
