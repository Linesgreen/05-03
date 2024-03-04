/* eslint-disable no-underscore-dangle */
// noinspection JSVoidFunctionReturnValueUsed

import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { QueryPaginationResult } from '../../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../../common/types/output';
import { PostgresPostQueryRepository } from '../../repositories/post/postgres.post.query.repository';
import { OutputPostType } from '../../types/output';

export class GetAllPostsWithLikeStatusCommand {
  constructor(
    public userId: string | null,
    public sortData: QueryPaginationResult,
  ) {}
}

@CommandHandler(GetAllPostsWithLikeStatusCommand)
export class GetAllPostsWithLikeStatusUseCase implements ICommandHandler<GetAllPostsWithLikeStatusCommand> {
  constructor(protected postgresPostQueryRepository: PostgresPostQueryRepository) {}

  async execute(command: GetAllPostsWithLikeStatusCommand): Promise<PaginationWithItems<OutputPostType>> {
    const { userId, sortData } = command;

    const posts = await this.postgresPostQueryRepository.getPosts(sortData);
    if (!posts?.items?.length) {
      throw new NotFoundException(`Posts not found`);
    }
    return posts;
  }
}
