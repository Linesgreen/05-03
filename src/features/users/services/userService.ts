import { Injectable } from '@nestjs/common';
import { UserCreateType, UserDb } from '../types/input';
import * as bcrypt from 'bcryptjs';
import { UsersRepository } from '../repositories/users.repository';
import { UsersDocument } from '../repositories/users-schema';
import { UserOutputType } from '../types/output';

@Injectable()
export class UserService {
  constructor(protected usersRepository: UsersRepository) {}
  async createUser(userData: UserCreateType): Promise<UserOutputType> {
    const passwordHash = await bcrypt.hash(userData.password, 12);
    const newUser = new UserDb(userData, passwordHash);
    const newUserInDb: UsersDocument = await this.usersRepository.addUser(newUser);
    return newUserInDb.toDto();
  }

  async deleteUser(userId: string) {
    return await this.usersRepository.deleteUserById(userId);
  }
}
