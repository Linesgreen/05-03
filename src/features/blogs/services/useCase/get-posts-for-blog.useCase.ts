/* eslint-disable no-underscore-dangle,@typescript-eslint/explicit-function-return-type */

import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { QueryPaginationResult } from '../../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../../common/types/output';
import { PostgresPostQueryRepository } from '../../../posts/repositories/post/postgres.post.query.repository';
import { OutputPostType } from '../../../posts/types/output';
import { PostgresBlogsRepository } from '../../repositories/postgres.blogs.repository';

export class GetPostForBlogCommand {
  constructor(
    public userId: number | null,
    public blogId: number,
    public sortData: QueryPaginationResult,
  ) {}
}

@CommandHandler(GetPostForBlogCommand)
export class GetPostForBlogUseCase implements ICommandHandler<GetPostForBlogCommand> {
  constructor(
    protected postgresPostQueryRepository: PostgresPostQueryRepository,
    protected postgresBlogsRepository: PostgresBlogsRepository,
  ) {}

  async execute(command: GetPostForBlogCommand): Promise<Result<string | PaginationWithItems<OutputPostType>>> {
    const { userId, sortData, blogId } = command;

    await this.checkBlogExist(blogId);

    const posts = await this.findPostsForBlog(blogId, sortData, userId);
    if (!posts) return Result.Err(ErrorStatus.NOT_FOUND, 'Posts not found');
    return Result.Ok(posts);
  }

  private async checkBlogExist(blogId: number) {
    const post = await this.postgresBlogsRepository.chekBlogIsExist(blogId);
    if (!post) throw new NotFoundException(`Blog ${blogId} not found`);
  }

  private async findPostsForBlog(blogId: number, sortData: QueryPaginationResult, userId: number | null) {
    const posts = await this.postgresPostQueryRepository.getPosts(sortData, userId, blogId);
    if (!posts?.items?.length) {
      return null;
    }
    return posts;
  }
}
