/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Session } from '../entites/session';

//TODO узнать
@Injectable()
export class PostgresSessionRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  /**
   * Создаем пользователя и затем возвращаем добавленный к нему id, который затем вставляем в поле id пользователя
   * @returns нового пользователя с вставленным в него id
   * @param newSession
   */
  async addSession(newSession: Session): Promise<void> {
    const { tokenKey, issuedDate, expiredDate, title, userId, ip, deviceId } = newSession;

    await this.dataSource.query(
      `INSERT INTO public.sessions("tokenKey", "issuedDate", "expiredDate", title, "userId", ip, "deviceId")
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
              RETURNING id;`,
      [tokenKey, issuedDate.toISOString(), expiredDate.toISOString(), title, userId, ip, deviceId],
    );
  }
  /**
   * Проверяет существование пользователя по логину или email
   * @returns true, если пользователь существует, иначе false
   * @param userId
   * @param tokenKey
   */
  async chekSessionIsExist(userId: number, tokenKey: string): Promise<boolean> {
    const chekResult = await this.dataSource.query(
      `SELECT EXISTS(SELECT id FROM public.sessions
                     WHERE "userId" = $1 and "tokenKey" = $2) as exists`,
      [userId, tokenKey],
    );
    return chekResult[0].exists;
  }

  /**
   * Получает пользователя по логину или email
   * @returns Объект пользователя или null, если пользователь не найден
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

  /**
   * Обновляет указанные поля для пользователя в базе данных.
   * так же можно обновить только одно поле
   * @param searchField - Поле для поиска пользователя.
   * @param searchValue - Значение поля для поиска пользователя.
   * @param fieldsToUpdate - Объект с полями для обновления и их значениями.
   * @returns Promise<void>
   */
  async updateFields(
    searchField: string,
    searchValue: string | number,
    fieldsToUpdate: Record<string, unknown>,
  ): Promise<void> {
    // Входные данные: { status: 'active', role: 'admin' }

    // entries = [['status', 'active'], ['role', 'admin']]
    const entries: [string, unknown][] = Object.entries(fieldsToUpdate);

    // setFields = '"status" = $2,"role" = $3'
    const setFields: string = entries.map(([key, value], index) => `"${key}" = $${index + 2}`).join(',');

    // values = ['userId123(searchField)', 'active', 'admin']
    const values: (string | unknown)[] = [searchValue, ...entries.map(([, value]) => value)];

    // Выполняем запрос к базе данных
    await this.dataSource.query(
      `UPDATE public.sessions
         SET ${setFields}
         WHERE "${searchField}" = $1`,
      values,
    );
  }
}
