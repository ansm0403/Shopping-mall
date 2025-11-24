import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Module({})
export class RedisModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: RedisModule,
      providers: [
        {
          provide: REDIS_CLIENT,
          useFactory: (configService: ConfigService) => {
            return new Redis({
              host: configService.get('REDIS_HOST', 'localhost'),
              port: configService.get('REDIS_PORT', 6379),
              password: configService.get('REDIS_PASSWORD'),
              db: configService.get('REDIS_DB', 0),
              retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
              },
              maxRetriesPerRequest: 3,
            });
          },
          inject: [ConfigService],
        },
        RedisService,
      ],
      exports: [REDIS_CLIENT, RedisService],
    };
  }
}
