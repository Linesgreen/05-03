/* eslint-disable no-underscore-dangle */
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Session } from '../../../security/entites/session';
import { PostgresSessionRepository } from '../../../security/repository/session.postgres.repository';
import { AuthService } from '../auth.service';

export class UserLoginCommand {
  constructor(
    public userId: string,
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

  async execute(command: UserLoginCommand): Promise<{ token: string; refreshToken: string }> {
    const { userId, ip, userAgent } = command;
    const tokenKey = crypto.randomUUID();
    const deviceId = crypto.randomUUID();
    await this.createSession(Number(userId), deviceId, ip, userAgent, tokenKey);
    return this.authService.generateTokenPair(userId, tokenKey, deviceId);
  }

  async createSession(
    userId: number,
    deviceId: string,
    ip: string,
    userAgent: string,
    tokenKey: string,
  ): Promise<void> {
    const session = new Session(tokenKey, deviceId, userAgent, userId, ip);
    await this.postgresSessionRepository.addSession(session);
  }
}
