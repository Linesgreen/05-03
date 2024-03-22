/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';

import { ErrorStatus, Result } from '../../../infrastructure/object-result/objcet-result';
import { PostgresSessionRepository } from '../repository/session.postgres.repository';

@Injectable()
export class SessionService {
  constructor(protected postgresSessionRepository: PostgresSessionRepository) {}

  async terminateCurrentSession(userId: string, tokenKey: string): Promise<Result<string>> {
    await this.postgresSessionRepository.terminateSessionByTokenKey(tokenKey);
    const chekResult = await this.postgresSessionRepository.chekSessionIsExist(Number(userId), tokenKey);
    if (chekResult) return Result.Err(ErrorStatus.SERVER_ERROR, 'Session not terminated');
    return Result.Ok('Session terminated');
  }
  async terminateAllSession(userId: string): Promise<void> {
    await this.postgresSessionRepository.terminateAllSessionByUserId(userId);
  }
  async terminateSessionByDeviceIdAndUserId(deviceId: string, userId: number): Promise<Result<string>> {
    await this.postgresSessionRepository.terminateSessionByDeviceIdAndUserId(deviceId, userId);
    return Result.Ok(`Session ${deviceId} terminated`);
  }
  async terminateOtherSession(userId: string, tokenKey: string): Promise<Result<string>> {
    await this.postgresSessionRepository.terminateOtherSession(userId, tokenKey);
    return Result.Ok(`other sessions terminated`);
  }
}
