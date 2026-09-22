import { mkdir, readFile, writeFile, unlink, stat, readdir, copyFile } from 'node:fs/promises';
import { dirname, join, normalize, sep } from 'node:path';
import { type StorageDriver } from '../storage';
import { validateKey } from '../storage';

export class LocalStorageDriver implements StorageDriver {
  constructor(private root: string) {}

  private resolve(key: string): string {
    validateKey(key);
    const path = normalize(join(this.root, key));
    if (!path.startsWith(normalize(this.root) + sep) && path !== normalize(this.root)) {
      throw new Error(`Path traversal blocked: ${key}`);
    }
    return path;
  }

  async put(key: string, data: string | Uint8Array): Promise<void> {
    const path = this.resolve(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, data);
  }

  async get(key: string): Promise<Uint8Array | null> {
    try {
      return new Uint8Array(await readFile(this.resolve(key)));
    } catch {
      return null;
    }
  }

  async getText(key: string): Promise<string | null> {
    try {
      return await readFile(this.resolve(key), 'utf-8');
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(this.resolve(key));
    } catch {
      // already gone
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await stat(this.resolve(key));
      return true;
    } catch {
      return false;
    }
  }

  async list(prefix = ''): Promise<string[]> {
    const results: string[] = [];
    const walk = async (dir: string, base: string): Promise<void> => {
      let entries;
      try {
        entries = await readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        const rel = base ? `${base}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          await walk(`${dir}/${entry.name}`, rel);
        } else {
          if (!prefix || rel.startsWith(prefix)) results.push(rel);
        }
      }
    };
    await walk(this.root, '');
    return results.sort();
  }

  async copy(from: string, to: string): Promise<void> {
    const src = this.resolve(from);
    const dst = this.resolve(to);
    await mkdir(dirname(dst), { recursive: true });
    await copyFile(src, dst);
  }

  async size(key: string): Promise<number | null> {
    try {
      const s = await stat(this.resolve(key));
      return s.size;
    } catch {
      return null;
    }
  }
}
