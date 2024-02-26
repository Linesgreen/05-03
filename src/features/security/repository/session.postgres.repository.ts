/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AbstractRepository } from '../../../infrastructure/repositories/abstract.repository';
import { Session } from '../entites/session';
import { SessionPgDb } from '../types/output';

//TODO узнать
@Injectable()
export class PostgresSessionRepository extends AbstractRepository<SessionPgDb> {
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }

  async addSession(newSession: Session): Promise<void> {
    const { tokenKey, issuedDate, expiredDate, title, userId, ip, deviceId } = newSession;
    const entity = { tokenKey, issuedDate, expiredDate, title, userId, ip, deviceId };
    await this.add('sessions', entity);
  }
  /**
   * Проверяет существование пользователя по логину или email
   * @returns true, если сессия существует и активна, иначе false
   * @param userId
   * @param tokenKey
   */
  async chekSessionIsExist(userId: number, tokenKey: string): Promise<boolean> {
    const conditions = { userId, tokenKey, active: true };
    return this.checkIfExistsByFields('sessions', conditions);
  }

  /**
   * @returns null или сессию
   * @param userId
   * @param tokenKey
   */
  async getByUserIdAndTokenKey(userId: number, tokenKey: string): Promise<Session | null> {
    const session = await this.dataSource.query(
      `SELECT id, "tokenKey", "issuedDate", "expiredDate", title, "userId", ip, "deviceId"
             FROM public.sessions
             WHERE "userId" = $1 AND "tokenKey" = $2`,
      [userId, tokenKey],
    );
    if (session.length === 0) return null;
    console.log(Session.fromDbToObject(session[0]));
    return Session.fromDbToObject(session[0]);
  }

  async updateSessionFields(
    searchField: string,
    searchValue: string | number,
    fieldsToUpdate: Record<string, unknown>,
  ): Promise<void> {
    const tableName = 'sessions'; // Указываем tableName внутри метода
    // Call the parent class method
    await this.updateFields(tableName, searchField, searchValue, fieldsToUpdate);
  }
}
