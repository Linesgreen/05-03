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
import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PaginationWithItems } from '../../common/types/output';
import { PostService } from '../../posts/services/post.service';
import { PostInBlogUpdateType } from '../../posts/types/input';
import { OutputPostType } from '../../posts/types/output';
import { BlogsQueryRepository } from '../repositories/blogs.query.repository';
import { PostgresBlogsQueryRepository } from '../repositories/postgres.blogs.query.repository';
import { BlogsService } from '../services/blogs.service';
import { GetPostForBlogCommand } from '../services/useCase/get-posts-for-blog.useCase';
import { BlogCreateModel, PostToBlogCreateModel } from '../types/input';
import { OutputBlogType } from '../types/output';

@UseGuards(AuthGuard)
@Controller('/sa/blogs')
export class SaBlogsController {
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

  @Post(':blogId/posts')
  @UseGuards(AuthGuard)
  async createPostToBlog(
    @Param('blogId') blogId: string,
    @Body() postData: PostToBlogCreateModel,
  ): Promise<OutputPostType> {
    const newPost: OutputPostType | null = await this.postService.createPost({ ...postData, blogId });
    if (!newPost) throw new NotFoundException('Blog Not Exist');
    return newPost;
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async updateBlog(@Param('id', ParseIntPipe) id: number, @Body() blogUpdateType: BlogCreateModel): Promise<void> {
    await this.blogsService.updateBlog(blogUpdateType, id);
  }

  @Put(':blogId/posts/:postId')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async updatePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() postUpdateData: PostInBlogUpdateType,
  ): Promise<void> {
    console.log(postId);
    await this.postService.updatePost(postUpdateData, postId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async deleteBlog(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.blogsService.deleteBlog(id);
  }
  @Delete(':blogId/posts/:postId')
  async deletePostForBlog(@Param('postId', ParseIntPipe) postId: number): Promise<void> {
    return this.postService.deletePost(postId);
  }
}
