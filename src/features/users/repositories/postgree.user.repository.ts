// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { User } from '../entites/user';

@Injectable()
export class PostgreeUserRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  /**
   * Создаем пользователя и затем возвращаем добавленный к нему id, который затем вставляем в поле id пользователя
   * @returns нового пользователя с вставленным в него id
   * @param newUser : UsersDocument
   */
  async addUser(newUser: User): Promise<User> {
    const login = newUser.accountData.login;
    const email = newUser.accountData.email;
    const password = newUser.accountData.passwordHash;
    const confirmationCode = newUser.emailConfirmation.confirmationCode;
    const expirationDate = newUser.emailConfirmation.expirationDate.toISOString();
    const createdAt = newUser.accountData.createdAt;
    const isConfirmed = newUser.emailConfirmation.isConfirmed;
    const userId = await this.dataSource.query(
      `INSERT INTO public.users(login, email, "passwordHash", "confirmationCode", "expirationDate","createdAt", "isConfirmed")
             VALUES ('${login}', '${email}',
                     '${password}',
                       '${confirmationCode}', '${expirationDate}', '${createdAt}', ${isConfirmed}) 
              RETURNING id;`,
    );
    //TODO узнать про это
    newUser.id = userId[0].id;
    return newUser;
  }

  async getByLoginOrEmail(logOrEmail: string): Promise<User | null> {
    const user = await this.dataSource.query(
      `SELECT id, login, email, "passwordHash", "confirmationCode", "expirationDate","createdAt", "isConfirmed"
	           FROM public.users
	           WHERE email = '${logOrEmail}' OR login = '${logOrEmail}'`,
    );
    if (user.length === 0) return null;
    const objUser = User.fromDbToObject(user[0]);
    console.log(objUser);
    return objUser;
  }
  async findByConfCode(code: string): Promise<User | null> {
    const user = await this.dataSource.query(
      `SELECT id, login, email, "passwordHash", "confirmationCode", "expirationDate","createdAt", "isConfirmed"
	           FROM public.users
	           WHERE "confirmationCode" = '${code}'`,
    );
    if (user.length === 0) return null;
    const objUser = User.fromDbToObject(user[0]);
    return objUser;
  }
  async updateField(searchField: string, searchValue: string, field: string, value: string | boolean): Promise<void> {
    await this.dataSource.query(
      `UPDATE public.users
             SET "${field}" = '${value}'
             WHERE "${searchField}" = '${searchValue}'`,
    );
  }
}
