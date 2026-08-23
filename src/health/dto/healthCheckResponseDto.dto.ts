import { ApiProperty } from '@nestjs/swagger';

//* DTO for the nested 'services' object
class ServiceStatusDto {
  @ApiProperty({ example: 'up', description: 'Status of the specific service' })
  database!: string;

  @ApiProperty({ example: 'up', description: 'Status of the specific service' })
  redis!: string;
}

//* Main Response DTO
export class HealthCheckResponseDto {
  @ApiProperty({ example: 'ok', description: 'Overall health status' })
  status!: string;

  @ApiProperty({
    example: 200,
    description: 'Overall health status with HTTP code',
  })
  code!: number;

  @ApiProperty({
    example: 'nest-3',
    description: 'Shows the instance it running into',
  })
  instance!: string;

  @ApiProperty({
    example: '2026-07-26T12:28:27.739Z',
    description: 'ISO 8601 timestamp of the check',
    format: 'date-time',
  })
  timestamp!: string;

  @ApiProperty({ example: 19.102409583, description: 'Uptime in seconds' })
  uptime!: number;

  @ApiProperty({
    example: 'development',
    description: 'Current environment name',
  })
  environment!: string;

  @ApiProperty({
    type: ServiceStatusDto,
    description: 'Status of individual internal services',
  })
  services!: ServiceStatusDto;
}
