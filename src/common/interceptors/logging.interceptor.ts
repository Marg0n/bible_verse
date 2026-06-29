/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  //? This NestInterceptor class wants to intercept every request
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    /**
     *     const method = request.method; //? GET, POST, PATCH, DELETE
     *     const url = request.originalUrl; //? e.g. /auth/login
     *     const now = Date.now(); //? e.g. 12:00:00.100
     */
    const now = Date.now();

    const http = context.switchToHttp();

    const request = http.getRequest();
    const response = http.getResponse(); //? access to outgoing response like 200, 201, 400, 401, 404, 500

    const { method, originalUrl, ip, user } = request;

    /**
     * Continue executing...
     * next.handle() returns => Observable<Response>
     * pipe() => Nest responses are built on RxJS Observables.
     * tap(() => {}) When the response finishes, execute this.It doesn't change the response. It only observes it.
     * ${Date.now() - now}ms //? 118ms - 100ms = 18ms
     * GET /favorites //? e.g. GET /favorites 200 14ms user=42 ip=203.xxx.xxx.xxx
     * Public endpoint //? GET /bible/random 200 3ms user=guest ip=::1
     * Authenticated endpoint //? GET /favorites 200 7ms user=cma81fjq200001234abcd ip=::1
     * Failed login //? POST /auth/login 401 18ms user=guest ip=::1
     */
    return next.handle().pipe(
      tap(() => {
        const statusCode = response.statusCode; //? e.g. GET /bible 200

        this.logger.log(
          `${method} ${originalUrl} ${statusCode} ${Date.now() - now}ms user=${user?.userId ?? 'guest'} ip=${ip}`,
        );
      }),
    );
  }
}
