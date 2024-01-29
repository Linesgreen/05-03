import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { UserCreateType, UserSortData } from '../types/input';
import { UserService } from '../services/userService';
import { UserOutputType } from '../types/output';
import { PaginationWithItems } from '../../common/types/output';
import { UserQueryRepository } from '../repositories/user.query.repository';

@Controller('users')
export class UserController {
  constructor(
    protected readonly userService: UserService,
    protected readonly userQueryRepository: UserQueryRepository,
  ) {}
  @Post('')
  async createUser(@Body() userCreateData: UserCreateType): Promise<UserOutputType> {
    try {
      return await this.userService.createUser(userCreateData);
    } catch (e) {
      throw new HttpException(`not valid input`, HttpStatus.BAD_REQUEST);
    }
  }
  @Get('')
  async getAllUsers(@Query() queryData: UserSortData): Promise<PaginationWithItems<UserOutputType>> {
    return await this.userQueryRepository.findAll(queryData);
  }
  @Delete(':userId')
  @HttpCode(204)
  async deleteUser(@Param('userId') userId: string) {
    console.log(userId);
    const deleteResult = await this.userService.deleteUser(userId);
    if (!deleteResult) throw new HttpException(`user do not exist`, HttpStatus.NOT_FOUND);
    return;
  }
}
