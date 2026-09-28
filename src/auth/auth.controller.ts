import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
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
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  ForgotPasswordDto,
  ForgotPasswordResponseDto,
} from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  ResetPasswordDto,
  ResetPasswordResponseDto,
} from './dto/reset-password.dto';
import {
  AuthResponseDto,
  RegAuthResponseDto,
} from './dto/swaggerAuthResponse.dto';
import { VerifyOtpDto, VerifyOtpResponseDto } from './dto/verify-otp.dto';
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
    type: RegAuthResponseDto,
  })
  @Throttle({
    default: {
      limit: 3,
      ttl: 60000, //? 60 * 10000 = 60s
    },
  })
  @Public()
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
  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // return this.authService.login(dto.email!, dto.password!);
    //? call the service
    const result = await this.authService.login(dto.email!, dto.password!);

    //? grab the .data part
    const { user, access_token, refresh_token } = result.data;
    const { description } = result;

    //? Store refresh token in an httpOnly cookie (invisible to JS → XSS-safe)
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      success: true,
      description: description || 'User logged in successfully.',
      data: { user, access_token }, //! no refresh_token in the body
    };
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
  @Public()
  @Post('refresh')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // return this.authService.refreshToken(dto.refreshToken);

    //? Read from cookie (no body needed)
    const refreshToken = req.cookies['refresh_token'] as string;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token found');
    }

    const result = await this.authService.refreshToken(refreshToken);
    const { access_token, refresh_token } = result.data;

    //? Rotate: overwrite the cookie with the NEW refresh token
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      success: true,
      data: { access_token },
    };
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
      ttl: 30000,
    },
  })
  @Public()
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
  @Public()
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.otp);
  }

  //* Reset password
  @ApiOperation({
    summary: 'Reset password using OTP',
  })
  @ApiBody({
    type: ResetPasswordDto,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Password reset successful',
    type: ResetPasswordResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired OTP',
  })
  @Public()
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
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
  async logout(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    // return this.authService.logout(user.userId);
    const result = await this.authService.logout(user.userId);

    //? Remove the httpOnly cookie
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return result;
  }
}
