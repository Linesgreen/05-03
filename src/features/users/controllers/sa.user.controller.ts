import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';

import { QueryPaginationPipe } from '../../../infrastructure/decorators/transform/query-pagination.pipe';
import { AuthGuard } from '../../../infrastructure/guards/auth-basic.guard';
import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../common/types/output';
import { PostgresUserQueryRepository } from '../repositories/postgres.user.query.repository';
import { UserService } from '../services/user.service';
import { UserCreateModel } from '../types/input';
import { UserOutputType } from '../types/output';

@Controller('sa/users')
@UseGuards(AuthGuard)
export class SaUserController {
  constructor(
    protected readonly userService: UserService,
    protected readonly postsQueryRepository: PostgresUserQueryRepository,
  ) {}
  @Post('')
  @HttpCode(201)
  async createUser(@Body() userCreateData: UserCreateModel): Promise<UserOutputType> {
    return this.userService.createUserToDto(userCreateData);
  }
  @Get('')
  async getAllUsers(
    @Query(QueryPaginationPipe) queryData: QueryPaginationResult,
  ): Promise<PaginationWithItems<UserOutputType>> {
    return this.postsQueryRepository.getAll(queryData);
  }
  @Delete(':userId')
  @HttpCode(204)
  async deleteUser(@Param('userId') userId: string): Promise<void> {
    return this.userService.deleteUser(userId);
  }
}
