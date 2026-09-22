import type { DynamicModule } from '@galaxy-stack/orbit-core';
import { StorageService } from './storage.service';
import { type StorageDriver } from './storage';
import { MemoryStorageDriver } from './drivers/memory.driver';
import { LocalStorageDriver } from './drivers/local.driver';

export const STORAGE_DRIVER = Symbol('STORAGE_DRIVER');
export const STORAGE_OPTIONS = Symbol('STORAGE_OPTIONS');

export type StorageModuleOptions =
  | { driver: 'memory' }
  | { driver: 'local'; root: string }
  | { driver: 'custom'; driverInstance: StorageDriver };

export class StorageModule {
  static forRoot(options: StorageModuleOptions): DynamicModule {
    return {
      module: StorageModule,
      global: true,
      providers: [
        { provide: STORAGE_OPTIONS, useValue: options },
        {
          provide: STORAGE_DRIVER,
          useFactory: (opts: StorageModuleOptions) => {
            if (opts.driver === 'local') return new LocalStorageDriver(opts.root);
            if (opts.driver === 'custom') return opts.driverInstance;
            return new MemoryStorageDriver();
          },
          inject: [STORAGE_OPTIONS],
        },
        { provide: StorageService, useFactory: (d: StorageDriver) => new StorageService(d), inject: [STORAGE_DRIVER] },
      ],
      exports: [STORAGE_DRIVER, StorageService, STORAGE_OPTIONS],
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<StorageModuleOptions> | StorageModuleOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: StorageModule,
      global: true,
      providers: [
        { provide: STORAGE_OPTIONS, useFactory: options.useFactory, inject: options.inject ?? [] },
        {
          provide: STORAGE_DRIVER,
          useFactory: (opts: StorageModuleOptions) => {
            if (opts.driver === 'local') return new LocalStorageDriver(opts.root);
            if (opts.driver === 'custom') return opts.driverInstance;
            return new MemoryStorageDriver();
          },
          inject: [STORAGE_OPTIONS],
        },
        { provide: StorageService, useFactory: (d: StorageDriver) => new StorageService(d), inject: [STORAGE_DRIVER] },
      ],
      exports: [STORAGE_DRIVER, StorageService, STORAGE_OPTIONS],
    };
  }
}

export { StorageService, MemoryStorageDriver, LocalStorageDriver };
export type { StorageDriver } from './storage';
