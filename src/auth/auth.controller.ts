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
import { Throttle } from '@nestjs/throttler';
import { ForgotPasswordDto, ForgotPasswordResponseDto } from './dto/forgot-password.dto';
import { VerifyOtpDto, VerifyOtpResponseDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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
  @Throttle({
    default: {
      limit: 3,
      ttl: 60000, //? 60 * 10000 = 60s
    },
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
  @Throttle({
    default: {
      limit: 5,
      ttl: 60000,
    },
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
  @Throttle({
    default: {
      limit: 15,
      ttl: 60000,
    },
  })
  @Post('refresh')
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  //* Forgot password
  @ApiOperation({
    summary: 'Request password reset OTP',
  })
  @ApiBody({
    type: ForgotPasswordDto,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'OTP sent successfully',
    type: ForgotPasswordResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'User not found',
  })
  @Throttle({
    default: {
      limit: 3,
      ttl: 60000,
    },
  })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  //* Verify OTP endpoint
  @ApiOperation({
    description: 'Verify password reset OTP',
  })
  @ApiBody({
    type: VerifyOtpDto,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'OTP verified successfully',
    type: VerifyOtpResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired OTP',
  })
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.otp);
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
