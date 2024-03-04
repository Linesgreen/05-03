/* eslint-disable no-underscore-dangle */
import { Schema } from '@nestjs/mongoose';
import { Exception } from 'handlebars';

import { BlogCreateModel } from '../types/input';
import { BlogPgDb, OutputBlogType } from '../types/output';

@Schema()
export class BlogPG {
  id: number | null;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
  constructor(name: string, description: string, websiteUrl: string) {
    this.id = null;
    this.name = name;
    this.description = description;
    this.websiteUrl = websiteUrl;
    this.createdAt = new Date();
    this.isMembership = false;
  }
  static fromDbToInstance(blogData: BlogPgDb): BlogPG {
    const newBlog = Object.create(BlogPG.prototype);
    newBlog.id = blogData.id;
    newBlog.name = blogData.name;
    newBlog.description = blogData.description;
    newBlog.websiteUrl = blogData.websiteUrl;
    newBlog.createdAt = blogData.createdAt;
    newBlog.isMembership = blogData.isMembership;

    return newBlog;
  }

  toDto(): OutputBlogType {
    if (!this.id) throw new Exception('пытаешься сделать дто без id');
    return {
      id: this.id.toString(),
      name: this.name,
      description: this.description,
      websiteUrl: this.websiteUrl,
      createdAt: this.createdAt.toISOString(),
      isMembership: this.isMembership,
    };
  }

  updateBlog(params: BlogCreateModel): void {
    this.name = params.name;
    this.description = params.description;
    this.websiteUrl = params.websiteUrl;
  }
}
