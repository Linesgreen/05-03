import { BlogCreateType, BlogUpdateType } from '../types/input';
import { BlogsDb } from '../types/output';
import { BlogsRepository } from '../repositories/blogs.repository';
import { Injectable } from '@nestjs/common';
import { BlogsDocument } from '../repositories/blogs-schema';
@Injectable()
export class BlogsService {
  constructor(protected blogsRepository: BlogsRepository) {}

  async createBlog(blogData: BlogCreateType) {
    const newBlog = new BlogsDb(blogData.name, blogData.description, blogData.websiteUrl);

    await this.blogsRepository.addBlog(newBlog);
    return newBlog.toDto();
  }

  async updateBlog(newData: BlogUpdateType, blogId: string) {
    const targetBlog: BlogsDocument | null = await this.blogsRepository.getBlogById(blogId);
    if (!targetBlog) return null;
    targetBlog.updateBlog(newData);
    await this.blogsRepository.saveBlog(targetBlog);
    return true;
  }

  async deleteBlog(blogId: string) {
    return await this.blogsRepository.deleteBlog(blogId);
  }
}
