import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/auth.interface';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'JWT_SECRET',
    });
  }

  validate(payload: JwtPayload) {
    const userData = payload.sub;
    return { userId: userData };
    /**
     * const user = await this.usersService.findById(payload.sub);

        if (!user) {
          throw new UnauthorizedException();
        }

        return user;
     */
  }
}
