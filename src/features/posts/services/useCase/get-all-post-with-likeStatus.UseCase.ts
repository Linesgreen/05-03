/* eslint-disable no-underscore-dangle */
// noinspection JSVoidFunctionReturnValueUsed

import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LikeStatusType } from '../../../comments/types/comments/input';
import { PaginationWithItems } from '../../../common/types/output';
import { PostLikesQueryRepository } from '../../repositories/likes/post-likes.query.repository';
import { PostsDocument } from '../../repositories/post/post.schema';
import { PostsRepository } from '../../repositories/post/posts.repository';
import { PostSortData } from '../../types/input';
import { OutputPostType } from '../../types/output';

export class GetAllPostsWithLikeStatusCommand {
  constructor(
    public userId: string | null,
    public sortData: PostSortData,
  ) {}
}
//TODO узнать по поводу этого безумия
@CommandHandler(GetAllPostsWithLikeStatusCommand)
export class GetAllPostsWithLikeStatusUseCase implements ICommandHandler<GetAllPostsWithLikeStatusCommand> {
  constructor(
    protected postRepository: PostsRepository,
    protected postlikesQueryRepository: PostLikesQueryRepository,
  ) {}

  async execute(command: GetAllPostsWithLikeStatusCommand): Promise<PaginationWithItems<OutputPostType>> {
    const { userId, sortData } = command;
    const posts = await this.postRepository.getAll(sortData);

    if (!posts?.items?.length) {
      throw new NotFoundException(`Posts not found`);
    }

    const likeStatuses = userId ? await this.getUserLikeStatuses(posts, userId) : {};
    return this.generatePostsOutput(posts, likeStatuses);
  }

  private async getUserLikeStatuses(
    posts: PaginationWithItems<PostsDocument>,
    userId: string,
  ): Promise<Record<string, LikeStatusType>> {
    const likes = await Promise.all(
      posts.items.map((post) => this.postlikesQueryRepository.getLikeByUserId(post._id, userId)),
    );
    return likes.reduce(
      (statuses, like) => {
        if (like) {
          statuses[like.postId] = like.likeStatus;
        }
        return statuses;
      },
      {} as Record<string, LikeStatusType>,
    );
  }

  private generatePostsOutput(
    posts: PaginationWithItems<PostsDocument>,
    likeStatuses: Record<string, LikeStatusType>,
  ): PaginationWithItems<OutputPostType> {
    const updatedItems = posts.items.map((post) => {
      const likeStatus = likeStatuses[post._id] ?? 'None';
      return post.toDto(likeStatus);
    });

    // Создание нового объекта, содержащего все поля из оригинального объекта posts,
    // но с обновленным массивом items
    return {
      ...posts,
      items: updatedItems,
    };
  }
}