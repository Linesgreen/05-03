import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { PostCreateType } from '../types/input';
import { PostService } from '../services/postService';
import { OutputPostType } from '../types/output';
import { PostsQueryRepository } from '../repositories/posts.query.repository';

@Controller('posts')
export class PostsController {
  constructor(
    protected readonly postService: PostService,
    protected readonly postQueryRepository: PostsQueryRepository,
  ) {}

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
}
