/* eslint-disable no-underscore-dangle,@typescript-eslint/explicit-function-return-type */
// Набор необходимых импортов
import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LikeStatusType } from '../../../comments/types/comments/input';
import { PaginationWithItems } from '../../../common/types/output';
import { PostLikesQueryRepository } from '../../repositories/likes/post-likes.query.repository';
import { PostsDocument } from '../../repositories/post/post.schema';
import { PostsRepository } from '../../repositories/post/posts.repository';
import { PostSortData } from '../../types/input';
import { OutputPostType } from '../../types/output';

// Команда
export class GetAllPostsWithLikeStatusCommand {
  constructor(
    public userId: string | null,
    public sortData: PostSortData,
  ) {}
}

// Обработчик команды
@CommandHandler(GetAllPostsWithLikeStatusCommand)
export class GetAllPostsWithLikeStatusUseCase implements ICommandHandler<GetAllPostsWithLikeStatusCommand> {
  // Конструктор с внедрением зависимостей
  constructor(
    protected postRepository: PostsRepository,
    protected postlikesQueryRepository: PostLikesQueryRepository,
  ) {}

  // Метод выполнения команды
  async execute(command: GetAllPostsWithLikeStatusCommand): Promise<PaginationWithItems<OutputPostType>> {
    const { userId, sortData } = command;

    // Получение всех постов
    const posts = await this.getPosts(sortData);

    // Зависимости постов от пользователей
    const likeStatuses = userId ? await this.getUserLikeStatuses(posts, userId) : {};

    // Возвращаем данные
    return this.generatePostsOutput(posts, likeStatuses);
  }

  private async getPosts(sortData: PostSortData) {
    const posts = await this.postRepository.getAll(sortData);
    if (!posts?.items?.length) {
      throw new NotFoundException(`Posts not found`);
    }
    return posts;
  }

  private async getUserLikeStatuses(posts: PaginationWithItems<PostsDocument>, userId: string) {
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

  private generatePostsOutput(posts: PaginationWithItems<PostsDocument>, likeStatuses: Record<string, LikeStatusType>) {
    const updatedItems = posts.items.map((post) => {
      const likeStatus = likeStatuses[post._id] ?? 'None';
      return post.toDto(likeStatus);
    });
    return { ...posts, items: updatedItems };
  }
}
