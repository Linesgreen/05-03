import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { QueryPaginationPipe } from '../../../infrastructure/decorators/transform/query-pagination.pipe';
import { AuthGuard } from '../../../infrastructure/guards/auth-basic.guard';
import { ErrorResulter } from '../../../infrastructure/object-result/objcet-result';
import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PaginationWithItems } from '../../common/types/output';
import { PostService } from '../../posts/services/post.service';
import { PostInBlogUpdateType } from '../../posts/types/input';
import { OutputPostType } from '../../posts/types/output';
import { PostgresBlogsQueryRepository } from '../repositories/postgres.blogs.query.repository';
import { PostgresBlogsRepository } from '../repositories/postgres.blogs.repository';
import { BlogsService } from '../services/blogs.service';
import { GetPostForBlogCommand } from '../services/useCase/get-posts-for-blog.useCase';
import { BlogCreateModel, PostToBlogCreateModel } from '../types/input';
import { OutputBlogType } from '../types/output';

@UseGuards(AuthGuard)
@Controller('/sa/blogs')
export class SaBlogsController {
  constructor(
    protected readonly postgresBlogsRepository: PostgresBlogsRepository,
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
  //TODO узнать по поводу ParseIntPipe
  async getBlog(@Param('id', ParseIntPipe) id: number): Promise<OutputBlogType> {
    const targetBlog = await this.postgresBlogsQueryRepository.getBlogById(id);
    if (!targetBlog) throw new NotFoundException('Blog Not Found');
    return targetBlog;
  }

  @Get(':blogId/posts')
  async getPostForBlog(
    @CurrentUser() userId: string,
    @Query(QueryPaginationPipe) queryData: QueryPaginationResult,
    @Param('blogId') blogId: string,
  ): Promise<PaginationWithItems<OutputPostType>> {
    return this.commandBus.execute(new GetPostForBlogCommand(userId, blogId, queryData));
  }

  @Post('')
  async createBlog(@Body() blogCreateData: BlogCreateModel): Promise<OutputBlogType> {
    return this.blogsService.createBlog(blogCreateData);
  }
  //TODO узнать про result
  @Post(':blogId/posts')
  @UseGuards(AuthGuard)
  async createPostToBlog(
    @Param('blogId') blogId: string,
    @Body() postData: PostToBlogCreateModel,
  ): Promise<OutputPostType> {
    const result = await this.postService.createPost({ ...postData, blogId });
    if (result.isFailure()) ErrorResulter.proccesError(result);
    return result.value as OutputPostType;
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async updateBlog(@Param('id', ParseIntPipe) id: number, @Body() blogUpdateType: BlogCreateModel): Promise<void> {
    const result = await this.blogsService.updateBlog(blogUpdateType, id);
    if (result.isFailure()) ErrorResulter.proccesError(result);
    return;
  }

  @Put(':blogId/posts/:postId')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async updatePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('blogId', ParseIntPipe) blogId: number,
    @Body() postUpdateData: PostInBlogUpdateType,
  ): Promise<void> {
    const blogIsExist = await this.postgresBlogsRepository.chekBlogIsExist(blogId);
    if (!blogIsExist) throw new NotFoundException('Blog Not Found');
    await this.postService.updatePost(postUpdateData, postId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async deleteBlog(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.blogsService.deleteBlog(id);
  }
  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  async deletePostForBlog(
    @Param('blogId', ParseIntPipe) blogId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<void> {
    const blogIsExist = await this.postgresBlogsRepository.chekBlogIsExist(blogId);
    if (!blogIsExist) throw new NotFoundException('Blog Not Found');
    return this.postService.deletePost(postId);
  }
}
