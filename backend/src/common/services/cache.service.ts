import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}
  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) await this.redisClient.setex(key, ttlSeconds, value);
    else await this.redisClient.set(key, value);
  }
  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}