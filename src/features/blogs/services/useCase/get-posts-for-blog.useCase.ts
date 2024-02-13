/* eslint-disable no-underscore-dangle */
// noinspection JSVoidFunctionReturnValueUsed

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

export class GetPostForBlogCommand {
  constructor(
    public userId: string | null,
    public blogId: string,
    public sortData: PostFromBlogSortData,
  ) {}
}
//TODO узнать по поводу этого безумия
@CommandHandler(GetPostForBlogCommand)
export class GetPostForBlogUseCase implements ICommandHandler<GetPostForBlogCommand> {
  constructor(
    protected postlikesQueryRepository: PostLikesQueryRepository,
    protected postRepository: PostsRepository,
    protected blogRepository: BlogsRepository,
  ) {}

  async execute(command: GetPostForBlogCommand): Promise<PaginationWithItems<OutputPostType>> {
    const { userId, sortData, blogId }: GetPostForBlogCommand = command;
    const blog = await this.blogRepository.getBlogById(blogId);
    if (!blog) throw new NotFoundException(`Blog with id ${blogId} Not Found`);

    const posts: PaginationWithItems<PostsDocument> = await this.postRepository.findByBlogId(blogId, sortData);

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
