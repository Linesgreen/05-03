import { Injectable } from '@nestjs/common';

import { ErrorStatus, Result } from '../../../infrastructure/object-result/objcet-result';
import { BlogPG } from '../entites/blogPG';
import { PostgresBlogsRepository } from '../repositories/postgres.blogs.repository';
import { BlogCreateModel } from '../types/input';
import { OutputBlogType } from '../types/output';

@Injectable()
export class BlogsService {
  constructor(protected postgresBlogsRepository: PostgresBlogsRepository) {}

  async createBlog(blogData: BlogCreateModel): Promise<OutputBlogType> {
    const newBlog = new BlogPG(blogData.name, blogData.description, blogData.websiteUrl);
    await this.postgresBlogsRepository.addBLog(newBlog);
    return newBlog.toDto();
  }

  async updateBlog(newData: BlogCreateModel, blogId: number): Promise<Result<string>> {
    const checkBlogIsExist = await this.isExistBlog(blogId);
    if (!checkBlogIsExist) {
      return Result.Err(ErrorStatus.NOT_FOUND, 'blog not found');
    }

    await this.postgresBlogsRepository.updateBlog(blogId, newData);

    return Result.Ok('blog updated successfully');
  }

  async deleteBlog(blogId: number): Promise<Result<string>> {
    const checkBlogIsExist = await this.isExistBlog(blogId);
    if (!checkBlogIsExist) {
      return Result.Err(ErrorStatus.NOT_FOUND, 'blog not found');
    }
    await this.postgresBlogsRepository.deleteById(blogId);
    return Result.Ok('blog deleted successfully');
  }

  private async isExistBlog(blogId: number): Promise<boolean> {
    return this.postgresBlogsRepository.chekBlogIsExist(blogId);
  }
}
