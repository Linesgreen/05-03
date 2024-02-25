import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { User } from '../entites/user';
import { PostgresUserRepository } from '../repositories/postgres.user.repository';
import { UserRepository } from '../repositories/user.repository';
import { UserCreateModel } from '../types/input';
import { UserOutputType } from '../types/output';

@Injectable()
export class UserService {
  constructor(
    protected usersRepository: UserRepository,
    private postgresUsersRepository: PostgresUserRepository,
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

  async deleteUser(userId: string): Promise<boolean> {
    return this.usersRepository.deleteUserById(userId);
  }
}
