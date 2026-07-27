import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { HealthCheckResponseDto } from './dto/healthCheckResponseDto.dto';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @ApiOperation({
    summary: 'Test Health of DB connection readiness status',
    description:
      'Writes a test key-value pair to Redis database instance and reads it back instantly.',
  })
  @ApiOkResponse({
    description: 'Health check successful',
    type: HealthCheckResponseDto,
  })
  @Get()
  getHealth() {
    return this.healthService.check();
  }
}
