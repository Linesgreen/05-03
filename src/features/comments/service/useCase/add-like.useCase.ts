import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentLike, createCommentLike } from '../../entites/comment-like';
import { PostgresCommentsQueryRepository } from '../../repositories/comments/postgres.comments.query.repository';
import { CommentsLikesRepository } from '../../repositories/likes/comments-likes.repository';
import { CommentsLikesQueryRepository } from '../../repositories/likes/comments-likes-query.repository';
import { LikeStatusType } from '../../types/comments/input';

export class AddLikeToCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
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

  async execute({ commentId, userId, likeStatus }: AddLikeToCommentCommand): Promise<void> {
    const postIdByComment = await this.postgresCommentsQueryRepository.getPostIdByCommentId(Number(commentId));
    if (!postIdByComment) throw new NotFoundException();

    const userLike: CommentLike | null = await this.commentLikesQueryRepository.getLikeByUserId(
      Number(commentId),
      Number(userId),
    );
    const newLike: createCommentLike = {
      commentId: Number(commentId),
      userId: Number(userId),
      likeStatus: likeStatus,
      postId: postIdByComment,
      createdAt: new Date(),
    };
    if (!userLike) {
      await this.createLike(newLike);
      return;
    }
    // If user's like status is already as expected, no further action needed
    if (likeStatus === userLike.likeStatus) return;
    await this.updateLike(Number(commentId), likeStatus, Number(userId));
  }

  private async createLike(newLike: createCommentLike): Promise<void> {
    await this.commentsLikesRepository.createLike(newLike);
  }

  private async updateLike(commentId: number, likeStatus: LikeStatusType, userId: number): Promise<void> {
    await this.commentsLikesRepository.updateLikeStatus(commentId, userId, likeStatus);
  }
}
