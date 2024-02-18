/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(protected jwtService: JwtService) {}
  async generateTokensPair(
    userId: string,
    tokenKey: string,
    deviceId: string,
  ): Promise<{ token: string; refreshToken: string }> {
    const token = await this.createJwt({ userId }, 10);
    const refreshToken = await this.createJwt({ userId, tokenKey, deviceId }, 20);
    return { token, refreshToken };
  }

  async createJwt(
    payload: {
      userId: string;
      tokenKey?: string;
      deviceId?: string;
    },
    expirationTime: number,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, { expiresIn: `${expirationTime}s` });
  }
}
