/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AbstractRepository } from '../../../infrastructure/repositories/abstract.repository';
import { SessionOutputType } from '../../auth/types/output';
import { Session } from '../entites/session';
import { SessionPgDb } from '../types/output';

@Injectable()
export class SessionPostgresQueryRepository extends AbstractRepository<SessionPgDb> {
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }

  async getUserSessions(userId: number): Promise<SessionOutputType[] | null> {
    const field = ['id', 'tokenKey', 'issuedDate', 'expiredDate', 'title', 'ip', 'deviceId', 'userId'];
    const session = await this.getByFields('sessions', field, { userId: userId, active: true });
    if (!session) return null;
    return session.map((s) => Session.fromDbToInstance(s).toDto());
  }
}
