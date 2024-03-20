/* eslint-disable no-underscore-dangle */
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result } from '../../../../infrastructure/object-result/objcet-result';
import { Session } from '../../../security/entites/session';
import { PostgresSessionRepository } from '../../../security/repository/session.postgres.repository';
import { AuthService } from '../auth.service';

export class UserLoginCommand {
  constructor(
    public userId: number,
    public ip: string,
    public userAgent: string,
  ) {}
}

@CommandHandler(UserLoginCommand)
export class UserLoginUseCase implements ICommandHandler<UserLoginCommand> {
  constructor(
    protected postgresSessionRepository: PostgresSessionRepository,
    protected authService: AuthService,
  ) {}

  async execute(command: UserLoginCommand): Promise<Result<{ token: string; refreshToken: string }>> {
    const { userId, ip, userAgent } = command;
    const tokenKey = crypto.randomUUID();
    const deviceId = crypto.randomUUID();
    await this.createSession({ userId, deviceId, ip, userAgent, tokenKey });
    const { token, refreshToken } = await this.authService.generateTokenPair(userId.toString(), tokenKey, deviceId);
    return Result.Ok({ token, refreshToken });
  }

  async createSession(sessionData: {
    userId: number;
    deviceId: string;
    ip: string;
    userAgent: string;
    tokenKey: string;
  }): Promise<void> {
    const { userId, deviceId, ip, userAgent, tokenKey } = sessionData;
    const session = new Session(tokenKey, deviceId, userAgent, userId, ip);
    await this.postgresSessionRepository.addSession(session);
  }
}
