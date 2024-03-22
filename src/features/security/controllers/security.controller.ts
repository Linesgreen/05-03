import { Controller, Delete, Get, HttpCode, NotFoundException, Param, UseGuards } from '@nestjs/common';

import { CookieJwtGuard } from '../../../infrastructure/guards/jwt-cookie.guard';
import { ErrorResulter } from '../../../infrastructure/object-result/objcet-result';
import { CurrentSession } from '../../auth/decorators/userId-sessionKey.decorator';
import { SessionOutputType } from '../../auth/types/output';
import { SessionOwnerGuard } from '../guards/session-owner.guard';
import { SessionPostgresQueryRepository } from '../repository/session.postgres.query.repository';
import { PostgresSessionRepository } from '../repository/session.postgres.repository';
import { SessionService } from '../service/session.service';

@Controller('security')
export class SecurityController {
  constructor(
    private sessionPostgresQueryRepository: SessionPostgresQueryRepository,
    private postgresSessionRepository: PostgresSessionRepository,
    private sessionService: SessionService,
  ) {}

  @UseGuards(CookieJwtGuard)
  @Get('devices')
  @HttpCode(200)
  async getSessions(
    @CurrentSession() { userId }: { userId: string; tokenKey: string },
  ): Promise<SessionOutputType[] | null> {
    const sessions = await this.sessionPostgresQueryRepository.getUserSessions(Number(userId));
    if (!sessions) throw new NotFoundException();
    return sessions;
  }

  @UseGuards(CookieJwtGuard, SessionOwnerGuard)
  @Delete('devices/:id')
  @HttpCode(204)
  async terminateCurrentSession(
    @CurrentSession() { userId }: { userId: string; tokenKey: string },
    @Param('id') deviceId: string,
  ): Promise<void> {
    const result = await this.sessionService.terminateSessionByDeviceIdAndUserId(deviceId, Number(userId));
    if (result.isFailure()) ErrorResulter.proccesError(result);
  }

  @UseGuards(CookieJwtGuard)
  @Delete('devices')
  @HttpCode(204)
  async terminateOtherSession(
    @CurrentSession() { userId, tokenKey }: { userId: string; tokenKey: string },
  ): Promise<void> {
    const result = await this.sessionService.terminateOtherSession(userId, tokenKey);
    if (result.isFailure()) ErrorResulter.proccesError(result);
  }
}
