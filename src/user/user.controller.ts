import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Theme } from '@prisma/client';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
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
  getUser(@Req() req: RequestWithUser) {
    return this.userService.getUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/theme')
  updateTheme(@Req() req: RequestWithUser, @Body('theme') theme: Theme) {
    return this.userService.updateTheme(req.user.userId, theme);
  }
}
