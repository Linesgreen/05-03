import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { User } from '../entites/user';
import { UserOutputType } from '../types/output';

@Injectable()
export class PostgresUserQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  /**
   * Получает пользователя из базы данных по его ID.
   * @param {string} userId - ID пользователя для получения.
   * @returns {UserOutputType | null} Объект пользователя, если найден, или null, если не найден.
   */
  async getUserById(userId: string): Promise<UserOutputType | null> {
    const user = await this.dataSource.query(
      `SELECT id, login, email, "passwordHash", "confirmationCode", "expirationDate","createdAt", "isConfirmed"
        FROM public.users
        WHERE "id" = $1`,
      [userId],
    );
    if (user.length === 0) return null;
    // Формируем объект пользователя с помощью метода fromDbToObject
    // Затем преобразуем его в DTO и возвращаем
    return User.fromDbToInstance(user[0]).toDto();
  }
}
