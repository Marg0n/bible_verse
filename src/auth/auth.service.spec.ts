/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { MailService } from '../mail/mail.service';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const jwtMock = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const configMock = {
    get: jest.fn(),
    getOrThrow: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-access-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
    }),
  };

  const redisMock = {
    getClient: jest.fn(),
  };

  const mailMock = {
    sendOtpEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: jwtMock,
        },
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: ConfigService,
          useValue: configMock,
        },
        {
          provide: RedisService,
          useValue: redisMock,
        },
        {
          provide: MailService,
          useValue: mailMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  //* Testing new successful user registration
  it('should register a new user successfully', async () => {
    const email = 'test@mail.com';
    const password = 'Password123!';

    //? Create a real bcrypt hash for the test
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = {
      id: 'user-123',
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    //? No existing user
    prismaMock.user.findUnique.mockResolvedValue(null);

    //? Simulated successful database creation
    prismaMock.user.create.mockResolvedValue(createdUser);

    //? Simulate JWT generation
    jwtMock.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    //? Simulate refresh-token DB update
    prismaMock.user.update.mockResolvedValue({
      ...createdUser,
      refreshToken: 'hashed-refresh-token',
    });

    const result = await service.register(email, password);

    //? Check response
    expect(result.success).toBe(true);
    expect(result.description).toBe('User registered successfully');

    //? Password must not be returned
    expect(result.data.user).not.toHaveProperty('password');

    //? Check email normalization and database lookup
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: email.toLowerCase() },
    });

    //? Check that the password was hashed before saving
    const createCall = prismaMock.user.create.mock.calls[0][0];
    expect(createCall.data.email).toBe(email);
    expect(await bcrypt.compare(password, createCall.data.password)).toBe(true);

    //? Check token generation
    expect(jwtMock.signAsync).toHaveBeenCalledTimes(2);

    //? Check refresh token was stored as a hash
    const updateCall = prismaMock.user.update.mock.calls[0][0];

    expect(updateCall.where.id).toBe(createdUser.id);
    expect(
      await bcrypt.compare('refresh-token', updateCall.data.refreshToken),
    ).toBe(true);

    //? Check returned tokens
    expect(result.data.access_token).toBe('access-token');
    expect(result.data.refresh_token).toBe('refresh-token');
  });

  //* Testing reject user registration
  it('should reject registration if the email already exists', async () => {
    const email = 'existing@mail.com';
    const password = 'Password123!';

    prismaMock.user.findUnique.mockResolvedValue({
      id: 'existing-user-123',
      email,
      password: 'some-hashed-password',
    });

    await expect(service.register(email, password)).rejects.toThrow(
      `Email ${email} already exists!`,
    );

    //? User creation must never happen
    expect(prismaMock.user.create).not.toHaveBeenCalled();

    //? Token generation must never happen
    expect(jwtMock.signAsync).not.toHaveBeenCalled();
  });

  //* Testing successful user login
  it('should login a user successfully', async () => {
    const email = 'LOGIN@mail.com';
    const normalizedEmail = 'login@mail.com';
    const password = 'Password123!';

    //? Create a real bcrypt hash for the test
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = {
      id: 'user-123',
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date(),
    };

    //? Mock finding the existing user
    prismaMock.user.findUnique.mockResolvedValue(existingUser);

    //? Mock JWT generation
    jwtMock.signAsync
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');

    //? Mock saving the hashed refresh token
    prismaMock.user.update.mockResolvedValue({
      ...existingUser,
      refreshToken: 'hashed-refresh-token',
    });

    const result = await service.login(email, password);

    //? Check successful response
    expect(result.success).toBe(true);
    expect(result.description).toBe('User login successful');

    //? Check email normalization
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: normalizedEmail },
    });

    //? Check password is not exposed
    expect(result.data.user).not.toHaveProperty('password');

    //? Check JWT generation
    expect(jwtMock.signAsync).toHaveBeenCalledTimes(2);

    //? Check refresh token storage
    const updateCall = prismaMock.user.update.mock.calls[0][0];

    expect(updateCall.where.id).toBe(existingUser.id);

    expect(
      await bcrypt.compare('new-refresh-token', updateCall.data.refreshToken),
    ).toBe(true);

    // Check returned tokens
    expect(result.data.access_token).toBe('new-access-token');
    expect(result.data.refresh_token).toBe('new-refresh-token');
  });

  //* Testing Login with incorrect password
  it('should reject login with an incorrect password', async () => {
    const email = 'test@example.com';
    const correctPassword = 'Password123!';
    const incorrectPassword = 'WrongPassword123!';

    const hashedPassword = await bcrypt.hash(correctPassword, 10);

    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-123',
      email,
      password: hashedPassword,
    });

    await expect(service.login(email, incorrectPassword)).rejects.toThrow(
      'Invalid credentials',
    );

    //? No JWT should be generated
    expect(jwtMock.signAsync).not.toHaveBeenCalled();

    //? No refresh token should be saved
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  //* Testing Login with non user
  it('should reject login if the user does not exist', async () => {
    const email = 'unknown@example.com';
    const password = 'Password123!';

    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.login(email, password)).rejects.toThrow(
      new BadRequestException('Invalid credentials'),
    );

    //? No token generation
    expect(jwtMock.signAsync).not.toHaveBeenCalled();

    //? No database update
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  //* Testing the successful refresh-token test
  it('should refresh access and refresh tokens successfully', async () => {
    const refreshToken = 'valid-refresh-token';
    const newAccessToken = 'new-access-token';
    const newRefreshToken = 'new-refresh-token';

    const user = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashed-password',
      refreshToken: await bcrypt.hash(refreshToken, 10),
    };

    //? Arrange: Mock the refresh JWT secret
    configMock.get.mockReturnValue('test-refresh-secret');

    //? Arrange: Mock JWT verification
    jwtMock.verifyAsync.mockResolvedValue({
      sub: user.id,
      email: user.email,
    });

    //? Arrange: Mock finding the user
    prismaMock.user.findUnique.mockResolvedValue(user);

    //? Arrange: Mock generating new tokens
    jwtMock.signAsync
      .mockResolvedValueOnce(newAccessToken)
      .mockResolvedValueOnce(newRefreshToken);

    //? Arrange: Mock database update
    prismaMock.user.update.mockResolvedValue({
      ...user,
      refreshToken: 'new-hashed-refresh-token',
    });

    //? Act
    const result = await service.refreshToken(refreshToken);

    //? Assert: JWT verification
    expect(jwtMock.verifyAsync).toHaveBeenCalledWith(refreshToken, {
      secret: 'test-refresh-secret',
    });

    //? Assert: User lookup
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: user.id },
    });

    //? Assert: Generate new access and refresh tokens
    expect(jwtMock.signAsync).toHaveBeenCalledTimes(2);

    //? Assert: Save the rotated refresh token
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: user.id },
        data: {
          refreshToken: expect.any(String),
        },
      }),
    );

    //? Confirm the saved token is actually hashed
    const updateCall = prismaMock.user.update.mock.calls[0][0];

    expect(
      await bcrypt.compare(newRefreshToken, updateCall.data.refreshToken),
    ).toBe(true);

    //? Assert: Response
    expect(result).toEqual({
      success: true,
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      },
    });
  });

  //* Testing while sending an invalid refresh token
  it('should reject an invalid refresh token', async () => {
    const refreshToken = 'invalid-refresh-token';

    //? ARRANGE
    jwtMock.verifyAsync.mockRejectedValue(new Error('Invalid token'));

    //? ACT & ASSERT
    await expect(service.refreshToken(refreshToken)).rejects.toThrow(
      'Invalid refresh token',
    );

    //? JWT verification was attempted
    expect(jwtMock.verifyAsync).toHaveBeenCalledWith(refreshToken, {
      secret: 'test-refresh-secret',
    });

    //? No database lookup should happen
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();

    //? No new tokens should be generated
    expect(jwtMock.signAsync).not.toHaveBeenCalled();

    //? No database update should happen
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  //* Testing Valid JWT, but user doesn't exist
  it('should reject refresh token if user does not exist', async () => {
    const refreshToken = 'valid-refresh-token';

    //? ARRANGE
    jwtMock.verifyAsync.mockResolvedValue({
      sub: 'deleted-user-123',
      email: 'test@example.com',
    });

    prismaMock.user.findUnique.mockResolvedValue(null);

    //? ACT & ASSERT
    await expect(service.refreshToken(refreshToken)).rejects.toThrow(
      'Invalid refresh token',
    );

    //? JWT verification should succeed
    expect(jwtMock.verifyAsync).toHaveBeenCalled();

    //? Database lookup should happen
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'deleted-user-123' },
    });

    //? No tokens should be generated
    expect(jwtMock.signAsync).not.toHaveBeenCalled();

    //? No database update should happen
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  //* Testing Refresh token doesn't match the stored hash
  it('should reject refresh token if it does not match the stored token', async () => {
    const refreshToken = 'wrong-refresh-token';

    const user = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashed-password',
      refreshToken: await bcrypt.hash('different-refresh-token', 10),
    };

    //? ARRANGE
    jwtMock.verifyAsync.mockResolvedValue({
      sub: user.id,
      email: user.email,
    });

    prismaMock.user.findUnique.mockResolvedValue(user);

    //? ACT & ASSERT
    await expect(service.refreshToken(refreshToken)).rejects.toThrow(
      'Invalid refresh token',
    );

    //? User lookup should happen
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: user.id },
    });

    //? No new tokens should be generated
    expect(jwtMock.signAsync).not.toHaveBeenCalled();

    //? No database update should happen
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  //* Testing User has no stored refresh token
  it('should reject refresh token if user has no stored refresh token', async () => {
    const refreshToken = 'old-refresh-token';

    const user = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashed-password',
      refreshToken: null,
    };

    //? ARRANGE
    jwtMock.verifyAsync.mockResolvedValue({
      sub: user.id,
      email: user.email,
    });

    prismaMock.user.findUnique.mockResolvedValue(user);

    //? ACT & ASSERT
    await expect(service.refreshToken(refreshToken)).rejects.toThrow(
      'Invalid refresh token',
    );

    //? User lookup should happen
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: user.id },
    });

    //? No new tokens should be generated
    expect(jwtMock.signAsync).not.toHaveBeenCalled();

    //? No database update should happen
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  //* Testing One final refresh-token test: Database lookup fails
  it('should reject refresh token if database lookup fails', async () => {
    const refreshToken = 'valid-refresh-token';

    //? ARRANGE
    jwtMock.verifyAsync.mockResolvedValue({
      sub: 'user-123',
      email: 'test@example.com',
    });

    prismaMock.user.findUnique.mockRejectedValue(
      new Error('Database connection lost'),
    );

    //? ACT & ASSERT
    await expect(service.refreshToken(refreshToken)).rejects.toThrow(
      'Invalid refresh token',
    );

    //? JWT verification should happen
    expect(jwtMock.verifyAsync).toHaveBeenCalled();

    //? Database lookup should happen
    expect(prismaMock.user.findUnique).toHaveBeenCalled();

    //? No tokens should be generated
    expect(jwtMock.signAsync).not.toHaveBeenCalled();

    //? No database update should happen
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  //* Testing a user requests a password reset, but the email address doesn't exist
  it('should return a generic response if user does not exist', async () => {
    const email = 'UNKNOWN@example.com';
    const normalizedEmail = 'unknown@example.com';

    //? ARRANGE
    const redisClientMock = {
      exists: jest.fn().mockResolvedValue(0),
      ttl: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    redisMock.getClient.mockReturnValue(redisClientMock);

    prismaMock.user.findUnique.mockResolvedValue(null);

    //? ACT
    const result = await service.forgotPassword(email);

    //? ASSERT

    //? Should check Redis cooldown
    expect(redisClientMock.exists).toHaveBeenCalledWith(
      `otp-cooldown:${normalizedEmail}`,
    );

    //? Should search for the normalized email
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: normalizedEmail },
    });

    //? Should return a generic response
    expect(result).toEqual({
      success: true,
      message: 'If an account exists for this email, an OTP has been sent.',
    });

    //? Should not send an email
    expect(mailMock.sendOtpEmail).not.toHaveBeenCalled();

    //? Should not store an OTP or set a cooldown
    expect(redisClientMock.set).not.toHaveBeenCalled();

    //? Should not delete or modify OTP attempts
    expect(redisClientMock.del).not.toHaveBeenCalled();
  });

  //* Testing he user exists, so an OTP must be generated, stored in Redis, and emailed
  it('should send OTP successfully if user exists', async () => {
    const email = 'TEST@example.com';
    const normalizedEmail = 'test@example.com';

    const user = {
      id: 'user-123',
      email: normalizedEmail,
      password: 'hashed-password',
      refreshToken: null,
    };

    //? ARRANGE
    const redisClientMock = {
      exists: jest.fn().mockResolvedValue(0),
      ttl: jest.fn(),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
    };

    redisMock.getClient.mockReturnValue(redisClientMock);

    prismaMock.user.findUnique.mockResolvedValue(user);

    mailMock.sendOtpEmail.mockResolvedValue(undefined);

    //? ACT
    const result = await service.forgotPassword(email);

    //? ASSERT
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: normalizedEmail },
    });

    expect(redisClientMock.set).toHaveBeenCalledTimes(2);

    const otpSetCall = redisClientMock.set.mock.calls[0];
    const cooldownSetCall = redisClientMock.set.mock.calls[1];

    const generatedOtp = otpSetCall[1];

    expect(otpSetCall).toEqual([
      `otp:${normalizedEmail}`,
      expect.stringMatching(/^\d{6}$/),
      { EX: 300 },
    ]);

    expect(redisClientMock.del).toHaveBeenCalledWith(
      `otp-attempts:${normalizedEmail}`,
    );

    expect(mailMock.sendOtpEmail).toHaveBeenCalledWith(
      normalizedEmail,
      generatedOtp,
    );

    expect(cooldownSetCall).toEqual([
      `otp-cooldown:${normalizedEmail}`,
      '1',
      { EX: 60 },
    ]);

    expect(result).toEqual({
      success: true,
      message: 'If an account exists for this email, an OTP has been sent.',
    });
  });
});
