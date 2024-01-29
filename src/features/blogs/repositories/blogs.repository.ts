import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Blog, BlogsDocument } from './blogs-schema';
import { Model } from 'mongoose';
import { BlogsDb } from '../types/output';

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
   * @param blogId
   * @returns true, false
   */
  async deleteBlog(blogId: string): Promise<boolean> {
    const deleteResult = await this.BlogModel.findByIdAndDelete(blogId);
    return !!deleteResult;
  }
  /**
   * @param blogId
   * @returns BlogsDocument (smart object) | null
   */
  async getBlogById(blogId: string): Promise<BlogsDocument | null> {
    return this.BlogModel.findById(blogId);
  }
  /**
   * save blog to repo
   * @param blog : BlogsDocument
   * @returns void
   */
  async saveBlog(blog: BlogsDocument) {
    await blog.save();
  }
}
