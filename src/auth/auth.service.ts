/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './interfaces/auth.interface';
import { RedisService } from '../redis/redis.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}

  //* Nestjs logger
  private readonly logger = new Logger(AuthService.name);

  //* Redis constants
  private readonly OTP_MAX_ATTEMPTS = 3;
  private readonly OTP_TTL_SECONDS = 300;

  //* Create user by registration
  async register(email: string, password: string) {
    try {
      const mail = email.toLowerCase();

      //? Check existing user
      const existingUser = await this.prisma.user.findUnique({
        where: { email: mail },
      });

      if (existingUser) {
        throw new BadRequestException(`Email ${mail} already exists!`);
        // this.logger.warn(`${mail} already exists!`);
        // return {
        //   success: true,
        //   message: 'Email already exists!',
        // };
      }

      //? Hashing
      const hashPassword = await bcrypt.hash(password, 10);

      //? Create user
      const user = await this.prisma.user.create({
        data: {
          email: mail,
          password: hashPassword,
        },
      });

      //? Create token
      const tokens = await this.generateTokens(user.id, user.email);

      //? Update refresh token to db
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      //? Removing password from response
      const { password: _, ...safeUser } = user;

      const result = {
        user: safeUser,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      };

      return {
        success: true,
        description: 'User registered successfully',
        data: result,
      };
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error?.code === 'P2003') {
        this.logger.error('Register error: ', error);
        //? Foreign key failure / DB down
        throw new ServiceUnavailableException('Database connection lost');
      }
      throw new BadRequestException('User Creation failed');
    }
  }

  //* Token generation helper function
  private async generateTokens(userId: string, email: string) {
    const payload = {
      sub: userId, //? sub = subject (standard JWT field))
      email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      // secret: process.env.JWT_SECRET,
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      // secret: process.env.JWT_REFRESH_SECRET,
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  //* Hashed Refresh Token to db
  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: hashedRefreshToken,
      },
    });
  }

  //* Login
  async login(email: string, password: string) {
    try {
      const mail = email.toLowerCase();

      //? Find user
      const user = await this.prisma.user.findUnique({
        where: {
          email: mail,
        },
      });

      if (!user) {
        throw new BadRequestException(`Invalid credentials for ${mail}`);
        // this.logger.warn(`Invalid credentials for ${mail}`);
        // return {
        //   success: false,
        //   message: 'Invalid user or credentials',
        // };
      }

      //? Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new BadRequestException('Invalid credentials');
      }

      //? Token
      const tokens = await this.generateTokens(user.id, user.email);

      //? Update refresh token to db
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      //? Remove password
      const { password: _, ...safeUser } = user;

      const result = {
        user: safeUser,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      };

      return {
        success: true,
        description: 'User login successful',
        data: result,
      };
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error?.code === 'P2003') {
        this.logger.error('Login error: ', error);
        //? Foreign key failure / DB down
        throw new ServiceUnavailableException('Database connection lost');
      }
      // throw error;

      throw new BadRequestException('User Login failed');
    }
  }

  //* Refresh Token
  async refreshToken(refreshToken: string) {
    try {
      //? Check validity/ verify token
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          // secret: process.env.JWT_REFRESH_SECRET,
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );

      //? Find user
      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Unauthorized user');
      }

      //! Compare hashed token
      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);

      if (!isMatch) {
        throw new UnauthorizedException('Invalid user');
      }

      //! Generate new token
      const tokens = await this.generateTokens(user.id, user.email);

      //! Rotate refresh token to DB
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        success: true,
        data: {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        },
      };
    } catch (error) {
      this.logger.error('Refresh token error:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  //* Generate OTP
  private generateOtp(): string {
    //? Always generate 6 digit number as 100000 + 0.54321 * 900000 = 588889
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  //* Redis storage for OTP
  private async storeOtp(email: string, otp: string) {
    const redis = this.redisService.getClient();

    await redis.set(`otp:${email}`, otp, {
      EX: this.OTP_TTL_SECONDS, //? e.g. 600 seconds = 10 mins
    });

    //? Reset attempt counter whenever a new OTP is generated
    await redis.del(`otp-attempts:${email}`);
  }

  //* Redis increment attempts
  private async incrementOtpAttempts(email: string): Promise<number> {
    const redis = this.redisService.getClient();

    const attempts = await redis.incr(`otp-attempts:${email}`);

    if (attempts === 1) {
      await redis.expire(`otp-attempts:${email}`, this.OTP_TTL_SECONDS);
    }

    return attempts;
  }

  //* Helper to clear redis attempts
  private async clearOtpAttempts(email: string) {
    const redis = this.redisService.getClient();

    await redis.del(`otp-attempts:${email}`);
  }

  //* Verify OTP helper
  private async verifyStoredOtp(email: string, otp: string): Promise<boolean> {
    const redis = this.redisService.getClient();

    const storedOtp = await redis.get(`otp:${email}`);

    return storedOtp === otp;
  }

  //* Forgot password
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found!');
    }

    //? Generate OTP
    const otp = this.generateOtp();

    //? Store OTP
    await this.storeOtp(email, otp);

    //? Send OTP via mail
    await this.mailService.sendOtpEmail(email, otp);

    return {
      success: true,
      message: 'OTP sent successfully',
    };
  }

  //* Verify OTP
  async verifyOtp(email: string, otp: string) {
    const isValid = await this.verifyStoredOtp(email, otp);

    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return {
      success: true,
      message: 'OTP verified',
    };
  }

  //* Reset password
  async resetPassword(email: string, otp: string, newPassword: string) {
    //? Awaiting for the OTP verification
    await this.verifyOtp(email, otp);

    //? Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    //? DB update
    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    //? Redis clear
    const redis = this.redisService.getClient();

    await redis.del(`otp:${email}`);

    return {
      success: true,
      message: 'Password reset successful',
    };
  }

  //TODO: Email Verification
  //TODO: Resend OTP

  //* Logout
  async logout(userId: string) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          refreshToken: null,
        },
      });

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error?.code === 'P2003') {
        this.logger.error('Logout error: ', error);
        //? Foreign key failure / DB down
        throw new ServiceUnavailableException('Database connection lost');
      }
      throw error;
    }
  }
}
