import { Injectable, NotFoundException } from '@nestjs/common';

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

  async updateBlog(newData: BlogCreateModel, blogId: number): Promise<void> {
    await this.isExistBlog(blogId);
    await this.postgresBlogsRepository.updateBlog(blogId, newData);
  }

  async deleteBlog(blogId: number): Promise<void> {
    await this.isExistBlog(blogId);
    await this.postgresBlogsRepository.deleteById(blogId);
  }

  private async isExistBlog(blogId: number): Promise<void> {
    const chekBlogIsExist = this.postgresBlogsRepository.chekBlogIsExist(blogId);
    if (!chekBlogIsExist) throw new NotFoundException();
  }
}
