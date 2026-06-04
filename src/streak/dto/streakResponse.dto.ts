import { ApiProperty } from '@nestjs/swagger';

class StreakDataDto {
  @ApiProperty({
    example: 5,
    description: 'The updated consecutive day streak count',
  })
  streakCount!: number;

  @ApiProperty({
    example: '2026-06-04T14:35:00.000Z',
    description: 'Timestamp of the user last recorded activity',
  })
  lastActiveDate!: Date;
}

export class StreakResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Streak updated successfully' })
  description!: string;

  @ApiProperty({ type: StreakDataDto })
  data!: StreakDataDto;
}
