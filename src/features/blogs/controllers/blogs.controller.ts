import { Controller, Get, NotFoundException, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { QueryPaginationPipe } from '../../../infrastructure/decorators/transform/query-pagination.pipe';
import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PaginationWithItems } from '../../common/types/output';
import { OutputPostType } from '../../posts/types/output';
import { PostgresBlogsQueryRepository } from '../repositories/postgres.blogs.query.repository';
import { GetPostForBlogCommand } from '../services/useCase/get-posts-for-blog.useCase';
import { OutputBlogType } from '../types/output';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected readonly postgresBlogsQueryRepository: PostgresBlogsQueryRepository,
    protected readonly commandBus: CommandBus,
  ) {}

  @Get('')
  async getAllBlogs(
    @Query(QueryPaginationPipe) queryData: QueryPaginationResult,
  ): Promise<PaginationWithItems<OutputBlogType>> {
    return this.postgresBlogsQueryRepository.getAll(queryData);
  }

  @Get(':id')
  async getBlog(@Param('id', ParseIntPipe) id: number): Promise<OutputBlogType> {
    const targetBlog = await this.postgresBlogsQueryRepository.getBlogById(id);
    if (!targetBlog) throw new NotFoundException('Blog Not Found');
    return targetBlog;
  }
  //TODO узнать про objectResult туцт
  @Get(':blogId/posts')
  async getPostForBlog(
    @CurrentUser() userId: number,
    @Query(QueryPaginationPipe) queryData: QueryPaginationResult,
    @Param('blogId', ParseIntPipe) blogId: number,
  ): Promise<PaginationWithItems<OutputPostType>> {
    return this.commandBus.execute(new GetPostForBlogCommand(userId, blogId, queryData));
  }
}
