import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.secret, 
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    if(!payload) {
      throw new UnauthorizedException('Invalid token or token expired');
    }

    // // check business logic permission for register
    // if(!payload.permissionList.some(permission => permission.page === 'user')) throw new UnauthorizedException('you don\'t have permission')

    return { id: payload.sub, username: payload.username, permissionList: payload.permissionList };
  }
}
