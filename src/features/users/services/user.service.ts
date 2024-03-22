import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { ErrorStatus, Result } from '../../../infrastructure/object-result/objcet-result';
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
  async createUserToDto(userData: UserCreateModel): Promise<Result<UserOutputType>> {
    const newUserInDb = await this.createUser(userData);
    const user = newUserInDb.toDto();
    return Result.Ok(user);
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

  async deleteUser(userId: string): Promise<Result<string>> {
    const userIsExist = await this.postgresUsersRepository.chekUserIsExistByUserId(userId);
    if (!userIsExist) return Result.Err(ErrorStatus.NOT_FOUND, `User ${userId} not found`);
    //Деактивируем все сессии пользователя
    await this.sessionService.terminateAllSession(userId);
    //Отмечаем пользователя как удаленного
    await this.postgresUsersRepository.deleteById(userId);
    return Result.Ok(`User ${userId} deleted`);
  }
}
