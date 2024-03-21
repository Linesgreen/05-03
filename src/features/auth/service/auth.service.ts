/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { configService } from '../../../settings/config.service';

@Injectable()
export class AuthService {
  constructor(protected jwtService: JwtService) {}
  async generateTokenPair(
    userId: string,
    tokenKey: string,
    deviceId: string,
  ): Promise<{ token: string; refreshToken: string }> {
    const tokenExpirationTime = configService.getTokenExp();
    const refreshTokenExpirationTime = configService.getRefreshTokenExp();
    const token = await this.createJwt({ userId }, tokenExpirationTime);
    const refreshToken = await this.createJwt({ userId, tokenKey, deviceId }, refreshTokenExpirationTime);
    return { token, refreshToken };
  }

  async createJwt(
    payload: {
      [key: string]: string;
    },
    expirationTimeInSeconds: string,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, { expiresIn: `${expirationTimeInSeconds}s` });
  }
}
