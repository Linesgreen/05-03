import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { SessionService } from '../../security/service/session.service';
import { User } from '../entites/user';
import { PostgresUserRepository } from '../repositories/postgres.user.repository';
import { UserCreateModel } from '../types/input';
import { UserOutputType } from '../types/output';

@Injectable()
export class UserService {
  constructor(
    private postgresUsersRepository: PostgresUserRepository,
    private sessionService: SessionService,
  ) {}
  async createUserToDto(userData: UserCreateModel): Promise<UserOutputType> {
    const newUserInDb = await this.createUser(userData);
    return newUserInDb.toDto();
  }

  async createUser(userData: UserCreateModel): Promise<User> {
    const passwordHash = await bcrypt.hash(userData.password, 12);
    const newUser: User = new User(userData, passwordHash);
    return this.postgresUsersRepository.addUser(newUser);
  }

  async checkCredentials(loginOrEmail: string, password: string): Promise<User | null> {
    const user: User | null = await this.postgresUsersRepository.getByLoginOrEmail(loginOrEmail);
    if (user && (await bcrypt.compare(password, user.accountData.passwordHash))) {
      return user;
    }
    return null;
  }

  async deleteUser(userId: string): Promise<void> {
    const chekUserIsExist = await this.postgresUsersRepository.chekUserIsExistByUserId(userId);
    if (!chekUserIsExist) throw new HttpException(`user do not exist`, HttpStatus.NOT_FOUND);
    //Деактивируем все сессии пользователя
    await this.sessionService.terminateAllSession(userId);
    //Отмечаем пользователя как удаленного
    await this.postgresUsersRepository.deleteById(userId);
  }
}
