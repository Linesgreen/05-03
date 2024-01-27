import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Blog, BlogsDocument } from './blogs-schema';
import { Model } from 'mongoose';
import { BlogsDb } from '../types/output';
import { BlogUpdateType } from '../types/input';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: Model<BlogsDocument>,
  ) {}

  /**
   * @param blog - новый блог
   * @returns id созданного блога
   */
  async addBlog(blog: BlogsDb) {
    const newBlogToDb = new this.BlogModel(blog);
    await newBlogToDb.save();
    return newBlogToDb._id;
  }

  /**
   * Обновляет блог
   * @param params - параметры для обновления блога
   * @param id - id блога
   * @returns ✅true, если обновление прошло успешно, иначе ❌false
   */
  async updateBlog(params: BlogUpdateType, id: string): Promise<boolean> {
    const updateResult = await this.BlogModel.findByIdAndUpdate(id, {
      name: params.name,
      description: params.description,
      websiteUrl: params.websiteUrl,
    });
    return !!updateResult;
  }
  /**
   * delete current blog
   * @param blogId
   * @returns true, false
   */
  async deleteBlog(blogId: string): Promise<boolean> {
    const deleteResult = await this.BlogModel.findByIdAndDelete(blogId);
    return !!deleteResult;
  }
}
