import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { BlogsQueryRepository } from './repositories/blogs.query.repository';
import { BlogCreateType, BlogUpdateType } from './types/input';
import { BlogsService } from './blogs.service';
import { OutputBlogType } from './types/output';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected readonly blogsQueryRepository: BlogsQueryRepository,
    protected readonly blogsService: BlogsService,
  ) {}

  //TODO узнать про await
  @Get('')
  getAllBlogs() {
    return this.blogsQueryRepository.findAll();
  }

  @Get(':id')
  async getBlog(@Param('id') id: string) {
    //TODO почему не подхватывает null
    const targetBlog: OutputBlogType | null =
      await this.blogsQueryRepository.findById(id);

    if (!targetBlog) throw new NotFoundException('Blog Not Found');
    return targetBlog;
  }

  @Post('')
  createBlog(@Body() blogCreateData: BlogCreateType) {
    const newBlog = this.blogsService.createBlog(blogCreateData);
    return newBlog;
  }

  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param('id') id: string,
    @Body() blogCreateData: BlogUpdateType,
  ) {
    const updateResult = await this.blogsService.updateBlog(blogCreateData, id);
    if (!updateResult) throw new NotFoundException('Blog Not Found');
    return 'This action update blog';
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') id: string) {
    const delteResult = await this.blogsService.deleteBlog(id);
    if (!delteResult) throw new NotFoundException('Blog Not Found');
    return 'This action delete blog';
  }
}
