import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { BlogsQueryRepository } from '../repositories/blogs.query.repository';
import { BlogCreateType, BlogUpdateType, PostToBlogCreateType } from '../types/input';
import { BlogsService } from '../services/blogs.service';
import { OutputBlogType } from '../types/output';
import { PostService } from '../../posts/services/postService';
import { OutputPostType } from '../../posts/types/output';
import { PostsQueryRepository } from '../../posts/repositories/posts.query.repository';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected readonly blogsQueryRepository: BlogsQueryRepository,
    protected readonly postQueryRepository: PostsQueryRepository,
    protected readonly blogsService: BlogsService,
    protected readonly postService: PostService,
  ) {}

  @Get('')
  async getAllBlogs(): Promise<OutputBlogType[]> {
    return await this.blogsQueryRepository.findAll();
  }

  @Get(':id')
  async getBlog(@Param('id') id: string): Promise<OutputBlogType> {
    const targetBlog = await this.blogsQueryRepository.findById(id);

    if (!targetBlog) throw new NotFoundException('Blog Not Found');
    return targetBlog;
  }

  @Post('')
  async createBlog(@Body() blogCreateData: BlogCreateType): Promise<OutputBlogType> {
    return await this.blogsService.createBlog(blogCreateData);
  }

  @Get(':blogId/posts')
  async getPostForBlog(@Param('blogId') blogId: string): Promise<OutputPostType[]> {
    const targetPosts: OutputPostType[] | null = await this.postQueryRepository.findByBlogId(blogId);
    if (!targetPosts) throw new NotFoundException('Post Not Found');
    return targetPosts;
  }

  @Post(':blogId/posts')
  @HttpCode(204)
  async createPostToBlog(@Param('blogId') blogId: string, @Body() postData: PostToBlogCreateType) {
    const newPost: OutputPostType | null = await this.postService.createPost({ ...postData, blogId });
    if (!newPost) throw new NotFoundException('Blog Not Exist');
    return newPost;
  }

  @Put(':id')
  @HttpCode(204)
  async updateBlog(@Param('id') id: string, @Body() blogUpdateType: BlogUpdateType) {
    const updateResult = await this.blogsService.updateBlog(blogUpdateType, id);
    if (!updateResult) throw new NotFoundException('Blog Not Found');
    return;
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') id: string) {
    const delteResult = await this.blogsService.deleteBlog(id);
    if (!delteResult) throw new NotFoundException('Blog Not Found');
    return;
  }
}
