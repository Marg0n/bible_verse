import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { StreakResponseDto } from './dto/streakResponse.dto';
import { StreakService } from './streak.service';

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('streak')
export class StreakController {
  constructor(private readonly streakService: StreakService) {}

  @ApiOperation({
    summary: 'Record daily user activity to increment or reset activity streak',
    description:
      'Call this endpoint when the user completes their daily target. It tracks consecutive days.',
  })
  @ApiOkResponse({
    description: 'Streak calculated and updated successfully.',
    type: StreakResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token.' })
  @ApiBadRequestResponse({
    description: 'Database calculation error occurred.',
  })
  @HttpCode(HttpStatus.OK) //? Changes default POST status code from 201 to 200 since it modifies state rather than creating an entity
  @Post()
  updateStreak(@CurrentUser() user: AuthUser) {
    return this.streakService.updateStreak(user.userId);
  }
}
