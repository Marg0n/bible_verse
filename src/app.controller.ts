import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RedisService } from './redis/redis.service';

@ApiTags('Server Connection Health & Monitoring')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redisService: RedisService,
  ) {}

  @ApiOperation({
    summary: 'Server connection',
    description: 'Testing if the server is online',
  })
  @ApiOkResponse({
    description: 'Simple response from server that it is running.',
    example: 'Hello World!, Welcome to Bible Verse!',
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiOperation({
    summary: 'Test Redis connection readiness status',
    description:
      'Writes a test key-value pair to Redis database instance and reads it back instantly.',
  })
  @ApiOkResponse({
    description: 'Redis is working cleanly.',
    type: String,
    example: 'world',
  })
  @Get('redis-test')
  async testRedis() {
    const redis = this.redisService.getClient();

    await redis.set('hello', 'world');

    return await redis.get('hello');
  }
}
