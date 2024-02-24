/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-function-return-type */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PostgresUserQueryRepository } from '../../features/users/repositories/postgres.user.query.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private postgresUserQueryRepository: PostgresUserQueryRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.postgresUserQueryRepository.getUserById(payload.userId);
    if (!user) throw new ForbiddenException();
    return { id: payload.userId };
  }
}
