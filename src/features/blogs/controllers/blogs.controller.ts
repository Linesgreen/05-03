import { Controller, Get, NotFoundException, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { QueryPaginationPipe } from '../../../infrastructure/decorators/transform/query-pagination.pipe';
import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../common/types/output';
import { PostService } from '../../posts/services/post.service';
import { BlogsQueryRepository } from '../repositories/blogs.query.repository';
import { PostgresBlogsQueryRepository } from '../repositories/postgres.blogs.query.repository';
import { BlogsService } from '../services/blogs.service';
import { OutputBlogType } from '../types/output';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected readonly blogsQueryRepository: BlogsQueryRepository,
    protected readonly blogsService: BlogsService,
    protected readonly postService: PostService,
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
    console.log('123132');
    const targetBlog = await this.postgresBlogsQueryRepository.getBlogById(id);
    if (!targetBlog) throw new NotFoundException('Blog Not Found');
    return targetBlog;
  }
}
