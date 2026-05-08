import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Theme } from '@prisma/client';
import { CreateUserDto } from './dto/createUserDto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { GetUserDto } from './dto/getUserDto.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getUser(@Param() dto: GetUserDto) {
    return this.userService.getUser(dto.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/theme')
  updateTheme(@Param() dto: GetUserDto, @Body('theme') theme: Theme) {
    return this.userService.updateTheme(dto.userId, theme);
  }
}
