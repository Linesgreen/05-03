import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserQueryRepository } from '../../../users/repositories/user.query.repository';
import { CommentsQueryRepository } from '../../repositories/comments/comments.query.repository';
import { CommentsRepository } from '../../repositories/comments/comments.repository';
import { CommentLikesQueryRepository } from '../../repositories/likes/comment-likes.query.repository';
import { CommentsLikesRepository } from '../../repositories/likes/comments-likes.repository';
import { CommentsLikesDocument } from '../../repositories/likes/likes.schema';
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
    protected commentsQueryRepository: CommentsQueryRepository,
    protected commentLikesQueryRepository: CommentLikesQueryRepository,
    protected commentsRepository: CommentsRepository,
    protected commentsLikesRepository: CommentsLikesRepository,
    protected userRepository: UserQueryRepository,
  ) {}

  async execute({ commentId, userId, likeStatus }: AddLikeToCommentCommand): Promise<void> {
    const user = await this.userRepository.getUserById(userId);
    const targetComment = await this.commentsQueryRepository.getCommentById(commentId);

    if (!targetComment) throw new NotFoundException();
    const userLike: CommentsLikesDocument | null = await this.commentLikesQueryRepository.getLikeByUserId(
      commentId,
      userId,
    );

    if (!userLike) {
      await this.createUserLike(commentId, likeStatus, userId, user!.login, user!.login);
      return;
    }

    if (userLike.likeStatus === likeStatus) {
      return;
    }

    if (userLike.likeStatus === 'None') {
      await this.addUserLike(commentId, likeStatus, userId);
      return;
    }

    switch (likeStatus) {
      case 'Dislike':
      case 'Like':
        await this.switchLikeStatus(commentId, likeStatus, userId);
        break;
      case 'None':
        await this.decreaseLike(commentId, likeStatus, userId, userLike.likeStatus);
        break;
    }
    return;
  }

  async createUserLike(
    commentId: string,
    likeStatus: LikeStatusType,
    userId: string,
    login: string,
    postId: string,
  ): Promise<void> {
    await this.commentsLikesRepository.createLike(commentId, postId, userId, login, likeStatus);
    await this.commentsRepository.addLikes(commentId, likeStatus);
  }

  async addUserLike(commentId: string, likeStatus: LikeStatusType, userId: string): Promise<void> {
    await this.commentsRepository.addLikes(commentId, likeStatus);
    await this.commentsLikesRepository.updateLikeStatus(commentId, userId, likeStatus);
  }

  async switchLikeStatus(commentId: string, likeStatus: LikeStatusType, userId: string): Promise<void> {
    await this.commentsRepository.switchLike(commentId, likeStatus);
    await this.commentsLikesRepository.updateLikeStatus(commentId, userId, likeStatus);
  }

  async decreaseLike(
    commentId: string,
    likeStatus: LikeStatusType,
    userId: string,
    userLike: LikeStatusType,
  ): Promise<void> {
    await this.commentsRepository.decreaseLike(commentId, userLike);
    await this.commentsLikesRepository.updateLikeStatus(commentId, userId, likeStatus);
  }
}
