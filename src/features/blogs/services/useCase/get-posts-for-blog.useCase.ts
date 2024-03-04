/* eslint-disable no-underscore-dangle,@typescript-eslint/explicit-function-return-type */

import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { QueryPaginationResult } from '../../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../../common/types/output';
import { PostgresPostQueryRepository } from '../../../posts/repositories/post/postgres.post.query.repository';
import { OutputPostType } from '../../../posts/types/output';
import { PostgresBlogsRepository } from '../../repositories/postgres.blogs.repository';

export class GetPostForBlogCommand {
  constructor(
    public userId: string | null,
    public blogId: string,
    public sortData: QueryPaginationResult,
  ) {}
}

@CommandHandler(GetPostForBlogCommand)
export class GetPostForBlogUseCase implements ICommandHandler<GetPostForBlogCommand> {
  constructor(
    protected postgresPostQueryRepository: PostgresPostQueryRepository,
    protected postgresBlogsRepository: PostgresBlogsRepository,
  ) {}

  async execute(command: GetPostForBlogCommand): Promise<PaginationWithItems<OutputPostType>> {
    const { userId, sortData, blogId } = command;

    await this.checkBlogExist(blogId);

    return this.findPostsForBlog(blogId, sortData);
  }

  private async checkBlogExist(blogId: string) {
    const post = await this.postgresBlogsRepository.chekBlogIsExist(Number(blogId));
    if (!post) throw new NotFoundException(`Post not found`);
  }

  private async findPostsForBlog(blogId: string, sortData: QueryPaginationResult) {
    const posts = await this.postgresPostQueryRepository.getPostForBlog(Number(blogId), sortData);
    if (!posts?.items?.length) {
      throw new NotFoundException(`Posts not found`);
    }
    return posts;
  }
}
