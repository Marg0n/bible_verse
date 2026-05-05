import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Theme } from '@prisma/client';
import { CreateUserDto } from './dto/createUserDto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  createUser() {
    return this.userService.createUser();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getUser(@Param() dto: CreateUserDto) {
    return this.userService.getUser(dto.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/theme')
  updateTheme(@Param() dto: CreateUserDto, @Body('theme') theme: Theme) {
    return this.userService.updateTheme(dto.userId, theme);
  }
}
