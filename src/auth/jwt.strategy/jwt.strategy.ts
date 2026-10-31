import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/auth.interface';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        //? Tries to extract from cookie first (matches Flutter / web clients frontend fetch/axios request)
        (request: Request): string | null => {
          //? Check if cookies exist and access them safely
          const cookies = request?.cookies as Record<
            string,
            string | undefined
          >;
          if (cookies && typeof cookies['access_token'] === 'string') {
            return cookies['access_token'];
          }
          return null;
        },
        //? Fallback to standard Bearer token header just in case other routes use it (Used by Chrome Extension)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // secretOrKey: process.env.JWT_SECRET!,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    const userData = payload.sub;
    const userEmail = payload.email;
    // console.log('JWT payload:', payload);
    return { userId: userData, email: userEmail };
    /**
     * const user = await this.usersService.findById(payload.sub);

        if (!user) {
          throw new UnauthorizedException();
        }

        return user;
     */
  }
}
