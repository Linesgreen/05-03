/* eslint-disable no-underscore-dangle */
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SessionDb } from '../../repository/seesion.schema';
import { SessionRepository } from '../../repository/session-repository';
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
    protected sessionRepository: SessionRepository,
    protected authService: AuthService,
  ) {}

  async execute(command: UserLoginCommand): Promise<{ token: string; refreshToken: string }> {
    const { userId, ip, userAgent } = command;
    const tokenKey = crypto.randomUUID();
    const deviceId = crypto.randomUUID();
    await this.createSession(userId, deviceId, ip, userAgent, tokenKey);
    return this.authService.generateTokensPair(userId, tokenKey, deviceId);
  }

  async createSession(
    userId: string,
    deviceId: string,
    ip: string,
    userAgent: string,
    tokenKey: string,
  ): Promise<void> {
    const session = new SessionDb(tokenKey, deviceId, userAgent, userId, ip);
    await this.sessionRepository.addSession(session);
  }
}
