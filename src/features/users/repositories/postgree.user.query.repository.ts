import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UserOutputType } from '../types/output';

@Injectable()
export class PostgreeUserQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getUserById(userId: string): Promise<UserOutputType | null> {
    const user = await this.dataSource;
    console.log(user);
    return null; //user.toDto();
  }
}
