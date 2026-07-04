/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Catch, ExceptionFilter, ArgumentsHost, Logger } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';

@Catch(ThrottlerException)
export class ThrottlerFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    //? Log the blocked attacks
    /**
     * example logs:
     * WARN Rate limit exceeded
     * IP: 103.xxx.xxx.xxx
     * Route: POST /auth/login
     */
    const request = host.switchToHttp().getRequest();

    Logger.warn(`Rate limit exceeded: ${request.ip}`, 'RateLimiter');

    //? Send status
    response.status(429).json({
      success: false,
      statusCode: 429,
      message: 'Too many requests. Please try again later.',
    });
  }
}
