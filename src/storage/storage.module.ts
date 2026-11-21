import { Module } from '@nestjs/common';
import { FIXFLOW_STORE } from './storage.token';
import { buildSeedStore } from './seed';

@Module({
  providers: [
    {
      provide: FIXFLOW_STORE,
      useFactory: async () => buildSeedStore(),
    },
  ],
  exports: [FIXFLOW_STORE],
})
export class StorageModule {}