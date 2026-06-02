import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { UpdateThemeDto } from './dto/updateThemeDto.dto';
import { UserService } from './user.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetUserResponseDto } from './dto/swaggerUserResponseDto.dto';

@ApiBearerAuth() //? Applies JWT lock icon to the whole controller instead of repeating it per method
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // @Post()
  // createUser(@Body() dto: CreateUserDto) {
  //   return this.userService.createUser(dto.email, dto.password);
  // }

  //* Get user data
  @ApiOperation({ summary: 'Retrieve current user profile' })
  @ApiOkResponse({
    description: 'User data successfully retrieved.',
    type: GetUserResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token.' })
  @Get()
  getUser(@CurrentUser() user: AuthUser) {
    return this.userService.getUser(user.userId);
  }

  //* Update theme
  @ApiOperation({ summary: 'Update UI theme preference for the user' })
  @ApiOkResponse({
    description: 'Theme updated successfully.',
    schema: {
      example: { success: true, message: 'Theme updated successfully' },
    }, //? Fallback if no specific response DTO exists
  })
  @ApiBadRequestResponse({ description: 'Invalid theme value provided.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token.' })
  @HttpCode(HttpStatus.OK) //? NestJS defaults PATCH to 200, but explicit is always better
  @Patch('/theme')
  updateTheme(@CurrentUser() user: AuthUser, @Body() theme: UpdateThemeDto) {
    return this.userService.updateTheme(user.userId, theme.theme);
  }
}
