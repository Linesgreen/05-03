/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-function-return-type */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { SessionRepository } from '../repository/session-repository';
import { jwtConstants } from '../service/constants';

@Injectable()
export class CookieJwtStrategy extends PassportStrategy(Strategy, 'jwt-cookie') {
  constructor(private sessionRepository: SessionRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies?.['refreshToken'];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    const sessionId = await this.sessionRepository.sessionIsExist(payload.userId, payload.tokenKey);
    if (!sessionId) throw new ForbiddenException();
    return { id: payload.userId, tokenKey: payload.tokenKey };
  }
}
