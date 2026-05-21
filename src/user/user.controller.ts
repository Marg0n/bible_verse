import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { Theme } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { CreateUserDto } from './dto/createUserDto.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getUser(@CurrentUser() user: AuthUser) {
    return this.userService.getUser(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/theme')
  updateTheme(@CurrentUser() user: AuthUser, @Body('theme') theme: Theme) {
    return this.userService.updateTheme(user.userId, theme);
  }
}
