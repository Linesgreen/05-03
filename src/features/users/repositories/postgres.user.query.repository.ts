import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../common/types/output';
import { User } from '../entites/user';
import { UserOutputType } from '../types/output';

@Injectable()
export class PostgresUserQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getUserById(userId: string): Promise<UserOutputType | null> {
    const user = await this.dataSource.query(
      `SELECT id, login, email, "passwordHash", "confirmationCode", "expirationDate","createdAt", "isConfirmed"
        FROM public.users
        WHERE "id" = $1`,
      [userId],
    );
    if (user.length === 0) return null;
    return User.fromDbToInstance(user[0]).toDto();
  }

  async getAll(sortData: QueryPaginationResult): Promise<PaginationWithItems<UserOutputType>> {
    const serachLoginTerm = sortData.searchLoginTerm ?? '';
    const searchEmailTerm = sortData.searchEmailTerm ?? '';

    const isText = await this.isTextColumn('users', sortData.sortBy);
    console.log(isText);
    const sortByType = isText ? `LOWER("${sortData.sortBy}")` : `"${sortData.sortBy}"`;
    console.log(sortByType);
    const users = await this.dataSource.query(
      `SELECT id, login, email, "passwordHash", "confirmationCode", "expirationDate","createdAt", "isConfirmed"
       FROM public.users
       WHERE (login ILIKE '%${serachLoginTerm}%' OR email ILIKE '%${searchEmailTerm}%') AND "active" = true
       ORDER BY "${sortData.sortBy}" ${sortData.sortDirection}
       LIMIT ${sortData.pageSize} OFFSET ${(sortData.pageNumber - 1) * sortData.pageSize}
      `,
    );

    const allDtoUsers: UserOutputType[] = users.map((user) => User.fromDbToInstance(user).toDto());
    const totalCount = await this.dataSource.query(`
      SELECT COUNT(id) FROM public.users WHERE (login ILIKE '%${serachLoginTerm}%' OR email ILIKE '%${searchEmailTerm}%') AND "active" = true
    `);

    return new PaginationWithItems(+sortData.pageNumber, +sortData.pageSize, Number(totalCount[0].count), allDtoUsers);
  }

  private async isTextColumn(tableName: string, columnName: string): Promise<boolean> {
    const columnType = await this.getColumnType(tableName, columnName);
    return columnType === 'text' || columnType === 'character varying';
  }

  private async getColumnType(tableName: string, columnName: string): Promise<string> {
    const query = `
      SELECT data_type
      FROM information_schema.columns
      WHERE table_name = '${tableName}' AND column_name = '${columnName}'
    `;
    const result = await this.dataSource.query(query);
    if (result.length > 0) {
      return result[0].data_type;
    } else {
      throw new Error('Column not found');
    }
  }
}
