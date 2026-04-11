import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { Theme } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  createUser() {
    return this.userService.createUser();
  }

  @Get()
  getUser(@Param('id') id: string) {
    return this.userService.getUser(id);
  }

  @Post(':id/theme')
  updateTheme(@Param('id') id: string, @Body('theme') theme: Theme) {
    return this.userService.updateTheme(id, theme);
  }
}
