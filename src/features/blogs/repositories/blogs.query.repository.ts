import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Blog, BlogsDocument } from './blogs-schema';
import { Model } from 'mongoose';
import { OutputBlogType } from '../types/output';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: Model<BlogsDocument>,
  ) {}

  async findAll(): Promise<OutputBlogType[]> {
    const allBlogs: BlogsDocument[] = await this.BlogModel.find().exec();
    return allBlogs.map((blog: BlogsDocument) => blog.toDto());
  }

  async findById(id: string): Promise<OutputBlogType | null> {
    const targetBlog: BlogsDocument | null = await this.BlogModel.findById(id);
    if (!targetBlog) return null;
    return targetBlog.toDto();
  }
}
