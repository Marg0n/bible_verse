import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); //? We're handling an HTTP request; not GraphQL, WebSockets, gRPC

    const response = ctx.getResponse<Response>(); //? instead of Nest doing it, manually sending e.g. response.status(400).json(...)

    const request = ctx.getRequest<Request>(); //? contains: method, url, headers, body, ip, params

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR; //? 500

    let message: unknown = 'Internal server error';

    //? Exclude Favicon from Logging
    if (request.url === '/favicon.ico') {
      return;
    }

    //? To safely extract whatever is inside
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        message =
          (exceptionResponse as { message?: unknown }).message ?? message;
      }
    }

    //? Error logging
    this.logger.error(
      `${request.method} ${request.url} -> ${status}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
