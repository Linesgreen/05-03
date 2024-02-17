/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-function-return-type */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserQueryRepository } from '../../users/repositories/user.query.repository';
import { jwtConstants } from '../service/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userQueryRepository: UserQueryRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    const user = await this.userQueryRepository.getUserById(payload.userId);
    if (!user) throw new ForbiddenException();
    console.log(payload);
    return { id: payload.userId };
  }
}
