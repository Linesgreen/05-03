import { Controller, Delete, Get, HttpCode, NotFoundException, Param, UseGuards } from '@nestjs/common';

import { CookieJwtGuard } from '../../../infrastructure/guards/jwt-cookie.guard';
import { CurrentSession } from '../../auth/decorators/userId-sessionKey.decorator';
import { SessionOutputType } from '../../auth/types/output';
import { SessionOwnerGuard } from '../guards/session-owner.guard';
import { SessionPostgresQueryRepository } from '../repository/session.postgres.query.repository';
import { PostgresSessionRepository } from '../repository/session.postgres.repository';

@Controller('security')
export class SecurityController {
  constructor(
    private sessionPostgresQueryRepository: SessionPostgresQueryRepository,
    private postgresSessionRepository: PostgresSessionRepository,
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
    await this.postgresSessionRepository.terminateSessionByDeviceIdAndUserId(deviceId, Number(userId));
  }

  @UseGuards(CookieJwtGuard)
  @Delete('devices')
  @HttpCode(204)
  async terminateOtherSession(
    @CurrentSession() { userId, tokenKey }: { userId: string; tokenKey: string },
  ): Promise<void> {
    await this.postgresSessionRepository.terminateOtherSession(userId, tokenKey);
  }
}
