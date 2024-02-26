import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Session } from '../../../security/entites/session';
import { PostgresSessionRepository } from '../../../security/repository/session.postgres.repository';
import { AuthService } from '../auth.service';

export class RefreshTokenCommand {
  constructor(
    public userId: string,
    public tokenKey: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    protected postgresSessionRepository: PostgresSessionRepository,
    protected authService: AuthService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<{ token: string; refreshToken: string }> {
    const { userId, tokenKey } = command;
    const session = await this.findSession(userId, tokenKey);
    const newTokenKey = crypto.randomUUID();
    const deviceId = session.deviceId;
    await this.updateAndSaveSession(session, newTokenKey);
    return this.authService.generateTokenPair(userId, newTokenKey, deviceId);
  }

  async findSession(userId: string, tokenKey: string): Promise<Session> {
    const session = await this.postgresSessionRepository.getByUserIdAndTokenKey(Number(userId), tokenKey);
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async updateAndSaveSession(session: Session, newTokenKey: string): Promise<void> {
    session.updateSession(newTokenKey);
    const { id, issuedDate, expiredDate, tokenKey } = session;
    await this.postgresSessionRepository.updateSessionFields('id', id, { issuedDate, tokenKey, expiredDate });
  }
}
