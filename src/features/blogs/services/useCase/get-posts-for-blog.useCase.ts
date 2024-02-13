/* eslint-disable no-underscore-dangle,@typescript-eslint/explicit-function-return-type */

import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommonRepository } from '../../../../infrastructure/common-likes';
import { PaginationWithItems } from '../../../common/types/output';
import { PostLikesQueryRepository } from '../../../posts/repositories/likes/post-likes.query.repository';
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

@CommandHandler(GetPostForBlogCommand)
export class GetPostForBlogUseCase implements ICommandHandler<GetPostForBlogCommand> {
  constructor(
    protected postLikesQueryRepository: PostLikesQueryRepository,
    protected postRepository: PostsRepository,
    protected blogRepository: BlogsRepository,
    protected commonRepository: CommonRepository,
  ) {}

  async execute(command: GetPostForBlogCommand): Promise<PaginationWithItems<OutputPostType>> {
    const { userId, sortData, blogId } = command;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await this.checkBlogExist(blogId);

    const posts = await this.getPostsForBlog(blogId, sortData);

    let likeStatuses = {};
    if (userId) {
      likeStatuses = await this.commonRepository.getUserLikeStatuses(
        posts,
        this.postLikesQueryRepository,
        userId,
        'postId',
      );
    }
    return this.commonRepository.generateDto(posts, likeStatuses);
  }

  private async checkBlogExist(blogId: string) {
    const post = await this.blogRepository.getBlogById(blogId);
    if (!post) throw new NotFoundException(`Post not found`);
  }

  private async getPostsForBlog(blogId: string, sortData: PostFromBlogSortData) {
    const posts = await this.postRepository.findByBlogId(blogId, sortData);
    if (!posts?.items?.length) {
      throw new NotFoundException(`Posts not found`);
    }
    return posts;
  }
}
