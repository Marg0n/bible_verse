/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';

@Catch(ThrottlerException)
export class ThrottlerFilter implements ExceptionFilter {
  private readonly logger = new Logger(ThrottlerFilter.name);

  catch(exception: ThrottlerException, host: ArgumentsHost) {
    // const response = host.switchToHttp().getResponse();
    // const request = host.switchToHttp().getRequest();

    const ctx = host.switchToHttp();

    const request = ctx.getRequest();
    const response = ctx.getResponse();

    //? Log the blocked attacks
    /**
     * example logs:
     * WARN [ThrottlerFilter]
     * Rate limit exceeded || POST /auth/login || IP: 103.xxx.xxx.xxx
     * Route: POST /auth/login
     */

    this.logger.warn(
      `Rate limit exceeded | ${request.method} ${request.url} | IP: ${request.ip}`,
    );

    // Logger.warn(`Rate limit exceeded: ${request.ip}`, 'RateLimiter');

    //? Send status
    // response.status(429).json({
    //   success: false,
    //   statusCode: 429,
    //   message: 'Too many requests. Please try again later.',
    // });

    response.status(HttpStatus.TOO_MANY_REQUESTS).json({
      success: false,
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message: 'Too many requests. Please try again later.',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
