import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UsersDocument } from './users-schema';
import { Model } from 'mongoose';
import { UserDb } from '../types/input';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: Model<UsersDocument>,
  ) {}
  /**
   * @returns id созданного блога
   * @param newUser : UsersDocument
   */
  async addUser(newUser: UserDb): Promise<UsersDocument> {
    const newUserToDb = new this.UserModel(newUser);
    await newUserToDb.save();
    return newUserToDb;
  }

  async deleteUserById(userId: string) {
    const deleteResult = await this.UserModel.findByIdAndDelete(userId);
    return !!deleteResult;
  }
}
