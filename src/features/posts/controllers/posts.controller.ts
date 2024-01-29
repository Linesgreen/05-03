import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { PostCreateType, PostSortData, PostUpdateType } from '../types/input';
import { PostService } from '../services/postService';
import { OutputPostType } from '../types/output';
import { PostsQueryRepository } from '../repositories/posts.query.repository';
import { PaginationWithItems } from '../../common/types/output';

@Controller('posts')
export class PostsController {
  constructor(
    protected readonly postService: PostService,
    protected readonly postQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getAllPosts(@Query() queryData: PostSortData): Promise<PaginationWithItems<OutputPostType>> {
    return await this.postQueryRepository.getAll(queryData);
  }

  @Get(':postId')
  async getPost(@Param('postId') postId: string): Promise<OutputPostType> {
    const targetPost: OutputPostType | null = await this.postQueryRepository.findById(postId);
    if (!targetPost) throw new NotFoundException('Post Not Found');
    return targetPost;
  }

  @Post()
  async createPost(@Body() postCreateData: PostCreateType): Promise<OutputPostType> {
    const newPost: OutputPostType | null = await this.postService.createPost(postCreateData);
    if (!newPost) throw new NotFoundException('Blog Not Exist');
    return newPost;
  }
  @Put(':id')
  @HttpCode(204)
  async updatePost(@Param('id') id: string, @Body() postUpdateData: PostUpdateType) {
    const updateResult = await this.postService.updatePost(postUpdateData, id);
    if (!updateResult) throw new NotFoundException('Blog Not Found');
    return;
  }
  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param('id') id: string) {
    const delteResult = await this.postService.deleteBlog(id);
    if (!delteResult) throw new NotFoundException('Blog Not Found');
    return;
  }
}
