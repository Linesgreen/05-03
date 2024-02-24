// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { User } from '../entites/user';
//TODO узнать
@Injectable()
export class PostgresUserRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  /**
   * Создаем пользователя и затем возвращаем добавленный к нему id, который затем вставляем в поле id пользователя
   * @returns нового пользователя с вставленным в него id
   * @param newUser : UsersDocument
   */
  async addUser(newUser: User): Promise<User> {
    const { login, email, passwordHash, createdAt } = newUser.accountData;
    const { confirmationCode, expirationDate, isConfirmed } = newUser.emailConfirmation;

    const userId = await this.dataSource.query(
      `INSERT INTO public.users(login, email, "passwordHash", "confirmationCode", "expirationDate","createdAt", "isConfirmed")
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
              RETURNING id;`,
      [login, email, passwordHash, confirmationCode, expirationDate.toISOString(), createdAt, isConfirmed],
    );

    // Присваиваем новому пользователю идентификатор, возвращенный из базы данных
    newUser.id = userId[0].id;
    // Возвращаем нового пользователя
    return newUser;
  }
  /**
   * Проверяет существование пользователя по логину или email
   * @param loginOrEmail - Логин или email пользователя
   * @returns true, если пользователь существует, иначе false
   */
  async chekUserIsExist(loginOrEmail: string): Promise<boolean> {
    const chekResult = await this.dataSource.query(
      `SELECT EXISTS(SELECT id FROM public.users
             WHERE email = $1 OR login = $2)`,
      [loginOrEmail, loginOrEmail],
    );
    return chekResult.exists;
  }

  /**
   * Получает пользователя по логину или email
   * @param logOrEmail - Логин или email пользователя
   * @returns Объект пользователя или null, если пользователь не найден
   */
  async getByLoginOrEmail(logOrEmail: string): Promise<User | null> {
    const user = await this.dataSource.query(
      `SELECT id, login, email, "passwordHash", "confirmationCode", "expirationDate","createdAt", "isConfirmed"
             FROM public.users
             WHERE email = $1 OR login = $2`,
      [logOrEmail, logOrEmail],
    );
    if (user.length === 0) return null;
    return User.fromDbToObject(user[0]);
  }
  /**
   * Получает пользователя по confirmation code
   * @param code - Confirmation code
   * @returns Объект пользователя или null, если пользователь не найден
   */
  async findByConfCode(code: string): Promise<User | null> {
    const user = await this.dataSource.query(
      `SELECT id, login, email, "passwordHash", "confirmationCode", "expirationDate","createdAt", "isConfirmed"
             FROM public.users
             WHERE "confirmationCode" = $1`,
      [code],
    );
    if (user.length === 0) return null;
    return User.fromDbToObject(user[0]);
  }
  /**
   * Обновляет поле в таблице users
   * @param searchField - Поле для поиска
   * @param searchValue - Значение для поиска
   * @param field - Поле для обновления
   * @param value - Новое значение
   */
  async updateField(searchField: string, searchValue: string, field: string, value: unknown): Promise<void> {
    await this.dataSource.query(
      `UPDATE public.users
             SET "${field}" = $1
             WHERE "${searchField}" = $2`,
      [value, searchValue],
    );
  }
}
