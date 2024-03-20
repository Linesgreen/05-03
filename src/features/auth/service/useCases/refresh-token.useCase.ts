import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { Session } from '../../../security/entites/session';
import { PostgresSessionRepository } from '../../../security/repository/session.postgres.repository';
import { AuthService } from '../auth.service';

export class RefreshTokenCommand {
  constructor(
    public userId: string,
    public tokenKey: string,
  ) {}
}
//TODO интерфейс
@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    protected postgresSessionRepository: PostgresSessionRepository,
    protected authService: AuthService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<Result<{ token: string; refreshToken: string } | string>> {
    const { userId, tokenKey } = command;

    const session = await this.findSession(userId, tokenKey);
    if (!session) return Result.Err(ErrorStatus.NOT_FOUND, 'Session not found');

    const deviceId = session.deviceId;
    const newTokenKey = crypto.randomUUID();

    await this.updateAndSaveSession(session, newTokenKey);
    const { token, refreshToken } = await this.authService.generateTokenPair(userId, newTokenKey, deviceId);
    return Result.Ok({ token, refreshToken });
  }

  async findSession(userId: string, tokenKey: string): Promise<Session | null> {
    const session = await this.postgresSessionRepository.getByUserIdAndTokenKey(Number(userId), tokenKey);

    if (!session) null;
    //throw new NotFoundException('Session not found');

    return session;
  }

  async updateAndSaveSession(session: Session, newTokenKey: string): Promise<void> {
    session.updateSession(newTokenKey);

    const { id, issuedDate, expiredDate, tokenKey } = session;

    await this.postgresSessionRepository.updateSessionFields('id', id, { issuedDate, tokenKey, expiredDate });
  }
}
