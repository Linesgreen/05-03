import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Blog, BlogsDocument } from '../blogs-schema';
import { Model } from 'mongoose';
import { BLogMapper } from './utils/blogMapper';
import { OutputBlogType } from '../types/output';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: Model<BlogsDocument>,
  ) {}

  async findAll(): Promise<OutputBlogType[]> {
    const allBlogs = await this.BlogModel.find().exec();
    return allBlogs.map(BLogMapper);
  }

  async findById(id: string): Promise<OutputBlogType | null> {
    const targetBlog = await this.BlogModel.findById(id).lean();
    if (!targetBlog) return null;
    return BLogMapper(targetBlog);
  }
}
