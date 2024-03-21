import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { CommentLike, createCommentLike } from '../../entites/comment-like';
import { PostgresCommentsQueryRepository } from '../../repositories/comments/postgres.comments.query.repository';
import { CommentsLikesRepository } from '../../repositories/likes/comments-likes.repository';
import { CommentsLikesQueryRepository } from '../../repositories/likes/comments-likes-query.repository';
import { LikeStatusType } from '../../types/comments/input';

export class AddLikeToCommentCommand {
  constructor(
    public commentId: number,
    public userId: number,
    public likeStatus: LikeStatusType,
  ) {}
}

@CommandHandler(AddLikeToCommentCommand)
export class AddLikeToCommentUseCase implements ICommandHandler<AddLikeToCommentCommand> {
  constructor(
    protected postgresCommentsQueryRepository: PostgresCommentsQueryRepository,
    protected commentLikesQueryRepository: CommentsLikesQueryRepository,
    protected commentsLikesRepository: CommentsLikesRepository,
  ) {}

  async execute({ commentId, userId, likeStatus }: AddLikeToCommentCommand): Promise<Result<string>> {
    const postIdByComment = await this.postgresCommentsQueryRepository.getPostIdByCommentId(commentId);
    if (!postIdByComment) return Result.Err(ErrorStatus.NOT_FOUND, `Post for comment ${commentId} not found`);

    const userLike: CommentLike | null = await this.commentLikesQueryRepository.getLikeByUserId(commentId, userId);
    const newLike: createCommentLike = {
      commentId: commentId,
      userId: userId,
      likeStatus: likeStatus,
      postId: postIdByComment,
      createdAt: new Date(),
    };
    if (!userLike) {
      await this.createLike(newLike);
      return Result.Ok('Like created');
    }
    // If user's like status is already as expected, no further action needed
    if (likeStatus === userLike.likeStatus) return Result.Ok('Like status is do not changed');
    await this.updateLike(commentId, likeStatus, userId);
    return Result.Ok('Like updated');
  }

  private async createLike(newLike: createCommentLike): Promise<void> {
    await this.commentsLikesRepository.createLike(newLike);
  }

  private async updateLike(commentId: number, likeStatus: LikeStatusType, userId: number): Promise<void> {
    await this.commentsLikesRepository.updateLikeStatus(commentId, userId, likeStatus);
  }
}
