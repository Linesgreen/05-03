/* eslint-disable no-underscore-dangle,@typescript-eslint/explicit-function-return-type */
// Набор необходимых импортов
import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LikeStatusType } from '../../../comments/types/comments/input';
import { PaginationWithItems } from '../../../common/types/output';
import { PostLikesQueryRepository } from '../../../posts/repositories/likes/post-likes.query.repository';
import { PostsDocument } from '../../../posts/repositories/post/post.schema';
import { PostsRepository } from '../../../posts/repositories/post/posts.repository';
import { OutputPostType } from '../../../posts/types/output';
import { BlogsRepository } from '../../repositories/blogs.repository';
import { PostFromBlogSortData } from '../../types/input';

// Команда
export class GetPostForBlogCommand {
  constructor(
    public userId: string | null,
    public blogId: string,
    public sortData: PostFromBlogSortData,
  ) {}
}

// Обработчик команды
@CommandHandler(GetPostForBlogCommand)
export class GetPostForBlogUseCase implements ICommandHandler<GetPostForBlogCommand> {
  // Конструктор с внедрением зависимостей
  constructor(
    protected postlikesQueryRepository: PostLikesQueryRepository,
    protected postRepository: PostsRepository,
    protected blogRepository: BlogsRepository,
  ) {}

  // Метод выполнения команды
  async execute(command: GetPostForBlogCommand): Promise<PaginationWithItems<OutputPostType>> {
    const { userId, sortData, blogId } = command;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await this.checkBlogExist(blogId);

    const posts = await this.getPosts(blogId, sortData);

    const likeStatuses = userId ? await this.getUserLikeStatuses(posts, userId) : {};

    return this.generatePostsOutput(posts, likeStatuses);
  }

  private async checkBlogExist(blogId: string) {
    const post = await this.blogRepository.getBlogById(blogId);
    if (!post) throw new NotFoundException(`Post not found`);
  }

  private async getPosts(blogId: string, sortData: PostFromBlogSortData) {
    const posts = await this.postRepository.findByBlogId(blogId, sortData);
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
