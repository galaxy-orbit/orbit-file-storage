<div align="center">

# @galaxy-stack/orbit-file-storage

**File storage for Orbit** — local and memory drivers with a pluggable `StorageDriver` interface (S3-ready).

[![npm version](https://img.shields.io/npm/v/@galaxy-stack/orbit-file-storage.svg)](https://www.npmjs.com/package/@galaxy-stack/orbit-file-storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

Part of the [Orbit framework](https://github.com/galaxy-orbit/orbit) — a NestJS-style backend framework for [Bun](https://bun.sh).

## Installation

```bash
bun add @galaxy-stack/orbit-file-storage
```

## Usage

```ts
import { StorageModule, StorageService, Module, Injectable } from '@galaxy-stack/orbit-file-storage';

@Module({
  imports: [StorageModule.forRoot({ driver: 'local', root: './uploads' })],
})
export class AppModule {}

@Injectable()
export class UploadService {
  constructor(private storage: StorageService) {}

  async saveAvatar(userId: string, bytes: Uint8Array) {
    await this.put(`avatars/${userId}.png`, bytes);
  }
  async put(key: string, data: string | Uint8Array) { return this.driverPut(key, bytes); }
  private driverPut(key: string, data: Uint8Array) { return this.put(key, data); }
}
```

API: `put`, `get`, `getText`, `getJson`, `putJson`, `delete`, `exists`, `list`, `copy`, `size`. Keys are validated against traversal (`../`, absolute paths).

Implement the `StorageDriver` interface (S3, GCS, …) and pass `{ driver: 'custom', driverInstance }`.

## License

MIT
