/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AbstractRepository } from '../../../infrastructure/repositories/abstract.repository';
import { User } from '../entites/user';
import { UserPgDb } from '../types/output';

@Injectable()
export class PostgresUserRepository extends AbstractRepository<UserPgDb> {
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }
  /**
   * Создаем пользователя и затем возвращаем добавленный к нему id, который затем вставляем в поле id пользователя
   * @returns нового пользователя с вставленным в него id
   * @param newUser : User
   */
  async addUser(newUser: User): Promise<User> {
    const { login, email, passwordHash, createdAt } = newUser.accountData;
    const { confirmationCode, expirationDate, isConfirmed } = newUser.emailConfirmation;
    const entity = {
      login,
      email,
      passwordHash,
      createdAt,
      confirmationCode,
      expirationDate,
      isConfirmed,
    };
    const userInDb = await this.add('users', entity);
    // Присваиваем новому пользователю идентификатор, возвращенный из базы данных
    newUser.id = userInDb[0].id;
    return newUser;
  }

  /**
   * Проверяет существование пользователя по логину или email
   * @param loginOrEmail - Логин или email пользователя
   * @returns true, если пользователь существует, иначе false
   */
  async chekUserIsExistByLoginOrEmail(loginOrEmail: string): Promise<boolean> {
    const chekResult = await this.dataSource.query(
      `SELECT EXISTS(SELECT id FROM public.users
                     WHERE (email = $1 OR login = $1) AND active = true) as exists`,
      [loginOrEmail],
    );
    return chekResult[0].exists;
  }
  /**
   * Проверяет существование пользователя по логину или email
   * @returns true, если пользователь существует, иначе false
   * @param userId
   */
  async chekUserIsExistByUserId(userId: string): Promise<boolean> {
    return this.checkIfExistsByFields('users', { id: userId, active: true });
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
             WHERE email = $1 OR login = $1`,
      [logOrEmail],
    );
    if (user.length === 0) return null;
    return User.fromDbToInstance(user[0]);
  }
  /**
   * Получает пользователя по confirmation code
   * @param code - Confirmation code
   * @returns Объект пользователя или null, если пользователь не найден
   */
  async findByConfCode(code: string): Promise<User | null> {
    const fieldsToSelect = [
      'id',
      'login',
      'email',
      'passwordHash',
      'confirmationCode',
      'expirationDate',
      'createdAt',
      'isConfirmed',
    ];
    const tableName = 'users';
    const foundedUser = await this.getByField(tableName, fieldsToSelect, 'confirmationCode', code);
    if (!foundedUser) return null;
    return User.fromDbToInstance(foundedUser[0]);
  }
  /**
   * Получает пользователя из базы данных по его ID.
   * @param {string} userId - ID пользователя для получения.
   * @returns {User | null} Объект пользователя, если найден, или null, если не найден.
   */
  async findUserById(userId: string): Promise<User | null> {
    const fieldsToSelect = [
      'id',
      'login',
      'email',
      'passwordHash',
      'confirmationCode',
      'expirationDate',
      'createdAt',
      'isConfirmed',
    ];
    const tableName = 'users';
    const foundedUser = await this.getByField(tableName, fieldsToSelect, 'id', userId);
    if (!foundedUser) return null;
    return User.fromDbToInstance(foundedUser[0]);
  }
  /**
   * Обновляет указанные поля для пользователя в базе данных.
   * так же можно обновить только одно поле
   * @param searchField - Поле для поиска пользователя.
   * @param searchValue - Значение поля для поиска пользователя.
   * @param fieldsToUpdate - Объект с полями для обновления и их значениями.
   * @returns Promise<void>
   */
  async updateUserFields(
    searchField: string,
    searchValue: string,
    fieldsToUpdate: Record<string, unknown>,
  ): Promise<void> {
    const tableName = 'users';
    // Call the parent class method
    await this.updateFields(tableName, searchField, searchValue, fieldsToUpdate);
  }
  async deleteById(id: string): Promise<void> {
    const tableName = 'users';
    await this.updateFields(tableName, 'id', id, { active: false });
  }
}
