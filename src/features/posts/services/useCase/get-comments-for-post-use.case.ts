/* eslint-disable @typescript-eslint/explicit-function-return-type,no-underscore-dangle,@typescript-eslint/ban-ts-comment */
// Набор необходимых импортов
import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { QueryPaginationResult } from '../../../../infrastructure/types/query-sort.type';
import { PostgresCommentsQueryRepository } from '../../../comments/repositories/comments/postgres.comments.query.repository';
import { OutputCommentType } from '../../../comments/types/comments/output';
import { PaginationWithItems } from '../../../common/types/output';
import { PostgresPostRepository } from '../../repositories/post/postgres.post.repository';

export class GetCommentsToPostWithLikeStatusCommand {
  constructor(
    public userId: string | null,
    public postId: string,
    public sortData: QueryPaginationResult,
  ) {}
}

@CommandHandler(GetCommentsToPostWithLikeStatusCommand)
export class GetCommentsForPostUseCase implements ICommandHandler<GetCommentsToPostWithLikeStatusCommand> {
  constructor(
    protected postRepository: PostgresPostRepository,
    protected commentsQueryRepository: PostgresCommentsQueryRepository,
  ) {}
  // @ts-ignore
  async execute(command: GetCommentsToPostWithLikeStatusCommand): Promise<PaginationWithItems<OutputCommentType>> {
    const { userId, sortData, postId } = command;

    await this.checkPostExist(postId);
    const comments = await this.findComments(postId, sortData, userId);
    return comments;
  }

  private async checkPostExist(postId: string) {
    const post = await this.postRepository.chekPostIsExist(Number(postId));
    if (!post) throw new NotFoundException(`Post not found`);
  }

  private async findComments(postId: string, sortData: QueryPaginationResult, userId: string | null) {
    const comments: PaginationWithItems<OutputCommentType> = await this.commentsQueryRepository.getCommentsToPosts(
      sortData,
      Number(postId),
      Number(userId),
    );
    if (comments.items.length === 0) throw new NotFoundException(`Comments not found`);
    return comments;
  }
}
