import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/swaggerAuthResponse.dto';
import type { AuthUser } from './interfaces/auth-user.interface';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';

@ApiTags('Authentication')
@ApiBearerAuth('JWT-auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //* Registration
  @ApiOperation({
    summary: 'Register new user',
  })
  @ApiBody({
    type: RegisterDto,
  })
  @ApiCreatedResponse({
    description: 'User registered successfully',
  })
  @ApiBadRequestResponse({
    description: 'Email already exists',
  })
  @ApiResponse({
    type: AuthResponseDto,
  })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password);
  }

  //* Login
  @ApiOperation({
    summary: 'Login user',
  })
  @ApiBody({
    type: RegisterDto,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'User login successful',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid credentials',
  })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email!, dto.password!);
  }

  //* Refresh token
  @ApiOperation({
    summary: 'Refresh user token',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Token refreshed successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid refresh token',
  })
  @Post('refresh')
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  //* Logout
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Logout user',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Logged out successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @Post('logout')
  logout(@CurrentUser() user: AuthUser) {
    return this.authService.logout(user.userId);
  }
}
