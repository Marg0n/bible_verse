import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('anonymous')
  createAnonymous() {
    return this.authService.createAnonymousUser();
  }
}
