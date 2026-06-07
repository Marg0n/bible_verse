import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  private client!: RedisClientType;
  private readonly logger = new Logger(RedisService.name);

  async onModuleInit() {
    const redisUrl =
      process.env.REDIS_URL || this.configService.get<string>('REDIS_URL');

    this.client = createClient({
      url: redisUrl,
    });

    // Handle runtime errors
    this.client.on('error', (err) =>
      this.logger.error('Redis Client Error', err),
    );

    try {
      this.logger.log(`Connecting to Redis at ${redisUrl}...`);
      await this.client.connect();
      this.logger.log('Redis connected successfully!');
    } catch (error) {
      this.logger.error('Failed to connect to Redis during startup', error);
      // Optional: process.exit(1) if Redis is absolutely mandatory for your app to run
    }

    // await this.client.connect();
  }

  getClient() {
    return this.client;
  }
}
