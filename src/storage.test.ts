import { describe, test, expect, afterAll } from 'bun:test';
import { StorageService, MemoryStorageDriver, LocalStorageDriver, StorageModule } from './index';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

async function exerciseDriver(name: string, make: () => StorageService) {
  const svc = make();

  test(`[${name}] put/getText round-trip`, async () => {
    await svc.put('a/b/hello.txt', 'hello orbit');
    expect(await svc.getText('a/b/hello.txt')).toBe('hello orbit');
    expect(await svc.exists('a/b/hello.txt')).toBe(true);
  });

  test(`[${name}] binary data`, async () => {
    const bytes = new Uint8Array([1, 2, 3, 250]);
    await svc.put('bin/data.bin', bytes);
    const read = await svc.get('bin/data.bin');
    expect(read).not.toBeNull();
    expect([...(read as Uint8Array)]).toEqual([1, 2, 3, 250]);
expect(await svc.size('bin/data.bin')).toBe(4);
  });

  test(`[${name}] JSON helpers`, async () => {
    await svc.putJson('json/user.json', { id: 7, name: 'orbit' });
    const user = await svc.getJson<{ id: number; name: string }>('json/user.json');
    expect(user).toEqual({ id: 7, name: 'orbit' });
    expect(await svc.getJson('json/missing.json')).toBeNull();
  });

  test(`[${name}] list with prefix`, async () => {
    await svc.put('docs/a.md', 'a');
    await svc.put('docs/b.md', 'b');
    const list = await svc.list('docs/');
    expect(list).toContain('docs/a.md');
    expect(list).toContain('docs/b.md');
    expect(list).not.toContain('a/b/hello.txt');
  });

  test(`[${name}] copy and delete`, async () => {
    await svc.put('src/x.txt', 'x');
    await svc.copy('src/x.txt', 'dst/x.txt');
    expect(await svc.getText('dst/x.txt')).toBe('x');
    await svc.delete('src/x.txt');
    expect(await svc.exists('src/x.txt')).toBe(false);
    expect(await svc.getText('src/x.txt')).toBeNull();
  });

  test(`[${name}] rejects path traversal`, async () => {
    expect(() => (svc as any).driver.constructor).toBeDefined();
    await expect(svc.put('../escape.txt', 'x')).rejects.toThrow();
    await expect(svc.put('/abs/path.txt', 'x')).rejects.toThrow();
  });
}

describe('MemoryStorageDriver via StorageService', () => {
  exerciseDriver('memory', () => new StorageService(new MemoryStorageDriver()));
});

describe('LocalStorageDriver via StorageService', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'orbit-storage-'));
  exerciseDriver('local', () => new StorageService(new LocalStorageDriver(tmp)));
});

describe('StorageModule', () => {
  test('memory module provides StorageService', async () => {
    const { OrbitFactory, Module } = await import('@galaxy-stack/orbit-core');
    @Module({ imports: [StorageModule.forRoot({ driver: 'memory' })] })
    class M {}
    const app = await OrbitFactory.create(M);
    const svc = await app.getContainer().resolve(StorageService);
    await svc.put('t.txt', 'v');
    expect(await svc.getText('t.txt')).toBe('v');
  });

  test('local module option', async () => {
    const { OrbitFactory, Module } = await import('@galaxy-stack/orbit-core');
    const root = mkdtempSync(join(tmpdir(), 'orbit-local-'));
    @Module({ imports: [StorageModule.forRoot({ driver: 'local', root })] })
    class M {}
    const app = await OrbitFactory.create(M);
    const svc = await app.getContainer().resolve(StorageService);
    await svc.put('nested/file.txt', 'data');
    expect(await svc.getText('nested/file.txt')).toBe('data');
  });
});
