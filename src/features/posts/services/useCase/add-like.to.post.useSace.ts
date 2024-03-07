/* eslint-disable no-underscore-dangle */
import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LikeStatusType } from '../../../comments/types/comments/input';
import { createPostLike, PostLikeFromDb } from '../../entites/like';
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

  async execute({ postId, userId, likeStatus }: AddLikeToPostCommand): Promise<void> {
    const targetPost = await this.postgresPostQueryRepository.getPostById(postId);
    if (!targetPost) throw new NotFoundException('post not found');

    const userLike: PostLikeFromDb | null = await this.postLikesQueryRepository.getLikeByUserId(postId, userId);
    const newLike: createPostLike = {
      postId: postId,
      blogId: Number(targetPost.blogId),
      userId: userId,
      likeStatus: likeStatus,
      createdAt: new Date(),
    };
    if (!userLike) {
      await this.createLike(newLike);
      return;
    }

    // If user's like status is already as expected, no further action needed
    if (likeStatus === userLike.likeStatus) return;
    await this.updateLike(postId, likeStatus, userId);
  }

  private async createLike(newLike: createPostLike): Promise<void> {
    await this.postLikesRepository.createLike(newLike);
  }

  private async updateLike(postId: number, likeStatus: LikeStatusType, userId: number): Promise<void> {
    await this.postLikesRepository.updateLikeStatus(postId, userId, likeStatus);
  }
}
