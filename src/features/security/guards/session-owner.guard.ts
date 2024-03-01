import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { Session } from '../entites/session';
import { PostgresSessionRepository } from '../repository/session.postgres.repository';

// Custom guard
// https://docs.nestjs.com/guards
@Injectable()
export class SessionOwnerGuard implements CanActivate {
  constructor(private postgresSessionRepository: PostgresSessionRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const deviceId = request.params.id;
    const userId = request.user.id;
    await this.chekIsUUID(deviceId);
    const targetSession: Session = await this.getSession(deviceId);
    return this.chekCredentials(targetSession, userId);
  }
  async getSession(deviceId: string): Promise<Session> {
    const session = await this.postgresSessionRepository.getByDeviceId(deviceId);
    if (!session) throw new NotFoundException();
    return session;
  }
  async chekCredentials(session: Session, userId: string): Promise<boolean> {
    if (session.userId !== Number(userId)) throw new ForbiddenException();
    return true;
  }
  async chekIsUUID(id: string): Promise<void> {
    if (id.match(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/)) {
    } else {
      throw new NotFoundException();
    }
  }
}
