/* eslint-disable @typescript-eslint/explicit-function-return-type,no-underscore-dangle,@typescript-eslint/ban-ts-comment */
// Набор необходимых импортов
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { QueryPaginationResult } from '../../../../infrastructure/types/query-sort.type';
import { PostgresCommentsQueryRepository } from '../../../comments/repositories/comments/postgres.comments.query.repository';
import { OutputCommentType } from '../../../comments/types/comments/output';
import { PaginationWithItems } from '../../../common/types/output';
import { PostgresPostRepository } from '../../repositories/post/postgres.post.repository';

export class GetCommentsToPostWithLikeStatusCommand {
  constructor(
    public userId: number | null,
    public postId: number,
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
  async execute(
    command: GetCommentsToPostWithLikeStatusCommand,
  ): Promise<Result<PaginationWithItems<OutputCommentType> | string>> {
    const { userId, sortData, postId } = command;

    const postIsExist = await this.checkPostExist(postId);
    if (postIsExist) return Result.Err(ErrorStatus.NOT_FOUND, `Post with id ${postId} not found`);
    const comments = await this.findComments(postId, sortData, userId);
    if (!comments) return Result.Err(ErrorStatus.NOT_FOUND, `Comments not found`);
    return Result.Ok(comments);
  }

  private async checkPostExist(postId: number) {
    const post = await this.postRepository.chekPostIsExist(postId);
    if (!post) return null;
  }

  private async findComments(postId: number, sortData: QueryPaginationResult, userId: number | null) {
    const comments: PaginationWithItems<OutputCommentType> = await this.commentsQueryRepository.getCommentsToPosts(
      sortData,
      postId,
      userId,
    );
    if (comments.items.length === 0) return null;
    return comments;
  }
}
