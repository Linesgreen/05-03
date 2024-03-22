/* eslint-disable no-underscore-dangle */
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { LikeStatusType } from '../../../comments/types/comments/input';
import { createPostLike, PostLike } from '../../entites/like';
import { PostLikesQueryRepository } from '../../repositories/likes/post-likes.query.repository';
import { PostLikesRepository } from '../../repositories/likes/post-likes.repository';
import { PostgresPostQueryRepository } from '../../repositories/post/postgres.post.query.repository';

export class AddLikeToPostCommand {
  constructor(
    public postId: number,
    public userId: number,
    public likeStatus: LikeStatusType,
  ) {}
}

@CommandHandler(AddLikeToPostCommand)
export class AddLikeToPostUseCase implements ICommandHandler<AddLikeToPostCommand> {
  constructor(
    protected postLikesQueryRepository: PostLikesQueryRepository,
    protected postLikesRepository: PostLikesRepository,
    protected postgresPostQueryRepository: PostgresPostQueryRepository,
  ) {}

  async execute({ postId, userId, likeStatus }: AddLikeToPostCommand): Promise<Result<string>> {
    const targetPost = await this.postgresPostQueryRepository.getPostById(postId);
    if (!targetPost) return Result.Err(ErrorStatus.NOT_FOUND, 'post not found');

    const userLike: PostLike | null = await this.postLikesQueryRepository.getLikeByUserId(postId, userId);

    if (!userLike) {
      const newLike: createPostLike = {
        postId: postId,
        blogId: Number(targetPost.blogId),
        userId: userId,
        likeStatus: likeStatus,
        createdAt: new Date(),
      };
      await this.createLike(newLike);
      return Result.Ok('Like created');
    }

    // If user's like status is already as expected, no further action needed
    if (likeStatus === userLike.likeStatus) return Result.Ok('Like status is do not changed');
    await this.updateLike(postId, likeStatus, userId);
    return Result.Ok('Like updated');
  }

  private async createLike(newLike: createPostLike): Promise<void> {
    await this.postLikesRepository.createLike(newLike);
  }

  private async updateLike(postId: number, likeStatus: LikeStatusType, userId: number): Promise<void> {
    await this.postLikesRepository.updateLikeStatus(postId, userId, likeStatus);
  }
}
