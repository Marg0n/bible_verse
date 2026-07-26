import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  //* Testing PostgreSQL
  async testingPostgreSQL(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  //* Testing Redis
  async testingRedis(): Promise<boolean> {
    try {
      const redis = this.redisService.getClient();

      await redis.ping();

      return true;
    } catch {
      return false;
    }
  }

  //* Response
  async check() {
    //? checks in parallel
    const [psql, redis] = await Promise.all([
      this.testingPostgreSQL(),
      this.testingRedis(),
    ]);

    const psqlStatus = psql ? 'up' : 'down';
    const redisStatus = redis ? 'up' : 'down';

    const status = psqlStatus && redisStatus ? 'ok' : 'error';

    return {
      status: status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.getOrThrow<string>('NODE_ENV'),
      services: {
        database: psqlStatus,
        redis: redisStatus,
      },
    };
  }
}
